import React, {Component} from 'react'
import Axios from 'axios'

import FindCollections from './FindCollections.js'
import FindFields from './FindFields.js'
import FindDocuments from './FindDocuments.js'

export default class Find extends Component {

	constructor (props) {
		super(props)

		this.state = {
			collection: Object.keys(props.collections)[0],
			filter: null,
			documents: [],
		}

		this.find_collection = this.find_collection.bind(this)
		this.update_filter = this.update_filter.bind(this)
		this.insert_document = this.insert_document.bind(this)
		this.delete_document = this.delete_document.bind(this)

		this.find_collection(this.state.collection)
	}

	find_collection (collection) {
		Axios.post('/find_collection', {collection:collection}).then((response) => {
			this.setState({
				collection: collection,
				filter: response.data.filter,
				documents: response.data.documents,
			})
		})
	}

	update_filter (fieldKey, fieldEnable) {
		const {filter} = this.state
		Axios.post('/update_filter', {collection:filter.collection, fieldKey:fieldKey, fieldEnable:fieldEnable}).then((response) => {
			//console.log(response.data)
			this.setState({
				filter: response.data.filter,
				documents: response.data.documents,
			})
		})
	}

	insert_document () {
		const {collection, filter, documents} = this.state
		Axios.post('/insert_document', {collection:collection}).then((response) => {
			let document = response.data
			let newDocument = {}
			if (filter) {
				filter.fields.map((field) => {
					if (field.enable) {
						newDocument._id = document._id
						newDocument[field.key] = document[field.key]
					}
				})
			} else {
				newDocument = document
			}
			documents.unshift(newDocument)
			this.setState({documents:documents})
		})
	}

	delete_document (_id) {
		const {collection, documents} = this.state
		if (window.confirm('確定要刪除這筆資料嗎')) {
			Axios.post('/delete_document', {collection:collection, _id:_id}).then((response) => {
				//console.log(response.data)
				if (response.data !== 'not clear') {
					if (response.data) {
						let newDocuments = []
						documents.map((document) => {
							if (document._id !== _id) {
								newDocuments.push(document)
							}
						})
						this.setState({
							documents: newDocuments
						})
					}
				} else {
					window.alert('需先刪除此資料中所有複合式欄位的資料');
				}
			})
		}
	}

	render () {
		const {db, collections} = this.props
		const {collection, filter, documents} = this.state

		if (db) {
			let fields = collections[collection].fields
			return (
				<div>
					<div className="findDatabase">{db.label}</div>
					<div className="findTitle">選擇集合</div>
					<FindCollections collections={collections} collection={collection} find_collection={this.find_collection} />
					<div className="findTitle">顯示欄位</div>
					<FindFields fields={fields} filter={filter} update_filter={this.update_filter} />
					<div className="findTitle">文件列表</div>
					<div className="findInsert" onClick={this.insert_document}>新增文件</div>
					<FindDocuments collection={collection} documents={documents} delete_document={this.delete_document} />
				</div>
			)
		} else {
			return null
		}
	}
}