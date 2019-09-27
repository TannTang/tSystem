const ObjectId = require('mongodb').ObjectID
const Express = require('express')

module.exports = (db) => {

	const router = Express.Router()

	router.post('/find_objects', async (request, response) => {
		let refCollection = request.body.refCollection
		let project = request.body.project
		let _objectIds = request.body._objectIds
		_objectIds = _objectIds.map((_objectId) => (new ObjectId(_objectId)))

		let objects = await db.collection(refCollection).find({_id:{$in:_objectIds}}).project(project).toArray()
		let refObjects = await db.collection(refCollection).find({_id:{$nin:_objectIds}}).project(project).toArray()

		response.send({objects:objects, refObjects:refObjects})
	})
	
	router.post('/push_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let refCollection = request.body.refCollection
		let project = request.body.project
		let refFields = request.body.refFields
		let _objectIds = request.body._objectIds
		let _objectId = request.body._objectId
		
		let projection = {}
		refFields.map((fieldKey) => {
			projection[fieldKey] = true
		})
		
		let refResult = await db.collection(refCollection).findOne({_id:new ObjectId(_objectId)}, {projection:projection})

		let push = {}
		push[fieldKey] = refResult

		let documentResult = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$push:push}, {returnOriginal:false})
		let document = documentResult.value
		let value = document[fieldKey]

		_objectIds.push(_objectId)
		_objectIds = _objectIds.map((_objectId) => (new ObjectId(_objectId)))
		
		let objects = await db.collection(refCollection).find({_id:{$in:_objectIds}}).project(project).toArray()
		let refObjects = await db.collection(refCollection).find({_id:{$nin:_objectIds}}).project(project).toArray()
		response.send({value:value, objects:objects, refObjects:refObjects})
	})

	router.post('/pull_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let refCollection = request.body.refCollection
		let project = request.body.project
		let _objectIds = request.body._objectIds
		let _objectId = request.body._objectId

		let pull = {}
		pull[fieldKey] = {_id:new ObjectId(_objectId)}

		let documentResult = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$pull:pull}, {returnOriginal:false})
		let document = documentResult.value
		let value = document[fieldKey]

		let index = _objectIds.indexOf(_objectId)
		_objectIds.splice(index, 1)
		_objectIds = _objectIds.map((_objectId) => (new ObjectId(_objectId)))

		let objects = await db.collection(refCollection).find({_id:{$in:_objectIds}}).project(project).toArray()
		let refObjects = await db.collection(refCollection).find({_id:{$nin:_objectIds}}).project(project).toArray()
		response.send({value:value, objects:objects, refObjects:refObjects})
	})

 	return router
}
