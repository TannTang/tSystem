const BodyParser = require('body-parser')
const Path = require('path')

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID

const Express = require('express')
const Crypto = require('crypto')

//const Sheet = require('../shishi/DataSheet_shishi.js')
const Sheet = require('../youdu/DataSheet_youdu.js')
//const Sheet = require('../murmur/DataSheet_murmur.js')

const tAdministrators = require('./tAdministrators.js')
const UpdateReference = require('./UpdateReference.js')
const UpdateImageBlob = require('./UpdateImageBlob.js')
const UpdateImagesBlob = require('./UpdateImagesBlob.js')
const UpdateMultipleBlob = require('./UpdateMultipleBlob.js')

/*
const UpdImgsBlobRouter = require('./UpdImgsBlobRouter.js')
const UpdDocsBucketRouter = require('./UpdDocsBucketRouter.js')
const UpdRefsRouter = require('./UpdRefsRouter.js')
const UpdMutiBlobRouter = require('./UpdMutiBlobRouter.js')
const UpdImgsBlobEmbedRouter = require('./UpdImgsBlobEmbedRouter.js')
const UpdRefsBridgeRouter = require('./UpdRefsBridgeRouter.js')
*/

const dbURL = Sheet.db.url
const dbName = Sheet.db.name
const collections = Sheet.collections
const ascs = Sheet.ascs
const blobContainer = Sheet.blobContainer

