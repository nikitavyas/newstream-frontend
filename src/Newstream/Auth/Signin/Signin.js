import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Card,
	Col,
	Form,
	Input,
	Layout,
	message,
	Row,
	Modal,
} from 'antd';
import axios from 'axios';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { CustIcon } from '../../Components/Svgs';
import { LOGIN } from '../../graphql/APIs';
import { GETAPPCONFIG } from '../../graphql/APIs';

import { analytics } from '../../utils/init-fcm';
import './Signin.css';

class Signin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
		};
		this._getUserLocation = this._getUserLocation.bind(this);
	}

	componentDidMount() {
		this._getUserLocation();
		SentryLog({
			category: 'page',
			message: 'Login Page Loaded',
			level: Severity.Debug,
		});
		if (localStorage.getItem('userActive') && localStorage.getItem('token')) {
			this.props.history.push('/contract-invitation');
		} else if (localStorage.getItem('token')) {
			SentryLog({
				category: 'auth',
				message: 'User Already Logged In',
				level: Severity.Debug,
			});
			this.props.history.push('/requests');
		}
	}
/**
 * _getUserLocation
 * Function call when get location data from API call
 */
async _getUserLocation() {
		axios
			.get('https://geolocation-db.com/json/')
			.then(function (response) {
				await localStorage.setItem('userLat', response.data.latitude);
				await localStorage.setItem('userLng', response.data.longitude);
			})
			.catch(function (error) {
				SentryError(error);
			});
	}

	render() {
		 const onFinish = (values) => {
			SentryLog({
				category: 'auth',
				message: 'Sign In Form Submitted',
				level: Severity.Debug,
			});
			this.setState({ isLoading: true });
			const { client } = this.props;
			client
				.mutate({
					variables: { ...values },
					mutation: LOGIN,
				})
				.then(async (result) => {
					localStorage.setItem('name', result.data.login.user.name);
					localStorage.setItem('email', result.data.login.user.email);
					localStorage.setItem('token', result.data.login.accessToken);
					localStorage.setItem(
						'profileImage',
						result.data.login.user.profileImage
					);
					localStorage.setItem('userId', result.data.login.user.userId);
					client
						.query({
							query: GETAPPCONFIG,
							//  fetchPolicy: "cache-and-network",
						})
						.then(({ data, loading }) => {
							localStorage.setItem(
								'cloudUrl',
								data.getAppConfig.bucketDetails.CLOUDFRONT_URL
							);

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
								if (result.data.login.user.isApplicant) {
									localStorage.setItem('userType', 'Applicant');
								}

								this.setState({ isLoading: false });
								analytics.setUserId(result.data.login.user.userId);
								analytics.setUserProperties({
									dimension0: result.data.login.user.publisher.title,
								});
								analytics.setUserProperties({ dimension1: 'Loggedin' });
								analytics.setUserProperties({ dimension2: 'Reporter' });
								message.success('Logged in successfully.');
								if (result.data.login.user.isContractsPending) {
									this.props.history.push('/contracts');
								} else {
									this.props.history.push('/requests');
								}
							}
						});
				})
				.catch((error) => {
					this.setState({ isLoading: false });
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later.');
					}
				});
		};

		return (
			<React.Fragment>
				<Layout className="loginPage d-flex flex-column align-items-center justify-content-center">
					<Card className="loginCard">
						<div className="loginForm_blk">
							<Row>
								<Col xs={24} sm={12} md={12} className="pt-sm-5">
									<div className="loginFormLeft ml-lg-3">
										<div className="loginForm_blk">
											<div className="loginLogo">
												{/* <img alt="" src={require('../../../assets/images/newstream_logo.jpg')} /> */}
												<CustIcon type="logo" className="logoSvg" />
											</div>
											<Form
												layout="vertical"
												className="mb-4"
												onFinish={onFinish}>
												<Form.Item
													className="mb-3"
													name="email"
													rules={[
														{
															required: true,
															message: 'Please enter your registered email',
														},
														{
															type: 'email',
															message: 'Kindly enter a valid email address',
														},
													]}>
													<Input placeholder="Email" />
												</Form.Item>
												<Form.Item
													className="mb-3"
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
													<Input placeholder="Password" type="password" />
												</Form.Item>
												<Form.Item>
													<Button
														type="primary"
														loading={this.state.isLoading}
														shape="round"
														htmlType="submit">
														Sign In
													</Button>
												</Form.Item>
											</Form>
											<Link
												to="/forgot-password"
												className=" d-flex flex-row align-items-center">
												Forgot Password?
											</Link>
											{/* <Link to="/forgot-password" className=" d-flex flex-row align-items-center"> <ArrowLeftOutlined className="mr-2" /> Go back to Login</Link> */}
										</div>
									</div>
								</Col>
								<Col xs={24} sm={12} md={12} className="abc">
									<div className="d-flex flex-column loginFormRight">
										<div className="mapImg">
											<img
												alt=""
												src={require('../../Assets/images/map.png')}
												height="100%"
											/>
										</div>
										<div className="lfrHeading">
											<div className="tagLine">
												<b className="primary-text-color">
													Are you trying to get
												</b>
											</div>
											<div className="subtagLine">
												<h3>to the top of the news race?</h3>
											</div>
											<div className="punchline">
												Take a photo. Shoot a video. Sell it on Newstream.
											</div>
										</div>
									</div>
								</Col>
							</Row>
						</div>
					</Card>
				</Layout>
			</React.Fragment>
		);
	}
}

Signin = withApollo(Signin);
export { Signin };
