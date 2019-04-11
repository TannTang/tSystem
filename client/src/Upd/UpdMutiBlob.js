import React, {Component} from 'react';
import Axios from 'axios';
import UpdInp from './UpdInp.js';
import UpdTxtArea from './UpdTxtArea.js';
import UpdMutiImgs from './UpdMutiImgs.js';

class UpdMutiInp extends Component {

	constructor(props) {
		super(props);
		//console.log(props.obj);
		this.upd_muti = this.upd_muti.bind(this);
	}

	mov_muti (mov) {
		this.props.mov_muti(this.props.obj._id, mov);
	}

	upd_muti (str) {
		console.log(str);
		this.props.upd_muti(this.props.obj._id, str);
	}

	render () {
		const {obj, coll, fld, _docId, del_muti} = this.props;
		//console.log(_docId);
		const {_id, type, str} = this.props.obj;

		switch (type) {
			case 'title':
				this.updMutiInp = 
					<div className="updMutiInpBlk">
						<div className="updMutiInpType">標題(title)</div>
						<UpdInp type={'text'} val={str} upd_fld={this.upd_muti} />
					</div>;
				break;
			case 'subtitle':
				this.updMutiInp = 
					<div className="updMutiInpBlk">
						<div className="updMutiInpType">副標題(subtitle)</div>
						<UpdInp type={'text'} val={str} upd_fld={this.upd_muti} />
					</div>;
				break;
			case 'txt':
				this.updMutiInp = 
					<div className="updMutiInpBlk">
						<div className="updMutiInpType">內文(text)</div>
						<UpdTxtArea val={str} upd_fld={this.upd_muti} />
					</div>;
				break;
			case 'imgs':
				this.updMutiInp = 
					<div className="updMutiInpBlk">
						<div className="updMutiInpType">影像(image)</div>
						<UpdMutiImgs coll={coll} fld={fld} _docId={_docId} _mutiId={_id} />
					</div>;
				break;
			default:
				this.updMutiInp = 
					<div className="updMutiInpBlk">
						<div className="updMutiInpType">null</div>
					</div>;
				break;
		}

		return (
			<div className="UpdMutiInp">
				{this.updMutiInp}
				<div className="updMutiInpBtns">
					<div className="updMutiInpMov" onClick={() => this.mov_muti(-1)}>上移</div>
					<div className="updMutiInpMov" onClick={() => this.mov_muti(1)}>下移</div>
					<div className="updMutiInpDel" onClick={() => del_muti(_id)}>刪除</div>
				</div>
			</div>
		);
	}
}

class UpdMutiBlob extends Component {

	constructor(props) {
		super(props);

		this.refs = [];
		this.state = {
			muti: [],

			_refIds: props.val,
			refDocsA: [],
			refDocsB: [],
		}

		//this.find_muti = this.find_muti.bind(this);
		this.upd_muti = this.upd_muti.bind(this);
		this.mov_muti = this.mov_muti.bind(this);
		this.del_muti = this.del_muti.bind(this);

		this.find_muti();
	}

	find_muti () {
		const {coll, fld, _docId} = this.props;
		Axios.post('/upd_mutiblob/find_muti', {coll:coll, fld:fld, _docId:_docId}).then((resp) => {
			//console.log(resp.data);
			this.setState({
				muti: resp.data,
			});
		}).catch((err) => {console.log(err);});
	}

	ins_muti (type) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/upd_mutiblob/ins_muti', {coll:coll, fld:fld, _docId:_docId, type:type}).then((resp) => {
			//console.log(resp.data);
			this.setState({
				muti: resp.data,
			});
		}).catch((err) => {console.log(err);});
	}

	upd_muti (_mutiId, str) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/upd_mutiblob/upd_muti', {coll:coll, fld:fld, _docId:_docId, _mutiId:_mutiId, str:str}).then((resp) => {
			//console.log(resp.data);
			this.setState({
				muti: resp.data,
			});
		}).catch((err) => {console.log(err);});
	}

	mov_muti (_mutiId, mov) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/upd_mutiblob/mov_muti', {coll:coll, fld:fld, _docId:_docId, _mutiId:_mutiId, mov:mov}).then((resp) => {
			this.setState({
				muti: resp.data,
			});
		}).catch((err) => {console.log(err);});
	}

	del_muti (_mutiId) {
		const {coll, fld, _docId} = this.props;
		Axios.post('/upd_mutiblob/del_muti', {coll:coll, fld:fld, _docId:_docId, _mutiId:_mutiId}).then((resp) => {
			if (resp.data !== 'haveimg') {
				this.setState({
					muti: resp.data,
				});	
			} else {
				window.alert('仍有影像未刪除');
			}
		}).catch((err) => {console.log(err);});
	}

	render () {
		const {coll, fld, _docId} = this.props;
		const {muti, refDocsA, refDocsB} = this.state;

		return (
			<div className="UpdMuti">
				{muti.map((obj, idx) => (
					<UpdMutiInp key={idx} obj={obj} coll={coll} fld={fld} _docId={_docId} upd_muti={this.upd_muti} mov_muti={this.mov_muti} del_muti={this.del_muti} />
				))}
				<div className="updMutiBtns">
					<div className="updMutiBtn" onClick={() => this.ins_muti('title')}>標題</div>
					<div className="updMutiBtn" onClick={() => this.ins_muti('subtitle')}>副標題</div>
					<div className="updMutiBtn" onClick={() => this.ins_muti('txt')}>內文</div>
					<div className="updMutiBtn" onClick={() => this.ins_muti('imgs')}>影像</div>
				</div>
			</div>
		);
	}
}

export default UpdMutiBlob;