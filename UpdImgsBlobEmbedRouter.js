const FS = require('fs');

const ObjId = require('mongodb').ObjectID;
const Express = require('express');

const AzrStg = require('azure-storage');
const Multer = require('multer');
const Sharp = require('sharp');

const uploads = Multer({dest:'uploads/'});

module.exports = (Sheet, db) => {

	const sheetColls = Sheet.collections;
	
	let blobSvr = null;
	let blobContainer = null;
	if (Sheet.blobContainer) {
		blobContainer = Sheet.blobContainer;
	}
	

	if (Sheet.ascs) {
		const ascs = Sheet.ascs;
		blobSvr = AzrStg.createBlobService(ascs);
		//const blobContainer = Sheet.blobContainer;

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

	router.post('/find_imgs', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		
		let doc = await db.collection(coll).findOne({_id:_docId});

		resp.send(doc[fld]);
	});

	router.post('/ins_img', uploads.single('file'), async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);

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

		let img = {
			_id: new ObjId(),
			scale: scale,
			filename: filename,
			url: url,
		}

		let doc = await db.collection(coll).findOne({_id:_docId});
		let imgs = doc[fld];
	
		imgs.push(img);

		let setObj = {};
		setObj[fld] = imgs;

		let result = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = result.value[fld];
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
		let imgs = doc[fld];

		let imgIdStrs = imgs.map((img) => (img._id.toString()));
		let imgIdx = imgIdStrs.indexOf(_imgId);

		imgs.splice(imgIdx, 1);
		let setObj = {};
		setObj[fld] = imgs;

		let result = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = result.value[fld];
		resp.send(newImgs);
	});

	router.post ('/upd_seq', async (req, resp) => {

		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _imgId = req.body._imgId;
		let mov = req.body.mov;

		let doc = await db.collection(coll).findOne({_id: _docId});
		let imgs = doc[fld];

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

		let setObj = {};
		setObj[fld] = imgs;

		let result = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});
		let newImgs = result.value[fld];
		resp.send(newImgs);
	});

 	return router;
}
