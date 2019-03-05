import React, { Component } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Mdf.css';

class MdfTxtEdt extends Component {
	constructor (props) {
		super (props);

		this.state = {vl:props.vl, iFcs:false};
		this.hnd_chn = this.hnd_chn.bind(this);
		this.hnd_sv = this.hnd_sv.bind(this);
	}

	upd_txt (cllKy, _dcmId, fldKy, fldVl) {
		const _this = this;
		axios.post('/upd_inp', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, fldVl:fldVl})
		.then(function(rsp) {
			_this.setState({vl:rsp.data[fldKy]});
		})
		.catch(function(err){console.log(err);});
	}

	hnd_chn (vl) {
		this.setState({vl:vl});
	}

	hnd_sv () {
		this.upd_txt(this.props.cllKy, this.props._dcmId, this.props.fldKy, this.state.vl);
	}

	render () {
		const {vl} = this.state;

		return (
			<div className="MdfTxtEdt">
				<ReactQuill value={this.state.vl} onChange={this.hnd_chn} />
				<div className="mdfBtnGryA" onClick={this.hnd_sv}>儲存</div>
			</div>
		);
	}
}

export default MdfTxtEdt;