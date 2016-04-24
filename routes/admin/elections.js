var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../tmp'});
var mv = require('mv');
var mime = require('mime');
var treeize   = require('treeize');

router.use(function (req, res, next) {
	if (req.user.level<5 ) {
		err = new Error("Forbidden");
		err.status = 403;
		return next(err);
	} else {
		return next();
	}
});

/* GET the elections page */
router.get('/', function (req, res, next) {
	req.db.manyOrNone('SELECT elections.id, elections.title, elections.status, election_positions.id AS "positions:id", election_positions.name AS "positions:name" FROM elections FULL JOIN election_positions ON election_positions.electionid = elections.id ORDER BY elections.id ASC')
		.then(function (elections) {
			var electionsTree = new treeize;
			electionsTree.grow(elections);
			return res.render('admin/elections', {elections: electionsTree.getData()});
		})
		.catch(function (err) {
			return next(err);
		});

});

/* POST a new election */
router.post('/', function (req, res, next) {
	req.db.one('INSERT INTO elections(title) VALUES ($1) RETURNING id', [req.body.title])
		.then(function (election) {
			res.redirect(303, '/admin/elections/'+election.id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET and delete an election */
router.get('/:id/delete', function (req, res, next) {
	req.db.none('DELETE FROM elections WHERE id=$1', [req.params.id])
		.then(function () {
			res.redirect(303, '/admin/elections/');
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the election results */
router.get('/:electionid/:positionid/results', function (req, res, next) {
	req.db.one('SELECT (elections.status=0) AS closed FROM elections WHERE elections.id=$1', [req.params.electionid])
		.then(function (election) {
			if (!election.closed) {
				err = new Error("Election is not closed");
				throw err;
			}
			return req.db.many('SELECT election_nominations.name AS nomination_name, election_nominations.id AS nomination_id, election_votes.value, election_votes.username, election_positions.name AS position_name FROM election_votes LEFT JOIN election_nominations ON election_votes.nominationid=election_nominations.id LEFT JOIN election_positions ON election_nominations.positionid=election_positions.id WHERE election_positions.id=$1 ORDER BY election_votes.username, election_nominations.name', [req.params.positionid]);
		})
		.then(function (rawVotes) {
			if (!rawVotes) {
				err = new Error("No votes");
				throw err;
			}

			result = "";
			// We make our votes nicely formatted and create our nominations array
			/*
				'votes': { username: { value: nominationId } }
				'nominations': { nomination_id : { 'name': nomination_name, 'votes': votes}}
			*/
			var nominations = {};
			var votes = {};
			var currentVoter = null;
			for (i=0; i<rawVotes.length; i++) {
				// Create out nominations array as we go
				if (nominations[rawVotes[i].nomination_id] == undefined) {
					nominations[rawVotes[i].nomination_id] = {
						name: rawVotes[i].nomination_name,
						votes: 0
					}
				}
				// If we're on a new voter set up their array
				if (currentVoter != rawVotes[i].username) {
					currentVoter = rawVotes[i].username;
					votes[currentVoter] = {};
					spoiltPreferences = [0];
				}
				// Check the gived voter hasn't already used the preference twice
				if (spoiltPreferences.indexOf(rawVotes[i].value) == -1) {
					// Check they haven't already used it once
					if (votes[currentVoter][rawVotes[i].value] == undefined) {
						votes[currentVoter][rawVotes[i].value] = rawVotes[i].nomination_id;
					} else {
						// otherwise mark the preference as spoilt and remove it
						delete votes[currentVoter][rawVotes[i].value];
						spoiltPreferences.push(rawVotes[i].value);
					}
				} else {
					delete votes[currentVoter][rawVotes[i].value];
				}
			}

			// Now we start counting the votes
			var electionCompleted = false;
			var round = 0;
			while (!electionCompleted) {
				round++;
				validVotes = 0;
				// Allocate votes
				for (voter in votes) {
					if (votes[voter][1] != undefined) {
						nominations[votes[voter][1]].votes++;
						validVotes++;
					}
				}
				// Calculate quota
				var quota = Math.floor(validVotes/2)+1;
				result += "<b>Round "+round+"</b><br/>";
				result += "There "+((validVotes==1)?"is "+validVotes+" valid vote":"are "+validVotes+" valid votes")+" giving a quota of "+quota+".<br/><br/>";
				// Order the nominations
				var first = null, last = null;
				for( nomination in nominations ) {
					result += nominations[nomination].name + ": "+nominations[nomination].votes+"<br/>";
					if (first == null) {
						first = nomination;
						last = nomination;
					}
					if (nominations[nomination].votes > nominations[first].votes) {
						first = nomination;
					} else if (nominations[nomination].votes < nominations[last].votes) {
						last = nomination;
					}
				}
				if (nominations[first].votes >= quota) {
					result += "<br/>"+nominations[first].name + " achieves quota and is duly elected.<br/><br/>";
					electionCompleted = true;
				} else {
					result += "<br/>No one achieves quota and "+nominations[last].name+" is eliminated.<br/><br/>";
					delete nominations[last];
					for (nomination in nominations) {
						nominations[nomination].votes = 0;
					}
					// We go through the voters and if there first preference was eliminated we move up their other preferences
					for (voter in votes) {
						if (votes[voter][1] == last) {
							delete votes[voter][1];
							for (preference in votes[voter]) {
								votes[voter][preference - 1] = votes[voter][preference];
								delete votes[voter][preference];
							}
						} else {
							for (preference in votes[voter]) {
								if (votes[voter][preference] == last) {
									delete votes[voter][preference];
								}
							}
						}
					}
				}
			}
			res.render('admin/elections_results', {results: result});
		})
		.catch(function (err) {
			next(err);
		});

});

/* GET the edit election page */
router.get('/:id', function (req, res, next) {
	var election;
	req.db.one('SELECT elections.id, elections.title, elections.status FROM elections WHERE elections.id=$1', [req.params.id])
		.then(function (data) {
			election = data;
			return req.db.manyOrNone('SELECT election_positions.id, election_positions.name, election_nominations.id AS "nominations:id", election_nominations.name AS "nominations:name" FROM election_positions FULL JOIN election_nominations ON election_positions.id=election_nominations.positionid WHERE (election_positions.electionid=$1 OR election_nominations.electionid=$1) ORDER BY election_positions.id ASC', [req.params.id]);
		})
		.then(function (data) {
			var positionsTree = new treeize;
			positionsTree.grow(data);
			election.positions = positionsTree.getData();
			res.render('admin/elections_edit', {election: election});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST an update to an election */
router.post('/:id', function (req, res, next) {
	req.db.none('UPDATE elections SET title=$1, status=$2 WHERE id=$3', [req.body.title, req.body.status, req.params.id])
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new position */
router.post('/:id/newposition', function (req, res, next) {
	req.db.none('INSERT INTO election_positions(name, electionid) VALUES ($1, $2)', [req.body.name, req.params.id])
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET and delete a position */
router.get('/:electionid/:positionid/delete', function (req, res, next) {
	req.db.none('DELETE FROM election_positions WHERE id=$1 CASCADE', [req.params.positionid])
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.electionid);
		})
		.catch(function (err) {
			next(err);
		});

});

/* POST a new nomination */
router.post('/:electionid/:positionid/newnomination', upload.single('manifesto'),function (req, res, next) {
	if (req.file) {
		var manifesto_name = slugify(req.body.name)+'-'+makeid(4)+'.'+mime.extension(req.file.mimetype);
		mv(req.file.path, __dirname+'/../../public/files/manifestos/'+manifesto_name, function (err) {
			req.db.none('INSERT INTO election_nominations(name, electionid, positionid, manifesto) VALUES ($1, $2, $3, $4)', [req.body.name, req.params.electionid, req.params.positionid, manifesto_name])
				.then(function () {
					res.redirect(303, '/admin/elections/'+req.params.electionid);
				})
				.catch(function (err) {
					next(err);
				});
		});
	} else {
		req.db.none('INSERT INTO election_nominations(name, electionid, positionid) VALUES ($1, $2, $3)', [req.body.name, req.params.electionid, req.params.positionid])
			.then(function () {
				res.redirect(303, '/admin/elections/'+req.params.electionid);
			})
			.catch(function (err) {
				next(err);
			});
	}
});

/* GET and delete a candidate */
router.get('/:electionid/:positionid/:nominationid/delete', function (req, res, next) {
	req.db.none('DELETE FROM election_nominations WHERE id=$1', [req.params.nominationid])
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.electionid);
		})
		.catch(function (err) {
			next(err);
		});
});

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function makeid(n)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = router;