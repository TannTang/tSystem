import React, {Component} from 'react'
import Axios from 'axios'

import QueryCollections from './QueryCollections.js'
import QueryFinds from './QueryFinds.js'
import QuerySorts from './QuerySorts.js'
import QueryProjections from './QueryProjections.js'
import QueryDocuments from './QueryDocuments.js'

export default class Query extends Component {

	constructor (props) {
		super(props)

		let collection = Object.keys(props.collections)[0]

		let finds = props.collections[collection].finds
		let find = null
		if (finds.length !== 0) {
			find = finds[0].find
		}

		let sorts = props.collections[collection].sorts
		let sort = null
		if (sorts.length !== 0) {
			sort = sorts[0].sort
		}
		
		this.state = {
			collection: collection,
			find: find,
			sort: sort,
			projection: {},
			documents: [],
		}

		this.change_collection = this.change_collection.bind(this)
		this.change_find = this.change_find.bind(this)
		this.change_sort = this.change_sort.bind(this)
		this.update_projection = this.update_projection.bind(this)
		this.find_documents = this.find_documents.bind(this)
		this.insert_document = this.insert_document.bind(this)
		this.delete_document = this.delete_document.bind(this)

		this.find_projection(collection)
	}

	find_projection (collection) {
		Axios.post('/find_projection', {collection:collection}).then((response) => {
			let projection = {}
			if (response.data) {
				projection = response.data.projection
			}
			this.setState({
				projection: projection,
			})
		})
	}

	change_collection (collection) {
		const {collections} = this.props

		let finds = collections[collection].finds
		let find = null
		if (finds.length !== 0) {
			find = finds[0].find
		}

		let sorts = collections[collection].sorts
		let sort = null
		if (sorts.length !== 0) {
			sort = sorts[0].sort
		}

		this.setState({
			collection: collection,
			find: find,
			sort: sort,
			documents: [],
		})
		this.find_projection(collection)
	}

	change_find (index) {
		const {collections} = this.props
		const {collection} = this.state
		let find = collections[collection].finds[index].find
		this.setState({
			find: find,
			documents: [],
		})
	}

	change_sort (index) {
		const {collections} = this.props
		const {collection} = this.state
		let sort = collections[collection].sorts[index].sort
		this.setState({
			sort: sort,
			documents: [],
		})
	}

	update_projection (fieldKey) {
		const {collection, projection} = this.state

		let newProjection = {}
		if (projection) {
			if (projection[fieldKey]) {
				Object.keys(projection).map((key) => {
					if (key !== fieldKey) {
						newProjection[key] = 1
					}
				})
			} else {
				Object.keys(projection).map((key) => {
					newProjection[key] = 1
				})
				newProjection[fieldKey] = 1
			}
		} else {
			newProjection[fieldKey] = 1
		}

		Axios.post('/update_projection', {collection:collection, projection:newProjection}).then((response) => {
			//console.log(response.data)
			this.setState({
				projection: response.data.projection,
				documents: [],
			})
		})
	}

	find_documents () {
		const {collection, find, sort, projection} = this.state
		//console.log(response.data)
		Axios.post('/find_documents', {collection:collection, find:find, sort:sort, projection:projection}).then((response) => {
			console.log(response.data)
			this.setState({
				documents: response.data, 
			})
		})
	}

	insert_document () {
		const {collection, projection, documents} = this.state
		Axios.post('/insert_document', {collection:collection}).then((response) => {
			let document = {}
			document._id = response.data._id
			Object.keys(projection).map((fieldKey) => {
				document[fieldKey] = response.data[fieldKey]
			})
			
			documents.unshift(document)
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
		const {collection, find, sort, projection, documents} = this.state

		if (db) {
			let finds = collections[collection].finds
			let sorts = collections[collection].sorts
			let fields = collections[collection].fields

			if (finds.length !== 0) {
				this.findsTitle	= <div className="queryTitle">查詢分類</div>
				this.finds = <QueryFinds finds={finds} find={find} change_find={this.change_find} />
			} else {
				this.findsTitle	= <div className="queryTitle">無查詢分類</div>
				this.finds = null
			}

			if (sorts.length !== 0) {
				this.sortsTitle	= <div className="queryTitle">查詢排序</div>
				this.sorts = <QuerySorts sorts={sorts} sort={sort} change_sort={this.change_sort} />
			} else {
				this.sortsTitle	= <div className="queryTitle">無查詢分類</div>
				this.sorts = null
			}

			if (documents.length !== 0) {
				this.tips = null
			} else {
				this.tips = <div className="queryTips">無查詢資料</div>
			}

			return (
				<div>
					
					<div className="queryTitle">查詢集合</div>
					<QueryCollections collections={collections} collection={collection} change_collection={this.change_collection} />
					{this.findsTitle}
					{this.finds}
					{this.sortsTitle}
					{this.sorts}
					<div className="queryTitle">顯示欄位</div>
					<QueryProjections fields={fields} projection={projection} update_projection={this.update_projection} />
					<div className="queryTitle">文件列表</div>
					<div className="queryOptions">
						<div className="queryOption" onClick={this.insert_document}>新增文件</div>
						<div className="queryOption" onClick={this.find_documents}>產生查詢列表</div>
					</div>
					{this.tips}
					<QueryDocuments collection={collection} documents={documents} delete_document={this.delete_document} />
				</div>
			)
		} else {
			return null
		}
	}
}