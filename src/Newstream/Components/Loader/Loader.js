import React, { Component } from 'react';
import './Loader.css';
import { Spin } from 'antd';

class Loader extends Component {
	render() {
		return (
			<div className="loaderConainer w-100 d-flex flex-row align-items-center justify-content-center">
				<Spin />
			</div>
		);
	}
}

export { Loader };
