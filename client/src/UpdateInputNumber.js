import React, {Component} from 'react'

export default class UpdateInputNumber extends Component {

	constructor (props) {
		super (props)

		this.state = {
            value: props.value,
            isFocus: false,
		}

        this.change = this.change.bind(this)
        this.blur = this.blur.bind(this)
		this.focus = this.focus.bind(this)
	}

	change (event) {
        this.value = event.target.value.trim()
        if (isNaN(this.value)) {
            this.value = 0
        }
		this.setState({
			value: Number(this.value)
		})
    }
    
    blur () {
		const {fieldKey, update_field} = this.props
		const {value} = this.state
		this._timeOutId = setTimeout(() => {
			if (this.state.isFocus) {
				update_field(fieldKey, value)
                this.setState({isFocus:false})
			}
		}, 0)
    }
    
    focus () {
		clearTimeout(this._timeOutId)
		if (!this.state.isFocus) {
			this.setState({isFocus:true})
		}
	}

	render () {
		const {value} = this.state
		return (
			<input className="updateInput" type="number" value={value} onChange={this.change} onBlur={this.blur} onFocus={this.focus} />
		)
	}
}