var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: __dirname+'/../../../tmp'});
var mv = require('mv');
var mime = require('mime');
var shortid = require('shortid');
var slug = require('slug');
var httpError = require('http-errors');

import ElectionsServiceImpl from "../../elections/ElectionsServiceImpl";
import { getConnection } from "typeorm";
import ElectionStatus from '../../elections/models/ElectionStatus';

const connection = getConnection("grey");

const electionsService = new ElectionsServiceImpl(connection);

router.use(function (req, res, next) {
	if (req.user.level < 5) {
		return next(httpError(403));
	} else {
		return next();
	}
});

/* GET the elections page */
router.get('/', function (req, res, next) {
	electionsService.getElections().then(function (elections) {
		return res.render('admin/elections', {
			closed: elections.filter(e => e.status === ElectionStatus.closed),
			publicizing: elections.filter(e => e.status === ElectionStatus.publicising),
			open: elections.filter(e => e.status === ElectionStatus.open)
		});
	}).catch(next);
});

/* POST a new election */
router.post('/', function (req, res, next) {
	electionsService.createElection(req.body.name).then(function (election) {
		res.redirect(303, '/admin/elections/'+election.id);
	}).catch(next);
});

/* GET and delete an election */
router.get('/:election_id/delete', function (req, res, next) {
	electionsService.deleteElection(Number(req.params.election_id)).then(function () {
		res.redirect(303, '/admin/elections/');
	}).catch(next);
});

/* GET the election results */
router.get('/:election_id/:position_id/results', function (req, res, next) {
	electionsService.getPositionResults(Number(req.params.position_id)).then(positionResults => {
		let result = "";
		positionResults.breakDown.forEach((round, index) => {
			result += `<b>Round ${index + 1}</b><br/>`;
			result += `There are ${round.totalVotes} valid votes giving a quota of ${round.threshold}.<br/><br/>`;
			round.nomineeElectionRounds.forEach(nomineeVotes => {
				result += `${nomineeVotes.nominee.name}: ${nomineeVotes.votes}<br/>`;
			});
			if (round.winner) {
				result += `<br/>${round.winner.name} achieves quota and is duly elected.<br/><br/>`;
			} else {
				result += `<br/>No one achieves quota and ${round.loser.name} is eliminated.<br/><br/>`;
			}
		});
		res.render('admin/elections_results', {result});
	}).catch(next);
});

/* GET the edit election page */
router.get('/:election_id', function (req, res, next) {
	electionsService.getElection(Number(req.params.election_id)).then(function(election){
		res.render('admin/elections_edit', {election: election});
	}).catch(next);
});

/* POST an update to an election */
router.post('/:election_id', function (req, res, next) {
	electionsService.updateElection(
		Number(req.params.election_id),
		req.body.name,
		req.body.status,
	).then(function (election) {
		res.redirect(303, '/admin/elections/'+req.params.election_id);
	}).catch(next);
});

/* POST a new position */
router.post('/:election_id/newposition', function (req, res, next) {
	electionsService.addPosition(Number(req.params.election_id), req.body.name).then(function () {
		res.redirect(303, '/admin/elections/'+req.params.election_id);
	}).catch(next);
});

/* GET and delete a position */
router.get('/:election_id/:position_id/delete', function (req, res, next) {
	electionsService.removePosition(Number(req.params.election_id), Number(req.params.position_id)).then(function () {
		res.redirect(303, '/admin/elections/'+req.params.election_id);
	}).catch(next);
});

/* POST a new nominee */
router.post('/:election_id/:position_id/newnominee', upload.single('manifesto'),function (req, res, next) {
	const moveManifesto = new Promise(function(resolve, reject){
		if (req.file) {
			var manifesto_name = slug(req.body.name)+'-'+shortid.generate()+'.'+mime.getExtension(req.file.mimetype);
			mv(req.file.path, process.env.FILES_DIRECTORY+'/manifestos/'+manifesto_name, function (err) {
				if(err) return reject(err);
				resolve(manifesto_name);
			});
		} else {
			resolve(null);
		}
	});
	moveManifesto.then(function (manifesto_name) {
		return electionsService.addNominee(
			Number(req.params.position_id),
			req.body.name,
			manifesto_name
		);
	}).then(function(){
		res.redirect(303, '/admin/elections/'+req.params.election_id);
	}).catch(next);
});

/* GET and delete a candidate */
router.get('/:election_id/:position_id/:nominee_id/delete', function (req, res, next) {
	electionsService.removeNominee(Number(req.params.election_id), Number(req.params.nominee_id)).then(function () {
		res.redirect(303, '/admin/elections/'+req.params.election_id);
	}).catch(next);
});

module.exports = router;
