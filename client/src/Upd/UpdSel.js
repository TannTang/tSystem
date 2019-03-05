import React, {Component} from 'react';

class UpdSel extends Component {
	constructor (props) {
		super (props);
		this.state = {val:props.val, iFocus:false};
		this.handler_chg = this.handler_chg.bind(this);
	}

	componentDidUpdate (prevProps) {
		if (this.props.val !== prevProps.val) {
			this.setState({val:this.props.val});
		}
	}

	handler_chg (e) {
		this.setState({val:e.target.value});
		this.props.upd_fld(e.target.value);
	}

	render () {
		
		const options = this.props.sheetFld.upd.options;

		return (
			<select className="UpdSel" value={this.state.val} onChange={this.handler_chg} >
				{options.map((option, idx) => (<option key={idx}>{option}</option>))}
			</select>
		);
	}
}

export default UpdSel;