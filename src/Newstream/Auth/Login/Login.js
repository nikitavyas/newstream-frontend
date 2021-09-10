import React, { Component } from 'react';
import './Login.css';
import {
	Form,
	Input,
	Button,
	Card,
	Layout,
	Row,
	Col,
	Modal,
	Checkbox,
	message
} from 'antd';
import { Link } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import { ArrowLeftOutlined, EyeFilled, EyeInvisibleOutlined } from '@ant-design/icons';
import { LOGIN, FORGOT_PASSWORD, GET_APP_CONFIG,SAVEREPORTERLOCATION_MUTATION } from '../../graphql/APIs';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { DEFAULTPROFILE } from '../../Components/general/constant';
import axios from 'axios';
import { analytics } from '../../utils/init-fcm';
import { COULDBASEURL } from '../../Components/general/constant';
import {Helmet} from "react-helmet";
import Cookies from 'universal-cookie';
// import Cookies from 'js-cookie';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import Password from 'antd/lib/input/Password';
import { cond } from 'lodash';
import { lengthToRadians } from '@turf/helpers';
import moment from 'moment-timezone';

let email = '';
let password = '';
const cookies = new Cookies();
class Login extends Component {
	constructor(props) {
		super(props);
		// const { cookies } = props;
		this.state = {
			showLogin: true,
			path : undefined,
			isChecked : false,
			email : undefined,
			password :undefined
		};
	}
	formRef = React.createRef();
	componentDidMount() {
		if(localStorage.getItem('rememberme')){
			let emailLS = localStorage.getItem("email");
			let cipher = localStorage.getItem("password");
			let checked = localStorage.getItem('rememberme')
			this.setState({email : emailLS})
			this.setState({password : cipher})
			this.setState({isChecked : checked})
			const CryptoJS = require("crypto-js");
			let key = "ASECRET";
			let decipher = CryptoJS.AES.decrypt(cipher, key);	
            decipher = decipher.toString(CryptoJS.enc.Utf8);
			this.formRef.current.setFieldsValue({
				email: emailLS,
				password: decipher,	
		    });	
		}
	}	

componentWillMount() {
		SentryLog({
			category: 'page',
			message: 'Login Page Loaded',
			level: Severity.Info,
		});
		// console.log('token',localStorage.getItem('access_token') )
		if (localStorage.getItem('access_token')  != '' && localStorage.getItem('access_token') != 'null' && localStorage.getItem('access_token') != null && localStorage.getItem('access_token')  != undefined) {
			SentryLog({
				category: 'auth',
				message: 'User Already Logged In',
				level: Severity.Info,
			});
			// console.log('if token',localStorage.getItem('access_token') )
		  this.props.history.push(localStorage.getItem('role') === 'reporter' ? '/requests/open' : 'marketplace')
		}
	}
	formRef = React.createRef();

