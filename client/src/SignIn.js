import React, {Component} from 'react'
import {Redirect, Link} from 'react-router-dom'
import Axios from 'axios'

export default class SignIn extends Component {

	constructor (props) {
        super(props)
        
		this.state = {
			username: '',
            password: '',
		}

		this.change_username = this.change_username.bind(this)
        this.change_password = this.change_password.bind(this)
        this.submit = this.submit.bind(this)
        this.reset = this.reset.bind(this)
	}

	change_username (event) {
		this.setState({
			username: event.target.value,
		})
    }

    change_password (event) {
		this.setState({
			password: event.target.value,
		})
    }

    submit () {
        const {authorize} = this.props
        const {username, password} = this.state

        if (username && password) {
			Axios.post('/tAdministrators/sign_in', {username:username, password:password}).then((response) => {
                //console.log(response.data)
				if (response.data) {
                    authorize()
				}
			}).catch((error) => {
                window.alert('信箱或密碼錯誤')
			})
		} else {
			window.alert('請輸入完整帳號與密碼')
		}
    }

    reset () {
        this.setState({
            username: '',
            password: '',
        })
    }

	render () {
        const {username, password} = this.state
        
		return (
			<div className="signIn">
				<div className="signInInner">
					<div className="signInTitle">管理者登入</div>
					<input className="signInInput" type="text" placeholder="輸入帳號" value={username} onChange={this.change_username} />
                    <input className="signInInput" type="password" placeholder="輸入密碼" value={password} onChange={this.change_password} />
                    <div className="signInOptions">
                        <div className="signInOption" onClick={this.submit}>登入</div>
                        <div className="signInOption" onClick={this.reset}>重設</div>
                    </div>
				</div>
			</div>
		)
	}
}

