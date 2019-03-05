import React, { Component } from 'react';
import axios from 'axios';
import './Mdf.css';

/*
function MdfRfrsSlc (props) {
	//console.log(props._rfrIds.length);
	let slc = false;
	let ind = 0;
	for (let i=0; i<props._rfrIds.length; i++) {
		if (props._dcmId === props._rfrIds[i]) {
			slc = true;
			ind = i;
		}
	}

	if (slc) {
		return (
			<div className="mdfRfrsCnc" onClick={() => props.upd_rfr(ind, props._dcmId, false)}>取消</div>
			
		);
	} else {
		return (
			<div className="mdfRfrsSlc" onClick={() => props.upd_rfr(ind, props._dcmId, true)}>選擇</div>
		);
	}
}
*/
class MdfRfrs extends Component {
	constructor(props) {
		super();
		this.rfrs = [];
		this.state = {
			_rfrIds: props.vl,
			rfrsA: [],
			rfrsB: [],
		}
		//this.cnc_rfr = this.cnc_rfr.bind(this);
		this.prv_rfr = this.prv_rfr.bind(this);
		this.nxt_rfr = this.nxt_rfr.bind(this);
		this.clc_rfr = this.clc_rfr.bind(this);
		this.upd_rfr = this.upd_rfr.bind(this);
	}

	componentDidMount () {
		const _this = this;
		axios.post('/mdf/fnd_rfrExss', {cllKy:this.props.rfrCllKy, qry:this.props.rfrQry, prj:this.props.rfrPrj})
		.then(function(rsp) {
			_this.rfrs = rsp.data;
			//console.log(_this.props.rfrCllKy+', '+_this.rfrs);
			_this.srt_rfr(_this.rfrs, _this.state._rfrIds);
		});
	}

	srt_rfr (rfrs, _rfrIds) {
		let rfrsA = [];
		let rfrsB = [];

		for (let i=0; i<_rfrIds.length; i++) {
			for (let j=0; j<rfrs.length; j++) {
				if (_rfrIds[i] === rfrs[j]._id) {
					rfrsA = rfrsA.concat(rfrs[j]);
				}
			}
		}

		for (let n=0; n<rfrs.length; n++) {
			let iExt = false;
			for (let m=0; m<_rfrIds.length; m++) {
				if (rfrs[n]._id === _rfrIds[m]) {
					//rfrsB = rfrsB.concat(rfrs[n]);
					iExt = true;
				}
			}
			if (!iExt) {
				rfrsB = rfrsB.concat(rfrs[n]);
			}
		}
		
		this.setState({
			_rfrIds: _rfrIds,
			rfrsA: rfrsA,
			rfrsB: rfrsB,
		});
	}

	prv_rfr (ind) {
		let arr = this.state._rfrIds;

		if (ind !== 0) {
			let tmp = arr[ind - 1];
			arr[ind - 1] = arr[ind];
			arr[ind] = tmp;
		}
		this.upd_rfr (arr);
	}

	nxt_rfr (ind) {
		let arr = this.state._rfrIds;

		if (ind !== arr.length - 1) {
			let tmp = arr[ind + 1];
			arr[ind + 1] = arr[ind];
			arr[ind] = tmp;
		}
		this.upd_rfr (arr);
	}

	clc_rfr (ind, _id, act) {
		let arr = this.state._rfrIds;

		if (act === 'add') {
			arr = arr.concat([_id]);
		} else {
			arr.splice(ind, 1);
		}
		this.upd_rfr (arr);
	}

	upd_rfr (vl) {
		const {cllKy, _dcmId, fldKy} = this.props;
		const _this = this;

		axios.post('/mdf/upd_rfr', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, vl:vl})
		.then(function(rsp) {

			_this.srt_rfr (_this.rfrs, rsp.data[fldKy]);
		})
		.catch(function(err){console.log(err);});
	}

	render () {
		const {rfrsA, rfrsB} = this.state;

		return (
			<div className="MdfRfrs">{/*<div className="mdfRfrId">_id: {rfr._id}</div>*/}
				<div className="mdfRfrsBlc">
					{rfrsA.map((rfr, ind) => (
						<div className="mdfRfrBlc" key={ind}>
							<div className="mdfRfrFldsBlc">
								{Object.values(rfr).map((fld, ind) => (
									<div className="mdfRfrFld" key={ind}>{fld}</div>
								))}
							</div>
							<div className="mdfBtnGryC" onClick={() => this.prv_rfr(ind)}>{'<<<'}</div>
							<div className="mdfBtnRdC" onClick={() => this.clc_rfr(ind)}>取消</div>
							<div className="mdfBtnGryC" onClick={() => this.nxt_rfr(ind)}>{'>>>'}</div>
						</div>
					))}
				</div>
				<div className="mdfRfrsBlc">
					{rfrsB.map((rfr, ind) => (
						<div className="mdfRfrBlc" key={ind}>
							<div className="mdfRfrFldsBlc">
								{Object.values(rfr).map((fld, ind) => (
									<div className="mdfRfrFld" key={ind}>{fld}</div>
								))}
							</div>
							<div className="mdfBtnBlA" onClick={() => this.clc_rfr(ind, rfr._id, 'add')}>選擇</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default MdfRfrs;