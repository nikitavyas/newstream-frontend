import React, { Component } from 'react';
import './ResetPassword.css';
import {
	Form,
	Input,
	Button,
	Card,
	Layout,
	Row,
	Col,
	message,
	Modal
} from 'antd';
import { EyeFilled,EyeInvisibleOutlined } from '@ant-design/icons';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { withApollo } from 'react-apollo';
import { RESET_PASSWORD } from '../../graphql/APIs';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
class ResetPassword extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showLogin: true,
			token: props.match.params.token,
			showDisabled :true,
			loading:false
		};
		localStorage.setItem('access_token', props.match.params.token);
	}
	componentDidMount() {
		SentryLog({
			category: 'Reset password',
			message: 'Reset Password Page Loaded with Token ' + this.state.token,
			level: Severity.Info,
		});
	}
	render() {


		/**
		 * onFinish
		 * calling onFinish Function when user Submit the ForgotPasswordForm
		 * @param {*} values 
		 */
		const onFinish = (values) => {
			this.setState({loading:true})
			SentryLog({
				category: 'auth',
				message: 'Reset Password Form Submitted',
				level: Severity.Info,
			});
			const { client } = this.props;
			const props = this.props;

			/*API Call for Reset Password */
			client
				.mutate({
					variables: { password: values.newPassword },
					mutation: RESET_PASSWORD,
					//  headers:{'token':'2123'}
				})
				.then((result) => {
					SentryLog({
						category: 'Reset Password',
						message: `${result.data.resetPassword.message}`,
						level: Severity.Info,
					});
					localStorage.setItem('access_token', null);
					this.setState({loading:false})
					Modal.success({
						className: 'notificationModal',
								width: 500,
								icon: (
									<div className="popDeleteicon">
									<img
										alt=""
										src={require('../../Assets/images/thumb-icon.svg')}
									/>
								</div>),
						content:result.data.resetPassword.message,
						onOk() {
							window.location.href = '/login';
						}
					});
					//message.success(result.data.resetPassword.message);
					/*Redirection to login page */
				//	props.history.push('/login');
					
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		};

	
		const onKeyPress = (e) => {
			if (e.charCode == 32) {
				e.preventDefault();
				return false;
			}
		};
		let thisData = this;
		return (
			<React.Fragment>
				<Layout className="loginPage d-flex flex-column align-items-center justify-content-center">
					<Card className="loginCard">
						<Row className="h-100">
							<Col xs={24} md={12}>
								<div className="d-flex flex-column loginFormRight">
									{/* <div className="mapImg">
										<img alt="" src={require('../../Assets/images/map.png')} />
									</div> */}
									<div className="tagLine ">
										<span>Reset Password,</span> to your account
									</div>
									<div className="subtagLine">
										<span>Anything</span> <span>interesting is</span>
										<br /> happening around you?
									</div>
								</div>
							</Col>
							<Col xs={24} md={12}>
								<div className="loginFormLeft d-flex  flex-column align-items-center justify-content-center">
									<div className="loginForm_blk">
										<div className="loginLogo">
											<img
												alt=""
												src={require('../../Assets/images/logo_newstream_v1.png')}
											/>
										</div>
										<div className="loginwelTitle">
											<span>Hello there!</span> Enter New Password
										</div>
										<Form layout="vertical" onFinish={onFinish}>
											<Form.Item
												className="mb-4"
												name="newPassword"
												rules={[
													{ required: true, message: 'Enter password' },
													{
														min: 6,
														max: 20,
														message:
															'New password must be between 6 to 20 characters',
													},
												]}>
												<Input.Password
													placeholder="Enter New Password"
													onKeyPress={onKeyPress}
													prefix={<CustIcon type="lockicon" />}
													suffix={<EyeFilled />}
													iconRender = {visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
													type="password"
												/>
											</Form.Item>
											<Form.Item
												className="mb-4"
												type="password"
												name="confirmPassword"
												dependencies={['password']}
												rules={[
													{ required: true, message: 'Enter confirm password' },
													({ getFieldValue }) => ({
														validator(rule, value) {
															if (
																!value ||
																getFieldValue('newPassword') === value
															) {
																return Promise.resolve();
															}
															return Promise.reject(
																'The passwords are not matching'
															);
														},
													}),
												]}>
												<Input.Password
													placeholder="Enter Confirm New Password"
													onKeyPress={onKeyPress}
													prefix={<CustIcon type="lockicon" />}
													suffix={<EyeFilled />}
													iconRender = {visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
													type="password"
												/>
											</Form.Item>
											<Form.Item>
												<Button type="primary" loading={this.state.loading} shape="round" htmlType="submit">
													Reset Password
												</Button>
											</Form.Item>
										</Form>
									</div>
								</div>
							</Col>
						</Row>
					</Card>
				</Layout>
			</React.Fragment>
		);
	}	
}

ResetPassword = withApollo(ResetPassword);
export { ResetPassword };
