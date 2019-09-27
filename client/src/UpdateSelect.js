import React, {Component} from 'react'

export default class UpdateSelect extends Component {

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
		if (this.value === 'false') {
			this.value = false
		} else if (this.value === 'true') {
			this.value = true
		}
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
        const {options} = this.props
		const {value} = this.state
		return (
			<select className="updateSelect" value={value} onChange={this.change} onBlur={this.blur} onFocus={this.focus}>
                {options.map((option, index) => (<option key={index} value={options.value}>{option.label.en}</option>))}
			</select>
		)
	}
}