const BdyPrs = require('body-parser');
const Pth = require('path');

const MngCln = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectID;

const Exp = require('express');
const Bcr = require('bcrypt-nodejs');

const Sht = require('../murmur/murmursheet.js');
//const Sht = require('../01_yd/ShtYd.js');
//const Sht = require('../01_sh/ShtSh.js');
//const UpdImgSngBlbRtr = require('./UpdImgSngBlbRtr.js');
const UpdImgBlbRtr = require('./UpdImgBlbRtr.js');
const UpdRfrRtr = require('./UpdRfrRtr.js');
const UpdBrdsRtr = require('./UpdBrdsRtr.js');

const dbURL = Sht.db.url;
const dbNm = Sht.db.name;
const clls = Sht.collections;

const ts = async () => {

const mngCln = new MngCln(dbURL, {useNewUrlParser:true});

try {

	await mngCln.connect();
	console.log('connected to '+ dbURL +' ---> '+ dbNm);

	const db = mngCln.db(dbNm);

	const app = Exp();
	// ---------- body-parser ----------------------------------------------------------------------------------------------------
	app.use(BdyPrs.json());
	app.use(BdyPrs.urlencoded({//此项必须在 bodyParser.json 下面,為參數編碼
		extended: true
	}));
	app.use(Exp.static(Pth.join(__dirname, 'client/build')));
	app.use('/updImgBlb', UpdImgBlbRtr(clls, db));
	app.use('/updRfr', UpdRfrRtr(clls, db));
	app.use('/updBrds', UpdBrdsRtr(db));

	function crt_dcm (cllKy) {
		
		let flds = clls[cllKy].fields;
		let fldKys = Object.keys(flds);

		let dcm = {};

		for (let i=0; i<fldKys.length; i++) {
			let fldKy = fldKys[i];
			let bsnTyp = flds[fldKy].default.bsonType;
			let vl = flds[fldKy].default.value;

			switch (bsnTyp) {
				case 'objectId': dcm[fldKy] = new ObjId(); break;
				case 'timestamp': dcm[fldKy] = new TmStm(); break;
				case 'date': dcm[fldKy] = new Date(); break;
				default: dcm[fldKy] = vl; break;
			}
		}
		return dcm;
	}

	app.get ('/*', function (rqs, rsp) {
		rsp.sendFile(Pth.join(__dirname, 'client/build', 'index.html'));
	});

	app.post('/fnd_sht', (rqs, rsp) => {
		rsp.send(Sht);
	});

	app.post ('/fnd_flt', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;

		let flt = await db.collection('filters').findOne({collection:cllKy});

		if (flt) {
			rsp.send(flt);
		} else {
			let flds = [];

			let sltFlds = clls[cllKy].fields;
			let sltFldKys = Object.keys(sltFlds);
			
			for (let i=0; i<sltFldKys.length; i++) {
				sltFld = sltFlds[sltFldKys[i]];
				flds[i] = {key:sltFldKys[i], label:sltFld.label, boolean:false};
			};

			flt = crt_dcm('filters');
			flt.collection = cllKy;
			flt.fields = flds;

			db.collection('filters').insertOne(flt, (err, dbRsp) => {
				rsp.send(dbRsp.ops[0]);
			});
		}
	});

	app.post ('/upd_flt', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let fltKy = rqs.body.fltKy;
		let fltBln = rqs.body.fltBln;
		let nwFlts = await db.collection('filters').findOneAndUpdate({collection:cllKy, 'fields.key':fltKy}, {$set:{'fields.$.boolean':fltBln}}, {returnOriginal:false});
		rsp.send(nwFlts.value);
	});

	app.post('/fnd_dcms', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let flts = rqs.body.flts;
		let prj = {};
		for (let i=0; i<flts.length; i++) {
			if (flts[i].boolean) {
				prj[flts[i].key] = 1;
			}
		}
		let dcms = await db.collection(cllKy).find({}).project(prj).toArray();
		rsp.send(dcms);
	});

	app.post('/fnd_dcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
		rsp.send(dcm);
	});

	app.post('/ins_dcm', (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		
		let dcm = crt_dcm(cllKy);

		db.collection(cllKy).insertOne(dcm, (err, dbRsp) => {
			rsp.send(dbRsp.ops[0]); 
		});
	});

	app.post ('/upd_dcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let obj = rqs.body.obj;
		//console.log(cllKy+', '+_id);
		let nwDcm = await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:obj}, {returnOriginal:false});
		rsp.send(nwDcm.value);
	});

	app.post ('/upd_dcmPss', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let fldKy = rqs.body.fldKy;
		let vl = rqs.body.vl;
		if (vl !== '') {
			vl = Bcr.hashSync(rqs.body.vl);
		}
		let obj = {};
		obj[fldKy] = vl;

		let nwDcm = await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:obj}, {returnOriginal:false});
		rsp.send(nwDcm.value);
	});

	app.post('/dlt_dcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let flds = clls[cllKy].fields;
		let fldKys = Object.keys(flds);

		for (let i=0; i<fldKys.length; i++) {
			if (flds[fldKys[i]].reference) {
				let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
				if (dcm[fldKys[i]].length !== 0) {
					//console.log(dcm[fldKys[i]]);
					rsp.send('have reference');
					return;
				}
				/*let rfrCllKy = flds[fldKys[i]].reference.collection;
				let rfrFld = flds[fldKys[i]].reference.field;
				let fndObj = {};
				fndObj[rfrFld] = _dcmId;

				if (rfrCllKy === 'images') {
					let imgs = await db.collection('images').find(fndObj).toArray();
					if (imgs.length !== 0) {
						rsp.send('images');
						return;
					}
				}
				await db.collection(rfrCllKy).deleteMany(fndObj);*/
			}
		}
		await db.collection(cllKy).deleteOne({_id:_dcmId}, (err, dbRsp) => {
			rsp.send(dbRsp);
		});
	});

	app.listen(5000, () => {
		console.log('http server listenin g on 5000')
	});

} catch (err) {
	console.log(err.stack);
}

};

ts();