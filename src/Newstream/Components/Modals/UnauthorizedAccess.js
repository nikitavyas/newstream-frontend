import { Modal, Button } from 'antd';
import React from 'react';
import { CustIcon } from '../Svgs';

const UnauthorizedAccessModal = ({ show, displayModal }) => {
	const closeAuthorizeModal = () => {
		displayModal(false);
	};

	return (
		<Modal
			visible={show}
			onCancel={closeAuthorizeModal}
			width={400}
			cancelText="Close"
			centered
			footer={
				<Button
					type="primary"
					shape="round"
					htmlType="button"
					onClick={closeAuthorizeModal}>
					Ok
				</Button>
			}>
			<CustIcon type="close" />
			<p>Sorry</p>
			<p>
				You currently do not have required authorization to access this feature.
			</p>
		</Modal>
	);
};

export { UnauthorizedAccessModal };
