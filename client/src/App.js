import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import Axios from 'axios';
import Find from './Find/Find.js';
import Upd from './Upd/Upd.js';

import './App.css';

class App extends Component {
	constructor() {
		super();
		this.fllWdt = 0;
		this.sftWdt = 0;
		this.hrdWdt = 0;
		this.fllHgh = 0;

		this.state = {
			fllWdt: this.fllWdt,
			sftWdt: this.sftWdt,
			hrdWdt: this.hrdWdt,
			fllHgh: this.fllHgh,
		};

		this.windowSizeChange = this.windowSizeChange.bind(this);
	}

	componentDidMount() {
		window.addEventListener('resize', this.windowSizeChange);
		this.windowSizeChange();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowSizeChange);
	}

	windowSizeChange () {
		this.detect_width();
		this.setState({
			fllWdt: this.fllWdt,
			sftWdt: this.sftWdt,
			hrdWdt: this.hrdWdt,
			fllHgh: this.fllHgh,
		});
	}

	detect_width () {
		this.fllWdt = document.body.clientWidth;
		this.sftWdt = 0;
		this.hrdWdt = 0;
		this.fllHgh = window.innerHeight;

		if (this.fllWdt <= 320) {
			this.sftWdt = this.fllWdt - 20;
			this.hrdWdt = this.fllWdt;

		} else if (this.fllWdt > 320 && this.fllWdt <= 375) {
			this.sftWdt = this.fllWdt - 30;
			this.hrdWdt = 320;

		} else if (this.fllWdt > 375 && this.fllWdt <= 425) {
			this.sftWdt = this.fllWdt - 40;
			this.hrdWdt = 375;

		} else if (this.fllWdt > 425 && this.fllWdt <= 768) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 94);
			this.hrdWdt = 425;

		} else if (this.fllWdt > 768 && this.fllWdt <= 1024) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 88);
			this.hrdWdt = 768;

		} else if (this.fllWdt > 1024 && this.fllWdt <= 1440) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 82);
			this.hrdWdt = 1024;

		} else if (this.fllWdt > 1440 && this.fllWdt <= 1600) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 76);
			this.hrdWdt = 1440;

		} else if (this.fllWdt > 1600 && this.fllWdt <= 1920) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 70);
			this.hrdWdt = 1600;

		} else if (this.fllWdt > 1920) {
			this.sftWdt = Math.floor(this.fllWdt / 100 * 64);
			this.hrdWdt = 1920;
		}
	}

	render() {

		const {fllWdt, sftWdt, hrdWdt, fllHgh} = this.state;

		return (
			<div className="App">
				<div className="Top">管理介面</div>
				<Route exact path='/' render={({match}) => (<Find fllWdt={fllWdt} sftWdt={sftWdt} hrdWdt={hrdWdt} />)} />
				<Route path='/upd/:coll/:_docId' render={({match}) => (<Upd match={match} />)} />
				{/*<Route path='/sgn/SgnIn' render={({match}) => (<SgnIn match={match} />)} />*/}
			</div>
		);
	}
}

export default App;
