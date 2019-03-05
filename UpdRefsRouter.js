const ObjId = require('mongodb').ObjectID;
const Express = require('express');

module.exports = (sheetColls, db) => {

	const router = Express.Router();

	function orderResult2(result, queryIds) {
		let hashResult = result.reduce((prev, current) => {
			prev[current._id] = current;
			return prev;
		}, {});
		return queryIds.map((id) => {return hashResult[id]});
	}

	function orderResult(result, objs) {
		let hashResult = result.reduce((prev, current) => {
			prev[current._id] = current;
			return prev;
		}, {});
		return objs.map((obj) => {return hashResult[obj._id]});
	}

	async function separate_refDocs (refColl, refFind, refProject, _refObjs) {
		let refDocs = await db.collection(refColl).find(refFind).project(refProject).toArray();
		let refDocsA = [];
		let refDocsB = [];

		let _refDocIdStrs = _refObjs.map((_ref) => (_ref._id.toString()));
		//console.log(refColl+', '+_refDocIdStrs);

		for (let i=0; i<refDocs.length; i++) {
			let _refDocIdStr = refDocs[i]._id.toString();
			if (_refDocIdStrs.indexOf(_refDocIdStr) !== -1) {
				refDocsA.push(refDocs[i]);
			} else {
				refDocsB.push(refDocs[i]);
			}
		}
		
		let orderRefDocsA = orderResult(refDocsA, _refObjs);
		
		return {refDocsA:orderRefDocsA, refDocsB:refDocsB};
	}

	async function replace_refDocs (coll, refColl, fld, refFld, _docId, _refDocId, refEmbed, act) {

		let doc = await db.collection(coll).findOne({_id:_docId});
		let refDoc = await db.collection(refColl).findOne({_id:_refDocId});

		let _refObjs = doc[fld];
		let _refDocIdStrs = _refObjs.map((_ref) => (_ref._id.toString()));
		let _refDocIdStr = _refDocId.toString();

		if (act === 'add') {
			if (_refDocIdStrs.indexOf(_refDocIdStr) === -1) {
				let embedObj = {_id:_refDocId}
				for (let e=0; e<refEmbed.length; e++) {
					embedObj[refEmbed[e]] = refDoc[refEmbed[e]];
				}
				_refObjs.push(embedObj);
			}
		} else {
			_refObjs.splice(_refDocIdStrs.indexOf(_refDocIdStr), 1);
		}

		let setObj = {};
		setObj[fld] = _refObjs;

		await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});

		return _refObjs;
	}

	router.post('/find_refDocs', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		
		let refColl = sheetColls[coll].fields[fld].upd.refColl;
		let refFld = sheetColls[coll].fields[fld].upd.refFld;
		let refFind = sheetColls[coll].fields[fld].upd.refFind;
		let refProject = sheetColls[coll].fields[fld].upd.refProject;
		
		let doc = await db.collection(coll).findOne({_id:_docId});
		let _refObjs = doc[fld];

		separate_refDocs (refColl, refFind, refProject, _refObjs).then((result) => {
			resp.send(result);
		});
	});

	router.post('/sel_refDoc', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _refDocId = new ObjId(req.body._refDocId);

		let twoWay = sheetColls[coll].fields[fld].upd.twoWay;
		let refColl = sheetColls[coll].fields[fld].upd.refColl;
		let refFld = sheetColls[coll].fields[fld].upd.refFld;
		let refFind = sheetColls[coll].fields[fld].upd.refFind;
		let refProject = sheetColls[coll].fields[fld].upd.refProject;
		let refEmbed = sheetColls[coll].fields[fld].upd.refEmbed;

		let _refObjs = await replace_refDocs(coll, refColl, fld, refFld, _docId, _refDocId, refEmbed, 'add');

		if (twoWay) {
			let embed = sheetColls[refColl].fields[refFld].upd.refEmbed;
			await replace_refDocs(refColl, coll, refFld, fld, _refDocId, _docId, embed, 'add');
		}

		separate_refDocs (refColl, refFind, refProject, _refObjs).then((result) => {
			resp.send(result);
		});
	});

	router.post('/cancel_refDoc', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _refDocId = new ObjId(req.body._refDocId);

		let twoWay = sheetColls[coll].fields[fld].upd.twoWay;
		let refColl = sheetColls[coll].fields[fld].upd.refColl;
		let refFld = sheetColls[coll].fields[fld].upd.refFld;
		let refFind = sheetColls[coll].fields[fld].upd.refFind;
		let refProject = sheetColls[coll].fields[fld].upd.refProject;
		let refEmbed = sheetColls[coll].fields[fld].upd.refEmbed;

		let _refObjs = await replace_refDocs(coll, refColl, fld, refFld, _docId, _refDocId, refEmbed, 'remove');

		if (twoWay) {
			let embed = sheetColls[refColl].fields[refFld].upd.refEmbed;
			await replace_refDocs(refColl, coll, refFld, fld, _refDocId, _docId, embed, 'remove');
		}

		separate_refDocs (refColl, refFind, refProject, _refObjs).then((result) => {
			resp.send(result);
		});
	});

	router.post('/mov_refDoc', async (req, resp) => {
		let coll = req.body.coll;
		let fld = req.body.fld;
		let _docId = new ObjId(req.body._docId);
		let _refDocId = req.body._refDocId;
		let mov = req.body.mov;

		let refColl = sheetColls[coll].fields[fld].upd.refColl;
		let refFld = sheetColls[coll].fields[fld].upd.refFld;
		let refFind = sheetColls[coll].fields[fld].upd.refFind;
		let refProject = sheetColls[coll].fields[fld].upd.refProject;
		let refEmbed = sheetColls[coll].fields[fld].upd.refEmbed;
		
		let doc = await db.collection(coll).findOne({_id:_docId});
		let _refObjs = doc[fld];

		let _refDocIdStrs = _refObjs.map((_ref) => (_ref._id.toString()));
		let idx = _refDocIdStrs.indexOf(_refDocId);

		if (mov === 1) {
			if (idx !== _refObjs.length - 1) {
				let tmp = _refObjs[idx + 1];
				_refObjs[idx + 1] = _refObjs[idx];
				_refObjs[idx] = tmp;
			}
		} else if (mov === -1) {
			if (idx !== 0) {
				let tmp = _refObjs[idx - 1];
				_refObjs[idx - 1] = _refObjs[idx];
				_refObjs[idx] = tmp;
			}
		}

		let setObj = {};
		setObj[fld] = _refObjs;

		await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false});

		separate_refDocs (refColl, refFind, refProject, _refObjs).then((result) => {
			resp.send(result);
		});
	});

 	return router;
}
