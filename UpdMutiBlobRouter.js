const FS = require('fs');

const ObjId = require('mongodb').ObjectID;
const Express = require('express');

const AzrStg = require('azure-storage');
const Multer = require('multer');
const Sharp = require('sharp');

const uploads = Multer({dest:'uploads/'});

module.exports = (Sheet, db) => {

	const sheetColls = Sheet.collections;

	if (Sheet.ascs) {
		const ascs = Sheet.ascs;
		const blobSvr = AzrStg.createBlobService(ascs);
		const blobContainer = Sheet.blobContainer;

		blobSvr.createContainerIfNotExists(blobContainer, function (err) {
			if (err) {
				console.log(err);
			} else { 
				setPermissions();
			}
		});

		function setPermissions() {
			let options = {publicAccessLevel:AzrStg.BlobUtilities.BlobContainerPublicAccessType.BLOB};
				blobSvr.setContainerAcl(blobContainer, null, options, (err) => {
				if (err) {
					console.log(err);
				} 
			});
		}
	}

	const router = Express.Router();

	router.post('/find_muti', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		
		let doc = await db.collection(coll).findOne({_id:_docId});
		let _muti = doc[fld];

		resp.send(_muti);
	});

	router.post('/ins_muti', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let type = req.body.type;
		
		let mutiObj = {
			_id: new ObjId(),
			type: type,
			str: '',
			imgs: [],
		};

		let doc = await db.collection(coll).findOne({_id:_docId});
		let muti = doc[fld];

		muti.push(mutiObj);
		let setObj = {};
		setObj[fld] = muti;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newMuti = newDoc.value[fld];
		resp.send(newMuti);
	});

	router.post('/upd_muti', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;
		let str = req.body.str;

		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let idx = mutiIdStrs.indexOf(_mutiId);

		mutis[idx].str = str;

		let setObj = {};
		setObj[fld] = mutis;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newMuti = newDoc.value[fld];
		resp.send(newMuti);
	});

	router.post('/mov_muti', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;
		let mov = req.body.mov;
		
		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let idx = mutiIdStrs.indexOf(_mutiId);

		if (mov === 1) {
			if (idx !== mutis.length - 1) {
				let tmp = mutis[idx + 1];
				mutis[idx + 1] = mutis[idx];
				mutis[idx] = tmp;
			}
		} else if (mov === -1) {
			if (idx !== 0) {
				let tmp = mutis[idx - 1];
				mutis[idx - 1] = mutis[idx];
				mutis[idx] = tmp;
			}
		}

		let setObj = {};
		setObj[fld] = mutis;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newMuti = newDoc.value[fld];
		resp.send(newMuti);
	});

	router.post('/del_muti', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;

		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let idx = mutiIdStrs.indexOf(_mutiId);

		if (mutis[idx].type === 'imgs') {
			if (mutis[idx].imgs.length === 0) {

				let modMutis = [];

				mutis.map((muti) => {
					if(muti._id.toString() !== _mutiId) {
						modMutis.push(muti);
					}
				});

				let setObj = {};
				setObj[fld] = modMutis;

				let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
				let newMuti = newDoc.value[fld];
				resp.send(newMuti);

			} else {
				resp.send('haveimg');
			}
		}
	});

	router.post('/find_imgs', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;
		
		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let idx = mutiIdStrs.indexOf(_mutiId);

		resp.send(mutis[idx].imgs);
	});

	router.post('/ins_img', uploads.single('file'), async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;

		const scale = req.body.scale;
		const path = req.file.path;
		const filename = req.file.filename;

		const pathXS = req.file.path +'_XS.jpg';
		const pathS = req.file.path +'_S.jpg';
		const pathM = req.file.path +'_M.jpg';
		const pathL = req.file.path +'_L.jpg';
		const pathXL = req.file.path +'_XL.jpg';
		const filenameXS = req.file.filename +'_XS.jpg';
		const filenameS = req.file.filename +'_S.jpg';
		const filenameM = req.file.filename +'_M.jpg';
		const filenameL = req.file.filename +'_L.jpg';
		const filenameXL = req.file.filename +'_XL.jpg';

		await Sharp(path).resize(128, Math.round(  128 * scale)).toFormat('jpeg').toFile(pathXS);
		await Sharp(path).resize(256, Math.round(  256 * scale)).toFormat('jpeg').toFile(pathS);
		await Sharp(path).resize(512, Math.round(  512 * scale)).toFormat('jpeg').toFile(pathM);
		await Sharp(path).resize(1024, Math.round(1024 * scale)).toFormat('jpeg').toFile(pathL);
		await Sharp(path).resize(2048, Math.round(2048 * scale)).toFormat('jpeg').toFile(pathXL);

		await blobSvr.createBlockBlobFromLocalFile(blobContainer, filenameXS, pathS, (err, resultXS) => {});
		await blobSvr.createBlockBlobFromLocalFile(blobContainer, filenameS, pathS, (err, resultS) => {});
		await blobSvr.createBlockBlobFromLocalFile(blobContainer, filenameM, pathM, (err, resultM) => {});
		await blobSvr.createBlockBlobFromLocalFile(blobContainer, filenameL, pathL, (err, resultL) => {});
		await blobSvr.createBlockBlobFromLocalFile(blobContainer, filenameXL, pathXL, (err, resultXL) => {});

		const url = blobSvr.getUrl(blobContainer, filename);

		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let mutiIdx = mutiIdStrs.indexOf(_mutiId);

		let img = {
			_id: new ObjId(),
			scale: scale,
			filename: filename,
			url: url,
		}
		
		mutis[mutiIdx].imgs.push(img);

		let setObj = {};
		setObj[fld] = mutis;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = newDoc.value[fld][mutiIdx].imgs;
		resp.send(newImgs);

		Sharp.cache(false);
		FS.unlink(path, (err) => {if (err) throw err;});
		FS.unlink(pathXS, (err) => {if (err) throw err;});
		FS.unlink(pathS, (err) => {if (err) throw err;});
		FS.unlink(pathM, (err) => {if (err) throw err;});
		FS.unlink(pathL, (err) => {if (err) throw err;});
		FS.unlink(pathXL, (err) => {if (err) throw err;});
	});

	router.post('/del_img', async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;
		let _imgId = req.body._imgId;

		let filenameXS = req.body.filename +'_XS.jpg';
		let filenameS = req.body.filename +'_S.jpg';
		let filenameM = req.body.filename +'_M.jpg';
		let filenameL = req.body.filename +'_L.jpg';
		let filenameXL = req.body.filename +'_XL.jpg';
		
		await blobSvr.deleteBlobIfExists(blobContainer, filenameXS, (err, resultXS) => {});
		await blobSvr.deleteBlobIfExists(blobContainer, filenameS, (err, resultS) => {});
		await blobSvr.deleteBlobIfExists(blobContainer, filenameM, (err, resultM) => {});
		await blobSvr.deleteBlobIfExists(blobContainer, filenameL, (err, resultL) => {});
		await blobSvr.deleteBlobIfExists(blobContainer, filenameXL, (err, resultXL) => {});

		let doc = await db.collection(coll).findOne({_id:_docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let mutiIdx = mutiIdStrs.indexOf(_mutiId);

		let imgIdStrs = mutis[mutiIdx].imgs.map((img) => (img._id.toString()));
		let imgIdx = imgIdStrs.indexOf(_imgId);

		mutis[mutiIdx].imgs.splice(imgIdx, 1);
		let setObj = {};
		setObj[fld] = mutis;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = newDoc.value[fld][mutiIdx].imgs;
		resp.send(newImgs);
	});

	router.post ('/upd_seq', async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _mutiId = req.body._mutiId;
		let _imgId = req.body._imgId;
		let mov = req.body.mov;

		let doc = await db.collection(coll).findOne({_id: _docId});
		let mutis = doc[fld];

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()));
		let mutiIdx = mutiIdStrs.indexOf(_mutiId);

		let imgs = mutis[mutiIdx].imgs;
		let imgIdStrs = imgs.map((img) => (img._id.toString()));
		let imgIdx = imgIdStrs.indexOf(_imgId);

		if (mov === 1) {
			if (imgIdx !== imgs.length - 1) {
				let tmp = imgs[imgIdx + 1];
				imgs[imgIdx + 1] = imgs[imgIdx];
				imgs[imgIdx] = tmp;
			}
		} else if (mov === -1) {
			if (imgIdx !== 0) {
				let tmp = imgs[imgIdx - 1];
				imgs[imgIdx - 1] = imgs[imgIdx];
				imgs[imgIdx] = tmp;
			}
		}

		mutis[mutiIdx].imgs = imgs;
		let setObj = {};
		setObj[fld] = mutis;

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = newDoc.value[fld][mutiIdx].imgs;
		resp.send(newImgs);
	});

 	return router;
}
