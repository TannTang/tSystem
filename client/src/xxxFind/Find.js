import React, {Component} from 'react';
import Axios from 'axios';

import FindSel from './FindSel.js';
import FindLst from './FindLst.js';

class Find extends Component {

	constructor (props) {
		super(props);
		this.state = {
			sheet: null,
			colls: null,
			collIdx: 0,
			coll: '',

			filters: [],
			docs: null,
		}

		this.upd_coll1 = this.upd_coll1.bind(this);
		this.find_sheet();
	}

	find_sheet () {
		Axios.post('/find_sheet').then((resp) => {
			let respColls = resp.data.collections;
			let respCollKeys = Object.keys(respColls);

			let colls = {};
			
			for(let i=0; i<respCollKeys.length; i++) {
				let respCollKey = respCollKeys[i];
				let respColl = respColls[respCollKey];

				if (respColl.find) {
					colls[respCollKey] = respColl;
				}
			}

			this.setState({
				sheet: resp.data,
				colls: colls,
				collIdx: 0,
				coll: Object.keys(colls)[0],
			});
		});
	}

	upd_coll1 (idx) {
		this.setState({
			collIdx: idx,
			coll: Object.keys(this.state.colls)[idx],
		});
	}

	render () {
		const {sftWdt} = this.props;
		const {sheet, colls, collIdx, coll, filters, docs} = this.state;
		//console.log(coll);
		if (sheet) {
			return (
				<div className="Find">
					<div className="findTitle">{sheet.db.label}</div>
					<FindSel colls={colls} collIdx={collIdx} upd_coll1={this.upd_coll1} />
					<FindLst colls={colls} coll={coll} /*filters={filters} flds={colls[coll].field} upd_flt={this.upd_flt}*/ />
					{/*<div className="dshCnt" style={{width:sftWdt}}>

					</div>*/}

				</div>
			);
			//this.dshFlt = null;
			/*if (filters) {
				this.dshFlt = <FindFlt colls={colls} coll={coll} filters={filters} flds={colls[coll].field}  upd_flt={this.upd_flt} />
			}
			this.dshDcms = null;
			if (docs) {
				this.dshDcms = <FindDcms colls={colls} coll={coll} flds={colls[coll].field} docs={docs} />
			}
			return (
				<div className="Find">
					<div className="dshCnt" style={{width:sftWdt}}>
						<div className="dshTtl">{sheet.db.label}</div>
						<FindColls sheet={sheet} colls={colls} collIdx={collIdx} upd_coll1={this.upd_coll1} />
						{this.dshFlt}
						{this.dshDcms}
					</div>
				</div>
			)*/
		} else {
			return null;
		}
	}
}

export default Find;