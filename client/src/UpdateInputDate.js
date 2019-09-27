import React, {Component} from 'react'

export default class UpdateInputDate extends Component {

	constructor (props) {
		super (props)

		this.dateObject = new Date(props.value)
		this.year = this.dateObject.getFullYear()
		this.month = ('0' + (this.dateObject.getMonth() + 1)).slice(-2)
		this.date = ('0' + this.dateObject.getDate()).slice(-2)
		this.value = this.year +'-'+ this.month +'-'+ this.date
		
		this.state = {
            value: this.value,
            isFocus: false,
		}

        this.change = this.change.bind(this)
        this.blur = this.blur.bind(this)
		this.focus = this.focus.bind(this)
	}

	change (event) {
		this.value = event.target.value.trim()
		this.setState({
			value: this.value
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
			<input className="updateInput" type="date" value={value} onChange={this.change} onBlur={this.blur} onFocus={this.focus} />
		)
	}
}