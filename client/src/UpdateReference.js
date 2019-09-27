import React, {Component} from 'react'
import Axios from 'axios'

export default class UpdateReference extends Component {

	constructor(props) {
        super(props)

		this.state = {
			value: props.value,
            objects: [],
			refObjects: [],
		}
        this.find_objects()
	}

	find_objects () {
		const {project, refCollection} = this.props.update
		const {value} = this.state
		let _objectIds = value.map((object) => (object['_id']))
		Axios.post('/update_reference/find_objects', {
			refCollection: refCollection,
			project: project,
			_objectIds: _objectIds,
		}).then((response) => {
            this.setState({
				objects: response.data.objects,
                refObjects: response.data.refObjects,
            })
		})
	}

	pull_object (_objectId) {
		const {collection, fieldKey, _id} = this.props
		const {refCollection, project} = this.props.update
		const {value} = this.state
		let _objectIds = value.map((object) => (object['_id']))
		Axios.post('/update_reference/pull_object', {
			collection:collection, fieldKey:fieldKey, _id:_id,
			refCollection:refCollection, project:project,
			_objectIds:_objectIds, _objectId:_objectId
		}).then((response) => {
			//console.log(response.data)
			if (response.data) {
				this.setState({
					value: response.data.value,
					objects: response.data.objects,
					refObjects: response.data.refObjects,
				})
			}
		}).catch((error) => {console.log(error)})
	}

	push_object (_objectId) {
        const {collection, fieldKey, _id} = this.props
		const {refCollection, project, refFields} = this.props.update
		const {value} = this.state
		let _objectIds = value.map((object) => (object['_id']))
        Axios.post('/update_reference/push_object', {
			collection:collection, fieldKey:fieldKey, _id:_id,
			refCollection:refCollection, project:project, refFields:refFields,
			_objectIds:_objectIds, _objectId:_objectId
		}).then((response) => {
            //console.log(response.data)
			if (response.data) {
				this.setState({
					value: response.data.value,
					objects: response.data.objects,
					refObjects: response.data.refObjects,
				})
			}
		}).catch((error) => {console.log(error)})
    }

	render () {
		const {objects, refObjects} = this.state
		return (
			<div className="updateReference">
				<div className="updateReferenceLabel">嵌入資料</div>
				<div className="updateReferenceItems">
					{objects.map((object, index) => (
						<div className="updateReferenceItem" key={index}>
							{Object.values(object).map((value, index) => (
								<div className="updateReferenceValue" key={index}>{Object.keys(object)[index] +':'+ value}</div>
							))}
							<div className="updateReferenceDelete" onClick={() => this.pull_object(object._id)}>刪除</div>
						</div>
					))}
					{/*refDocsA.map((refDoc, idx) => (
						<div className="updRefsRef" key={idx}>
							<div className="updRefsFlds">
								{Object.values(refDoc).map((refFld, idx) => (
									<div className="updRefsFld" key={idx}>{Object.keys(refDoc)[idx] +': '+ refFld}</div>
								))}
							</div>
							<div className="updRefsBtns">
								<div className="updRefsMov" onClick={() => this.mov_refDoc(refDoc._id, -1)}>{'<<<'}</div>
								<div className="updRefsCancel" onClick={() => this.cancel_refDoc(refDoc._id)}>取消選取</div>
								<div className="updRefsMov" onClick={() => this.mov_refDoc(refDoc._id, 1)}>{'>>>'}</div>
							</div>
						</div>
                    ))*/}
				</div>
				<div className="updateReferenceLabel">參考資料</div>
				<div className="updateReferenceItems">
                    {refObjects.map((object, index) => (
                        <div className="updateReferenceItem" key={index}>
                            {Object.values(object).map((value, index) => (
                                <div className="updateReferenceValue" key={index}>{Object.keys(object)[index] +':'+ value}</div>
                            ))}
                            <div className="updateReferenceSelect" onClick={() => this.push_object(object._id)}>選取</div>
                        </div>
                    ))}
				</div>
			</div>
		)
	}
}