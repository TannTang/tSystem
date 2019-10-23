import React, {Component} from 'react'
import {Route} from 'react-router-dom'
import Axios from 'axios'
import Query from './Query.js'
import Update from './Update.js'
import SignIn from './SignIn.js'
import './App.css'

export default class App extends Component {
	
	constructor() {
		super()

		this.state = {
			tAdministrator: null,
			sheet: null,
		}
		
		this.sign_out = this.sign_out.bind(this)
		this.authorize = this.authorize.bind(this)

		this.authorize()
	}

	authorize () {
		Axios.post('/tAdministrators/authorize').then((response) => {
			if (response.data) {
				console.log('authorize --- true')
				this.setState({tAdministrator:response.data})
				this.find_sheet()
			} else {
				console.log('authorize --- false')
				this.setState({tAdministrator:false})
			}
		}).catch((error) => {console.log(error)})
	}

	sign_out () {
		Axios.post('/tAdministrators/sign_out').then((response) => {
			if (response.data === 'sign_out') {
				console.log('sign_out')
				this.setState({tAdministrator:false})
			}
		})
	}

	find_sheet () {
		Axios.post('/find_sheet').then((response) => {
			this.setState({
				sheet: response.data,
			})
		})
	}

	render() {
		const {tAdministrator, sheet} = this.state
		if (tAdministrator) {
			if (sheet) {
				return (
					<div>
						<div className="top">
							<div className="database">{sheet.db.label.cn}</div>
							<div className="signOut" onClick={this.sign_out}>登出</div>
						</div>
						<Route exact path='/' render={({match}) => (<Query db={sheet.db} collections={sheet.collections} />)} />
						<Route path='/update/:collection/:_id' render={({match}) => (<Update match={match} collections={sheet.collections} />)} />
					</div>
				)
			} else {
				return (
					<div>
						資料讀取中...
					</div>
				)
			}
		} else if (tAdministrator === false) {
			return (
				<SignIn authorize={this.authorize} />
			)
		} else if (tAdministrator === null) {
			return (
				<div>
					管理員身分驗證中...
				</div>
			)
		}
	}
}