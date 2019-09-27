import React, {Component} from 'react'
import Axios from 'axios'
import UpdateEditText from './UpdateEditText.js'
import UpdateImagesBlob from './UpdateImagesBlob.js'

export default class UpdateMutipleBlob extends Component {

	constructor(props) {
		super(props)

		this.state = {
			objects: props.value,
		}

		this.push_object = this.push_object.bind(this)
		this.pull_object = this.pull_object.bind(this)
		this.upward_object = this.upward_object.bind(this)
		this.downward_object = this.downward_object.bind(this)
		this.update_text = this.update_text.bind(this)
	}

	push_object (type) {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		Axios.post('/update_multiple_blob/push_object', {collection:collection, fieldKey:fieldKey, _id:_id, type:type}).then((response) => {
			//console.log(response.data)
			if (response.data) {
				objects.push(response.data)
				this.setState({
					objects: objects,
				})
			}
		}).catch((error) => {console.log(error)})
	}

	pull_object (type, _objectId, index) {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		if (window.confirm('確定要刪除此段落嗎？')) {
			Axios.post('/update_multiple_blob/pull_object', {collection:collection, fieldKey:fieldKey, _id:_id, type:type, _objectId:_objectId}).then((response) => {
				//console.log(response.data)
				if (response.data === 'have image') {
					window.alert('段落中有影像未刪除')
				} else if (response.data) {
					let newObjects = objects
					newObjects.splice(index, 1)
					this.setState({
						objects: newObjects
					})
				}
			}).catch((error) => {console.log(error)})
		}
	}

	upward_object (_objectId, index) {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		if (index > 0) {
			Axios.post('/update_multiple_blob/upward_object', {collection:collection, fieldKey:fieldKey, _id:_id, _objectId:_objectId}).then((response) => {
				//console.log(response.data)
				if (response.data) {
					let temp = objects[index]
					objects[index] = objects[index - 1]
					objects[index - 1] = temp
					this.setState({
						objects: objects
					})
				}
			})
		}
	}

	downward_object (_objectId, index) {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		if (index < objects.length - 1) {
			Axios.post('/update_multiple_blob/downward_object', {collection:collection, fieldKey:fieldKey, _id:_id, _objectId:_objectId}).then((response) => {
				//console.log(response.data)
				if (response.data) {
					let temp = objects[index]
					objects[index] = objects[index + 1]
					objects[index + 1] = temp
					this.setState({
						objects: objects
					})
				}
			})
		}
	}

	update_text (_objectId, value, index) {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		Axios.post('/update_multiple_blob/update_text', {collection:collection, fieldKey:fieldKey, _id:_id, _objectId:_objectId, value:value}).then((response) => {
			console.log(response.data)
			if (response.data) {
				console.log(objects)
				objects[index].text = value
				console.log(objects)
				this.setState({
					objects: objects
				})
			}
		})
	}

	render () {
		const {collection, fieldKey, _id} = this.props
		const {objects} = this.state
		return (
			<div className="updateMultiple">
				{objects.map((object, index) => {
					let component = null
					switch (object.type) {
						case 'text':
							component = <UpdateEditText value={object.text} fieldKey={fieldKey} update_field={(fieldKey, value) => this.update_text(object._id, value, index)} />
							break
						case 'images':
							component = <UpdateImagesBlob value={object.images} collection={collection} fieldKey={fieldKey} _id={_id} _objectId={object._id} />
							break
					}
					return 	<div className="updateMultipleItem" key={index}>
								{component}
								<div className="updateMultipleItemOptions">
									<div className="updateMultipleItemUpward" onClick={() => this.upward_object(object._id, index)}>上升段落</div>
									<div className="updateMultipleItemDelete" onClick={() => this.pull_object(object.type, object._id, index)}>刪除段落</div>
									<div className="updateMultipleItemDownward" onClick={() => this.downward_object(object._id, index)}>下降段落</div>
								</div>
							</div>
				})}
				<div className="updateMultipleOptions">
					<div className="updateMultipleOption" onClick={() => this.push_object('text')}>增加文字段落</div>
					<div className="updateMultipleOption" onClick={() => this.push_object('images')}>增加影像段落</div>
				</div>
			</div>
		)
	}
}