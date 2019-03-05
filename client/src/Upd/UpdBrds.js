import React, { Component } from 'react';
import axs from 'axios';

class UpdBrds extends Component {
	constructor(props) {
		super();
		this.rfrs = [];
		this.state = {
			_rfrIds: props.vl,
			brdDcms: [],
			rfrDcms: [],
		}
		//this.cnc_rfr = this.cnc_rfr.bind(this);
		this.prv_rfr = this.prv_rfr.bind(this);
		this.nxt_rfr = this.nxt_rfr.bind(this);
		this.clc_rfr = this.clc_rfr.bind(this);
		this.upd_rfr = this.upd_rfr.bind(this);

		//console.log(props.fld);
		this.fnd_brds(props.cllKy, props._dcmId, props.fldKy);
	}

	fnd_brds (cllKy, _dcmId, fldKy) {
		axs.post('/updBrds/fnd_brds', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy}).then((rsp) => {
			this.setState({
				brdDcms: rsp.data.brdDcms,
				rfrDcms: rsp.data.rfrDcms,
			});
		});
	}

	slc_rfrDcm (_rfrDcmId) {
		const {cllKy, _dcmId, fldKy} = this.props;
		axs.post('/updBrds/slc_rfrDcm', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, _rfrDcmId:_rfrDcmId}).then((rsp) => {
			if (rsp.data !== 'exist') {
				this.setState({
					brdDcms: rsp.data.brdDcms,
					rfrDcms: rsp.data.rfrDcms,
				});
			} else {
				window.alert('已有參考');
			}
		}).catch((err) => {console.log(err);});
	}

	cnc_rfrDcm (_brdDcmId) {
		const {cllKy, _dcmId, fldKy} = this.props;
		axs.post('/updBrds/cnc_rfrDcm', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, _brdDcmId:_brdDcmId}).then((rsp) => {
			//console.log(rsp.data);
			this.setState({
				brdDcms: rsp.data.brdDcms,
				rfrDcms: rsp.data.rfrDcms,
			});
		}).catch((err) => {console.log(err);});
	}

	mv_rfrDcm (_rfrDcmId, mv) {
		const {cllKy, _dcmId, fldKy} = this.props;
		axs.post('/updRfr/mv_rfrDcm', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, _rfrDcmId:_rfrDcmId, mv:mv}).then((rsp) => {
			this.setState({
				brdDcms: rsp.data.brdDcms,
				rfrDcms: rsp.data.rfrDcms,
			});
		}).catch((err) => {console.log(err);});
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

		axs.post('/mdf/upd_rfr', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, vl:vl})
		.then(function(rsp) {

			_this.srt_rfr (_this.rfrs, rsp.data[fldKy]);
		})
		.catch(function(err){console.log(err);});
	}

	render () {
		const {clls, cllKy, fldKy, fld} = this.props;
		const {brdDcms, rfrDcms} = this.state;

		//const fldLbl = clls[cllKy].fields[fldKy].label.cn;
		//console.log(brdDcms);

		return (
			<div className="UpdRfrs">{/*<div className="updRfrId">_id: {rfr._id}</div>*/}
				<div className="updRfrsBlc">
					{brdDcms.map((brdDcm, ind) => (
						<div className="updRfrsRfr" key={ind}>
							<div className="updRfrsFlds">
								{Object.values(brdDcm).map((brdFld, ind) => (
									<div className="updRfrsFld" key={ind}>{Object.keys(brdDcm)[ind] +': '+ brdFld}</div>
								))}
							</div>
							<div className="updRfrsBtts">
								{/*<div className="updRfrsMv" onClick={() => this.mv_rfrDcm(brdDcm._id, -1)}>{'<<<'}</div>*/}
								<div className="updRfrsCnc" onClick={() => this.cnc_rfrDcm(brdDcm._id)}>取消選取</div>
								{/*<div className="updRfrsMv" onClick={() => this.mv_rfrDcm(brdDcm._id, 1)}>{'>>>'}</div>*/}
							</div>
						</div>
					))}
				</div>
				<br />
				<div className="updRfrsBlc">
					{rfrDcms.map((rfrDcm, ind) => (
						<div className="updRfrsRfr" key={ind}>
							<div className="updRfrsFlds">
								{Object.values(rfrDcm).map((rfrFld, ind) => (
									<div className="updRfrsFld" key={ind}>{Object.keys(rfrDcm)[ind] +': '+ rfrFld}</div>
								))}
							</div>
							<div className="updRfrsSlc" onClick={() => this.slc_rfrDcm(rfrDcm._id)}>選取</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default UpdBrds;