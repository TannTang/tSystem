import React, { Component } from 'react';
import UpdInp from './UpdInp.js';

class UpdInps extends Component {
	constructor(props) {
		super();
		this.state = {vals:props.vals}
		this.upd_inp = this.upd_inp.bind(this);
		this.remove_inp = this.remove_inp.bind(this);
		this.add_inp = this.add_inp.bind(this);
	}

	upd_inp (val, idx) {
		let array = this.state.vals;
		array[idx] = val;
		this.setState({vals:array});
		this.props.upd_fld(array);
	}

	add_inp () {
		let array = this.state.vals.concat(['']);
		this.setState({vals:array});
		this.props.upd_fld(array);
	}

	remove_inp (idx) {
		let array = this.state.vals; 
		array.splice(idx, 1);
		this.setState({vals:array});
		this.props.upd_fld(array);
	}

	render () {
		const {vals} = this.state;
		
		return (
			<div className="UpdInps">
				{vals.map((val, idx) => (
					<div className="updInpsSub" key={idx}>
						<UpdInp idx={idx} val={val} upd_fld={(val) => this.upd_inp(val, idx)} />
						<div className="updInpsRemove" onClick={() => this.remove_inp(idx)}>刪除</div>
					</div>
				))}
				<div className="updInpsAdd" onClick={this.add_inp}>增加</div>
			</div>
		);
	}
}

export default UpdInps;