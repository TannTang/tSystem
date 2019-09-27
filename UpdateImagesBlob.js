const FS = require('fs')

const ObjectId = require('mongodb').ObjectID
const Express = require('express')

const AzureStorage = require('azure-storage')
const Multer = require('multer')
const Sharp = require('sharp')

const uploads = Multer({dest:'uploads/'})

module.exports = (db, ascs, blobContainer) => {

	let blobService = null

	if (ascs) {
		blobService = AzureStorage.createBlobService(ascs)

		blobService.createContainerIfNotExists(blobContainer, function (error) {
			if (error) {
				console.log(error)
			} else { 
				setPermissions()
			}
		})

		function setPermissions() {
			let options = {publicAccessLevel:AzureStorage.BlobUtilities.BlobContainerPublicAccessType.BLOB}
				blobService.setContainerAcl(blobContainer, null, options, (error) => {
				if (error) {
					console.log(error)
				} 
			})
		}
	}

	const router = Express.Router()

	router.post('/find_images', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		
		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		response.send(document[fieldKey])
	})

	router.post('/insert_image', uploads.single('file'), async (request, response) => {

		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id

		let scale = request.body.scale
		let path = request.file.path
		let filename = request.file.filename

		let _objectId = request.body._objectId

		const pathXS = request.file.path +'_XS.jpg'
		const pathS = request.file.path +'_S.jpg'
		const pathM = request.file.path +'_M.jpg'
		const pathL = request.file.path +'_L.jpg'
		const pathXL = request.file.path +'_XL.jpg'
		const filenameXS = request.file.filename +'_XS.jpg'
		const filenameS = request.file.filename +'_S.jpg'
		const filenameM = request.file.filename +'_M.jpg'
		const filenameL = request.file.filename +'_L.jpg'
		const filenameXL = request.file.filename +'_XL.jpg'

		await Sharp(path).resize(128, Math.round(  128 * scale)).toFormat('jpeg').toFile(pathXS)
		await Sharp(path).resize(256, Math.round(  256 * scale)).toFormat('jpeg').toFile(pathS)
		await Sharp(path).resize(512, Math.round(  512 * scale)).toFormat('jpeg').toFile(pathM)
		await Sharp(path).resize(1024, Math.round(1024 * scale)).toFormat('jpeg').toFile(pathL)
		await Sharp(path).resize(2048, Math.round(2048 * scale)).toFormat('jpeg').toFile(pathXL)

		await blobService.createBlockBlobFromLocalFile(blobContainer, filenameXS, pathS, (error, resultXS) => {})
		await blobService.createBlockBlobFromLocalFile(blobContainer, filenameS, pathS, (error, resultS) => {})
		await blobService.createBlockBlobFromLocalFile(blobContainer, filenameM, pathM, (error, resultM) => {})
		await blobService.createBlockBlobFromLocalFile(blobContainer, filenameL, pathL, (error, resultL) => {})
		await blobService.createBlockBlobFromLocalFile(blobContainer, filenameXL, pathXL, (error, resultXL) => {})

		const url = blobService.getUrl(blobContainer, filename)

		//console.log('scale --- '+ scale +' --- '+ typeof scale)
		//console.log('_objectId --- '+ _objectId +' --- '+ typeof _objectId)
		scale = Number(scale)
		scale = Number(scale.toFixed(3))
		if (_objectId === 'null' || _objectId === 'false' || _objectId === 'undefined') {
			_objectId = null
		}

		let image = {
			_id: new ObjectId(),
			scale: scale,
			filename: filename,
			url: url,
		}

		let result = null
		
		if (_objectId) {
			let find = {}
			find['_id'] = new ObjectId(_id)
			find[fieldKey +'._id'] = new ObjectId(_objectId)

			let push = {}
			push[fieldKey +'.$.images'] = image
			result = await db.collection(collection).findOneAndUpdate(find, {$push:push}, {returnOriginal:false})
		} else {
			let push = {}
			push[fieldKey] = image
			result = await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$push:push}, {returnOriginal:false})
		}
		if (result) {
			response.send(image)
		}

		Sharp.cache(false)
		FS.unlink(path, (error) => {if (error) throw error})
		FS.unlink(pathXS, (error) => {if (error) throw error})
		FS.unlink(pathS, (error) => {if (error) throw error})
		FS.unlink(pathM, (error) => {if (error) throw error})
		FS.unlink(pathL, (error) => {if (error) throw error})
		FS.unlink(pathXL, (error) => {if (error) throw error})
	})

	router.post('/delete_image', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _imageId = request.body._imageId

		const _objectId = request.body._objectId

		let filenameXS = request.body.filename +'_XS.jpg'
		let filenameS = request.body.filename +'_S.jpg'
		let filenameM = request.body.filename +'_M.jpg'
		let filenameL = request.body.filename +'_L.jpg'
		let filenameXL = request.body.filename +'_XL.jpg'

		await blobService.deleteBlobIfExists(blobContainer, filenameXS, (error, resultXS) => {})
		await blobService.deleteBlobIfExists(blobContainer, filenameS, (error, resultS) => {})
		await blobService.deleteBlobIfExists(blobContainer, filenameM, (error, resultM) => {})
		await blobService.deleteBlobIfExists(blobContainer, filenameL, (error, resultL) => {})
		await blobService.deleteBlobIfExists(blobContainer, filenameXL, (error, resultXL) => {})

		if (_objectId) {
			let find = {}
			find['_id'] = new ObjectId(_id)
			find[fieldKey +'._id'] = new ObjectId(_objectId)
			find[fieldKey +'.images._id'] = new ObjectId(_imageId)

			let pull = {}
			pull[fieldKey +'.$.images'] = {_id:new ObjectId(_imageId)}
			await db.collection(collection).findOneAndUpdate(find, {$pull:pull}, {returnOriginal:false})
		} else {
			let pull = {}
			pull[fieldKey] = {_id:new ObjectId(_imageId)}
			await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$pull:pull}, {returnOriginal:false})
		}
		response.send(true)
	})

	router.post ('/forward_image', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _imageId = request.body._imageId

		const _objectId = request.body._objectId

		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		if (_objectId) {
			let objects = document[fieldKey]
			let _objectIds = objects.map((object) => (object._id.toString()))
			let objectIndex = _objectIds.indexOf(_objectId)
			let images = objects[objectIndex].images
			let _imageIds = images.map((image) => (image._id.toString()))
			let index = _imageIds.indexOf(_imageId)
			if (index > 0) {
				let temp = images[index]
				images[index] = images[index - 1]
				images[index - 1] = temp
				
				let find = {}
				find['_id'] = new ObjectId(_id)
				find[fieldKey +'._id'] = new ObjectId(_objectId)

				let set = {}
				set[fieldKey +'.$.images'] = images
				await db.collection(collection).findOneAndUpdate(find, {$set:set}, {returnOriginal:false})
				response.send(true)
			} else {
				response.send(false)
			}
		} else {
			let images = document[fieldKey]
			let _imageIds = images.map((image) => (image._id.toString()))
			let index = _imageIds.indexOf(_imageId)
			if (index > 0) {
				let temp = images[index]
				images[index] = images[index - 1]
				images[index - 1] = temp
				
				let set = {}
				set[fieldKey] = images
				await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$set:set}, {returnOriginal:false})
				response.send(true)
			} else {
				response.send(false)
			}
		}
	})

	router.post ('/afterward_image', async (request, response) => {
		let collection = request.body.collection
		let fieldKey = request.body.fieldKey
		let _id = request.body._id
		let _imageId = request.body._imageId

		const _objectId = request.body._objectId

		let document = await db.collection(collection).findOne({_id:new ObjectId(_id)})
		if (_objectId) {
			let objects = document[fieldKey]
			let _objectIds = objects.map((object) => (object._id.toString()))
			let objectIndex = _objectIds.indexOf(_objectId)
			let images = objects[objectIndex].images
			let _imageIds = images.map((image) => (image._id.toString()))
			let index = _imageIds.indexOf(_imageId)
			if (index < images.length - 1) {
				let temp = images[index]
				images[index] = images[index + 1]
				images[index + 1] = temp
				
				let find = {}
				find['_id'] = new ObjectId(_id)
				find[fieldKey +'._id'] = new ObjectId(_objectId)

				let set = {}
				set[fieldKey +'.$.images'] = images
				await db.collection(collection).findOneAndUpdate(find, {$set:set}, {returnOriginal:false})
				response.send(true)
			} else {
				response.send(false)
			}
		} else {
			let images = document[fieldKey]
			let _imageIds = images.map((image) => (image._id.toString()))
			let index = _imageIds.indexOf(_imageId)
			
			if (index < images.length - 1) {
				let temp = images[index]
				images[index] = images[index + 1]
				images[index + 1] = temp
				
				let set = {}
				set[fieldKey] = images

				await db.collection(collection).findOneAndUpdate({_id:new ObjectId(_id)}, {$set:set}, {returnOriginal:false})
				response.send(true)
			} else {
				response.send(false)
			}
		}
	})

 	return router
}
