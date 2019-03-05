import React, { Component } from 'react';
import UpdInp from './UpdateInput.js';
import UpdInps from './UpdInps.js';
import UpdTxtAr from './UpdTxtAr.js';
import UpdSlc from './UpdSlc.js';

import UpdCntEdt from './UpdCntEdt.js';

//import UpdImgs from './UpdImgs.js';
import UpdImgBlb from './UpdateImageBlob.js';
import UpdRfrs from './UpdRfrs.js';
import UpdBrds from './UpdBrds.js';

class UpdFld extends Component {

	constructor(props) {
		super(props);
		this.upd_fld = this.upd_fld.bind(this);
		this.upd_fldPss = this.upd_fldPss.bind(this);
	}

	upd_fld (vl) {
		this.props.upd_dcm(this.props.fldKy, vl);
	}

	upd_fldPss (vl) {
		this.props.upd_dcmPss(this.props.fldKy, vl);
	}

	render () {

		const {clls, cllKy, _dcmId, fldKy, fld, vl} = this.props;

		let updCmp = null;
		switch (fld.update.method) {
			case 'InputText': updCmp = <UpdInp typ={'text'} vl={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'InputNumber': updCmp = <UpdInp typ={'number'} vl={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'InputPassword': updCmp = <UpdInp typ={'text'} vl={this.props.vl} upd_fld={this.upd_fldPss} />; break;
			case 'InputDate': updCmp = <UpdInp typ={'date'} vl={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'InputTexts': updCmp = <UpdInps typ={'text'} vls={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'TextArea': updCmp = <UpdTxtAr vl={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'Select': updCmp = <UpdSlc fld={fld} vl={this.props.vl} upd_fld={this.upd_fld} />; break;

			case 'UpdateContentEditable': updCmp = <UpdCntEdt vl={this.props.vl} upd_fld={this.upd_fld} />; break;

			//case 'updateImages': updCmp = <UpdImgs cllKy={cllKy} _dcmId={_dcmId} fldKy={fldKy} typ={fld.update.type} vl={this.props.vl} upd_fld={this.upd_fld} />; break;
			case 'UpdateImageBlob': updCmp = <UpdImgBlb coll={cllKy} _docId={_dcmId} field={fldKy} setObj={fld.update.set} embedFields={fld.update.embedFields}/*vl={this.props.vl} upd_fld={this.upd_fld}*/ />; break;
			case 'UpdateReference': updCmp = <UpdRfrs clls={clls} cllKy={cllKy} _dcmId={_dcmId} fldKy={fldKy} typ={fld.update.type}  /*vl={this.props.vl} upd_fld={this.upd_fld}*/ />; break;
			case 'UpdateBridges': updCmp = <UpdBrds clls={clls} cllKy={cllKy} _dcmId={_dcmId} fldKy={fldKy} fld={fld} />; break;
			default: updCmp = <div className="updNll">{this.props.vl}</div>; break;
		}

		return (
			<div className="UpdFld">
				<div className="updFldLbl">{fld.label.cn} ({fldKy})</div>
				<div className="updFldVl">
					{updCmp}
				</div>
			</div>
		);
	}
}

export default UpdFld;