import React, { Component } from 'react';
import axios from 'axios';
import './Mdf.css';

function MdfRfrSlc (props) {
	if (props._id === props._rfrId) {
		return (
			<div className="mdfBtnRdA" onClick={() => props.upd_rfr(props._id, 'cnc')}>取消</div>
			
		);
	} else {
		return (
			<div className="mdfBtnBlA" onClick={() => props.upd_rfr(props._id, 'slc')}>選擇</div>
		);
	}
}

class MdfRfr extends Component {
	constructor(props) {
		super();
		this.state = {
			rfrs: [],
			_rfrId: props.vl,
		}
		this.upd_rfr = this.upd_rfr.bind(this);
	}

	componentDidMount () {
		const _this = this;
		axios.post('/mdf/fnd_rfrExss', {cllKy:this.props.rfrCllKy, qry:this.props.rfrQry, prj:this.props.rfrPrj})
		.then(function(rsp) {
			_this.setState({
				rfrs: rsp.data,
			});
		});
	}

	upd_rfr (_id, act) {
		const _this = this;
		const {cllKy, _dcmId, fldKy} = this.props;
		let vl = _id;
		if (act === 'cnc') {
			vl = null;
		}

		axios.post('/mdf/upd_rfr', {cllKy:cllKy, _dcmId:_dcmId, fldKy:fldKy, vl:vl})
		.then(function(rsp) {
			_this.setState({_rfrId:rsp.data[fldKy]});
		})
		.catch(function(err){console.log(err);});
	}

	render () {
		const {_rfrId} = this.state;
		return (
			<div className="MdfRfrs">
				<div className="mdfRfrsBlc">
					{this.state.rfrs.map((rfr, ind) => (
						<div className="mdfRfrBlc" key={ind}>
							<div className="mdfRfrFldsBlc">
								{Object.values(rfr).map((fld, ind) => (
									<div className="mdfRfrFld" key={ind}>{fld}</div>
								))}
							</div>
							<MdfRfrSlc ind={ind} _id={rfr._id} _rfrId={_rfrId} upd_rfr={this.upd_rfr} />
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default MdfRfr;