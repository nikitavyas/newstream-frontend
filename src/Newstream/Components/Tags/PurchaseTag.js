import React from 'react';
import { Row } from 'antd';

const PurchaseTag = () => {
	return (
		<Row className="align-items-center d-flex lbl-purchased">
			<img alt="" src={require('../../Assets/images/purchased-icon.svg')} />
			<span> Purchased</span>
		</Row>
	);
};

export { PurchaseTag };
