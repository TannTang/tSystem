import React, {Component} from 'react'
import Axios from 'axios'

export default class QueryCollections extends Component {

	render () {
		const {collections, collection, change_collection} = this.props
		let collectionStyles = []
		for (let i=0; i<Object.keys(collections).length; i++) {
			if (Object.keys(collections)[i] === collection) {
				collectionStyles[i] = 'queryCollectionActive'
			} else {
				collectionStyles[i] = 'queryCollectionNormal'
			}
		}

		return (
			<div className="queryCollections">
				{Object.keys(collections).map((collectionKey, index) => {
					if (collections[collectionKey].finds) {
						return (
							<div className={collectionStyles[index]} key={index} onClick={() => change_collection(collectionKey)}>
								<div>{collections[collectionKey].label.cn}</div>
								<div>{collectionKey}</div>
							</div>
						)
					}
				})}
			</div>
		)
	}
}