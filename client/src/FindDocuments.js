import React, {Component} from 'react'
import {Link} from 'react-router-dom'

function Field (props) {
	if (typeof(props.value) === 'object') {
		return	<div className="findDocumentField">
					<div className="findDocumentFieldKey">object</div>
					<div className="findDocumentFieldValue">object</div>
				</div>
	} else {
		let value = null
		if (props.value) {
			value = props.value
		} else {
			value = 'null'
		}
		return	<div className="findDocumentField">
					<div className="findDocumentFieldKey">{props.fieldKey}</div>
					<div className="findDocumentFieldValue">{value}</div>
				</div>
	}	
}

export default class FindDocuments extends Component {

	render () {
		const {collection, documents, delete_document} = this.props
		return (
			<div className="findDocuments">
				{documents.map((document, index) => (
					<div className="findDocument" key={index}>
						<div className="findDocumentNumber">{index + 1}</div>
						{Object.keys(document).map((fieldKey, index) => (
							<Field key={index} fieldKey={fieldKey} value={document[fieldKey]} />
						))}
						<Link className="findDocumentEdit" to={'/update/'+ collection +'/'+ document._id} target="_blank">編輯</Link>
						<div className="findDocumentDelete" onClick={() => delete_document(document._id)}>刪除</div>
					</div>
				))}
			</div>
		)
	}
}