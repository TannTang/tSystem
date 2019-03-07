import React, { Component } from 'react';
import Axios from 'axios';

class UpdDocsBucket extends Component {
	constructor(props) {
		super();

		this.state = {
			file: null,
			fileInfo: '未選擇影像擋案',
			scale: 0,
			isSelected: false,

			imgs: [],
		}

		this.sel_img = this.sel_img.bind(this);
		this.ins_img = this.ins_img.bind(this);

		this.find_imgs(props.coll, props._docId, props.fld);
	}

	sel_img (e) {
		let _this = this;
		let _URL = window.URL || window.webkitURL;
		let file =  e.target.files[0];
		let fileType = e.target.files[0].type;
		let fileSize = e.target.files[0].size;
		let fileName = e.target.files[0].name;

		if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png') {
			if (fileSize < 5242880) {
				let img = new Image();
				img.onload = function () {
					_this.setState({
						file: file,
						fileInfo: '已選擇影像檔案 ---> '+ fileName,
						scale: this.height / this.width,
						isSelected: true,
					});
				};
				img.src = _URL.createObjectURL(e.target.files[0]);
			} else {
				this.setState({
					fileInfo: '影像檔案超過5MB',
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
	}

	find_imgs (coll, _docId, fld) {
		//console.log(coll+', '+_docId+', '+fld);
		Axios.post('/upd_docsbucket/find_imgs', {coll:coll, _docId:_docId, fld:fld}).then((resp) => {
			//console.log(resp.data);
			this.setState({imgs:resp.data});
		});
	}

	ins_img () {
		const {coll, _docId, fld} = this.props;
		const {file, scale} = this.state;

		let formData = new FormData();
		formData.append('coll', coll);
		formData.append('_docId', _docId);
		formData.append('fld', fld);
		formData.append('file', file);
		formData.append('scale', scale);

		Axios.post('/upd_docsbucket/ins_img', formData).then((resp) => {
			//console.log(resp.data);
			//this.add_img(resp.data);
		});
	}

	add_img (img) {
		let array = this.state.imgs.concat([img]);
		this.setState({imgs:array, file:null, fileInfo:'未選擇影像擋案', isSelected:false});
	}

	del_img (img, idx) {
		const {coll, _docId, fld} = this.props;
		Axios.post('/upd_docsbucket/del_img', {coll:coll, _docId:_docId, fld:fld, _imgId:img._id, imgFileName:img.fileName}).then((resp) => {
			this.remove_img(idx);
		});
	}

	remove_img (idx) {
		let array = this.state.imgs;
		array.splice(idx, 1);
		this.setState({imgs:array});
	}

	upd_seq (idx, mov) {
		const {coll, _docId, fld} = this.props;
		Axios.post('/upd_docsbucket/upd_seq', {coll:coll, _docId:_docId, fld:fld, idx:idx, mov:mov}).then((resp) => {
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
							{img.urlS ? (
								<img className="updImgsView" src={img.urlS} />
								) : (
								<img className="updImgsView" src={img.urlM} />
								)
							}
							<div className="updImgsId">_id: {img._id}</div>
							<div className="updImgsMovs">
								<div className="updImgsMov" onClick={() => this.upd_seq(idx, -1)}>{'<<<'}</div>
								<div className="updImgsMov" onClick={() => this.upd_seq(idx, 1)}>{'>>>'}</div>
							</div>
							<div className="updImgsDel" onClick={() => this.del_img(img, idx)}>刪除</div>
						</div>
					))}
				</div>
				<input className="updImgsFile" type="file" onChange={this.sel_img} />
				<div className="updImgsInfo">{this.state.fileInfo}</div>
				{updImgsIns}
				<br /><br /><br /><br /><br />
			</div>
		);
	}
}

export default UpdDocsBucket;