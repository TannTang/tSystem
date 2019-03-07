'use strict';

const BodyParser = require('body-parser');
const Path = require('path');

const MongoClient = require('mongodb').MongoClient;
const ObjId = require('mongodb').ObjectID;

const Express = require('express');
const Crypto = require('crypto');

//const Sheet = require('../shishi/DataSheet_shishi.js');
//const Sheet = require('../youdu/DataSheet_youdu.js');
const Sheet = require('../murmur/DataSheet_murmur.js');

const UpdImgsBlobRouter = require('./UpdImgsBlobRouter.js');
const UpdDocsBucketRouter = require('./UpdDocsBucketRouter.js');
const UpdRefsRouter = require('./UpdRefsRouter.js');
//const UpdBridgesRouter = require('./UpdBridgesRouter.js');

const dbURL = Sheet.db.url;
const dbName = Sheet.db.name;
const sheetColls = Sheet.collections;

const TSystem = async () => {

const mongoClient = new MongoClient(dbURL, {useNewUrlParser:true});

try {

	await mongoClient.connect();
	console.log('connected to '+ dbURL +' ---> '+ dbName);

	const db = mongoClient.db(dbName);

	const app = Express();
	// ---------- body-parser ----------------------------------------------------------------------------------------------------
	app.use(BodyParser.json());
	app.use(BodyParser.urlencoded({//此项必须在 bodyParser.json 下面,為參數編碼
		extended: true
	}));
	app.use(Express.static(Path.join(__dirname, 'client/build')));
	app.use('/upd_imgsblob', UpdImgsBlobRouter(sheetColls, db));
	app.use('/upd_docsbucket', UpdDocsBucketRouter(sheetColls, db));
	app.use('/upd_refs', UpdRefsRouter(sheetColls, db));
	//app.use('/upd_bridges', UpdBridgesRouter(db));

	function create_doc (coll) {
		let flds = sheetColls[coll].fields;
		let fldKeys = Object.keys(flds);
		let doc = {};
		for (let i=0; i<fldKeys.length; i++) {
			let fldKey = fldKeys[i];
			let bsonType = flds[fldKey].def.bsonType;
			let val = flds[fldKey].def.val;
			switch (bsonType) {
				case 'objectId': doc[fldKey] = new ObjId(); break;
				case 'date': doc[fldKey] = new Date(); break;
				default: doc[fldKey] = val; break;
			}
		}
		return doc;
	}

	app.get ('/*', (req, resp) => {
		resp.sendFile(Path.join(__dirname, 'client/build', 'index.html'));
	});

	app.post('/find_sheet', (req, resp) => {
		//console.log('/find_sheet');
		resp.send(Sheet);
	});

	app.post ('/find_filter', async (req, resp) => {
		let coll = req.body.coll;

		let filter = await db.collection('filters').findOne({collection:coll});

		if (filter) {
			resp.send(filter);
		} else {
			let flds = [];

			let selFlds = sheetColls[coll].fields;
			let selFldKeys = Object.keys(selFlds);
			
			for (let i=0; i<selFldKeys.length; i++) {
				selFld = selFlds[selFldKeys[i]];
				flds[i] = {key:selFldKeys[i], label:selFld.label, boolean:false};
			};

			filter = create_doc('filters');
			filter.collection = coll;
			filter.fields = flds;

			db.collection('filters').insertOne(filter, (err, result) => {
				resp.send(result.ops[0]);
			});
		}
	});

	app.post ('/upd_filter', async (req, resp) => {
		let coll = req.body.coll;
		let filterKey = req.body.filterKey;
		let filterBool = req.body.filterBool;
		let newFilters = await db.collection('filters').findOneAndUpdate({collection:coll, 'fields.key':filterKey}, {$set:{'fields.$.boolean':filterBool}}, {returnOriginal:false});
		resp.send(newFilters.value);
	});

	app.post('/find_docs', async (req, resp) => {
		let coll = req.body.coll;
		let filters = req.body.filters;
		let projectObj = {};
		for (let i=0; i<filters.length; i++) {
			if (filters[i].boolean) {
				projectObj[filters[i].key] = 1;
			}
		}
		let docs = await db.collection(coll).find({}).project(projectObj).toArray();
		resp.send(docs);
	});

	app.post('/find_doc', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let doc = await db.collection(coll).findOne({_id:_docId});
		resp.send(doc);
	});

	app.post('/ins_doc', (req, resp) => {
		let coll = req.body.coll;
		
		let doc = create_doc(coll);

		db.collection(coll).insertOne(doc, (err, result) => {
			resp.send(result.ops[0]); 
		});
	});

	app.post ('/upd_doc', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let obj = req.body.obj;
		//console.log(coll+', '+_id);
		let newDcm = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:obj}, {returnOriginal:false});
		resp.send(newDcm.value);
	});

	app.post ('/upd_docPss', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let fldKey = req.body.fldKey;
		let val = req.body.val;
		if (val !== '') {
			//val = Crypto.hashSync(req.body.val);
			val = crypto.createHmac('sha256').update(val).digest('hex');
		}
		let obj = {};
		obj[fldKey] = val;

		let newDcm = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:obj}, {returnOriginal:false});
		resp.send(newDcm.value);
	});

	app.post('/del_doc', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let flds = sheetColls[coll].fields;
		let fldKeys = Object.keys(flds);

		for (let i=0; i<fldKeys.length; i++) {
			if (flds[fldKeys[i]].reference) {
				let doc = await db.collection(coll).findOne({_id:_docId});
				if (doc[fldKeys[i]].length !== 0) {
					//console.log(doc[fldKeys[i]]);
					resp.send('have reference');
					return;
				}
				/*let rfrCllKy = flds[fldKeys[i]].reference.collection;
				let rfrFld = flds[fldKeys[i]].reference.field;
				let findObj = {};
				findObj[rfrFld] = _docId;

				if (rfrCllKy === 'images') {
					let imgs = await db.collection('images').find(findObj).toArray();
					if (imgs.length !== 0) {
						resp.send('images');
						return;
					}
				}
				await db.collection(rfrCllKy).deleteMany(findObj);*/
			}
		}
		await db.collection(coll).deleteOne({_id:_docId}, (err, dbRsp) => {
			resp.send(dbRsp);
		});
	});

	app.listen(5000, () => {
		console.log('http server listenin g on 5000')
	});

} catch (err) {
	console.log(err.stack);
}

};

TSystem();