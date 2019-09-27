import React, { Component } from 'react'
import UpdateInputText from './UpdateInputText.js'

export default class UpdateInputTexts extends Component {

	constructor(props) {
		super(props)

		this.state = {
			values: props.value
		}

		this.insert_inputText = this.insert_inputText.bind(this)
		this.delete_inputText = this.delete_inputText.bind(this)

		this.update_inputText = this.update_inputText.bind(this)
	}

	update_inputText (fieldKey, value, index) {
		const {update_field} = this.props
		const {values} = this.state
		values[index] = value
		update_field(fieldKey, values)
	}

	insert_inputText () {
		const {fieldKey, update_field} = this.props
		const {values} = this.state
		let newValues = values.concat([''])
		this.setState({
			values: newValues
		})
		update_field(fieldKey, newValues)
	}

	delete_inputText (index) {
		const {fieldKey, update_field} = this.props
		const {values} = this.state
		let newValues = values
		newValues.splice(index, 1)
		this.setState({
			values: newValues
		})
		update_field(fieldKey, newValues)
	}

	render () {
		const {fieldKey} = this.props
		const {values} = this.state
		
		return (
			<div className="updateInputTexts">
				{values.map((value, index) => (
					<div className="updateInputTextsItem" key={index}>
						<UpdateInputText value={value} fieldKey={fieldKey} update_field={(fieldKey, value) => this.update_inputText(fieldKey, value, index)} />
						<div className="updateInputTextsItemDelete" onClick={() => this.delete_inputText(index)}>刪除</div>
					</div>
				))}
				<div className="updateInputTextsInsert" onClick={this.insert_inputText}>增加</div>
			</div>
		)
	}
}