import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable'

class UpdContentEditable extends Component {
	constructor (props) {
		super (props);
		this.cntEdt = React.createRef();
		
		if (props.val) {
			this.val = props.val;
		} else {
			this.val = '';
		}
		this.state = {val: this.val, iFocus:false};

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
				if (this.state.val === '') {
					this.setState({val:'空白', iFocus:false});
				} else {
					this.setState({iFocus:false});
				}
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
			<ContentEditable className="UpdContentEditable" innerRef={this.cntEdt} html={this.state.val} onChange={this.handler_chg} onBlur={this.handler_blur} onFocus={this.handler_focus} />
		);
	}
}

export default UpdContentEditable;