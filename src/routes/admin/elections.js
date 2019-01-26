var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../../tmp'});
var mv = require('mv');
var mime = require('mime');
var shortid = require('shortid');
var slug = require('slug');
var httpError = require('http-errors');

var Election = require('../../models/election');

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET the elections page */
router.get('/', function (req, res, next) {
	Promise.all([
		Election.getByStatus(0),
		Election.getByStatus(1),
		Election.getByStatus(2)
	])
		.then(function (data) {
			return res.render('admin/elections', {closed:data[0], publicizing: data[1], open: data[2]});
		})
		.catch(function (err) {
			return next(err);
		});

});

/* POST a new election */
router.post('/', function (req, res, next) {
	Election.create(req.body.name)
		.then(function (election) {
			res.redirect(303, '/admin/elections/'+election.id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET and delete an election */
router.get('/:election_id/delete', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			return election.delete();
		})
		.then(function () {
			res.redirect(303, '/admin/elections/');
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET the election results */
router.get('/:election_id/:position_id/results', function (req, res, next) {
	var election = null;
	Election.findById(parseInt(req.params.election_id)).then(function(data) {
		election = data;
		return election.getBallotsByPosition(parseInt(req.params.position_id));
	}).then(function(ballots) {
		var nominee_totals = {};
		var nominee_names = {};
		for (position of election.positions) {
			if (position.id == parseInt(req.params.position_id)) {
				for (nominee of position.nominees) {
					nominee_names[nominee.id] = nominee.name;
					nominee_totals[nominee.id] = 0;
				}
				break;
			}
		}

		var election_completed = false;
		var round = 1;
		var winner = null;
		var result = "";
		while(!winner) {
			// Clean ballots
			for (var i = ballots.length-1; i >=0; i--) {
				ballots[i] = election.cleanseBallot(ballots[i]);
				if (ballots[i].length === 0) {
					ballots.splice(i, 1);
				}
			}
			// calculate quota
			var valid_votes = ballots.length;
			var quota = Math.floor(valid_votes/2)+1;

			result += "<b>Round "+round+"</b><br/>";
			result += "There "+((valid_votes==1)?"is 1 valid vote":"are "+valid_votes+" valid votes")+" giving a quota of "+quota+".<br/><br/>";


			// count votes
			for (ballot of ballots) {
				nominee_totals[election.getFirstPreference(ballot)]++;
			}
			var loser = null;
			for (var nominee_id in nominee_totals) {
				if (nominee_totals.hasOwnProperty(nominee_id)) {
					result += nominee_names[nominee_id] + ": "+nominee_totals[nominee_id]+"<br/>";
					if (nominee_totals[nominee_id] < nominee_totals[loser] || loser === null) {
						loser = nominee_id;
					}
					if (nominee_totals[nominee_id] >= quota) {
						winner = nominee_id;
					}
				}
			}

			if (!winner) {
				round++;
				// redistribute votes
				result += "<br/>No one achieves quota and " + nominee_names[loser] + " is eliminated.<br/><br/>";
				delete nominee_totals[loser];
				for (ballot of ballots) {
					for (var i = 0; i < ballot.length; i++) {
						ballot[i].preference = i+1;
						if (ballot[i].nominee_id == loser) {
							ballot.splice(i, 1);
							i--;
						}
					}
				}
				// reset counts
				for (var nominee_id in nominee_totals) {
					if (nominee_totals.hasOwnProperty(nominee_id)) {
						nominee_totals[nominee_id] = 0;
					}
				}
			}
		}
		result += "<br/>" + nominee_names[winner] + " achieves quota and is duly elected.<br/><br/>";
		res.render('admin/elections_results', {result: result});
	})
	.catch(function (err) {
		next(err);
	});
});

/* GET the edit election page */
router.get('/:election_id', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			res.render('admin/elections_edit', {election: election});
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST an update to an election */
router.post('/:election_id', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			return election.update(req.body.name, req.body.status);
		})
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.election_id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* POST a new position */
router.post('/:election_id/newposition', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			return election.addPosition(req.body.name);
		})
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.election_id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET and delete a position */
router.get('/:election_id/:position_id/delete', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			return election.removePosition(req.params.position_id);
		})
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.election_id);
		})
		.catch(function (err) {
			next(err);
		});

});

/* POST a new nominee */
router.post('/:election_id/:position_id/newnominee', upload.single('manifesto'),function (req, res, next) {
	moveManifesto = new Promise(function(resolve, reject){
		if (req.file) {
			var manifesto_name = slug(req.body.name)+'-'+shortid.generate()+'.'+mime.extension(req.file.mimetype);
			mv(req.file.path, process.env.FILES_DIRECTORY+'/manifestos/'+manifesto_name, function (err) {
				if(err) return reject(err);
				return resolve(manifesto_name);
			});
		} else {
			return resolve(null);
		}
	});
	var election = null;
	Election.findById(parseInt(req.params.election_id))
		.then(function(data){
			election = data;
			return moveManifesto;
		})
		.then(function (manifesto_name) {
			return election.addNominee(req.params.position_id, req.body.name, manifesto_name);
		})
		.then(function(){
			res.redirect(303, '/admin/elections/'+req.params.election_id);
		})
		.catch(function (err) {
			next(err);
		});
});

/* GET and delete a candidate */
router.get('/:election_id/:position_id/:nominee_id/delete', function (req, res, next) {
	Election.findById(parseInt(req.params.election_id))
		.then(function(election){
			return election.removeNominee(req.params.nominee_id);
		})
		.then(function () {
			res.redirect(303, '/admin/elections/'+req.params.election_id);
		})
		.catch(function (err) {
			next(err);
		});
});

module.exports = router;
