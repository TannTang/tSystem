import React, {Component} from 'react';

class UpdTxtArea extends Component {
	constructor (props) {
		super (props);
		this.state = {val:props.val, iFocus:false};
		this.handler_chg = this.handler_chg.bind(this);
		this.handler_blur = this.handler_blur.bind(this);
		this.handler_focus = this.handler_focus.bind(this);
	}

	handler_chg (e) {
		this.setState({val:e.target.value});
	}

	handler_blur () {
		this._timeOutId = setTimeout(() => {
			if (this.state.iFocus) {
				this.setState({iFocus:false});
				this.props.upd_fld(this.state.val);
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
			<textarea className="UpdTxtArea" rows="5" value={this.state.val} onChange={this.handler_chg} onBlur={this.handler_blur} onFocus={this.handler_focus} />
		);
	}
}

export default UpdTxtArea;