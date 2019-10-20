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

	render () {
		const {coll, fld} = this.props;
		const {refDocsA, refDocsB} = this.state;

		return (
			<div className="UpdRefs">
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