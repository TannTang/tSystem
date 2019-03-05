import React, { Component } from 'react';

import './Adm.css';

function Fld (props) {
	const {ky, txt, act, upd_cll} = props;
	if (act) {
		return ( 
			<div className="admCllFldAct" onClick={() => upd_cll(ky, false)}>{txt}</div>
		)
	} else {
		return (
			<div className="admCllFldNrm" onClick={() => upd_cll(ky, true)}>{txt}</div>
		)
	}
}

class AdmCll extends Component {
	constructor(props) {
		super();
		this.upd_cll = this.upd_cll.bind(this);
	}

	upd_cll (ky, act) {
		this.props.upd_cll(this.props.cll.ky, ky, act);
	}

	render () {
		const {cll, upd_cll} = this.props;

		return (
			<div id="AdmCll">
				<div className="admCllBlc">
					<div className="admCllStr">{cll.ky} - 欄位</div>
					<div className="admCllFldBlc">
						{cll.fld.map((fld, ind) => (<Fld key={ind} ky={fld.ky} txt={fld.txt} act={fld.act} upd_cll={this.upd_cll} />))}
					</div>
				</div>
			</div>
		);
	}
}

export default AdmCll;