import React, {Component} from 'react';
import Axios from 'axios';

class UpdRefs extends Component {
	constructor(props) {
		super();
		this.refs = [];
		this.state = {
			_refIds: props.val,
			refDocsA: [],
			refDocsB: [],
		}
		//this.cancel_ref = this.cancel_ref.bind(this);
		//this.prev_ref = this.prev_ref.bind(this);
		//this.next_ref = this.next_ref.bind(this);
		//this.clk_ref = this.clk_ref.bind(this);
		//this.upd_ref = this.upd_ref.bind(this);

		this.find_refDocs(props.coll, props._docId, props.fld);
	}

	find_refDocs (coll, _docId, fld) {
		Axios.post('/upd_refs/find_refDocs', {coll:coll, _docId:_docId, fld:fld}).then((resp) => {
			//console.log(resp.data);
			this.setState({
				refDocsA: resp.data.refDocsA,
				refDocsB: resp.data.refDocsB,
			});
		});
	}

	sel_refDoc (_refDocId) {
		const {coll, _docId, fld} = this.props;
		Axios.post('/upd_refs/sel_refDoc', {coll:coll, _docId:_docId, fld:fld, _refDocId:_refDocId}).then((resp) => {
			this.setState({
				refDocsA: resp.data.refDocsA,
				refDocsB: resp.data.refDocsB,
			});
		}).catch((err) => {console.log(err);});
	}

	cancel_refDoc (_refDocId) {
		const {coll, _docId, fld} = this.props;
		Axios.post('/upd_refs/cancel_refDoc', {coll:coll, _docId:_docId, fld:fld, _refDocId:_refDocId}).then((resp) => {
			this.setState({
				refDocsA: resp.data.refDocsA,
				refDocsB: resp.data.refDocsB,
			});
		}).catch((err) => {console.log(err);});
	}

	mov_refDoc (_refDocId, mov) {
		const {coll, _docId, fld} = this.props;
		Axios.post('/upd_refs/mov_refDoc', {coll:coll, _docId:_docId, fld:fld, _refDocId:_refDocId, mov:mov}).then((resp) => {
			this.setState({
				refDocsA: resp.data.refDocsA,
				refDocsB: resp.data.refDocsB,
			});
		}).catch((err) => {console.log(err);});
	}
/*
	srt_ref (refs, _refIds) {
		let refsA = [];
		let refsB = [];

		for (let i=0; i<_refIds.length; i++) {
			for (let j=0; j<refs.length; j++) {
				if (_refIds[i] === refs[j]._id) {
					refsA = refsA.concat(refs[j]);
				}
			}
		}

		for (let n=0; n<refs.length; n++) {
			let iExt = false;
			for (let m=0; m<_refIds.length; m++) {
				if (refs[n]._id === _refIds[m]) {
					//refsB = refsB.concat(refs[n]);
					iExt = true;
				}
			}
			if (!iExt) {
				refsB = refsB.concat(refs[n]);
			}
		}
		
		this.setState({
			_refIds: _refIds,
			refsA: refsA,
			refsB: refsB,
		});
	}

	prev_ref (idx) {
		let array = this.state._refIds;

		if (idx !== 0) {
			let tmp = array[idx - 1];
			array[idx - 1] = array[idx];
			array[idx] = tmp;
		}
		this.upd_ref (array);
	}

	next_ref (idx) {
		let array = this.state._refIds;

		if (idx !== array.length - 1) {
			let tmp = array[idx + 1];
			array[idx + 1] = array[idx];
			array[idx] = tmp;
		}
		this.upd_ref (array);
	}

	clk_ref (idx, _id, act) {
		let array = this.state._refIds;

		if (act === 'add') {
			array = array.concat([_id]);
		} else {
			array.splice(idx, 1);
		}
		this.upd_ref (array);
	}

	upd_ref (val) {
		const {coll, _docId, fld} = this.props;
		const _this = this;

		Axios.post('/mdf/upd_ref', {coll:coll, _docId:_docId, fld:fld, val:val})
		.then(function(resp) {

			_this.srt_ref (_this.refs, resp.data[fld]);
		})
		.catch(function(err){console.log(err);});
	}
*/
	render () {
		const {coll, fld} = this.props;
		const {refDocsA, refDocsB} = this.state;

		return (
			<div className="UpdRefs">{/*<div className="updRefId">_id: {ref._id}</div>*/}
				<div className="updRefsBlk">
					{refDocsA.map((refDoc, idx) => (
						<div className="updRefsRef" key={idx}>
							<div className="updRefsFlds">
								{Object.values(refDoc).map((refFld, idx) => (
									<div className="updRefsFld" key={idx}>{Object.keys(refDoc)[idx] +': '+ refFld}</div>
								))}
							</div>
							<div className="updRefsBtns">
								<div className="updRefsMov" onClick={() => this.mov_refDoc(refDoc._id, -1)}>{'<<<'}</div>
								<div className="updRefsCancel" onClick={() => this.cancel_refDoc(refDoc._id)}>取消選取</div>
								<div className="updRefsMov" onClick={() => this.mov_refDoc(refDoc._id, 1)}>{'>>>'}</div>
							</div>
						</div>
					))}
				</div>
				<br />
				<div className="updRefsBlk">
					{refDocsB.map((refDoc, idx) => (
						<div className="updRefsRef" key={idx}>
							<div className="updRefsFlds">
								{Object.values(refDoc).map((refFld, idx) => (
									<div className="updRefsFld" key={idx}>{Object.keys(refDoc)[idx] +': '+ refFld}</div>
								))}
							</div>
							<div className="updRefsSel" onClick={() => this.sel_refDoc(refDoc._id)}>選取</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default UpdRefs;