	render() {
		const onFinish = async(values) => {
            let email = values.email
			let password = values.password
			this.setState({email : email , password : password})
			const CryptoJS = require("crypto-js");
			let key = "ASECRET";
			let cipher = CryptoJS.AES.encrypt(password , key);
			cipher = cipher.toString();
			const cookies = new Cookies();
			if(this.state.isChecked){
				localStorage.setItem('email', email);
				localStorage.setItem('password',cipher);
				localStorage.setItem('rememberme',true)
			}
			this.setState({email : values.email})
			this.setState({password : values.password})
			this.setState({ isLoading: true });
			SentryLog({
				category: 'auth',
				message: 'Sign In Form Submitted',
				level: Severity.Info,
			});
			const { client } = this.props;
			client
				.mutate({
					variables: { ...values },
					mutation: LOGIN,
				})
				.then(async (result) => {
					if (result.data.login.accessToken) {
						SentryLog({
							category: 'auth',
							message: `User Authenticated ${result.data.login.user.name}`,
							level: Severity.Info,
						});
						analytics.setUserId(result.data.login.user.userId);
						//analytics.setUserProperties({'userId':result.data.login.user.userId });
						analytics.setUserProperties({
							dimension0: result.data.login.user.publisher.title,
						});
						analytics.setUserProperties({ dimension1: 'Loggedin' });
						localStorage.setItem('isLoggedIn', true);
						localStorage.setItem('access_token', result.data.login.accessToken);
						localStorage.setItem('name', result.data.login.user.name);
						localStorage.setItem('userId', result.data.login.user.userId);
						localStorage.setItem('timeZone', result.data.login.user.timeZone ? result.data.login.user.timeZone  : moment.tz.guess());
						localStorage.setItem('role', result.data.login.user.role.slug);
						localStorage.setItem('publisherId', result.data.login.user.publisherId);
						let profileImage =
							result.data.login.user.profileImage != ''
								? result.data.login.user.profileImage
								: null;
						localStorage.setItem('profileImage', profileImage);
						localStorage.setItem('email', result.data.login.user.email);
						localStorage.setItem('isApplicant', result.data.login.user.isApplicant);
						localStorage.setItem(
							'isContractsPending',
							result.data.login.user.isContractsPending
						);
						localStorage.setItem(
							'isApprovalPending',
							result.data.login.user.isApprovalPending
						);
						localStorage.setItem(
							'slackUserId',
							result.data.login.user.slackUserId
						);
						localStorage.setItem(
							'phoneNumber',
							result.data.login.user.phoneNumber
						);
						let locationResponse = [];
						await axios
							.get('https://geolocation-db.com/json/')
							.then(function (response) {
								console.log(response.data)
								const countryCode = response.data.country_code;
								localStorage.setItem('userLat', response.data.latitude != "Not found" ?  response.data.latitude : '47.4808722');
								localStorage.setItem('userLng', response.data.longitude  != "Not found" ? response.data.longitude : '18.8501225');
								localStorage.setItem('countryCode', countryCode.toLowerCase());
								locationResponse = response.data;
								let locationData = undefined;
								if(response.data.city && response.data.state && response.data.country_name){
									locationData = response.data.city +
									',' +
									response.data.state +
									',' +
									response.data.country_name;
								}else{
									locationData = undefined;
								}
								console.log(locationData)
								localStorage.setItem(
									'location',
									locationData.search('Not found') == -1 ?  locationData : null
								);

							})
							.catch(function (error) {
								if (error.graphQLErrors && error.graphQLErrors.length > 0) {
								} else {
									//message.error('Something went wrong please try again later');
								}
							})
							.finally(function () {
								// always executed
							});
						await client
							.query({
								query: GET_APP_CONFIG,
								//  fetchPolicy: "cache-and-network",
							})
							.then(async ({ data, loading }) => {
								this.loading = loading;
								if (data !== undefined) {
									SentryLog({
										category: 'App config',
										message: `App cofigurations saved`,
										level: Severity.Info,
									});
									localStorage.setItem(
										'cloudUrl',
										data.getAppConfig.bucketDetails.CLOUDFRONT_URL
									);
									if (localStorage.getItem('role') === 'journalist') {
										this.setState({ isLoading: false });
										if (result.data.login.user.isManager) {
											localStorage.setItem(
												'isManager',
												result.data.login.user.isManager
											);
										} else {
											localStorage.setItem('isManager', false);
										}
										if (
											!localStorage.getItem('slackUserId') ||
											!localStorage.getItem('phoneNumber')
										) {
											this.props.history.push('setUpProfile');
										} else if (
											localStorage.getItem('isContractsPending') === 'true'
										) {
											this.props.history.push('/contracts');
										} else if (
											localStorage.getItem('isApprovalPending') == 'true'
										) {
											Modal.success({
												content:
													'Your contract is still under review, you will be notified via email as soon as Publisher approves your details.',
											});
										} else {
											this.props.history.push('/marketplace');
										}
									} else {
										let value={
											lat:parseFloat(locationResponse.latitude),
											lng:parseFloat(locationResponse.longitude),
											country:locationResponse.country_name,
											state :locationResponse.state,
											city:locationResponse.country_name
										};
										const data = await client.mutate({
											mutation: SAVEREPORTERLOCATION_MUTATION,
											variables:value
										  });
										
										if (
											result.data.login.user.isApplicant &&
											result.data.login.user.applicantStatus === 'Pending'
										) {
											this.setState({ isLoading: false });
											Modal.confirm({
												content:
													'Your Application is still under review. Please try after sometime.',
												centered: true,
												cancelButtonProps: { style: { display: 'none' } },
												onOk() {
													return null;
												},
												onCancel() {
													return null;
												},
											});
										} else if (
											result.data.login.user.isApplicant &&
											result.data.login.user.applicantStatus === 'Rejected'
										) {
											this.setState({ isLoading: false });
											Modal.error({
												content: 'Your Application has been rejected.',
												centered: true,
												cancelButtonProps: { style: { display: 'none' } },
												onOk() {
													return null;
												},
												onCancel() {
													return null;
												},
											});
										} else {
											SentryLog({
												category: 'auth',
												message: `User Authenticated ${result.data.login.user.name}`,
												level: Severity.Debug,
											});
											
											this.setState({ isLoading: false });
											analytics.setUserProperties({ dimension2: 'Reporter' });
											if (
												!localStorage.getItem('slackUserId') ||
												!localStorage.getItem('phoneNumber')
											) {
												this.props.history.push('setUpProfile');
											} else if (
												localStorage.getItem('isContractsPending') === 'true'
											) {
												this.props.history.push('/contracts');
											} else if (
												localStorage.getItem('isApprovalPending') == 'true'
											) {
												Modal.success({
													content:
														'Your contract is still under review, you will be notified via email as soon as Publisher approves your details.',
												});
											} else {
												message.success('Logged in successfully.');
												if( localStorage.getItem('isApplicant') === 'true'){
														this.props.history.push('/requests/assigned');
													}else if( localStorage.getItem('isApplicant') !== 'true'){
														this.props.history.push('/requests/open');
													}
											}
										
											// if (result.data.login.user.isContractsPending) {
											// 	this.props.history.push('/contracts');
											// } else if( localStorage.getItem('isApplicant') === 'true'){
											// 	this.props.history.push('/requests/2');
											// }else if( localStorage.getItem('isApplicant') !== 'true'){
											// 	this.props.history.push('/requests/1');
											// }
										}
									}
								}
							});
					} else if (result.errors) {
						message.error(result.errors[0].message);
						this.setState({ isLoading: false });
					}
				})
				.catch((error, result) => {
					this.setState({ isLoading: false });
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						//message.error('Something went wrong please try again later');
					}
				});
		};
		const onForgotPasswordSubmit = (values) => {
			SentryLog({
				category: 'auth',
				message: 'Forgot password Form Submitted',
				level: Severity.Info,
			});
			const { client } = this.props;
			let thisPointer = this;
			client
				.mutate({
					variables: { ...values },
					mutation: FORGOT_PASSWORD,
				})
				.then((result) => {
					SentryLog({
						category: 'Forgot Password',
						message: result.data.forgotPassword.message,
						level: Severity.Info,
					});
					message.success(result.data.forgotPassword.message);
					thisPointer.formRef.current.resetFields();
					this.setState({ showLogin: true });
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						//message.error('Something went wrong please try again later');
					}
				});
		};
		const onKeyPress = (e) => {
			
			if (e.charCode == 32) {
				e.preventDefault();
				return false;
			}
		};
		const onChange = (event)  => {
			// console.log(`checked = ${event.target.checked}`);
			this.setState({isChecked : event.target.checked})
			localStorage.setItem("rememberme",event.target.checked);
        }
	
		return (
			<React.Fragment>
                <Helmet>
					<title>{this.state.path == '/forgot password/' ? "Newstream | Forgot password" : "Newstream | Login" } </title>
				</Helmet>
				<Layout className="loginPage d-flex flex-column align-items-center justify-content-center">
					<Card className="loginCard">
						<Row className="h-100">
							<Col xs={24} md={12}>
								<div className="d-flex flex-column loginFormRight">
									{/* <div className="mapImg">
											<img
												alt=""
												src={require('../../Assets/images/map.png')}
											/>
										</div> */}
									{this.state.showLogin ? (
										<div className="tagLine ">
											<span>Sign In,</span> to your account
										</div>
									) : (
											<div className="tagLine ">
												<span>Forgot Password,</span> to your account
											</div>
										)}
									<div className="subtagLine">
										<span>Anything</span> <span>interesting is</span>
										<br /> happening around you?
									</div>
									{/* 
											<div className="punchline">
												Take a photo. Shoot a video. Sell it on Newstream.
											</div> */}
								</div>
							</Col>
							<Col xs={24} md={12}>
								<div className="loginFormLeft d-flex  flex-column align-items-center justify-content-center">
									{this.state.showLogin ? (
										<div className="loginForm_blk">
											<div className="loginLogo">
												<img
													alt=""
													src={require('../../Assets/images/logo_newstream_v1.png')}
												/>
											</div>
											<div className="loginwelTitle">
												<span>Hello there!</span> Welcome Back
											</div>
											<Form
												ref={this.formRef}
												layout="vertical"	
												onFinish={onFinish}
												>
												<Form.Item
													refs={this.formRef}
													className="mb-4"
													name="email"
													// value={this.state.email}
													// prefix={
													// 	<MailOutlined className="site-form-item-icon" />
													// }
													rules={[
														{
															required: true,
															message: 'Please enter your email address',
														},
														{
															type: 'email',
															message: 'Kindly enter a valid email address',
														},
													]}>
													<Input
														placeholder="Enter Email"
														prefix={<CustIcon type="mailicon" />}
													/>
												</Form.Item>
												<Form.Item
												    
													className="mb-4"
													name="password"
													rules={[
														{
															required: true,
															message: 'Please enter your password',
														},
														{
															min: 6,
															max: 20,
															message:
																'Password must be between 6 to 20 characters',
														},
													]}>
													<Input.Password 
														placeholder="Enter Password"
														onKeyPress={onKeyPress}
														prefix={<CustIcon type="lockicon" />}
														iconRender={visible => (visible ? <EyeFilled /> : <EyeInvisibleOutlined />)}
													/>
												</Form.Item>
												<div className="d-flex justify-content-between mb-2 mb-lg-4">
													<Checkbox onChange={onChange} checked={this.state.isChecked}>
														Remember Password
													</Checkbox>
													<span
														onClick={() => this.setState({ showLogin: false , path:'/forgot password/' })}
														className="font-medium black-text-color forgotPasswordTxt">
														Forgot Password?
													</span>
												</div>
												<Form.Item>
													<Button
														type="primary"
														shape="round"
														loading={this.state.isLoading}
														htmlType="submit">
														Sign In
													</Button>
												</Form.Item>
											</Form>

											{/* {message ? <div className="errorMsg">message</div>: null } */}
										</div>
									) : (
										
											<div className="forgotPassword_blk loginForm_blk">
												<div className="loginLogo">
													<img
														alt=""
														src={require('../../Assets/images/logo_newstream_v1.png')}
													/>
												</div>
												<div className="loginwelTitle">
													<span>Hello there!</span> Enter Register Email here
											</div>
												{/* <h5>Forgot Password?</h5>
											<p>You can reset your password here.</p> */}
												<Form
												
													layout="vertical"
													className="mb-4"
													ref={this.formRef}
													onFinish={onForgotPasswordSubmit}>
													<Form.Item
														name="email"
														rules={[
															{
																required: true,
																message: 'Please enter your email address',
															},
															{
																type: 'email',
																message: 'Kindly enter a valid email address',
															},
														]}>
														<Input
															placeholder="Enter Email"
															prefix={<CustIcon type="mailicon" />}
														/>
													</Form.Item>
													<Form.Item className="forgotSpace">
														<Button
															type="primary"
															shape="round"
															htmlType="submit">
															Next
													</Button>
													</Form.Item>
												</Form>
												<Link
													onClick={() => this.setState({ showLogin: true })}
													className=" d-flex flex-row align-items-center">
													<ArrowLeftOutlined className="mr-2" /> Go back to Login
											</Link>
											</div>
										)}
								</div>
							</Col>
						</Row>
					</Card>
				</Layout>
			</React.Fragment>
		);
	}
}

Login = withApollo(Login);
export { Login };
