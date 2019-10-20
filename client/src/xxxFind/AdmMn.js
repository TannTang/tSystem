import React, { Component } from 'react';

import '../App.css';
import './Adm.css';

class AdmMn extends Component {

	render () {
		const {dtSht, dtKys, mn1, mn2, mn3, clc_mn1, clc_mn2, clc_mn3} = this.props;

		let stls1 = []; let stls2 = []; let stls3 = [];
		let slcStl = {backgroundColor:'#dddddd', color:'#000000'};
		stls1[mn1] = slcStl;
		stls2[mn2] = slcStl;
		stls3[mn3] = slcStl;

		return (
			<div id="AdmMn">
				<div className="admMnBlc">
					<div className="admMn1">
						{dtKys.map((opt, ind) => (
							<div key={ind} ind={ind} className="admOpt" style={stls1[ind]} onClick={() => clc_mn1(ind)}>{dtSht[opt].fnd.txt}</div>
						))}
					</div>
					<div className="admMn2">
						{dtSht[dtKys[mn1]].fnd.whr.map((opt, ind) => (
							<div key={ind} ind={ind} className="admOpt" style={stls2[ind]} onClick={() => clc_mn2(ind)}>{opt.txt}</div>
						))}
					</div>
					<div className="admMn3">
						{dtSht[dtKys[mn1]].fnd.srt.map((opt, ind) => (
							<div key={ind} ind={ind} className="admOpt" style={stls3[ind]} onClick={() => clc_mn3(ind)}>{opt.txt}</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}

export default AdmMn;