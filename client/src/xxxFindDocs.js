import React, {Component} from 'react';
import Axios from 'axios';
import FindDoc from './FindDoc.js';

class FindDocs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			docs: [],

			int: false,
			
			mn1: 0,
			mn2: 0,
			mn3: 0,
			//cll: null,
			
		}
		/*this.clc_mn1 = this.clc_mn1.bind(this);
		this.clc_mn2 = this.clc_mn2.bind(this);
		this.clc_mn3 = this.clc_mn3.bind(this);*/

		this.ins_doc = this.ins_doc.bind(this);
		this.del_doc = this.del_doc.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.find_docs(this.props.coll, this.props.filters);
		}
	}

	find_docs (coll, filters) {
		const _this = this;
		Axios.post('/find_docs', {coll:coll, filters:filters}).then((resp) => {
			this.setState({docs:resp.data});
		});
		/*
		let ky = dtKys[mn1];
		let whr = dtSht[dtKys[mn1]].find.whr[mn2].obj;
		let srt = dtSht[dtKys[mn1]].find.srt[mn3].obj;
		
		ajx.post('/find_docs', {ky:ky, whr:whr, srt:srt})
		.then(function(resp) {
			_this.setState({docs: resp.data});
		})
		.catch(function(err){console.log(err);});*/
	}
	/*clc_mn1 (mn1) {
		this.setState({mn1: mn1, mn2: 0, mn3: 0});
		this.find_cll(mn1);
		this.find_docs(mn1, 0, 0);
	}

	clc_mn2 (mn2) {
		this.setState({mn2: mn2});
		this.find_docs(this.state.mn1, mn2, 0);
	}

	clc_mn3 (mn3) {
		this.setState({mn3: mn3});
		this.find_docs(this.state.mn1, this.state.mn2, mn3);
	}

	
	/*
	find_docs (mn1, mn2, mn3) {
		const _this = this;
		const {dtSht, dtKys} = this.props;
		//const dtKys = Object.keys(dtSht);

		let ky = dtKys[mn1];
		let whr = dtSht[dtKys[mn1]].find.whr[mn2].obj;
		let srt = dtSht[dtKys[mn1]].find.srt[mn3].obj;

		ajx.post('/find_docs', {ky:ky, whr:whr, srt:srt})
		.then(function(resp) {
			_this.setState({docs: resp.data});
		})
		.catch(function(err){console.log(err);});
	}
	*/
	ins_doc () {
		//console.log(this.props.coll);
		Axios.post('/ins_doc', {coll:this.props.coll}).then((resp) => {
			this.find_docs(this.props.coll, this.props.filters);
		});
	}

	del_doc (doc, idx) {
		if (window.confirm('確定要刪除這筆資料？')) {
			Axios.post('/del_doc', {coll:this.props.coll, _docId:doc._id}).then((resp) => {
				if (resp.data === 'have reference') {
					window.alert('需先刪除此資料中所有參考欄位的資料');
				} else {
					this.find_docs(this.props.coll, this.props.filters);
				}
			});
		} else {

		}
	}

	render () {
		const {colls, coll} = this.props;
		const {docs} = this.state;
		//console.log(coll);
		return (
			<div className="FindDocs">
				<div className="findDocsIns">
					<div className="findDocsInsOption" onClick={this.ins_doc}>insert {colls[coll].label.cn}</div>
				</div>
				{docs.map((doc, idx) => (<FindDoc key={idx} idx={idx} coll={coll} flds={colls[coll].fields} doc={doc} del_doc={this.del_doc} />))}
			</div>
		);
	}
}

export default FindDocs;