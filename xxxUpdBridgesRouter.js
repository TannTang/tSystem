const ObjId = require('mongodb').ObjectID;

const Exp = require('express');
const Azr = require('azure-storage');

const Sht = require('../01_yd/ShtYd.js');
const clls = Sht.collections;

module.exports = (db) => {

	const rtr = Exp.Router();

	function ordRlt(rlt, qryIds) {
		let hshRlt = rlt.reduce((prv, crr) => {
			prv[crr._id] = crr;
			return prv;
		}, {});
		return qryIds.map((_id) => {return hshRlt[_id]});
	}

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

	async function spr_rfrDcms (rfrCllKy, fndObj, prjObj, _rfrDcmIds) {
		let rfrDcms = await db.collection(rfrCllKy).find(fndObj).project(prjObj).toArray();
		let rfrDcmsA = [];
		let rfrDcmsB = []; 

		for (let i=0; i<rfrDcms.length; i++) {
			let _rfrDcmIdStrs = _rfrDcmIds.map((_rfrDcmId) => {return _rfrDcmId.toString()});
			if (_rfrDcmIdStrs.indexOf(rfrDcms[i]._id.toString()) !== -1) {
				rfrDcmsA.push(rfrDcms[i]);
			} else {
				rfrDcmsB.push(rfrDcms[i]);
			}
		}

		let ordRfrDcmsA = ordRlt(rfrDcmsA, _rfrDcmIds);
		/*console.log(_rfrDcmIds);
		console.log(rfrDcmsA);
		console.log(ordRfrDcmsA);*/
		
		return {rfrDcmsA:ordRfrDcmsA, rfrDcmsB:rfrDcmsB};
	}

	async function rpl_rfrDcms (cllKy, fldKy, _dcmId, _rfrDcmId, act) {

		let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
		//console.log(cllKy +' --> '+ fldKy +' --> '+_dcmId);
		//console.log(dcm[fldKy]);
		let _rfrDcmIds = dcm[fldKy];
		let _rfrDcmIdStrs = _rfrDcmIds.map((_id) => {return _id.toString()});

		if (act === 'add') {
			if (_rfrDcmIdStrs.indexOf(_rfrDcmId.toString()) === -1) {
				_rfrDcmIds.push(_rfrDcmId);
			}
		} else {
			_rfrDcmIds.splice(_rfrDcmIdStrs.indexOf(_rfrDcmId.toString()), 1);
		}

		let stObj = {};
		stObj[fldKy] = _rfrDcmIds;
		await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:stObj}, {returnOriginal:false});
		return _rfrDcmIds;
	}

	rtr.post('/fnd_brds', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let fldKy = rqs.body.fldKy;
		let _dcmId = new ObjId(rqs.body._dcmId);

		let brgCllKy = clls[cllKy].fields[fldKy].update.bridgeCollectionKey;

		let rfrCllKy = clls[cllKy].fields[fldKy].update.referenceCollectionKey;
		let rfrDcmsFnd = clls[cllKy].fields[fldKy].update.referenceDocuments.find;
		let rfrDcmsPrj = clls[cllKy].fields[fldKy].update.referenceDocuments.project;

		let dcm = await db.collection(cllKy).findOne({_id:_dcmId});

		let _dcmBrdIds = dcm[fldKy];

		let brgDcms = await db.collection(brgCllKy).find({_id:{$in:_dcmBrdIds}}).toArray();
		let rfrDcms = await db.collection(rfrCllKy).find(rfrDcmsFnd).project(rfrDcmsPrj).toArray();

		rsp.send({brdDcms:brgDcms, rfrDcms:rfrDcms});
		/*
		spr_rfrDcms (rfrCllKy, fndObj, prjObj, _rfrDcmIds).then((rsl) => {
			rsp.send(rsl);
		});*/
	});

	rtr.post('/slc_rfrDcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let fldKy = rqs.body.fldKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let _rfrDcmId = new ObjId(rqs.body._rfrDcmId);

		let brgCllKy = clls[cllKy].fields[fldKy].update.bridgeCollectionKey;
		let brgCllFldKy = clls[cllKy].fields[fldKy].update.bridgeCollectionFieldKey;
		let brgDcmIdFldKy = clls[cllKy].fields[fldKy].update.bridgeDocumentIdFieldKey;
		let brgRfrDcmIdFldKy = clls[cllKy].fields[fldKy].update.bridgeReferenceDocumentIdFieldKey;

		let rfrCllKy = clls[cllKy].fields[fldKy].update.referenceCollectionKey;
		let rfrDcmsFnd = clls[cllKy].fields[fldKy].update.referenceDocuments.find;
		let rfrDcmsPrj = clls[cllKy].fields[fldKy].update.referenceDocuments.project;

		let chkObj = {};
		chkObj[brgCllFldKy] = cllKy;
		chkObj[brgDcmIdFldKy] = _dcmId;
		chkObj[brgRfrDcmIdFldKy] = _rfrDcmId;

		let chk1 = await db.collection(brgCllKy).find(chkObj).count();

		if (chk1 === 0) {
			let nwBrdDcmObj = crt_dcm(brgCllKy);
			nwBrdDcmObj[brgCllFldKy] = cllKy;
			nwBrdDcmObj[brgDcmIdFldKy] = _dcmId;
			nwBrdDcmObj[brgRfrDcmIdFldKy] = _rfrDcmId;

			let nwBrdDcmRsl = await db.collection(brgCllKy).insertOne(nwBrdDcmObj);
			let nwBrdDcm = nwBrdDcmRsl.ops[0];

			let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
			let _brdDcmIds = dcm[fldKy];
			_brdDcmIds.push(nwBrdDcm._id);

			let stObj = {};
			stObj[fldKy] = _brdDcmIds;
			let nwDcm = await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:stObj}, {returnOriginal:false});
			let brgDcms = await db.collection(brgCllKy).find({_id:{$in:_brdDcmIds}}).toArray();
			let rfrDcms = await db.collection(rfrCllKy).find(rfrDcmsFnd).project(rfrDcmsPrj).toArray();

			rsp.send({brdDcms:brgDcms, rfrDcms:rfrDcms});
		} else {
			rsp.send('exist');
		}
	});

	rtr.post('/cnc_rfrDcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let fldKy = rqs.body.fldKy;
		let _dcmId = new ObjId(rqs.body._dcmId);
		let _brdDcmId = new ObjId(rqs.body._brdDcmId);

		let brgCllKy = clls[cllKy].fields[fldKy].update.bridgeCollectionKey;
		let brgCllFldKy = clls[cllKy].fields[fldKy].update.bridgeCollectionFieldKey;
		let brgDcmIdFldKy = clls[cllKy].fields[fldKy].update.bridgeDocumentIdFieldKey;
		let brgRfrDcmIdFldKy = clls[cllKy].fields[fldKy].update.bridgeReferenceDocumentIdFieldKey;
		
		let rfrCllKy = clls[cllKy].fields[fldKy].update.referenceCollectionKey;
		let rfrDcmsFnd = clls[cllKy].fields[fldKy].update.referenceDocuments.find;
		let rfrDcmsPrj = clls[cllKy].fields[fldKy].update.referenceDocuments.project;

		let dltBrdDcmRsl = await db.collection(brgCllKy).deleteOne({_id:_brdDcmId});
		//console.log(dltBrdDcmRsl.deletedCount);

		let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
		let _brdDcmIds = dcm[fldKy];
		let _brdDcmIdsStr = _brdDcmIds.map((_id) => {return _id.toString()});
		_brdDcmIds.splice(_brdDcmIdsStr.indexOf(_brdDcmId.toString()), 1);

		let stObj = {};
		stObj[fldKy] = _brdDcmIds;
		let nwDcm = await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:stObj}, {returnOriginal:false});
		let brgDcms = await db.collection(brgCllKy).find({_id:{$in:_brdDcmIds}}).toArray();
		let rfrDcms = await db.collection(rfrCllKy).find(rfrDcmsFnd).project(rfrDcmsPrj).toArray();

		rsp.send({brdDcms:brgDcms, rfrDcms:rfrDcms});
	});

	rtr.post('/mv_rfrDcm', async (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let fldKy = rqs.body.fldKy;
		let _dcmId = new ObjId(rqs.body._dcmId);

		let rfrCllKy = clls[cllKy].fields[fldKy].reference.collection;
		let rfrFldKy = clls[cllKy].fields[fldKy].reference.field;
		let fndObj = clls[cllKy].fields[fldKy].update.find;
		let prjObj = clls[cllKy].fields[fldKy].update.project;
		let _rfrDcmId = rqs.body._rfrDcmId;
		let mv = rqs.body.mv;

		let dcm = await db.collection(cllKy).findOne({_id:_dcmId});
		let _rfrDcmIds = dcm[fldKy];

		let _rfrDcmIdStrs = _rfrDcmIds.map((_rfrDcmId) => {return _rfrDcmId.toString()});
		let ind = _rfrDcmIdStrs.indexOf(_rfrDcmId);

		if (mv === 1) {
			if (ind !== _rfrDcmIds.length - 1) {
				let tmp = _rfrDcmIds[ind + 1];
				_rfrDcmIds[ind + 1] = _rfrDcmIds[ind];
				_rfrDcmIds[ind] = tmp;
			}
		} else if (mv === -1) {
			if (ind !== 0) {
				let tmp = _rfrDcmIds[ind - 1];
				_rfrDcmIds[ind - 1] = _rfrDcmIds[ind];
				_rfrDcmIds[ind] = tmp;
			}
		}

		let stObj = {};
		stObj[fldKy] = _rfrDcmIds;

		await db.collection(cllKy).findOneAndUpdate({_id:_dcmId}, {$set:stObj}, {returnOriginal:false});

		spr_rfrDcms (rfrCllKy, fndObj, prjObj, _rfrDcmIds).then((rsl) => {
			rsp.send(rsl);
		});
	});
	/*
	rtr.post ('/upd_rfr', (rqs, rsp) => {
		let cllKy = rqs.body.cllKy;
		let _dcmId = new objId(rqs.body._dcmId);
		let fldKy = rqs.body.fldKy;
		let vl = rqs.body.vl;
		let obj = {};
		obj[fldKy] = vl;
		obj['updDt'] = Date.now();
		Mdls[cllKy].findOneAndUpdate({_id: _dcmId}, obj, {new: true}).exec(function(err, rfr) {
			rsp.send(rfr);
		});
	});
	*/
 	return rtr;
}
