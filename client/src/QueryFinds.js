import React, {Component} from 'react'

export default class QueryFinds extends Component {

	render () {
		const {finds, find, change_find} = this.props

		let findStyles = []

		if (finds) {
			finds.map((object, index) => {
				if (object.find === find) {
					findStyles[index] = 'queryFindActive'
				} else {
					findStyles[index] = 'queryFindNormal'
				}
			})
		}

		return (
			<div className="queryFind">
				{finds.map((findObject, index) => (
					<div className={findStyles[index]} key={index} onClick={() => change_find(index)}>
						{findObject.label.cn}
					</div>
				))}
                {/*Object.keys(fields).map((fieldKey, index) => (
					<div className={fieldStyles[index]} key={index} onClick={() => update_filter(fieldKey, !filter.fields[index].enable)}>
						<div>{fields[fieldKey].label.cn}</div>
						<div>{fieldKey}</div>
					</div>
				))*/}
			</div>
		)
	}
}