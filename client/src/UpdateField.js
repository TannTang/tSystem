import React, { Component } from 'react'
import UpdInp from './UpdInp.js'

import UpdInps from './UpdInps.js'
import UpdTxtArea from './UpdTxtArea.js'
import UpdSel from './UpdSel.js'

import UpdContentEditable from './UpdContentEditable.js'

import UpdImgsBlob from './UpdImgsBlob.js'
import UpdDocsBucket from './UpdDocsBucket.js'
import UpdRefs from './UpdRefs.js'
import UpdMutiBlob from './UpdMutiBlob.js'
import UpdImgsBlobEmbed from './UpdImgsBlobEmbed.js'
//import UpdRefsBridge from './UpdRefsBridge.js'

export default class UpdateField extends Component {

	constructor(props) {
		super(props)
		//this.upd_fld = this.upd_fld.bind(this)
		//this.upd_fldPsw = this.upd_fldPsw.bind(this)
	}

	/*upd_fld (val) {
		this.props.upd_doc(this.props.fld, val)
	}

	upd_fldPsw (val) {
		this.props.upd_docPss(this.props.fld, val)
	}*/

	render () {
		//const {collection, _docId, fld, sheetFld, val} = this.props
		const {collection, field} = this.props
		let updateComponent = null

		//console.log(field)
		//switch (sheetFld.upd.method) {
			/*case 'inpTxt': updComponent = <UpdInp type={'text'} val={val} upd_fld={this.upd_fld} />
				break*/
			/*case 'inpTxt': updateComponent = 'input'
				break*/
			/*case 'inpNum': updComponent = <UpdInp type={'number'} val={val} upd_fld={this.upd_fld} /> break
			case 'inpPsw': updComponent = <UpdInp type={'text'} val={val} upd_fld={this.upd_fldPsw} /> break
			case 'inpDate': updComponent = <UpdInp type={'date'} val={val} upd_fld={this.upd_fld} /> break
			case 'inpTxts': updComponent = <UpdInps type={'text'} vals={val} upd_fld={this.upd_fld} /> break
			case 'txtArea': updComponent = <UpdTxtArea val={val} upd_fld={this.upd_fld} /> break
			case 'sel': updComponent = <UpdSel sheetFld={sheetFld} val={val} upd_fld={this.upd_fld} /> break

			case 'updContentEditable': updComponent = <UpdContentEditable val={val} upd_fld={this.upd_fld} /> break

			case 'updImgsBlob': updComponent = <UpdImgsBlob coll={coll} fld={fld} _docId={_docId} /> break
			case 'updDocsBucket': updComponent = <UpdDocsBucket coll={coll} fld={fld} _docId={_docId} /> break
			case 'updRefs': updComponent = <UpdRefs coll={coll} fld={fld} _docId={_docId} /> break
			case 'updMutiBlob': updComponent = <UpdMutiBlob coll={coll} fld={fld} _docId={_docId} /> break
			case 'updImgsBlobEmbed': updComponent = <UpdImgsBlobEmbed coll={coll} fld={fld} _docId={_docId} /> break*/
			//case 'updRefsBridge': updComponent = <UpdRefsBridge coll={coll} fld={fld} _docId={_docId} /> break
			/*default: updateComponent = <div className="updNull">{val}</div>
				break
		}*/

		return (
			<div className="updateField">
				{1}
				{/*<div className="updFldLabel">{sheetFld.label.cn} ({fld})</div>
					<div className="updFldVal">
						{updComponent}
				</div>*/}
			</div>
		)
	}
}