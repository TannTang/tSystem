import React, { Component } from 'react'
import Axios from 'axios'
import UpdateInputText from './UpdateInputText.js'
import UpdateInputNumber from './UpdateInputNumber.js'
import UpdateInputDate from './UpdateInputDate.js'
import UpdateTextArea from './UpdateTextArea.js'
import UpdateSelect from './UpdateSelect.js'
import UpdateInputTexts from './UpdateInputTexts.js'
import UpdateEditText from './UpdateEditText.js'
import UpdateReference from './UpdateReference.js'
import UpdateImagesBlob from './UpdateImagesBlob.js'
import UpdateMultipleBlob from './UpdateMultipleBlob.js'

export default class Update extends Component {
	
	constructor(props) {
		super(props)

		let statuss = {}
		Object.keys(props.collections[props.match.params.collection].fields).map((fieldKey) => {statuss[fieldKey] = 'loaded'})

		this.state = {
			document: null,
			statuss: statuss
		}

		this.update_field = this.update_field.bind(this)
		this.update_date = this.update_date.bind(this)
		//this.upd_docPss = this.upd_docPss.bind(this)

		this.find_document()
	}

	find_document () {
		const {collection, _id} = this.props.match.params
		Axios.post('/find_document', {collection:collection, _id:_id}).then((response) => {
			//console.log(response.data)
			this.setState({
				document: response.data,
			})
		})
	}

	update_field (fieldKey, value) {
		const {collection, _id} = this.props.match.params
		let {document, statuss} = this.state

		statuss[fieldKey] = 'updating ...'
		this.setState({statuss:statuss})

		let setObject = {}
		setObject[fieldKey] = value
		Axios.post('/update_field', {collection:collection, _id:_id, setObject:setObject}).then((response) => {
			if (response.data) {
				document[fieldKey] = value
				statuss[fieldKey] = 'updated'
				this.setState({
					statuss:statuss
				})
			}
		})
	}

	update_date (fieldKey, value) {
		const {collection, _id} = this.props.match.params
		let {document, statuss} = this.state

		statuss[fieldKey] = 'updating ...'
		this.setState({statuss:statuss})

		Axios.post('/update_date', {collection:collection, fieldKey:fieldKey, _id:_id, date:value}).then((response) => {
			if (response.data) {
				document[fieldKey] = value
				statuss[fieldKey] = 'updated'
				this.setState({
					statuss:statuss
				})
			}
		})
	}

	/*
	upd_docPss (fldKey, val) {
		const coll = this.props.match.params.coll
		const _docId = this.props.match.params._docId
		Axios.post('/upd_docPss', {coll:coll, _docId:_docId, fldKey:fldKey, val:val}).then((resp) => {
			this.find_doc(coll, _docId)
		})
	}
	*/

	render () {
		const {collection, _id} = this.props.match.params
		const {collections} = this.props
		const {document, statuss} = this.state

		if (document) {
			let fields = collections[collection].fields
			this.fields = 
				<div className="updateFields">
					{Object.keys(fields).map((fieldKey, index) => {
						let label = fields[fieldKey].label.cn
						let update = fields[fieldKey].update
						let method = ''
						let method_CN = ''
						let updateComponent = null
						let value = document[fieldKey]
						if (update) {
							method = update.method
							switch (method) {
								case 'inputText':
									method_CN = '文字'
									updateComponent = <UpdateInputText value={value} fieldKey={fieldKey} update_field={this.update_field} />
									break
								case 'inputNumber':
									method_CN = '數字'
									updateComponent = <UpdateInputNumber value={value} fieldKey={fieldKey} update_field={this.update_field} />
									break
								case 'inputDate':
									method_CN = '日期'
									updateComponent = <UpdateInputDate value={value} fieldKey={fieldKey} update_date={this.update_date} />
									break
								case 'textArea':
									method_CN = '文字區塊'
									updateComponent = <UpdateTextArea value={value} fieldKey={fieldKey} update_field={this.update_field} />
									break
								case 'select':
									method_CN = '選項'
									updateComponent = <UpdateSelect value={value} fieldKey={fieldKey} options={fields[fieldKey].update.options} update_field={this.update_field} />
									break
								case 'inputTexts':
									method_CN = '多組文字'
									updateComponent = <UpdateInputTexts value={value} fieldKey={fieldKey} update_field={this.update_field} />
									break
								case 'editText':
									method_CN = '內文編輯'
									updateComponent = <UpdateEditText value={value} fieldKey={fieldKey} update_field={this.update_field} />
									break
								case 'reference':
									method_CN = '嵌入參考'
									updateComponent = <UpdateReference value={value} collection={collection} fieldKey={fieldKey} _id={document._id} update={fields[fieldKey].update} update_field={this.update_field} />
									break
								case 'imagesBlob':
									method_CN = '影像儲存容器(azure blob)'
									updateComponent = <UpdateImagesBlob value={value} collection={collection} fieldKey={fieldKey} _id={document._id} _objectId={null} />
									break
								case 'multipleBlob':
									method_CN = '複合內容'
									updateComponent = <UpdateMultipleBlob value={value} collection={collection} fieldKey={fieldKey} _id={document._id} update_field={this.update_field} />
									break
								/*
								case 'inpPsw': updComponent = <UpdInp type={'text'} val={val} upd_fld={this.upd_fldPsw} /> break
								case 'inpTxts': updComponent = <UpdInps type={'text'} vals={val} upd_fld={this.upd_fld} /> break
								case 'updDocsBucket': updComponent = <UpdDocsBucket coll={coll} fld={fld} _docId={_docId} /> break
								case 'updRefs': updComponent = <UpdRefs coll={coll} fld={fld} _docId={_docId} /> break
								case 'updMutiBlob': updComponent = <UpdMutiBlob coll={coll} fld={fld} _docId={_docId} /> break
								//case 'updRefsBridge': updComponent = <UpdRefsBridge coll={coll} fld={fld} _docId={_docId} /> break
								*/

								default:
									method = 'null'
									updateComponent = null
									break
							}
						} else {
							method = 'readOnly'
							if (typeof value === 'array') {
								value = 'array'
							} else if (typeof value === 'object') {
								value = 'object'
							}
							updateComponent = <div className="updateReadOnly">{value}</div>
						}
						return <div className="updateField" key={index}>
									<div className="updateLabel">{label+'('+fieldKey+')'}</div>
									<div className="updateMethod">{method}<br />{method_CN}</div>
									{updateComponent}
									<div className="updateStatus">{statuss[fieldKey]}</div>
								</div>
					})}
				</div>
		} else {
			this.fields = <div>loading ...</div>
		}

		return (
			<div>
				<div className="updateTitle">{collection +' - '+ _id}</div>
				{this.fields}
				<br /><br /><br /><br /><br />
			</div>
		)
	}
}
