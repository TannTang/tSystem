import React, { Component } from 'react';
import Axios from 'axios';

class UpdImgsBlobEmbed extends Component {
	constructor(props) {
		super(props);

		this.state = {
			file: null,
			fileInfo: '未選擇影像擋案',
			scale: 0,
			isSelected: false, 

			imgs: [],
		}

		this.sel_img = this.sel_img.bind(this);
		this.ins_img = this.ins_img.bind(this);
		this.find_imgs();
	}

	sel_img (e) {
		if (e.target.files[0]) {
			let _this = this;
			let _URL = window.URL || window.webkitURL;
			let file =  e.target.files[0];
			let type = e.target.files[0].type;
			let size = e.target.files[0].size;
			let filename = e.target.files[0].name;

			if (type === 'image/jpeg' || type === 'image/jpg' || type === 'image/png') {
				if (size < 2097152) {
					let img = new Image();
					img.onload = function () {
						_this.setState({
							file: file,
							fileInfo: '已選擇影像檔案 ---> '+ filename,
							scale: this.height / this.width,
							isSelected: true,
						});
					};
					img.src = _URL.createObjectURL(e.target.files[0]);
				} else {
					this.setState({
						fileInfo: '影像檔案超過2MB',
						scale: 0,
						isSelected: false,
					});
				}
			} else {
				this.setState({
					fileInfo: '影像檔案類型錯誤，僅許可jpg / png檔',
					scale: 0,
					isSelected: false,
				});
			}
		} else {
			this.setState({
				fileInfo: '未選擇影像擋案',
				scale: 0,
				isSelected: false,
			});
		}
	}

	find_imgs () {
		const {coll, fld, _docId, _bannerId} = this.props;
		Axios.post('/updimgsblobembed/find_imgs', {coll:coll, fld:fld, _docId:_docId}).then((resp) => {
			//console.log(resp.data);
			this.setState({imgs:resp.data});
		});
	}

	ins_img () {
		const {coll, fld, _docId} = this.props;
		const {file, scale} = this.state;

		let formData = new FormData();
		formData.append('coll', coll);
		formData.append('fld', fld);
		formData.append('_docId', _docId);
		formData.append('file', file);
		formData.append('scale', scale);

		Axios.post('/updimgsblobembed/ins_img', formData).then((resp) => {
			//console.log(resp.data);
			this.setState({imgs:resp.data});
		});
	}

	del_img (img) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/updimgsblobembed/del_img', {coll:coll, fld:fld, _docId:_docId, _imgId:img._id, filename:img.filename}).then((resp) => {
			//console.log(resp.data);
			this.setState({imgs:resp.data});
		});
	}

	upd_seq (_imgId, mov) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/updimgsblobembed/upd_seq', {coll:coll, fld:fld, _docId:_docId, _imgId:_imgId, mov:mov}).then((resp) => {
			//console.log(resp.data);
			this.setState({imgs:resp.data});
		})
	}

	render () {
		let updImgsIns = null;
		if (this.state.isSelected) {
			updImgsIns = <div className="updImgsIns" onClick={this.ins_img}>新增影像</div>
		}
		return (
			<div className="UpdImgs">
				<div className="updImgsItems">
					{this.state.imgs.map((img, idx) => (
						<div className="updImgsItem" key={idx}>
							<img className="updImgsView" src={img.url +'_S.jpg'} />
							<div className="updImgsId">_id: {img._id}</div>
							<div className="updImgsMovs">
								<div className="updImgsMov" onClick={() => this.upd_seq(img._id, -1)}>{'<<<'}</div>
								<div className="updImgsMov" onClick={() => this.upd_seq(img._id, 1)}>{'>>>'}</div>
							</div>
							<div className="updImgsDel" onClick={() => this.del_img(img)}>刪除</div>
						</div>
					))}
				</div>
				<input className="updImgsFile" type="file" onChange={this.sel_img} />
				<div className="updImgsInfo">{this.state.fileInfo}</div>
				{updImgsIns}
			</div>
		);
	}
}

export default UpdImgsBlobEmbed;