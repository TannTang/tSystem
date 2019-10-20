import React, {Component} from 'react';

class UpdInp extends Component {
	constructor (props) {
		super (props);
		this.state = {val:props.val, iFocus:false};
		this.handler_chg = this.handler_chg.bind(this);
		this.handler_blur = this.handler_blur.bind(this);
		this.handler_focus = this.handler_focus.bind(this);
	}

	componentDidUpdate (prevProps) {
		if (this.props.val !== prevProps.val) {
			this.setState({val:this.props.val});
		}
	}

	isInt(n){
		return Number(n) % 1 === 0;
	}
	
	isFloat(n){
		return Number(n) % 1 !== 0;
	}

	handler_chg (e) {
		this.setState({val:e.target.value});
	}

	handler_blur () {
		this._timeOutId = setTimeout(() => {
			if (this.state.iFocus) {
				this.setState({iFocus:false});
				let val = this.state.val;
				if (this.props.type === 'number') {
					val = Number(val);
				}
				console.log(typeof val);
				this.props.upd_fld(val);
			}
		}, 0);
	}

	handler_focus () {
		clearTimeout(this._timeOutId);
		if (!this.state.iFocus) {
			this.setState({iFocus:true});
		}
	}

	render () {
		return (
			<input type={this.props.type} className="UpdInp" value={this.state.val} onChange={this.handler_chg} onBlur={this.handler_blur} onFocus={this.handler_focus} />
		);
	}
}

export default UpdInp;