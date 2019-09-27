import React, {Component} from 'react'
import Axios from 'axios'

export default class FindCollections extends Component {

	constructor(props) {
		super(props)
		this.state = {
			filters: []
		}
		//this.find_filter(props.collection)
	}

	componentDidUpdate(prevProps) {
		if (this.props.collection !== prevProps.collection) {
			//this.find_filter(this.props.collection)
		}
	}

	render () {
		const {collections, collection, find_collection} = this.props

		let collectionStyles = []
		let collectionValues = Object.values(collections)
		let collectionKeys = Object.keys(collections)
		for (let i=0; i<collectionKeys.length; i++) {
			if (collectionKeys[i] === collection) {
				collectionStyles[i] = 'findCollectionActive'
			} else {
				collectionStyles[i] = 'findCollectionNormal'
			}
		}

		return (
			<div className="findCollections">
				{collectionValues.map((collection, index) => (
					<div className={collectionStyles[index]} key={index} onClick={() => find_collection(collectionKeys[index])}>
						<div>{collection.label.cn}</div>
						<div>{collectionKeys[index]}</div>
					</div>
				))}
				{/*Object.keys(collections).map((coll, index) => (<div className={collectionStyles[index]} key={index} onClick={() => this.clk_coll1(index)}>{collections[coll].label.cn}</div>))*/}
				
				{/*<div className="fndMnBlc">
					<div className="dshMn1">
						{dtKeys.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls1[ind]} onClick={() => clk_coll1(ind)}>{dtSht[opt].fnd.txt}</div>
						))}
					</div>
					<div className="dshMn2">
						{dtSht[dtKeys[coll1]].fnd.whr.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls2[ind]} onClick={() => clk_coll2(ind)}>{opt.txt}</div>
						))}
					</div>
					<div className="dshMn3">
						{dtSht[dtKeys[coll1]].fnd.srt.map((opt, ind) => (
							<div key={ind} ind={ind} className="dshOpt" style={stls3[ind]} onClick={() => clk_coll3(ind)}>{opt.txt}</div>
						))}
					</div>
				</div>*/}
			</div>
		)
	}
}