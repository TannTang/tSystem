import React, {Component} from 'react'
import {Route} from 'react-router-dom'
import Axios from 'axios'
import Find from './Find.js'
import Update from './Update.js'
import './App.css'

export default class App extends Component {
	
	constructor() {
		super()

		this.state = {
			sheet: null,
		}
		
		this.find_sheet()
	}

	find_sheet () {
		Axios.post('/find_sheet').then((response) => {
			this.setState({
				sheet: response.data,
			})
		})
	}

	render() {
		const {sheet} = this.state

		if (sheet) {
			return (
				<div>
					<Route exact path='/' render={({match}) => (<Find db={sheet.db} collections={sheet.collections} />)} />
					<Route path='/update/:collection/:_id' render={({match}) => (<Update match={match} collections={sheet.collections} />)} />
				</div>
			)
		} else {
			return null
		}
	}
}