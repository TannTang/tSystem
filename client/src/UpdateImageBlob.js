import React, { Component } from 'react'
import Axios from 'axios'

export default class UpdateImageBlob extends Component {

	constructor(props) {
		super(props)

		this.state = {
			file: null,
			scale: 0,
            isSelected: false, 
            fileInfo: '未選擇影像擋案',
			images: props.value,
		}

		this.select_image = this.select_image.bind(this)
        this.insert_image = this.insert_image.bind(this)
	}

	componentDidUpdate (prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({
				images: this.props.value,
			})
		}
	}

	select_image (event) {
		if (event.target.files[0]) {
			let _this = this
			let _URL = window.URL || window.webkitURL
			let file =  event.target.files[0]
			let type = event.target.files[0].type
			let size = event.target.files[0].size
			let filename = event.target.files[0].name

			if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
				if (size < 2097152) {
					let image = new Image()
					image.onload = function () {
						_this.setState({
							file: file,
							fileInfo: '已選擇影像檔案 ---> '+ filename,
							scale: this.height / this.width,
							isSelected: true,
						})
					}
					image.src = _URL.createObjectURL(event.target.files[0])
				} else {
					this.setState({
						fileInfo: '影像檔案超過2MB',
						scale: 0,
						isSelected: false,
					})
				}
			} else {
				this.setState({
					fileInfo: '影像檔案類型錯誤，僅許可jpg / png檔',
					scale: 0,
					isSelected: false,
				})
			}
		} else {
			this.setState({
                file: null,
				fileInfo: '未選擇影像擋案',
				scale: 0,
				isSelected: false,
			})
		}
    }

	insert_image () {
		const {collection, fieldKey, _id, _objectId} = this.props
		const {file, scale, images} = this.state
		let formData = new FormData()
		formData.append('collection', collection)
		formData.append('fieldKey', fieldKey)
		formData.append('_id', _id)
		formData.append('file', file)
		formData.append('scale', scale)
		formData.append('_objectId', _objectId)
		
		this.setState({
			file: null,
			fileInfo: '未選擇影像擋案',
			scale: 0,
			isSelected: false,
		})

		Axios.post('/update_image_blob/insertOne_image', formData).then((response) => {
            //console.log(response.data)
            images.push(response.data)
            this.setState({
                images: images,
            })
		})
	}

	//delete_image (index, _imageId) {
	deleteOne_image () {
        const {collection, fieldKey, _id, _objectId} = this.props
		const {image} = this.state
		//const filename = images[index].filename
		const filename = image.filename

		Axios.post('/update_image_blob/deleteOne_image', {collection:collection, fieldKey:fieldKey, _id:_id, filename:filename, _imageId:_imageId, _objectId:_objectId}).then((response) => {
            console.log(response.data)
            if (response.data) {
                /*images.splice(index, 1)
                this.setState({
                    images: images,
				})*/
				this.setState({
                    image: null,
				})
            }
		})
    }

	render () {
        const {fileInfo, isSelected, image} = this.state

		if (isSelected) {
			this.updateImagesInsert = <div className="updateImagesInsert" onClick={this.insertOne_image}>新增影像</div>
        } else {
            this.updateImagesInsert = null
        }
		let imageItem = null
		if (image) {
			imageItem = 
			<div className="updateImageItem" key={index}>
				<div className="updateImageItemView" style={{backgroundImage:'url('+ image.url +'_XS.jpg)'}} />
				<div className="updateImageItemId">{image._id}</div>
				<div className="updateImageOptions">
					<div className="updateImageDelete" onClick={() => this.delete_image(index, image._id)}>刪除</div>
				</div>
			</div>
		}
		return (
			<div className="updateImages">
				<div className="updateImageItems">
					{imageItem}
					{/*images.map((image, index) => (
						<div className="updateImageItem" key={index}>
							<div className="updateImageItemView" style={{backgroundImage:'url('+ image.url +'_XS.jpg)'}} />
							<div className="updateImageItemId">{image._id}</div>
							<div className="updateImageOptions">
								<div className="updateImageForward" onClick={() => this.forward_image(index, image._id)}>{'<<'}</div>
                                <div className="updateImageDelete" onClick={() => this.delete_image(index, image._id)}>刪除</div>
								<div className="updateImageAfterward" onClick={() => this.afterward_image(index, image._id)}>{'>>'}</div>
							</div>
						</div>
					))*/}
				</div>
				<input className="updateImagesFile" type="file" onChange={this.select_image} />
				<div className="updateImagesInfo">{fileInfo}</div>
				{this.updateImagesInsert}
			</div>
		)
	}
}