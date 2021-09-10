import React, { Component } from 'react';
import './ChangePassword.css';
import {
	Row,
	Col,
	Form,
	Input,
	Modal,
	Typography,
	Button,
	Card,
	Tooltip,
	message,
} from 'antd';
import { EyeFilled,ExclamationCircleOutlined, EyeInvisibleOutlined} from '@ant-design/icons';
import { CHANGE_PASSWORD } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { analytics } from '../../utils/init-fcm';

import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
const { Title } = Typography;

class ChangePassword extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Change Password');
		this.state = { 
			editProfile: true,
			// activeKey: this.props.match.params.tabId
		 };
	}
	componentDidMount() {
		SentryLog({
			category: 'Change password',
			message: 'Change Password Page Loaded',
			level: Severity.Info,
		});
	}
	formRef = React.createRef();
	render() {

		/**
		 * onFinish
		 * Function call When submit Change Password
		 * @param {*} values 
		 */
		const onFinish = (values) => {
			try {
				SentryLog({
					category: 'Change password',
					message: 'Change Password Form Submitted',
					level: Severity.Info,
				});
				const { client } = this.props;
				this.setState({isLoading : true})
				let thisPointer = this;
				client
					.mutate({
						variables: {
							currentpassword: values.currentPassword,
							newpassword: values.newPassword,
						},
						mutation: CHANGE_PASSWORD,
					})
					.then((result) => {
						if (result.data.changePassword.status) {
							Modal.success({
								className: 'notificationModal',
								width: 500,
								icon: (
									<div className="popDeleteicon">
									<img
										alt=""
										src={require('../../Assets/images/thumb-icon.svg')}
									/>
								</div>
								),
								content: result.data.changePassword.message,
								onOk() {
									thisPointer.formRef.current.resetFields();
									thisPointer.setState({isLoading : false})
								},
							});
						}
					})
					.catch((error) => {
						thisPointer.setState({isLoading : false})
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						} else {
							SentryError(error);
							message.destroy();
							message.error('Something went wrong please try again later');
						}
					});
			} catch (error) {
				SentryError(error);
			}
		};
		const onKeyPress = (e) => {
			if (e.charCode === 32) {
				//space
				e.preventDefault();
				return true;
			}
		};
		return (
			<React.Fragment>
				<Card className="rightSideSetting changepassForm">
					<Form
						layout="vertical"
						ref={this.formRef}
						className="myProfileForm"
						onFinish={onFinish}>
						<Row gutter={20}>
							<Col xs={24}>
								<div className="ant-col ant-form-item-label d-flex flex-row">
									<label htmlFor="title" title="Current Password">
										Current Password
									</label>
									<Tooltip placement="top" title="Enter current password">
										<ExclamationCircleOutlined className="infoIcon" />
									</Tooltip>
								</div>
								<Form.Item
									name="currentPassword"
									rules={[
										{
											required: true,
											message: 'Please enter current password',
											whitespace: false,
										},
										{
											min: 6,
											max: 20,
											message:
												'Current password must be between 6 to 20 characters',
										},
									]}>
									<Input.Password
										onKeyPress={onKeyPress}
										size="small"
										type="password"
										placeholder="Enter current password"
										// suffix={<EyeFilled />}
										iconRender = {visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
									/>
								</Form.Item>	
							</Col>
							<Col xs={24}>
								<div className="ant-col ant-form-item-label d-flex flex-row">
									<label htmlFor="title" title="New Password">
										New Password
									</label>
									<Tooltip placement="top" title="Enter new password">
										<ExclamationCircleOutlined className="infoIcon" />
									</Tooltip>
								</div>
								<Form.Item
									type="password"
									name="newPassword"
									rules={[
										{ required: true, message: 'Please enter password' },
										{
											min: 6,
											max: 20,
											message:
												'New password must be between 6 to 20 characters',
										},
									]}>
									<Input.Password
										onKeyPress={onKeyPress}
										size="small"
										type="password"
										placeholder="Enter new password"
										suffix={<EyeFilled />}
										iconRender={visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
									/>
								</Form.Item>
							</Col>
							<Col xs={24}>
								<div className="ant-col ant-form-item-label d-flex flex-row">
									<label htmlFor="title" title="Confirm Password">
										Confirm Password
									</label>
									<Tooltip placement="top" title="Enter new password to confirm">
										<ExclamationCircleOutlined className="infoIcon" />
									</Tooltip>
								</div>
								<Form.Item
									type="password"
									name="confirmPassword"
									dependencies={['password']}
									rules={[
										{
											required: true,
											message: 'Please enter confirm password',
										},
										({ getFieldValue }) => ({
											validator(rule, value) {
												if (!value || getFieldValue('newPassword') === value) {
													return Promise.resolve();
												}
												return Promise.reject('The passwords are not matching');
											},
										}),
									]}>
									<Input.Password
										onKeyPress={onKeyPress}
										size="small"
										type="password"
										placeholder="Confirm new password"
										suffix={<EyeFilled />}
										iconRender={visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
									/>
								</Form.Item>
							</Col>
						</Row>

						<Form.Item className="text-right pt-2">
							<Button 
							loading={this.state.isLoading ? true : false}
							type="primary" 
							htmlType="submit"
							 size="large">
								Submit
							</Button>
						</Form.Item>
					</Form>
				</Card>
			</React.Fragment>
		);
	}
}

ChangePassword = withApollo(ChangePassword);
export { ChangePassword };
