import React, {Component} from 'react'

export default class QueryProjections extends Component {

	render () {
		const {fields, projection, update_projection} = this.props
		let projectionStyles = []
		//console.log()
		Object.keys(fields).map((fieldKey, index) => {
			//if (projection) {
				if (projection[fieldKey] === 1) {
					projectionStyles[index] = 'queryProjectionActive'
				} else {
					projectionStyles[index] = 'queryProjectionNormal'
				}
			//} else {
				//projectionStyles[index] = 'queryProjectionNormal'
			//}
		})
	
		
		return (
			<div className="queryProjections">
				{Object.keys(fields).map((fieldKey, index) => (
					<div className={projectionStyles[index]} key={index} onClick={() => update_projection(fieldKey)}>
						<div>{fields[fieldKey].label.cn}</div>
						<div>{fieldKey}</div>
					</div>
				))}
                {/*Object.keys(fields).map((fieldKey, index) => (
					<div className={projectionStyles[index]} key={index} onClick={() => update_projection(fieldKey, !projection.fields[index].enable)}>
						<div>{fields[fieldKey].label.cn}</div>
						<div>{fieldKey}</div>
					</div>
				))*/}
			</div>
		)
	}
}