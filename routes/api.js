var express = require('express');
var router = express.Router();
var fs = require('fs');
var prettydate = require('pretty-date');

router.get('/search/', function (req, res, next) {
	var query = '%'+req.query.q+'%';
	var data = {
		results: {}
	};
	req.db.manyOrNone("SELECT blog.id, blog.title, blog.slug, blog.timestamp, positions.slug AS position_slug FROM blog LEFT JOIN positions ON blog.positionid=positions.id WHERE LOWER(blog.title) LIKE LOWER($1) ORDER BY blog.timestamp DESC", [query])
		.then(function (blogPosts) {
			if (blogPosts.length != 0) {
				data.results.blog = {
					name: 'Blog Posts',
					results: []
				}
				for (var i = 0; i < blogPosts.length; i++) {
					data.results.blog.results.push({
						title: blogPosts[i].title,
						url: '/jcr/blog/'+blogPosts[i].position_slug+'/'+blogPosts[i].timestamp.getFullYear()+'/'+(blogPosts[i].timestamp.getMonth()+1)+'/'+blogPosts[i].slug,
						description: prettydate.format(blogPosts[i].timestamp)
					});
				};
			}
			return req.db.manyOrNone("SELECT name, timestamp, image, slug FROM events WHERE LOWER(name) LIKE LOWER($1) AND timestamp>NOW() ORDER BY timestamp ASC", [query]);
		})
		.then(function (events) {
			if (events.length != 0) {
				data.results.events = {
					name: 'Upcoming Events',
					results: []
				}
				for (var i = 0; i < events.length; i++) {
					data.results.events.results.push({
						title: events[i].name,
						// image: '/images/events/'+events[i].image,
						url: "/events/"+events[i].timestamp.getFullYear()+"/"+(events[i].timestamp.getMonth()+1)+"/"+(events[i].timestamp.getDate())+"/"+events[i].slug,
						description: events[i].timestamp.toDateString()
					});
				};
			}
			if (!req.isAuthenticated()) {
				return res.json(data);
			}
			return req.db.manyOrNone("SELECT name, username FROM users WHERE LOWER(name) LIKE LOWER($1)", [query]);			
		})
		.then(function (users) {
			if(users.length != 0) {
				data.results.users = {
					name: 'Grey College Members',
					results: []
				}
				for (var i = 0; i < users.length; i++) {
					data.results.users.results.push({
						title: users[i].name,
						// image: '/api/users/'+users[i].username+'/avatar',
						url: '/services/users/'+users[i].username,
						description: users[i].username
					});
				};
			}
			return res.json(data);
		})
		.catch( function (err) {
			return res.json(err);
		})
});

