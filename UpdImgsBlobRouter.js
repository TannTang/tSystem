const FS = require('fs');

const ObjId = require('mongodb').ObjectID;

const Express = require('express');
const AzrStg = require('azure-storage');
const Multer = require('multer');
const Sharp = require('sharp');

const uploads = Multer({dest:'uploads/'});

const ascs = 'DefaultEndpointsProtocol=https;AccountName=youdu;AccountKey=/NeujD/MOD+Pfs6mTu43z6NrrlZoULU6/IEfJ4QWLDtQHrICIg4maua8LS+rVPZNqOJ9SbHe8eHioN7+r2jDHQ==;EndpointSuffix=core.windows.net';
//const ascs = 'DefaultEndpointsProtocol=https;AccountName=shi;AccountKey=f6ObExk54WzwiIJydGPuPFRwLyLZVQGNq1wu9cVyzrtNB57CekwAWoUIcN/rzM2g3NDz+ZjNbyMsRvuONBHbuA==;EndpointSuffix=core.windows.net';
const blobSvr = AzrStg.createBlobService(ascs);
const blobContainer = 'youdu-imgs';
//const blobContainer = 'shiblb';
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

module.exports = (sheetColls, db) => {

	const imgSizes = [{letter:'S', width:128}, {letter:'M', width:512}, {letter:'L', width:1024}];
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

	router.post('/find_imgs', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let fld = req.body.fld;

		let doc = await db.collection(coll).findOne({_id:_docId});

		let _ids = [];
		for (let i=0; i<doc[fld].length; i++) {
			if (doc[fld][i]._id) {
				_ids.push(doc[fld][i]._id);
			} else {
				_ids.push(doc[fld][i]);
			}
		}

		let findObj = {_id:{$in:_ids}};
		let imgs = await db.collection('images').find(findObj).toArray();
		let orderImgs = orderResult(imgs, _ids);

		resp.send(orderImgs);
	});

	router.post('/ins_img', uploads.single('file'), (req, resp) => {

		let img = create_doc('images');
		let refEmbed = sheetColls[req.body.coll].fields[req.body.fld].upd.refEmbed;
		let setType = sheetColls[req.body.coll].fields[req.body.fld].upd.setType;

		img['referenceCollection'] = req.body.coll;
		img['_referenceDocumentId'] = new ObjId(req.body._docId);
		img['referenceField'] = req.body.fld;
		img['type'] = setType;
		img['scale'] = req.body.scale;
		img['fileName'] = req.file.filename;
		img['path'] = req.file.path;

		for (let i = 0; i<imgSizes.length; i++) {
			let fileName = img.fileName+'_'+ imgSizes[i].letter +'.jpg';
			let path = img.path+'_'+ imgSizes[i].letter +'.jpg';
			let urlKey = 'url'+imgSizes[i].letter;

			Sharp(req.file.path)
			.resize(imgSizes[i].width, Math.round(imgSizes[i].width * img.scale), {
				//fit: Sharp.fit.contain,
			})
			.toFormat('jpeg')
			.toFile(path)
			.then((buf) => {
				blobSvr.createBlockBlobFromLocalFile(blobContainer, fileName, path, async (err, result) => {
					if (!err) {

						let flUrl = __dirname+'/uploads/'+fileName;
						FS.unlink(flUrl, (err) => {
							if (err) throw err;
						});

						img[urlKey] = blobSvr.getUrl(blobContainer, fileName);

						if (i === imgSizes.length - 1) {
							Sharp.cache(false);
							let flUrlOrg = __dirname+'/uploads/'+img.fileName;
							FS.unlinkSync(flUrlOrg);

							let insResult = await db.collection('images').insertOne(img);
							let	newImg = insResult.ops[0];

							let refColl = newImg.referenceCollection;
							let _refDocId = newImg._referenceDocumentId;
							let refFld = newImg.referenceField;
							
							let doc = await db.collection(refColl).findOne({_id:_refDocId});

							let refObj = {_id:newImg._id}
							for (let e=0; e<refEmbed.length; e++) {
								refObj[refEmbed[e]] = newImg[refEmbed[e]];
							}
							doc[refFld].push(refObj);
							let setObj = {};
							setObj[refFld] = doc[refFld];

							await db.collection(refColl).findOneAndUpdate({_id:_refDocId}, {$set:setObj}, {returnOriginal:false});
							resp.send(newImg);
				
						}
					} else {
						console.error(err);
					}
				});
			});
		}
	});

	router.post('/del_img', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let fld = req.body.fld;

		let _imgId = req.body._imgId;
		let imgFileName = req.body.imgFileName;

		for (let i = 0; i<imgSizes.length; i++) {
			let fileName = imgFileName+'_'+ imgSizes[i].letter +'.jpg';
			blobSvr.deleteBlobIfExists(blobContainer, fileName, async (err, rsl) => {
				if (!err) {
					if (i === imgSizes.length - 1) {

						let doc = await db.collection(coll).findOne({_id:_docId});

						let _orgImgs = doc[fld];
						let _newImgs = [];
						for (let i=0; i<_orgImgs.length; i++) {
							if (_orgImgs[i]._id) {
								if (_orgImgs[i]._id.toString() !== _imgId) {
									_newImgs.push(_orgImgs[i]);
								}
							} else {
								if (_orgImgs[i].toString() !== _imgId) {
									_newImgs.push(_orgImgs[i]);
								}
							}
						}

						let updObj = {};
						updObj[fld] = _newImgs;

						let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:updObj}, {returnOriginal:false});
						_imgId = new ObjId(_imgId);
						await db.collection('images').deleteOne({_id: _imgId});

						resp.send(newDoc.value);
					}
				} else {
					console.error(err);
				}
			});
		}
	});

	router.post ('/upd_seq', async (req, resp) => {
		let coll = req.body.coll;
		let _docId = new ObjId(req.body._docId);
		let fld = req.body.fld;
		let idx = req.body.idx;
		let mov = req.body.mov;

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

		let newDoc = await db.collection(coll).findOneAndUpdate({_id: _docId}, {$set:updObj}, {returnOriginal:false});

		let _ids = newDoc.value[fld].map((obj) => (obj._id));
		let fndObj = {_id:{$in:_ids}};

		let imgs = await db.collection('images').find(fndObj).toArray();

		resp.send(orderResult(imgs, _ids));
	});

 	return router;
}
