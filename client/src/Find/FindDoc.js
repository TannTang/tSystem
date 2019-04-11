import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class FindDocFld extends Component {
	render () {
		let {fld, val} = this.props;
		if (fld) {
			if (val) {
				val = val.toString();
			}
			return (
				<div className="FindDocFld">
					<div className="findDocFldLabel">{fld.label.cn}:</div>
					<div className="findDocFldVal">{val}</div>
				</div>
			);
		} else {
			return null;
		}
	}
}

class FindDoc extends Component {
	render () {
		const {idx, coll, flds, doc, del_doc} = this.props;
		return (
			<div className="FindDoc">
				<div className="findDocFlds">
					{Object.keys(doc).map((fldKey, idx) => (<FindDocFld key={idx} fld={flds[fldKey]} val={doc[fldKey]} />))}
				</div>
				<div className="findDocOptions">
					<Link to={'/upd/'+ coll +'/'+ doc._id} target="_blank"><div className="findDocOption">編輯</div></Link>
					<div className="findDocOption" onClick={() => del_doc(doc, idx)}>刪除</div>
				</div>
			</div>
		);
	}
}

export default FindDoc;