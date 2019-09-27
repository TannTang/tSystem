import React, { Component } from 'react'
import {Editor, EditorState, convertToRaw, convertFromRaw} from 'draft-js'

export default class UpdateEditText extends Component {

	constructor (props) {
		super (props)

		let editorState = null
		if (typeof props.value === 'object' && props.value.blocks) {
			let contentState = convertFromRaw(props.value)
			editorState = EditorState.createWithContent(contentState)
		} else {
			editorState = EditorState.createEmpty()
		}
		this.state = {
			editorState: editorState
		}

		this.change_editor = this.change_editor.bind(this)
		this.blur_editor = this.blur_editor.bind(this)
	}

	componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			let editorState = null
			if (typeof this.props.value === 'object' && this.props.value.blocks) {
				let contentState = convertFromRaw(this.props.value)
				editorState = EditorState.createWithContent(contentState)
			} else {
				editorState = EditorState.createEmpty()
			}
			this.setState({
				editorState: editorState
			})
		}
	}

	change_editor (editorState) {
        this.setState({
            editorState: editorState,
        })
	}

	blur_editor () {
		const {fieldKey, update_field} = this.props
		const {editorState} = this.state
		let value = convertToRaw(editorState.getCurrentContent())
		update_field(fieldKey, value)
	}

	handler_blur () {
		this._timeOutId = setTimeout(() => {
			if (this.state.iFocus) {
				if (this.state.val === '') {
					this.setState({val:'空白', iFocus:false})
				} else {
					this.setState({iFocus:false})
				}
				this.props.upd_fld(this.state.val)
			}
		}, 0)
	}

	handler_focus () {
		clearTimeout(this._timeOutId)
		if (!this.state.iFocus) {
			this.setState({iFocus:true})
		}
	}

	render () {
		const {editorState} = this.state
		return (
			<div className="updateEditText">
				<Editor editorState={editorState} onChange={this.change_editor} onBlur={this.blur_editor} />
			</div>
		)
	}
}