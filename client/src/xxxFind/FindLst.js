import React, {Component} from 'react';
import Axios from 'axios';
import FindDocs from './FindDocs.js';

function FindFilterFld (props) {
	const {filterKey, bool, label, clk_filter} = props;

	let filterStyle = {}
	let revsBool = true;

	if (bool) {
		filterStyle = {backgroundColor:'#000000', color:'#ffffff'}
		revsBool = false;
	} else {
		filterStyle = {backgroundColor:'#cccccc', color:'#000000'}
	}

	return (
		<div className="FindFilterFld" style={filterStyle} onClick={() => clk_filter(filterKey, revsBool)} >{label.cn}</div>
	)
}

class FindLst extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filters: [],
		}

		this.upd_filter = this.upd_filter.bind(this);
		this.find_filter (props.coll);
	}

	componentDidUpdate(prevProps) {
		if (this.props.coll !== prevProps.coll) {
			this.find_filter(this.props.coll);
		}
	}

	find_filter (coll) {
		Axios.post('/find_filter', {coll:coll}).then((resp) => {
			this.setState({filters:resp.data.fields});
		});
	}

	upd_filter (key, bool) {
		Axios.post('/upd_filter', {coll:this.props.coll, filterKey:key, filterBool:bool}).then((resp) => {
			this.setState({filters:resp.data.fields});
		});
	}

	render () {
		const {colls, coll} = this.props;
		const {filters} = this.state;

		return (
			<div className="FindLst">
				<div className="FindFilter">
					<div className="findFilterTitle">Field Filter</div>
					<div className="findFilterFlds">
						{filters.map((filter, idx) => (<FindFilterFld key={idx} filterKey={filter.key} bool={filter.boolean} label={filter.label} clk_filter={this.upd_filter} />))}
					</div>
				</div>
				<FindDocs colls={colls} coll={coll} filters={filters} />
			</div>
		);
	}
}

export default FindLst;