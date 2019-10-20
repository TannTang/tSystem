import React, { Component } from 'react';
import Axios from 'axios';
import UpdFld from './UpdFld.js';

class Upd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sheetColls: null,
			sheetFlds: null,
			//coll: null,
			doc: null,
		}
		this.upd_doc = this.upd_doc.bind(this);
		this.upd_docPss = this.upd_docPss.bind(this);
		this.find_sheet();
	}

	find_sheet () {
		Axios.post('/find_sheet').then((resp) => {
			const coll = this.props.match.params.coll;
			const _docId = this.props.match.params._docId;
			this.setState({
				sheetColls: resp.data.collections,
				sheetFlds: resp.data.collections[coll].fields,
				//coll: coll,
			});
			this.find_doc(coll, _docId);
		});
	}

	find_doc (coll, _docId) {
		Axios.post('/find_doc', {coll:coll, _docId:_docId}).then((resp) => {
			//console.log(resp.data);
			this.setState({
				doc: resp.data,
			});
		});
	}

	upd_doc (fld, val) {
		const coll = this.props.match.params.coll;
		const _docId = this.props.match.params._docId;
		let obj = {};
		obj[fld] = val;
		Axios.post('/upd_doc', {coll:coll, _docId:_docId, obj:obj}).then((resp) => {
			//console.log(resp.data);
		});
	}

	upd_docPss (fldKey, val) {
		const coll = this.props.match.params.coll;
		const _docId = this.props.match.params._docId;
		Axios.post('/upd_docPss', {coll:coll, _docId:_docId, fldKey:fldKey, val:val}).then((resp) => {
			this.find_doc(coll, _docId);
		});
	}

	render () {
		const {coll, _docId} = this.props.match.params;
		const {sheetColls, sheetFlds, doc} = this.state;

		if (doc) {
			return (
				<div className="Upd">
					<div className="updId">{sheetColls[coll].label.cn}({coll}) - 識別碼(_id) - {_docId}</div>
					{Object.keys(sheetFlds).map((sheetFldKey, ind) => (
						<UpdFld key={ind} coll={coll} _docId={_docId} fld={sheetFldKey} sheetFld={sheetFlds[sheetFldKey]} val={doc[sheetFldKey]} upd_doc={this.upd_doc} upd_docPss={this.upd_docPss} />
					))}
				</div>
			);
		} else {
			return null;
		}
	}
}

export default Upd;