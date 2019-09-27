import React, {Component} from 'react'

export default class FindFields extends Component {

	render () {
		const {fields, filter, update_filter} = this.props
		let fieldStyles = []

		if (filter) {
			filter.fields.map((field, index) => {
				if (field.enable) {
					fieldStyles[index] = 'findFieldActive'
				} else {
					fieldStyles[index] = 'findFieldNormal'
				}
			})
		}
		/* else {
			Object.keys(fields).map((field, index) => {
				fieldStyles[index] = 'findFieldNormal'
			})
		}*/

		
		
		return (
			<div className="findFields">
                {Object.keys(fields).map((fieldKey, index) => (
					<div className={fieldStyles[index]} key={index} onClick={() => update_filter(fieldKey, !filter.fields[index].enable)}>
						<div>{fields[fieldKey].label.cn}</div>
						<div>{fieldKey}</div>
					</div>
				))}
			</div>
		)
	}
}