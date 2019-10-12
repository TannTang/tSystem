import React, {Component} from 'react'

export default class QuerySorts extends Component {

	render () {
		const {sorts, sort, change_sort} = this.props

		let sortStyles = []

		if (sorts) {
			sorts.map((object, index) => {
				if (object.sort === sort) {
					sortStyles[index] = 'querySortActive'
				} else {
					sortStyles[index] = 'querySortNormal'
				}
			})
		}

		return (
			<div className="querySort">
				{sorts.map((sortObject, index) => (
					<div className={sortStyles[index]} key={index} onClick={() => change_sort(index)}>
						{sortObject.label.cn}
					</div>
				))}
			</div>
		)
	}
}