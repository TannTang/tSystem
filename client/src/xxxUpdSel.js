import React, {Component} from 'react';

class UpdSel extends Component {
	constructor (props) {
		super (props);
		this.state = {val:props.val, iFocus:false};
		this.chg_opt = this.chg_opt.bind(this);
	}

	componentDidUpdate (prevProps) {
		if (this.props.val !== prevProps.val) {
			this.setState({val:this.props.val});
		}
	}

	chg_opt (e) {
		this.setState({val:e.target.value});
	
		let val = e.target.value;
		if (val === 'false') {
			val = false;
		} else if (val === 'true') {
			val = true;
		}
		console.log(typeof val);

		this.props.upd_fld(val);
	}

	render () {
		const {val} = this.state;
		const opts = this.props.sheetFld.upd.options;

		return (
			<select className="UpdSel" value={val} onChange={this.chg_opt} >
				{opts.map((opt, idx) => (<option key={idx} value={opt.val}>{opt.str}</option>))}
			</select>
		);
	}
}

export default UpdSel;