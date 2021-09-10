import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import moment from 'moment';

export class ReporterModalForm extends React.Component {
	formRef = React.createRef();

	componentDidMount() {
		const { email, firstName, lastName } = this.props;
		this.formRef.current.setFieldsValue({
			email,
			firstName,
			lastName,
		});
	}

	onFinish = (e) => {};

	render() {
		const { createdDate } = this.props;

		return (
			<Form
				ref={this.formRef}
				layout="vertical"
				id="myForm"
				name="myForm"
				onFinish={this.onFinish}>
				<Row>
					<Col span={12}>
						<Form.Item
							label="First Name"
							className="px-2 mb-2"
							name="firstName"
							rules={[
								{
									required: true,
									message: 'Please enter first name',
								},
							]}>
							<Input disabled={true} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Last Name"
							className="px-2 mb-2"
							name="lastName"
							rules={[
								{
									required: true,
									message: 'Please enter last name',
								},
							]}>
							<Input disabled={true} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					label="Email"
					className="px-2 mb-2"
					name="email"
					rules={[
						{
							type: 'email',
							message: 'Kindly enter a valid email address',
						},
						{
							required: true,
							message: 'Please enter email address',
						},
					]}>
					<Input disabled={true} />
				</Form.Item>
				<div className="px-2 mt-2">
					Invitation sent on{' '}
					{moment(new Date(parseFloat(createdDate))).format(
						'MM/DD/YYYY hh:mm:ss A'
					)}
				</div>
			</Form>
		);
	}
}