const tsystem = async () => {

const mongoClient = new MongoClient(dbURL, {useNewUrlParser:true})

try {

	await mongoClient.connect()
	console.log('connected to '+ dbURL +' ---> '+ dbName)

	const db = mongoClient.db(dbName)

	const app = Express()
	// ---------- body-parser ----------------------------------------------------------------------------------------------------
	app.use(BodyParser.json())
	app.use(BodyParser.urlencoded({//此项必须在 bodyParser.json 下面,為參數編碼
		extended: true
	}))
	app.use(Express.static(Path.join(__dirname, 'client/build')))
	app.use('/tAdministrators', tAdministrators(db))
	app.use('/update_reference', UpdateReference(db))
	app.use('/update_image_blob', UpdateImageBlob(db, ascs, blobContainer))
	app.use('/update_images_blob', UpdateImagesBlob(db, ascs, blobContainer))
	app.use('/update_multiple_blob', UpdateMultipleBlob(db, ascs, blobContainer))
	/*app.use('/upd_imgsblob', UpdImgsBlobRouter(collections, db))
	app.use('/upd_docsbucket', UpdDocsBucketRouter(collections, db))
	app.use('/upd_refs', UpdRefsRouter(collections, db))
	app.use('/upd_mutiblob', UpdMutiBlobRouter(Sheet, db))
	app.use('/updimgsblobembed', UpdImgsBlobEmbedRouter(Sheet, db))*/
	//app.use('/upd_refsbridge', UpdRefsBridgeRouter(db))

	function create_document (collection) {
		let fields = collections[collection].fields
		let document = {}
		Object.keys(fields).map((fieldKey) => {
			let bsonType = fields[fieldKey].default.bsonType
			let value = fields[fieldKey].default.value
			switch (bsonType) {
				case 'objectId':
					document[fieldKey] = new ObjectId()
					break
				case 'bool':
					if (typeof value === 'boolean') {
						document[fieldKey] = value
					} else {
						document[fieldKey] = false
					}
					break
				case 'int':
					if (typeof value === 'number') {
						document[fieldKey] = parseInt(value)
					} else {
						document[fieldKey] = 0
					}
					break
				case 'double':
					if (typeof value === 'number') {
						document[fieldKey] = value
					} else {
						document[fieldKey] = 0
					}
					break
				case 'string':
					document[fieldKey] = value.toString()
					break
				case 'date':
					if (value) {
						document[fieldKey] = new Date(value)
					} else {
						document[fieldKey] = new Date()
					}
					break
				case 'array':
					if (Array.isArray(value)) {
						document[fieldKey] = value
					} else {
						document[fieldKey] = []
					}
					break
				case 'object':
					if (typeof value === 'object') {
						document[fieldKey] = value
					} else {
						document[fieldKey] = null
					}
					break
				default:
					document[fieldKey] = value
					break
			}
		})
		return document
	}

	app.get ('/*', (request, response) => {
		response.sendFile(Path.join(__dirname, 'client/build', 'index.html'))
	})

	app.post('/find_sheet', async (request, response) => {
		response.send(Sheet)
	})

	app.post ('/find_projection', async (request, response) => {
		let collection = request.body.collection
		let projection = await db.collection('projections').findOne({collection:collection})
		response.send(projection)
	})

	app.post ('/change_find', async (request, response) => {
		let collection = request.body.collection
		let find = request.body.find
		let projection = request.body.projection

		let documents = await db.collection(collection).find(find, {projection:projection}).sort({insertTime:-1}).limit(50).toArray()
		response.send(documents)
	})

	app.post ('/change_sort', async (request, response) => {
		let collection = request.body.collection
		let find = request.body.find
		let projection = request.body.projection
		let sort = request.body.sort
		let limit = request.body.limit

		let documents = await db.collection(collection).find(find, {projection:projection}).sort(sort).limit(limit).toArray()
		response.send(documents)
	})

	app.post ('/update_projection', async (request, response) => {
		let collection = request.body.collection
		let projection = request.body.projection
		let projectionResult = await db.collection('projections').findOneAndUpdate({collection:collection}, {$set:{projection:projection}}, {upsert:true, returnOriginal:false})
		let newProjection = projectionResult.value
		response.send(newProjection)
	})

	app.post ('/find_documents', async (request, response) => {
		let collection = request.body.collection
		let find = request.body.find
		let sort = request.body.sort
		let projection = request.body.projection

		//console.log(collection+', '+find+', '+sort)

		let documents = await db.collection(collection).find(find, {projection:projection}).sort(sort).toArray()
		response.send(documents)
	})
	
	app.post('/find_document', async (request, response) => {
		let collection = request.body.collection
		let _id = request.body._id
		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		response.send(document)
	})

	app.post('/insert_document', async (request, response) => {
		let collection = request.body.collection
		let document = create_document(collection)
		let insertResult = await db.collection(collection).insertOne(document)
		let newDocument = insertResult.ops[0]
		response.send(newDocument)
	})

	app.post('/delete_document', async (request, response) => {
		let collection = request.body.collection
		let _id = request.body._id
		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		let isClear = true
		/*Object.keys(document).map((fieldKey) => {
			let fields = collections[collection].fields
			if (fields[fieldKey].refImage) {
				isClear = false
			}
		})*/
		Object.values(document).map((value) => {
			if (Array.isArray(value) && value.length !== 0) {
				isClear = false
			}
			//console.log(Array.isArray(value)+' --- '+ value.length)
		})
		
		if (isClear) {
			let deleteReturn = await db.collection(collection).deleteOne({_id:new ObjectId(_id)})
			let deleteResult = deleteReturn.result
			if (deleteResult.n === 0) {
				response.send(false)
			} else {
				response.send(true)
			}
		} else {
			response.send('not clear')
		}
	})

	app.post ('/update_field', async (request, response) => {
		let collection = request.body.collection
		let _id = request.body._id
		let setObject = request.body.setObject

		let updateObject = await db.collection(collection).updateOne({_id:new ObjectId(_id)}, {$set:setObject})
		let result = updateObject.result
		if (result.n === 0) {
			response.send(false)
		} else {
			response.send(true)
		}
	})

	app.post ('/update_date', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let date = request.body.date

		let set = {}
		set[fieldKey] = new Date(date)
		let updateObject = await db.collection(collection).updateOne({_id:new ObjectId(_id)}, {$set:set})
		let result = updateObject.result
		if (result.n === 0) {
			response.send(false)
		} else {
			response.send(true)
		}
	})

	app.post ('/upd_docPss', async (request, response) => {
		let coll = request.body.coll
		let _docId = new ObjectId(request.body._docId)
		let fldKey = request.body.fldKey
		let val = request.body.val
		if (val !== '') {
			val = Crypto.createHash('sha256').update(val).digest('hex')
		}
		let obj = {}
		obj[fldKey] = val

		let newDcm = await db.collection(coll).findOneAndUpdate({_id:_docId}, {$set:obj}, {returnOriginal:false})
		response.send(newDcm.value)
	})

	app.listen(5000, () => {
		console.log('http server listenin g on 5000')
	})

} catch (error) {
	console.log(error.stack)
}

}

tsystem()








/*app.post ('/find_collection', async (request, response) => {
		let collection = request.body.collection
		let find = request.body.find
		let filter = await db.collection('filters').findOne({collection:collection})

		if (!filter) {
			filter = create_document('filters')
			let fieldKeys = Object.keys(collections[collection].fields)
			let fields = []
			for (let i=0; i<fieldKeys.length; i++) {
				fields[i] = {
					key: fieldKeys[i],
					enable: false,
				}
			}
			filter.collection = collection
			filter.fields = fields
			let filterResult = await db.collection('filters').insertOne(filter)
			filter = filterResult.ops[0]
		}

		let projectionObject = {}
		filter.fields.map((field) => {
			if (field.enable) {
				projectionObject[field.key] = 1
			}
		})
		let documents = await db.collection(collection).find(find, {projection:projectionObject}).sort({insertTime:-1}).limit(50).toArray()

		response.send({documents:documents, filter:filter})
	})*/