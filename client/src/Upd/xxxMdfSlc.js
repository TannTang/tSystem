import React, { Component } from 'react';

import './Mdf.css';

class MdfSlc extends Component {
	constructor (props) {
		super (props);
		this.state = {vl: props.vl, iFcs: false};
		this.hnd_chn = this.hnd_chn.bind(this);
		this.hnd_blr = this.hnd_blr.bind(this);
		this.hnd_fcs = this.hnd_fcs.bind(this);
	}

	hnd_chn (e) {
		this.setState({vl: e.target.value});
	}

	hnd_blr () {
		this._tmOtId = setTimeout(() => {
			if (this.state.iFcs) {
				this.setState({iFcs: false});
				this.props.upd_fld(this.state.vl);
			}
		}, 0);
	}

	hnd_fcs () {
		clearTimeout(this._tmOtId);
		if (!this.state.iFcs) {
			this.setState({iFcs: true});
		}
	}

	render () {
		const {opts} = this.props;
		const {vl} = this.state;
		return (
			<select className="admSlc" value={vl} onChange={this.hnd_chn} onBlur={this.hnd_blr} onFocus={this.hnd_fcs} >
				{opts.map((opt, ind) => (<option key={ind} value={opt.vl}>{opt.txt}</option>))}
			</select>
		);
	}
}
export default MdfSlc;