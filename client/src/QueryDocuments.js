import React, {Component} from 'react'
import {Link} from 'react-router-dom'

function Field (props) {
	if (typeof(props.value) === 'object') {
		return	<div className="queryDocumentField">
					<div className="queryDocumentFieldKey">object</div>
					<div className="queryDocumentFieldValue">object</div>
				</div>
	} else {
		let value = null
		if (props.value) {
			value = props.value
		} else {
			value = 'null'
		}
		return	<div className="queryDocumentField">
					<div className="queryDocumentFieldKey">{props.fieldKey}</div>
					<div className="queryDocumentFieldValue">{value}</div>
				</div>
	}	
}

export default class QueryDocuments extends Component {

	render () {
		const {collection, documents, delete_document} = this.props
		return (
			<div className="queryDocuments">
				{documents.map((document, index) => (
					<div className="queryDocument" key={index}>
						<div className="queryDocumentNumber">{index + 1}</div>
						{Object.keys(document).map((fieldKey, index) => (
							<Field key={index} fieldKey={fieldKey} value={document[fieldKey]} />
						))}
						<Link className="queryDocumentEdit" to={'/update/'+ collection +'/'+ document._id} target="_blank">編輯</Link>
						<div className="queryDocumentDelete" onClick={() => delete_document(document._id)}>刪除</div>
					</div>
				))}
			</div>
		)
	}
}