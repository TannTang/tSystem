'use strict';

const {Storage} = require('@google-cloud/storage');

//const IAM_ROLE = 'roles/storage.objectAdmin';
//const MEMBERS = [
	//'user:tannfeel@gmail.com',    // Example members to grant
	//'group:admins@example.com', // the new role to
//];
/*function getPublicUrlM(filename) {
	return `https://storage.googleapis.com/${BUCKET_NAME}/${filename +'_M.jpg'}`;
}*/

const FS = require('fs');
const ObjId = require('mongodb').ObjectID;
const Express = require('express');
const Multer = require('multer');

const multer = Multer({
	dest:'uploads/',
	storage: Multer.MemoryStorage,
	limits: {
		fileSize: 5 * 1024 * 1024 // no larger than 5mb
	}
});

const Sharp = require('sharp');

module.exports = (sheetColls, db) => {

	const router = Express.Router();

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

	function orderResult(result, queryIds) {
		let hashResult = result.reduce((prev, current) => {
			prev[current._id] = current;
			return prev;
		}, {});
		return queryIds.map((id) => {return hashResult[id]});
	}

	function defBucket(coll, fld) {
		const stg = new Storage({
			projectId: sheetColls[coll].fields[fld].upd.projectId,
			keyFilename: sheetColls[coll].fields[fld].upd.keyFilename,
		});
		let bucket = stg.bucket(sheetColls[coll].fields[fld].upd.bucketName);
		bucket['folder'] = sheetColls[coll].fields[fld].upd.bucketFolder;

		return bucket;
	}

	router.post('/find_img', async (req, resp) => {
		
		const coll = req.body.coll;
		const fld = req.body.fld;
		const _docId = new ObjId(req.body._docId);

		const filenameL = req.body.filenameL;

		const bucket = defBucket(coll, fld);

		let file = bucket.file(bucket.folder + filenameL);
		file.getSignedUrl({
			action: 'read',
			expires: new Date().getTime() + 5 * 60 * 1000
		}, (err, url) => {
			resp.send(url);
		});
	});

	router.post('/find_imgs', async (req, resp) => {

		const coll = req.body.coll;
		const fld = req.body.fld;
		const _docId = new ObjId(req.body._docId);
		
		const bucket = defBucket(coll, fld);

		let doc = await db.collection(coll).findOne({_id:_docId});
		
		if (doc[fld].length !== 0) {
			let count = 0;
			for (let i=0; i<doc[fld].length; i++) {
				let file = bucket.file(bucket.folder + doc[fld][i].filenameM);
				file.getSignedUrl({
					action: 'read',
					expires: new Date().getTime() + 5 * 60 * 1000
				}, (err, url) => {
					//console.log(url);
					count += 1;
					doc[fld][i]['urlM'] = url;
					if (count === doc[fld].length) {
						resp.send(doc[fld]);
					}
				});
			}
		} else {
			resp.send([]);
		}
	});

	router.post('/ins_img', multer.single('file'), async (req, resp, next) => {
		
		const coll = req.body.coll;
		const fld = req.body.fld;
		const _docId = new ObjId(req.body._docId);

		const scale = req.body.scale;
		const filename = req.file.filename;
		const path = req.file.path;

		const refEmbed = sheetColls[coll].fields[fld].upd.refEmbed;
		const setType = sheetColls[coll].fields[fld].upd.setType;

		const bucket = defBucket(coll, fld);

		await Sharp(path).resize(512, Math.round(512 * scale)).toFormat('jpeg').toFile(path +'_M.jpg');
		await Sharp(path).resize(2048, Math.round(2048 * scale)).toFormat('jpeg').toFile(path +'_L.jpg');
		await bucket.upload(path +'_M.jpg', {destination:bucket.folder + filename +'_M.jpg', gzip:true});
		await bucket.upload(path +'_L.jpg', {destination:bucket.folder + filename +'_L.jpg', gzip:true});

		Sharp.cache(false);
		FS.unlink(path +'_M.jpg', (err) => {if (err) throw err;});
		FS.unlink(path +'_L.jpg', (err) => {if (err) throw err;});
		FS.unlink(path, (err) => {if (err) throw err;});

		let img = create_doc('documents');
		img['type'] = setType;
		img['scale'] = scale;
		img['bucketName'] = bucket.name;
		img['bucketFolder'] = bucket.folder;
		img['filename'] = filename;
		img['filenameM'] = filename +'_M.jpg';
		img['filenameL'] = filename +'_L.jpg';
		img['referenceCollection'] = coll;
		img['referenceField'] = fld;
		img['_referenceDocumentId'] = _docId;

		let insResult = await db.collection('documents').insertOne(img);
		let	newImg = insResult.ops[0];
		
		let doc = await db.collection(coll).findOne({_id:_docId});

		let _refObj = {_id:newImg._id}
		for (let e=0; e<refEmbed.length; e++) {
			_refObj[refEmbed[e]] = newImg[refEmbed[e]];
		}

		doc[fld].push(_refObj);
		let setObj = {};
		setObj[fld] = doc[fld];

		await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});

		let file = bucket.file(bucket.folder + newImg.filenameM);
		file.getSignedUrl({
			action: 'read',
			expires: new Date().getTime() + 5* 60 * 1000
		}, (err, url) => {
			newImg['urlM'] = url;
			resp.send(newImg);
		});
	});

	router.post('/del_img', async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);

		let _imgId = req.body._imgId;
		let filenameM = req.body.filenameM;
		let filenameL = req.body.filenameL;
		
		const bucket = defBucket(coll, fld);

		let doc = await db.collection(coll).findOne({_id:_docId});

		let _newRefs = [];
		for (let i=0; i<doc[fld].length; i++) {
			if (doc[fld][i]._id.toString() !== _imgId) {
				_newRefs.push(doc[fld][i]);
			}
		}

		let updObj = {};
		updObj[fld] = _newRefs;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:updObj}, {returnOriginal:false});
		_imgId = new ObjId(_imgId);
		await db.collection('documents').deleteOne({_id: _imgId});

		await bucket.file(bucket.folder + filenameM).delete();
		await bucket.file(bucket.folder + filenameL).delete();

		resp.send(newDoc.value);
	});

	router.post ('/upd_seq', async (req, resp) => {

		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let fld = req.body.fld;
		let idx = req.body.idx;
		let mov = req.body.mov;

		const bucket = defBucket(coll, fld);

		let doc = await db.collection(coll).findOne({_id: _docId});

		let _imgs = doc[fld];

		if (mov === 1) {
			if (idx !== _imgs.length - 1) {
				let tmp = _imgs[idx + 1];
				_imgs[idx + 1] = _imgs[idx];
				_imgs[idx] = tmp;
			}
		} else if (mov === -1) {
			if (idx !== 0) {
				let tmp = _imgs[idx - 1];
				_imgs[idx - 1] = _imgs[idx];
				_imgs[idx] = tmp;
			}
		}

		let updObj = {};
		updObj[fld] = _imgs;

		let result = await db.collection(coll).findOneAndUpdate({_id: _docId}, {$set:updObj}, {returnOriginal:false});
		let newDoc = result.value;

		let count = 0 ;
		for (let i=0; i<newDoc[fld].length; i++) {
			let file = bucket.file(bucket.folder + newDoc[fld][i].filenameM);
			file.getSignedUrl({
				action: 'read',
				expires: new Date().getTime() + 5 * 60 * 1000
			}, (err, url) => {
				//console.log(url);
				count += 1;
				newDoc[fld][i]['urlM'] = url;
				if (count === newDoc[fld].length) {
					resp.send(newDoc[fld]);
				}
			});
		}
	});

 	return router;
}