router.get('/events/:year/:month', function (req, res, next) {
	req.db.one("SELECT id, name, slug, description, image AS positions_slug FROM events WHERE date_part('year', blog.timestamp)=$1 AND date_part('month', blog.timestamp)=$2", req.params.id)
		.then(function (position) {
			if (!position.description) {
				position.description = "No Description"
			}
			return res.json(position);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/positions/:id', function (req, res, next) {
	req.db.one("SELECT title, description FROM positions WHERE id=$1", req.params.id)
		.then(function (position) {
			if (!position.description) {
				position.description = "No Description"
			}
			return res.json(position);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/users', function (req, res, next) {
	var query = '%'+req.query.q+'%';
	req.db.manyOrNone('SELECT * FROM users WHERE LOWER(username) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1)', query)
		.then(function (users) {
			return res.json({success: true, users: users});
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/users/:username', function (req, res, next) {
	req.db.one("SELECT * FROM users WHERE username='"+req.params.username+"'")
		.then(function (user) {
			return res.json(user);
		}).catch(function (err) {
			return res.json(err);
		});
});

router.get('/users/:username/avatar', function (req, res, next) {
	fs.access(__dirname+'/../public/images/avatars/'+req.params.username+'.png', function (err) {
		if (!err) {
			res.sendFile('public/images/avatars/'+req.params.username+'.png', {
    			root: __dirname+'/../'
    		});
		} else {
			res.sendFile('public/images/avatars/anon.png', {
    			root: __dirname+'/../'
    		});
		}
	});
	
});

router.get('/files/:directoryid', function (req, res, next) {
	var current
	var files;
	var directories;
	req.db.one("SELECT name, id, parent FROM file_directories WHERE id=$1", [req.params.directoryid])
		.then(function (data){
			current = data;
			return req.db.manyOrNone("SELECT id, timestamp, name, path, description FROM files WHERE directoryid=$1", [req.params.directoryid])
		})
		.then(function (data) {
			files = data;
			return req.db.manyOrNone("SELECT name, id FROM file_directories WHERE parent=$1", [req.params.directoryid]);
		})
		.then(function (data) {
			directories = data;
			res.json({"current": current,"directories": directories, "files": files});
		})
		.catch(function (err) {
			res.json(err);
		});
});

router.get('/feedback/new', function (req, res, next) {
	if (!req.isAuthenticated()) {
		err = new Error("Unauthenticated");
		err.status = 401;
		return res.json(err);
	}
	req.db.manyOrNone("SELECT feedback.id, feedback.title FROM feedback WHERE read_by_user=false AND parentid IS NULL AND exec=false AND author=$1", [req.user.username])
		.then(function(feedback) {
			res.json({data: feedback});
		})
		.catch(function(err) {
			res.json(err);
		})
});

// var https = require('https');

// router.get('/addusers', function (req, res, next) {
// 	usernames = ["bbch26", "bbnj43", "bbwt67", "bbzd51", "bbzt98", "bcdr34", "bdmr89", "bdmt42", "bdqf96", "bfmq63", "bfmr65", "bfnv68", "bfrq72", "bgdf95", "bgdk77", "bgvb57", "bgvp41", "bhgd66", "bhxq46", "bhxz47", "bjbf68", "bjdb23", "bjdc32", "bjtf34", "bjtr49", "bjwh75", "bkgq55", "bklc87", "bkmt59", "bkvq87", "bkwf31", "blbc65", "blpz88", "blqd48", "bnnp94", "bnpk58", "bnrs25", "bnsb42", "bpdb34", "bpgl36", "bphl19", "bpnd28", "bqwx34", "brkx94", "brth42", "bsfz92", "bsms48", "bsmz23", "btms29", "bvgz27", "bvtt17", "bwnj45", "bwvf24", "bwxj22", "bxnm83", "bxxm34", "bzjc38", "bzjs21", "bzjv23", "bzkk82", "bzlr55", "bzqc86", "cbsq43", "cbvp35", "cchn82", "cchn95", "ccjb79", "cclr92", "ccrf56", "ccws33", "cdbw68", "cddw83", "cdgd25", "cdjf44", "cdjt87", "cdlk68", "cdrc32", "cdvs49", "cfhq63", "cfhv33", "cfxb88", "cgbq26", "cgcm83", "cggb36", "cgns86", "cgsc62", "cgxc75", "cgxg34", "chcx17", "chzd56", "cjdk88", "cjkl62", "cjmj73", "cjnn57", "cjrz45", "cjtw77", "cjvw36", "ckqp25", "cksw24", "cksw73", "cktf74", "ckwk86", "ckwr13", "clml38", "cmbz68", "cmhs84", "cmrl27", "cmxm85", "cndg14", "cnnx11", "cnwq38", "cpbm63", "cpff31", "cphg75", "cprn16", "cpxf52", "Cqck24", "cqkw36", "cqsg26", "cqtd55", "cqxf55", "crdh45", "crtw35", "crxm12", "crzr54", "crzt76", "cscv22", "csdk72", "csff63", "cshl25", "csnw52", "ctbf19", "ctcc23", "ctpb63", "ctxg75", "ctxm99", "cvnc58", "cvxv27", "cwfd54", "cwpf69", "cwqd72", "cxbj44", "cxcp87", "cxns22", "cxwk57", "cxxv88", "czjp88", "czkq47", "czvv44", "dbcv62", "dblm25", "dccg25", "dchx18", "dcnr34", "dcsj33", "ddcx54", "ddfw58", "ddkj98", "ddsn67", "ddsn76", "ddzj38", "dfjk78", "dftj39", "dfwb58", "dgkq11", "dgnp97", "dgr4kls", "dgsr38", "dgvv83", "dgwt16", "dhbj81", "dhgh83", "dhnd95", "dhnj72", "dhnw21", "dhpw74", "dhrk45", "dhwk32", "dhwk35", "djbr65", "djjl38", "djmc35", "djpp83", "djvd39", "djwr67", "djxd26", "djzj25", "dkgl44", "dkhj97", "dklt36", "dkml18", "dkqx86", "dkrm39", "dkrn31", "dljs67", "dlms51", "dlvx77", "dmch36", "dmhx27", "dmnp46", "dmth16", "dnfj52", "dnmh66", "dnnj87", "dntw69", "dplj87", "dqlz22", "dqtm68", "dqvn38", "dqvn53", "dqvt53", "dqws27", "drdj73", "drgr13", "drjh11", "drkl79", "drmr89", "drql76", "dsgd69", "dsgd74", "dsgn37", "dsgs37", "dsjs67", "dslw54", "dspd63", "Dsrx49", "dtbz22", "dtfv78", "dtjb62", "dtkq28", "dtsg75", "dtwb37", "dvbt34", "dvwh44", "dwfb61", "dwht48", "dwlg45", "dwlz95", "dwtd18", "dxcl73", "dxgn84", "dxrw82", "dxxd43", "dxzw95", "dzjn38", "dznx38", "fbbf79", "fbdh95", "fbqw77", "fbrh52", "fclh66", "fcmv32", "fcnq54", "fdbh84", "fddb29", "fddt76", "fdhh56", "fdpw89", "fdqd43", "ffgt14", "ffhr85", "ffmj25", "ffxs36", "fgbm72", "fgcn82", "fgcs83", "fgdc56", "fgdv78", "fgjp63", "fgxt43", "fhgh35", "fhsd35", "fhvs34", "fhzw76", "fjdn24", "fjks33", "fjxp86", "fjxw35", "fkbg33", "fkdl45", "fknl45", "flgb73", "fljs81", "Flkl31", "flwl25", "fmcl41", "fmjk35", "fmtq86", "fmwg88", "fncb73", "fnct23", "fncz53", "fndg14", "fnjc96", "fnlj87", "fnsg64", "fnts69", "fnvq42", "fnxb36", "fpfm54", "fplj45", "fplm87", "fpnp45", "fpnr63", "fpwp94", "fpzz39", "fqbr93", "fqvj56", "frmg56", "frmp84", "fsdd58", "fsdn29", "fspc34", "fsqd15", "fssd89", "fstp33", "fstr36", "ftbx56", "fthg82", "ftkt64", "ftnr67", "ftpd34", "ftqw52", "ftxm51", "fvgc24", "fvxj67", "fwsw97", "fxck66", "fxgn85", "fxnj75", "fxqn52", "fxrg44", "fxsn84", "fzfd86", "fzgk71", "fzhb67", "fzjx85", "fzlw37", "fzpx65", "fzqh62", "gbxl36", "gcxd83", "gcxn74", "gdbg96", "gdcm42", "gdkn84", "gdvm84", "gdxb14", "gdxh39", "gflj59", "gfls28", "gfrp76", "gfsz78", "gfwq36", "ggfc34", "ggkv71", "ggsx68", "ggvs36", "ggxs68", "ghhk85", "ghkz18", "ghlx56", "ghmt38", "ghrl26", "ghsl77", "gjfs33", "gjnf16", "gjtv43", "gjvr17", "gkng34", "glbq89", "glmv53", "glzw57", "gmgq89", "gnhc14", "gnkt24", "gnlr67", "gnmt51", "gnqr82", "gpvk86", "gpwr27", "gpzk23", "gqcn58", "gqhw49", "gqjn33", "gqlh48", "gqlj64", "gqmh86", "gqpk93", "gqtw52", "gqxl64", "grnj85", "grnm71", "grqb42", "grsf43", "grsk15", "grws49", "gscc61", "gscm22", "Gsmc52", "gsrd68", "gssq42", "gsvf71", "gsww54", "gsxw87", "gtbg59", "gtxh47", "gvbx52", "gvkt43", "gvtr92", "gwvn45", "gwvr15", "gxnt58", "gxrs52", "gzqj57", "hbnt92", "hbrs62", "hbxz35", "hcgl58", "hcjp69", "hckz39", "hcwp49", "hcwr14", "hczx41", "hdcc55", "hdgn45", "hdmc18", "hdqp35", "hdrz54", "hdsx86", "hfbc81", "hfcr45", "hfvf64", "hfvl58", "hgct73", "hgkl86", "hgmk72", "hgpw45", "hgwb76", "hgxp25", "hhgt48", "hjbm82", "hjdn62", "hjjf96", "hjjv41", "hjlx81", "hjtn88", "hjwg55", "hjxr14", "hjxs73", "hjxx64", "Hkbc55", "hkdg84", "hkjl53", "hkml65", "hlkj38", "hlnd96", "hlqx18", "hlrg68", "hmkb48", "hmmw56", "hmpq22", "hmwv28", "hmxk55", "hnhw75", "hpbb99", "Hpcg74", "hplf28", "hprz52", "hpxl44", "hqbt83", "hqjg68", "hqrm54", "hqtn23", "hqvv45", "hqvw25", "hrjt62", "hrmp98", "hrnw66", "hrpb24", "hrwb78", "hsbt66", "hsdz38", "hskk84", "hszv28", "htfj55", "hthc36", "htwl37", "htwr56", "hvhs52", "hvmd26", "hwcw47", "hwjq25", "hwlq22", "hwnk57", "hwvz16", "hwzh37", "hxjq34", "hxrq82", "hxsh35", "hxxz24", "hzkj23", "hznq48", "hzqs68", "hzrg23", "jbcw54", "jbpm38", "jbrc11", "jbrl58", "jbvr35", "jbvs72", "jcbs78", "jckt88", "jcmz24", "jcrn52", "jctx39", "jdjt69", "jdvk46", "jffs35", "jfpl38", "jftb23", "jftb58", "jfvc54", "jgmp84", "jgqq74", "jgsj92", "jgww68", "jgzg16", "jhcj32", "jhht21", "jhjw98", "jhpf68", "jhwq36", "jhxs29", "jhzm87", "jjgj22", "jjhq47", "jjjs67", "jjpb62", "jkff29", "jkhc17", "jkkz95", "jkpn36", "jkqv73", "jkvd62", "jkzj34", "jlgc75", "jlzj95", "jlzz12", "jmcj96", "jmfb32", "jmqf34", "jmvg29", "jmxz36", "jnbw31", "jnhv24", "jnkd91", "jnlc27", "jnmc58", "jnqt33", "jnsz73", "jnts48", "jntx31", "jnzg41", "jpcl56", "jplm58", "jpwl28", "jqks82", "jqvj46", "jrdh25", "jrfn83", "jrjm53", "jrkk57", "jrlb84", "jrmm84", "jrsx63", "jrtp26", "jrvg39", "jrvh15", "jsdp25", "jsjh88", "jsqr72", "jswd24", "jswj73", "jszb42", "jtgp17", "jtqf86", "jtvk43", "jvbx44", "jvcr31", "jvdk62", "jvdw53", "jvfr24", "jvkf33", "jvml36", "jvtp41", "jwmh57", "jwsx12", "jxhk58", "jxnp26", "jxqm47", "jzhn22", "jzkl58", "jzpr28", "jzwh91", "kblm85", "kbwp22", "kcct22", "kccv92", "kcfh54", "kcrp82", "kcvs35", "kddh85", "kdpv67", "kfdl73", "kfrg17", "kfrj71", "kgcx27", "kggl78", "KgKm35", "kglp88", "kgnj12", "kgpl68", "kgzf77", "kgzp88", "khbb43", "khcs33", "khds35", "khjd68", "khtn29", "khvd88", "kjbq21", "kjdq46", "kjmz68", "kjvj81", "kklr98", "kkqc78", "kktb39", "kkwb16", "klcc51", "klcx13", "kllk76", "klnl99", "kmcn95", "kmdk34", "kmdk38", "kmgj58", "kmnb54", "kmpg85", "kmpj88", "kmpk66", "kmpt18", "kmwj95", "kmxr83", "knnj92", "Knrh33", "kpgg33", "kppc48", "kqjd25", "kqmf42", "kqql56", "kqxd32", "kqxf82", "kqxz24", "krbn55", "krch47", "krfn47", "krjh25", "Krpj58", "krqx77", "krxh78", "ksjg78", "ksnl48", "kspf92", "ktlc35", "ktmz31", "ktvp37", "ktzx41", "kvlt27", "kvpk56", "kvts77", "kwkp59", "kwmb37", "kwnf68", "kwqx36", "kwsr53", "kwvw42", "kxhd68", "kxpt34", "kznd28", "kzrw85", "kzwl18", "kzwx29", "lbbh26", "lbnd35", "lbts13", "lclt76", "lcml59", "lcpr88", "lcpt86", "lcqs69", "lcrm57", "lcrz86", "lddj46", "ldkq65", "ldpl46", "ldqc38", "ldvc64", "lfjm49", "lfrp63", "lfrt64", "lfwh73", "lgbh66", "lgmz85", "lgnf98", "lgqn53", "lhdm23", "lhjt86", "lhqz95", "lhxh42", "ljdx67", "ljgb29", "ljsj26", "ljxm42", "ljzf44", "lkdd48", "lkkq92", "lkvj67", "lkxc78", "llfw57", "lljq12", "llkg23", "lllh86", "lllt53", "llnt73", "llqw33", "llrc47", "llsl71", "lmgd43", "lmgm26", "lmgq76", "lmgs77", "lmjr58", "lmwb28", "lnbq63", "lncl44", "lnhl58", "lpcb64", "lpfl28", "lppf36", "lpvh57", "lqdc33", "lqkx93", "lqpk92", "lrnf42", "lrvd87", "lsdm25", "lsgv25", "lsht38", "lssf38", "lssg85", "ltkq73", "ltmk75", "ltqv22", "lvbp56", "lvlx58", "lvxj33", "lvzs34", "lwdv36", "lwgs27", "lwsn15", "lwsp83", "lwtg51", "lwwr65", "lwwz37", "lxsf42", "lznx84", "lzwj24", "mbqq27", "mbqt45", "mbtz44", "mbxw35", "mcgr62", "mchl61", "mcxv55", "mdxc44", "mdzm25", "mfbw82", "mfdk82", "mfhv88", "mgkb62", "mhgg54", "mhgx49", "mhhb35", "mhkh22", "mhnm37", "mhnm49", "mhrj35", "mjkr33", "mjrh65", "mjsj26", "mkhk44", "mkqq82", "mlbb47", "mlbx87", "mlcv66", "mlfk84", "mlfw55", "mlkm84", "mlrv14", "mlwf18", "mmbn36", "mmlz32", "mmqh77", "mmrg63", "mmzl64", "mnjn42", "mnkj28", "mnmk74", "mnrw59", "mpkk37", "mpmr27", "mpzf79", "mqdz74", "mqfm75", "mqjj57", "mqjx82", "mqms37", "mqns68", "mrqg94", "mrwx48", "mrxg53", "msjm42", "msnz42", "mtcj32", "mtdq98", "mthx47", "mtjz81", "mtrm29", "mvjx76", "mvnd16", "mvpq67", "mvvn78", "mvxw56", "mwdb16", "mwgx61", "mwjb63", "mwvb86", "mwvl22", "mwwf62", "mwwq23", "mxcq14", "mxhs71", "mxmd31", "mxqm14", "mzdk76", "mzdw24", "mzhn58", "mzkk42", "mzlr34", "mzqb55", "MZWJ84", "nbmp66", "nbwg47", "nbzt22", "ncgs85", "ncjm94", "nckf84", "ncmz45", "ncxl35", "ndhr84", "ndvt48", "ndvw78", "ndxr55", "nfhk48", "nfqg69", "nfvj81", "nfwj75", "nfzd55", "ngbv24", "ngjn38", "nglb53", "ngmk64", "ngvf77", "ngzn88", "nhqz28", "nhsv85", "njbd52", "njcc26", "njgk68", "njjw16", "njkm85", "njwk48", "njzf39", "nkkg77", "nkmw16", "nlcj13", "nlrv32", "nlws97", "nlzd26", "nmck82", "nmlx81", "nmvj63", "nnlq39", "nnqk98", "nnrj43", "nnwv58", "nnzv86", "npbs71", "nplp46", "nplq52", "npxc82", "nqhl57", "nqhs55", "nqjq38", "nqqg54", "nqsg78", "nqsq41", "nqwd77", "nrck34", "nrjq75", "nrnw84", "nrvz33", "nshp44", "nsjs92", "nspc32", "nssk84", "nsvf83", "nswg48", "ntbh67", "ntlk45", "ntzm86", "nvdk78", "nvkd84", "nvlr46", "nvqj86", "nwjc38", "nwqb53", "nwrq65", "nwtn78", "nxkt67", "nxxk45", "nxxx56", "nzbs84", "nzmj57", "nzrp67", "pbcj64", "pbkj29", "pbll47", "pccb44", "pclf71", "pcrn68", "pcsh84", "pcsw55", "pdmd52", "pdxh68", "pfcb37", "pfdg36", "pfgm71", "pfhn43", "pftn66", "pggp58", "pghx33", "pgpg34", "pgqm65", "pgwt15", "phbt44", "phdf13", "phxl88", "phxw25", "pjch23", "pjmx99", "pjqb41", "pjtn29", "pjtt55", "pkhm33", "pkhx52", "pklj84", "pkmc67", "pkwr38", "pkws83", "plgk15", "plqk64", "pltw88", "pmhh85", "pmhn98", "pmnd45", "pmrr34", "pmwf43", "pncj87", "pndh16", "pngz57", "pnhx22", "pnqm92", "pnvc88", "pnvn81", "ppgp17", "ppkc41", "ppnb55", "ppqx47", "ppwn77", "pqmg42", "pqrn66", "pqsv44", "pqwj68", "pqwl75", "prqq38", "psdn73", "psjg28", "pskc84", "pslh42", "psss38", "psxn22", "ptll56", "ptqx42", "ptsb42", "pttm22", "ptzb45", "pvgv78", "pvhf73", "pvjs63", "pvlt86", "pvng53", "pvnv58", "pvpn72", "pvth54", "pwbd34", "pwdx89", "pwdz83", "pwgd58", "pwpj88", "pwsf78", "pwvj85", "pwvp58", "pxfn34", "pxgn84", "pxlt99", "pxtw19", "pxws68", "pzcq88", "pzjw57", "pzmp37", "pzrb37", "qbnk38", "qbxx39", "qcdh35", "qcgb63", "qclc78", "qctw37", "qcwq42", "qdhw26", "qdnt13", "qdsm51", "qdtb65", "qdzf72", "qdzk13", "qffq79", "qfkl85", "qftd63", "qftm35", "qgjl24", "qgkr71", "qgkw54", "qglq21", "qgpp28", "qgqk88", "qjzr57", "qkxj57", "qkzp83", "qlcm12", "qljz79", "qlln73", "qmcf79", "qmfb46", "qmhn75", "qmjc29", "qmnc24", "qmpv84", "qmtc43", "qmxj35", "qncc25", "qncs52", "qnms89", "qnpc26", "qnrj69", "qnvj34", "qnvk15", "qnzg76", "qpdp33", "qpmp43", "qpnm24", "qptz22", "qqds12", "qqdw82", "qqgg77", "qqmf74", "qqql57", "qqwf49", "qqxv22", "qrjf57", "qrlm88", "qrmf82", "qrpg82", "qsms58", "QSVK42", "qtjs14", "qttl34", "qvbq33", "qvcw94", "qvjq53", "qvrp54", "qvsk38", "qwdr95", "qwfm43", "qwgq15", "qwtd35", "qwtf65", "qwtg58", "qxcd64", "qxcf62", "qxdf89", "qxfn33", "qxhw41", "qxjj73", "qxjs82", "qxzv19", "qzbq57", "qzhg63", "qznb77", "qznv48", "rbdb16", "rbpk72", "rbqf17", "rccf72", "rccm78", "rchk44", "rclp45", "rcmx76", "rcmz33", "rcpc85", "rcpd87", "rcsl75", "rcwt61", "rczk48", "rdmr69", "rdpk65", "rdqc67", "rdws14", "rfcf96", "rfld62", "rfmw43", "rfnj47", "rfnn65", "rfqf58", "rfqt25", "rftb77", "rfth77", "rfxf88", "rghl44", "rgkj47", "rgml37", "rgrg26", "rgtd48", "rgtg62", "rgxd18", "rhkk64", "rhlk48", "rhpp23", "rhtm52", "rjjm36", "rjnt35", "rjrh82", "rjrk42", "rjtn96", "rjvw55", "rjwv53", "rkbp31", "rkcz57", "rkgx35", "rkhc54", "rktz35", "rkxl49", "rlnp34", "rlxl73", "rmbv43", "rmcs42", "rmfg45", "rmjx85", "rmmc34", "rmmw52", "rmtb14", "rncf37", "rngh42", "rnlf45", "rnnn35", "rnqv92", "rnzm67", "rpbt67", "rpjg56", "rpjg89", "rprj48", "rpss58", "rptm82", "rpts34", "rpxf52", "rpxf66", "rqbb65", "rqcm69", "rqfc42", "rqhc68", "rqlv94", "rqsq74", "rqvp45", "rrdb67", "rrfr34", "rrfv38", "rrjc28", "rrjx88", "rrlz69", "rrzb16", "rsdf86", "rsdv82", "rsmr26", "rsnc87", "rtfm54", "rthp45", "rtrx35", "rvgr79", "rvpk48", "rvrw38", "rvtc54", "rwhc48", "rwlp88", "rwqm43", "rwqw82", "rwwl14", "rxdr53", "rxfd77", "rxgm55", "rxhl64", "rxkm18", "rxms25", "rxpr27", "rxvk82", "rxxl72", "rzcx65", "rzfj25", "rzlq73", "rzml79", "rzwh19", "rzzk15", "sbjq92", "sbxn76", "scjx86", "scsf26", "sczq86", "sdrn27", "sdsh63", "sdsh94", "sdxd66", "sffd48", "sfhx58", "sfmt24", "sfqv82", "sfvq58", "sfvr73", "sfvt52", "sgdb63", "sgfr37", "sgkx67", "sgth37", "sgtv63", "sgvr68", "sgxm11", "shgm44", "shhn85", "shkj87", "sjvv77", "sjxj44", "skbp92", "skds36", "skhc73", "skjh68", "skvw42", "skww25", "skxx85", "slcz78", "slds85", "slkr43", "slkr45", "sllz78", "snfj87", "snlm55", "snpg56", "snph78", "sntx63", "snxf97", "sphh63", "sqdz64", "sqjd99", "sqkm37", "sqmv16", "sqmv95", "sqrb52", "sqrg77", "sqsw34", "sqvm83", "srdl43", "srfd66", "srgz97", "srpw88", "srsn12", "srtz27", "ssgb33", "ssgh37", "sskp63", "ssps73", "ssrm46", "sssf69", "sssq57", "sswc98", "stdm65", "sthq14", "stld56", "stmv46", "strw36", "svcg89", "svhp56", "svph35", "svsx84", "svtb77", "swck66", "swgl15", "swlt36", "swrp91", "sxbp38", "sxcq13", "sxdn37", "sxjj31", "sxlt17", "sxxt51", "szkv56", "szlk64", "szsk38", "tbhl82", "tbnm85", "tbvk91", "tbwx33", "tcnt39", "tctr61", "tcws28", "tczk26", "tdbj44", "tdgh38", "tdnm44", "tdpk41", "tfjj68", "tfjk44", "tflx73", "tftx41", "tgdl49", "tgfx73", "tggw55", "tgjb88", "tgkd95", "tgpf89", "tgpx25", "tgqh94", "tgtg93", "thpr54", "thtl52", "tjdp67", "tjnk67", "tjws51", "tkcw67", "tkhj89", "tkjm36", "tklt48", "tkmv55", "tkqh92", "tkvx26", "tlht39", "tlnp82", "tlwk73", "tmtg11", "tnbw96", "tpdp74", "tpjq86", "tpkc85", "tpmn34", "tprv85", "tqfz24", "tqhh37", "tqjk66", "tqjt16", "tqkc53", "tqqt24", "tqrg96", "tqxv44", "trcv23", "trdm78", "trjn38", "trtb63", "Trxz88", "tshb92", "tswp44", "tszd89", "ttch21", "ttsm86", "ttsr45", "tvdk42", "tvjn31", "tvpc95", "tvrj63", "tvwl35", "twld52", "twlh12", "twmr14", "twqs59", "twsg81", "txgn77", "txjx44", "txsk12", "tzlz46", "vbmp21", "vbnl43", "vbnm36", "vbpr93", "vbvn26", "vbzf72", "vcgh16", "vcgl75", "vclx34", "vclx62", "vcpf23", "vczj21", "vddw73", "vdfr97", "vdtv89", "vfhw23", "vfnd93", "vfvv72", "vfxv73", "vgdm83", "vgjj23", "vgmm84", "vgrl85", "vhbw73", "vhgp49", "vhhl42", "vhht44", "vhmc74", "vhvs24", "vjbr65", "vjkh55", "vjtr44", "vkjs23", "vkjz78", "vkmh78", "vldr62", "vljt42", "vlkj73", "vlrw54", "vlvk85", "vlxz57", "vlzz83", "vmcd25", "vmgq42", "vmnv86", "vmpb43", "vmsv37", "vmvh77", "vmwv88", "vnfb64", "vnlp54", "vpfn72", "vpfx24", "vpjq84", "vpkb67", "vpnk35", "vppb86", "vprq63", "vpzs72", "vqbr88", "vqqx29", "vqwt21", "vqxn94", "vrfj13", "vrgs61", "vrrd79", "vrwc42", "vrwd32", "vrxd21", "vrxj83", "vrxk26", "vsvl93", "vtcr27", "vtlt74", "vtvz21", "vtwk78", "vtzw69", "vvbt54", "vvdp86", "vvdv64", "vvhd16", "vvkh58", "vvkk73", "vvlq21", "vvnq22", "vvqv62", "vvxc73", "vwbf46", "vwnv48", "vxcv32", "vxlp87", "vxlx63", "vxpd25", "vxpr22", "vxzv62", "vzmf49", "vzpf77", "vzrs61", "vzvl41", "wbjm27", "wbqd35", "wbqk63", "wbsk24", "wchj76", "wcpg64", "wcpn62", "wctr39", "wdhv62", "wdjk63", "wdpd28", "wdpv99", "wdrc53", "wdwd26", "wdwh47", "wfcc77", "wfdh72", "wfgn47", "wfgz64", "wfmg55", "wfph73", "wgbg68", "wghj36", "wgpr25", "wgtw44", "wgwf32", "whdv49", "whwb27", "wjfm78", "wjqk64", "wkfc76", "wkkh57", "wksf74", "wktp68", "wkxm72", "wlff43", "wlkr26", "wlmf57", "wlnn66", "wltw54", "wlvg65", "wlwt22", "wmcr23", "wmnd72", "wmnx58", "wmvs46", "wmxd94", "wnqc22", "wnsp72", "wntq16", "wplb68", "wpmb44", "wpnm45", "wpnr88", "wpql77", "wpsq38", "wpwv82", "wqfg79", "wqmk79", "wqnl63", "wqwm81", "wqzn45", "wrdq82", "wrkm56", "wrpp62", "wrxq64", "wsbx69", "wsdb65", "wsgv35", "wsnw74", "wsts38", "wsxf27", "wtfl74", "wtgn54", "wtgz27", "wtjf79", "wtpd79", "wttr26", "wtvs75", "wtwl81", "wvjd97", "wvkk63", "wvkn79", "wvmh23", "wvvq63", "wvxh78", "wwgf44", "wwjg28", "wwmn19", "wwrc54", "wxbq57", "wxfd27", "wxft34", "wxhs85", "wxkg97", "wxvb53", "wzgr23", "wzpc44", "wzsd61", "xbhf88", "xbhw37", "xblc42", "xbpt85", "xbrh57", "xbws24", "xcbg47", "xcbm32", "xchj13", "xclf64", "xclh83", "xclr33", "xcmr63", "xdgd64", "xdlh42", "xdlk42", "xdsx66", "xdvt13", "xffq35", "xfgv35", "xfmh23", "xfpx37", "xfwm99", "xgdl62", "xgjd64", "xgql82", "xgtq67", "xhcv41", "xhsx86", "xhwt99", "xjmp54", "xjss56", "xkfp97", "xkmf86", "xkvb22", "xlcz38", "xlfg51", "xlgn63", "xljp31", "xlvc73", "xlvr44", "xmcb75", "xmdr66", "xmjg74", "xmrc41", "xmrv37", "xmwt57", "xnck67", "xnfk23", "xpgq23", "xpkl56", "xplh56", "xprq87", "xpzv87", "xqsd44", "xqwl82", "xqzl71", "xrnr82", "XRNR86", "xrsl45", "xrsx33", "xrvr35", "xrwv75", "xskl65", "xtcl85", "xthq15", "xtnb83", "xtpd57", "xtvv28", "xtwp73", "xvgm38", "xvjm23", "xvpr61", "xvqd93", "xvwc31", "xwck87", "xwfb72", "xwfh42", "xwkt74", "xwml79", "xwnr86", "xwrg87", "xwsk17", "xwvf37", "xxjq81", "xxks54", "xxmr81", "xxsp83", "xxsq52", "xzkf61", "xzsv95", "xzvq33", "zbmj99", "zbqx98", "zbwk62", "zbxn71", "zckx23", "zcls22", "zcpj52", "zcrj84", "zdlj61", "zdmf76", "Zdmw35", "zdql56", "zdsj25", "zdxb44", "zfcj38", "zfsh93", "zghq35", "zght95", "zghv25", "zgrt12", "zgsh46", "zgxq68", "zhgd65", "zhjx78", "zhlt55", "zhtv25", "zhvx84", "zjhr72", "zjtc38", "zjwv78", "zkcl82", "zkfv44", "zkkx33", "zkwx19", "zkxx27", "zlht31", "zlnj74", "zmft54", "zmgk33", "zmrz87", "zmsr34", "zmvp48", "zmwr78", "znbw57", "zntq83", "zpkh14", "zptp45", "zqdp37", "zqqc75", "zqzg85", "zrcg15", "zrct66", "zrph23", "zrvz64", "zsgr73", "zshs54", "zspd45", "ztgd22", "zthk84", "zttf24", "zvpd77", "zwmj62", "zwtv44", "zxhv33", "zxhx39", "zxlx46", "zxtf95", "zxtw44", "zxvh22", "zxvx19", "zzgw23", "zzql55", "zzxn98"];
	
// 	var success = [];
// 	var fail = [];

// 	var i = 0;

// 	res.send('will do!')

// 	function myLoop () {

// 		console.log(usernames.length - i);

// 		if (i == usernames.length) {
// 	    	return;
// 	    }
	      
// 	    username = usernames[i].toLowerCase();

// 		var options = {
// 	        host: 'community.dur.ac.uk',
// 	        port: 443,
// 	        path: '/grey.jcr/itsuserdetailsjson.php?username='+username,  
// 	    };

// 		https.get(options, function(result){
// 	        var body = '';

// 	        result.on('data', function(chunk){ body += chunk; });

// 	        result.on('end', function(data){
// 	        	var response = JSON.parse(body);
// 	        	if (!response.error) {

// 	        		if (response.college != "Grey College") {
// 	        			delete username;
// 	        			fail.push(username)
// 		        		i++;
// 		        		return myLoop();
// 	        		} else {
// 		        		var username = response.username.toLowerCase();
// 			          	var name = (response.firstnames.split(',')[0]).capitalizeFirstLetter() +' '+ response.surname.capitalizeFirstLetter();
// 			          	var email = response.email;

// 			          	// See if the user exists
// 			          	req.db.oneOrNone('SELECT * FROM users WHERE username=$1', username).then(function (user) {
// 			            	// If the user doesn't exist check they're grey then add them
// 				            if (!user) {
// 				              return req.db.one("INSERT INTO users(username, email, name) VALUES ($1, $2, $3) RETURNING *", [username, email, name]);
// 				            } else {
// 				              return req.db.one("UPDATE users SET email=$2, name=$3 WHERE username=$1 RETURNING *", [username, email, name]);
// 			            	}
// 			          	}).then(function (user) {
// 			            	success.push(username);
// 			            	delete username;
// 			            	i++;
// 			            	return myLoop();
// 			          	}).catch(function (err) {
// 			           		fail.push(username);
// 			           		delete username;
// 			           		i++;
// 			           		return myLoop();
// 			        	})
// 			        }
// 		        } else {
// 		        	fail.push(username)
// 		        	delete username;
// 		        	i++;
// 		        	return myLoop();
// 		        }
// 	        });
// 	    }).on('error', function(err){
// 	        fail.push(username)
// 	    });
// 	}

// 	myLoop();  
// });

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
}

module.exports = router;