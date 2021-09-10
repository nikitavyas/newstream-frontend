import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import moment from 'moment';

export class ReporterModalForm extends React.Component {
	formRef = React.createRef();

	componentDidMount() {
		// console.log(this.props);
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
				<Row gutter={10}>
					<Col sm={12} xs={24}>
						<div className="ant-col ant-form-item-label d-flex flex-row">
							<label htmlFor="First Name" title="First Name">
								First Name
							</label>
						</div>
						<Form.Item
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
					<Col sm={12} xs={24}>
						<div className="ant-col ant-form-item-label d-flex flex-row">
							<label htmlFor="Last Name" title="Last Name">
								Last Name
							</label>
						</div>
						<Form.Item
							// label="Last Name"
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
				<div className="ant-col ant-form-item-label d-flex flex-row">
					<label htmlFor="Email" title="Email">
						Email
					</label>
				</div>
				<Form.Item
					//	label="Email"
					className="mb-2"
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
				<div className="mt-2">
					Invitation sent on{' '}
					{moment(new Date(parseFloat(createdDate))).format(
						'MM/DD/YYYY hh:mm:ss A'
					)}
				</div>
			</Form>
		);
	}
}
