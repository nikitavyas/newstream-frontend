import React, { Component } from 'react';

import { Input } from 'antd';

class NumericInput extends Component {
	onChange = (e) => {
		const { value } = e.target;
		// e.stopPropogation();
		const reg = /^-?[0-9]*(\.[0-9]*)?$/;
		if (
			(!isNaN(value) &&
				reg.test(value) &&
				value !== undefined &&
				value <= this.props.max &&
				value >= this.props.min) ||
			value === '' ||
			value === '-'
		) {
			this.props.onChange(value);
		}
	};

	// '.' at the end or only '-' in the input box.
	onBlur = () => {
		const { valueEntered, onBlur, onChange } = this.props;
		let value = valueEntered;
		let valueTemp = valueEntered;
		if (value.charAt(value.length - 1) === '.' || value === '-') {
			valueTemp = value.slice(0, -1);
		}
		onChange(valueTemp.replace(/0*(\d+)/, '$1'));
		if (onBlur) {
			onBlur();
		}
	};

	render() {
		return (
			<Input
				{...this.props}
				onChange={this.onChange}
				onBlur={this.onBlur}
				placeholder={this.props.placeholder}
				maxLength={25}
				max={10}
				value={this.props.valueEntered}
			/>
		);
	}
}
export default NumericInput;
