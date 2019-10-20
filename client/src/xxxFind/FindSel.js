import React, {Component} from 'react';

class FindSel extends Component {

	constructor (props) {
		super(props);

		this.selStyle = {backgroundColor:'#000000', color:'#ffffff'};
		this.defStyle = {backgroundColor:'#cccccc', color:'#000000'};
		this.optionStyles = [];
	}

	clk_coll1 (ind) {
		this.props.upd_coll1(ind);
	}

	reset_render (colls, collIdx) {
		for (let i=0; i<Object.keys(colls).length; i++) {
			this.optionStyles[i] = this.defStyle;
		}
		this.optionStyles[collIdx] = this.selStyle;
	}

	render () {
		const {colls, collIdx} = this.props;
		this.reset_render(colls, collIdx);
		return (
			<div className="FindSel">
				{Object.keys(colls).map((coll, ind) => (<div className="findOption" key={ind} style={this.optionStyles[ind]} onClick={() => this.clk_coll1(ind)}>{colls[coll].label.cn}</div>))}
				
				{/*<div className="fndMnBlc">
					<div className="dshMn1">
						{dtKeys.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls1[ind]} onClick={() => clk_coll1(ind)}>{dtSht[opt].fnd.txt}</div>
						))}
					</div>
					<div className="dshMn2">
						{dtSht[dtKeys[coll1]].fnd.whr.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls2[ind]} onClick={() => clk_coll2(ind)}>{opt.txt}</div>
						))}
					</div>
					<div className="dshMn3">
						{dtSht[dtKeys[coll1]].fnd.srt.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls3[ind]} onClick={() => clk_coll3(ind)}>{opt.txt}</div>
						))}
					</div>
				</div>*/}
			</div>
		);
	}
}

export default FindSel;