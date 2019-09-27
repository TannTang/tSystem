const FS = require('fs')

const ObjectId = require('mongodb').ObjectID
const Express = require('express')

const AzureStorage = require('azure-storage')
const Multer = require('multer')
const Sharp = require('sharp')

const uploads = Multer({dest:'uploads/'})

module.exports = (db, ascs, blobContainer) => {

	const router = Express.Router()

	router.post('/find_muti', async (request, response) => {
		let coll = req.body.coll
		let fieldKey = req.body.fieldKey
		let _docId = new ObjectId(req.body._docId)
		
		let doc = await db.collection(coll).findOne({_id:_docId})
		let _muti = doc[fieldKey]

		response.send(_muti)
	})

	router.post('/push_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let type = request.body.type

		let object = {_id:new ObjectId()}
		switch (type) {
			case 'text':
				object.type = 'text'
				object.text = {}
				break
			case 'images':
				object.type = 'images'
				object.images = []
				break
		}
		
		let push = {}
		push[fieldKey] = object
		let documentResult = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$push:push}, {returnOriginal:false})
		if (documentResult) {
			response.send(object)
		} else {
			response.send(false)
		}
	})

	router.post('/pull_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let type = request.body.type
		let _objectId = request.body._objectId

		if (type === 'text') {
			let pull = {}
			pull[fieldKey] = {_id:new ObjectId(_objectId)}
			let documentResult = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$pull:pull}, {returnOriginal:false})
			if (documentResult) {
				response.send(true)
			} else {
				response.send(false)
			}
		} else if (type === 'images') {
			let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
			let objects = document[fieldKey]
			let _objectIds = objects.map((object) => (object._id.toString()))
			let index = _objectIds.indexOf(_objectId)
			if (objects[index].images.length > 0) {
				response.send('have image')
			} else {
				let pull = {}
				pull[fieldKey] = {_id:new ObjectId(_objectId)}
				let documentResult = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$pull:pull}, {returnOriginal:false})
				if (documentResult) {
					response.send(true)
				} else {
					response.send(false)
				}
			}
		}
	})

	router.post('/upward_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _objectId = request.body._objectId
		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		let objects = document[fieldKey]
		let _objectIds = objects.map((object) => (object._id.toString()))
		let index = _objectIds.indexOf(_objectId)

		if (index > 0) {
			let temp = objects[index]
			objects[index] = objects[index - 1]
			objects[index - 1] = temp
			let set = {}
			set[fieldKey] = objects
			await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$set:set}, {returnOriginal:false})
			response.send(true)
		} else {
			response.send(false)
		}
	})

	router.post('/downward_object', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _objectId = request.body._objectId
		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		let objects = document[fieldKey]
		let _objectIds = objects.map((object) => (object._id.toString()))
		let index = _objectIds.indexOf(_objectId)

		if (index < objects.length -1) {
			let temp = objects[index]
			objects[index] = objects[index + 1]
			objects[index + 1] = temp
			let set = {}
			set[fieldKey] = objects
			await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$set:set}, {returnOriginal:false})
			response.send(true)
		} else {
			response.send(false)
		}
	})

	router.post('/update_text', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _objectId = request.body._objectId
		let value = request.body.value

		let find = {}
		find['_id'] = new ObjectId(_id)
		find[fieldKey +'._id'] = new ObjectId(_objectId)

		let set = {}
		set[fieldKey +'.$.text'] = value

		let documentResult = await db.collection(collection).findOneAndUpdate(find, {$set:set}, {returnOriginal:false})
		if (documentResult) {
			response.send(true)
		} else {
			response.send(false)
		}
	})
	/*
	router.post('/upd_muti', async (request, response) => {
		let coll = request.body.coll
		let fieldKey = request.body.fieldKey
		let _docId = new ObjectId(request.body._docId)
		let _mutiId = request.body._mutiId
		let str = request.body.str

		let doc = await db.collection(coll).findOne({_id:_docId})
		let mutis = doc[fieldKey]

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()))
		let idx = mutiIdStrs.indexOf(_mutiId)

		mutis[idx].str = str

		let setObj = {}
		setObj[fieldKey] = mutis

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false})
		let newMuti = newDoc.value[fieldKey]
		response.send(newMuti)
	})
	*/
	router.post('/mov_muti', async (request, response) => {
		let coll = request.body.coll
		let fieldKey = request.body.fieldKey
		let _docId = new ObjectId(request.body._docId)
		let _mutiId = request.body._mutiId
		let mov = request.body.mov
		
		let doc = await db.collection(coll).findOne({_id:_docId})
		let mutis = doc[fieldKey]

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()))
		let idx = mutiIdStrs.indexOf(_mutiId)

		if (mov === 1) {
			if (idx !== mutis.length - 1) {
				let tmp = mutis[idx + 1]
				mutis[idx + 1] = mutis[idx]
				mutis[idx] = tmp
			}
		} else if (mov === -1) {
			if (idx !== 0) {
				let tmp = mutis[idx - 1]
				mutis[idx - 1] = mutis[idx]
				mutis[idx] = tmp
			}
		}

		let setObj = {}
		setObj[fieldKey] = mutis

		let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false})
		let newMuti = newDoc.value[fieldKey]
		response.send(newMuti)
	})
	/*
	router.post('/del_muti', async (request, response) => {
		let coll = request.body.coll
		let fieldKey = request.body.fieldKey
		let _docId = new ObjectId(request.body._docId)
		let _mutiId = request.body._mutiId

		let doc = await db.collection(coll).findOne({_id:_docId})
		let mutis = doc[fieldKey]

		let mutiIdStrs = mutis.map((muti) => (muti._id.toString()))
		let idx = mutiIdStrs.indexOf(_mutiId)

		if (mutis[idx].type === 'imgs') {
			if (mutis[idx].imgs.length === 0) {

				let modMutis = []

				mutis.map((muti) => {
					if(muti._id.toString() !== _mutiId) {
						modMutis.push(muti)
					}
				})

				let setObj = {}
				setObj[fieldKey] = modMutis

				let newDoc = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:setObj}, {returnOriginal:false})
				let newMuti = newDoc.value[fieldKey]
				response.send(newMuti)

			} else {
				response.send('haveimg')
			}
		}
	})
	*/
 	return router
}
