import { captureException as SentryError } from '@sentry/react';
import { Button, Checkbox, Col, Form, Input, message, Row } from 'antd';
import axios from 'axios';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useHistory, useLocation } from 'react-router-dom';
import {
	APPLICANT_REGISTER_MUTATION,
	SIGNUP_MUTATION,
} from '../../../graphql/APIs';
import { INVITEREPORTLIST } from '../../../graphql/APIs';
import { parse as parseParams } from 'query-string';
import { ResumeUploader } from '../../Uploader';
import { CustIcon } from '../../Svgs';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';

const SignUpForm = ({ uploadingFlag, fileUploaded }) => {
	const [phoneNumber, setPhoneNumber] = useState(null);
	const [isInvited, setIsInvited] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [resumeFile, setResumeFile] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	//Hooks
	const browserHistory = useHistory();
	const client = useApolloClient();
	const SignUpFormRef = useRef();
	const urlParameters = parseParams(useLocation().search);

	// Params from URL
	const token = urlParameters.invite;
	const publisherId = urlParameters.publisher;

	useEffect(() => {
		if (token) {
			// console.log(token)
			setIsInvited(true);
			getInvitationData();
		}
		getUserLocation();
	}, []);

	useEffect(() => {
		setIsUploading(uploadingFlag);
	}, [uploadingFlag]);

	
	/**
	 * getUserLocation
	 * This Function Call For get location through Api call 
	 */
	const getUserLocation = () => {
		axios
			.get('https://geolocation-db.com/json/')
			.then(({ data }) => {
				/*Set location data in the localstorage */
				localStorage.setItem('userLat',data.latitude != "Not found" ?  data.latitude : '47.4808722');
				localStorage.setItem('userLng', data.longitude  != "Not found" ? data.longitude : '18.8501225');
			})
			.catch((error) => {});
	};


/**
 * getInvitationData
 * This function call when Editor send invitation to the reporters for sign up
 */
	const getInvitationData = () => {
		// console.log('invite reproters')
		client
			.query({
				query: INVITEREPORTLIST,
				context: {
					headers: {
						Authorization: 'Bearer ' + token,
					},
				},
			})
			.then(({ data }) => {
				const { status } = data?.getInviteReporter;
				if (status === 'registered') {
					/*Clear data from localstorage */
					localStorage.clear();
					return browserHistory.push('/');
				}
				const { email, firstName, lastName } = data?.getInviteReporter;
				/*Set email in the loacalstorage */
				localStorage.setItem('email', email);
				SignUpFormRef.current.setFieldsValue({
					firstName,
					lastName,
					email,
				});
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors[0]?.message) {
				//	message.error('Invalid invitation link or link expired.');
					browserHistory.push('/login')
				} else {
					SentryError(error);
					message.error('Something went wrong, please try after sometime.');
				}
			});
	};

	/**
	 * onInvitationSignUp
	 * Function Call when reporter Fill the sign up data and submit
	 * @param {*} values 
	 * return 
	 */
	const onInvitationSignUp = (values) => {
		/*Set true value when subimitting  */
		setIsSubmitting(true);
		let profileImage = fileUploaded || '';
		if (profileImage.includes('.com/')) {
			values.profileImage = profileImage.split('.com/')[1];
		} else {

			values.profileImage = profileImage;
		}
		values.name = values.firstName + ' ' + values.lastName;
		values.phoneNumber = phoneNumber;
		values.slackUserId = values.slackUserId.toUpperCase();
		values.timeZone = moment.tz.guess();
		client
			.mutate({
				mutation: SIGNUP_MUTATION,
				context: {
					headers: {
						Authorization: `Bearer ` + token,
					},
				},
				variables: values,
			})
			.then(async ({ data: { signupReporter } }) => {
				setIsSubmitting(false);
				message.success('Your details have submitted successfully.');
				/*Store user details to localstorage*/
				localStorage.setItem('access_token', signupReporter.accessToken);
				localStorage.setItem('userId', signupReporter.userId);
				localStorage.setItem('name', signupReporter.name);
				localStorage.setItem('email', signupReporter.email);
				localStorage.setItem('reporter', true);
				localStorage.setItem('timeZone', moment.tz.guess());
				if (signupReporter.isContractsPending) {
					browserHistory.push('/contracts');
				} else {
					browserHistory.push('/requests');
				}
			})
			.catch((error) => {
				setIsSubmitting(false);
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
					if (error.graphQLErrors[0].message === 'User already exists') {
						this.props.history.push('/');
					} else {
						//message.error(error.graphQLErrors[0].message);
					}
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	/**
	 * onApplicantSignUp
	 * This Function calls when applicant Fill sign up form and submit successfully.  
	 */

	const onApplicantSignUp = (values) => {
		setIsSubmitting(true);
		let profileImage = fileUploaded || '';
		if (profileImage.includes('.com/')) {
			values.profileImage = profileImage.split('.com/')[1];
		} else {
			values.profileImage = profileImage;
		}
		values.name = values.firstName + ' ' + values.lastName;
		values.phoneNumber = phoneNumber;
		values.slackUserId = values.slackUserId.toUpperCase();
		values.publisherId = publisherId;
		values.timeZone = moment.tz.guess();
		client
			.mutate({
				mutation: APPLICANT_REGISTER_MUTATION,
				variables: values,
			})
			.then(() => {
				setIsSubmitting(false);
				message.success('Your details have submitted successfully.');
				localStorage.clear();
				browserHistory.push('/');
			})
			.catch((error) => {
				setIsSubmitting(false);
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
					if (error.graphQLErrors[0].message === 'User already exists') {
					//	message.error('You have already Registered');
						localStorage.clear();
						browserHistory.push('/');
					} else {
						//message.error(error.graphQLErrors[0].message);
					}
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	/**
	 * handleFileUploaded
	 * This Function Calls when cv uploaded.
	 * @param {*} fileData 
	 */
	const handleFileUploaded = (fileData) => {
		setResumeFile(fileData);
		SignUpFormRef.current.setFieldsValue({
			resume: fileData.url,
		});
	};

	
	return (
		<Form
			layout="vertical"
			ref={SignUpFormRef}
        onFinish={isInvited ? onInvitationSignUp : onApplicantSignUp}
			>
			<div className="row">
				<div className="col-lg-6 col-12">
					<Form.Item
						rules={[
							{   
								required: true,
								message: 'Please enter your first name',

							},
							{
								pattern: /^[a-zA-Z0-9]*$/,
								message : 'Enter Valid first name'
							}
						]}
						name="firstName"
						label="First Name">
						<Input placeholder="First Name" disabled={!publisherId} />
					</Form.Item>
				</div>
				<div className="col-lg-6 col-12">
					<Form.Item
						rules={[
							{
								required: true,
								message: 'Enter Valid last name',
							},
							{
								pattern: /^[a-zA-Z0-9]*$/,
								message : 'Specialcharacter not allowed'
							}
						]}
						name="lastName"
						label="Last Name">
						<Input placeholder="Last Name" disabled={!publisherId} />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-lg-12 col-12">
					<Form.Item
						rules={[
							{
								required: true,
								message: 'Please enter your email',
							},
						]}
						name="email"
						label="Email ID">
						<Input placeholder="Email ID" disabled={!publisherId} />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-lg-6 col-12">
					<Form.Item
						name="password"
						label="Password"
						rules={[
							{
								required: true,
								message: 'Please enter your password.',
							},
							{
								min: 6,
								message: 'Password must be of minimum 6 character',
							},
						]}>
						<Input
							placeholder="Password"
							autoComplete="new-password"
							type="password"
						/>
					</Form.Item>
				</div>
				<div className="col-lg-6 col-12">
					<Form.Item
						name="confirmPassword"
						label="Confirm Password"
						rules={[
							{
								required: true,
								message: 'Please enter confirm password.',
							},
							({ getFieldValue }) => ({
								validator(_rule, value) {
									if (!value || getFieldValue('password') === value) {
										return Promise.resolve();
									}
									return Promise.reject('Confirm Password does not match!');
								},
							}),
						]}>
						<Input placeholder="Confirm Password" type="password" />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-lg-6 col-12">
					<Form.Item
						label="Phone Number"
						name="phoneNumber"
						rules={[
							{
								required: true,
								message: 'Please enter your mobile number.',
							},
						]}
						extra={
							<p>*Please add phone number that is linked to your WhatsApp</p>
						}>
						<PhoneInput
							placeholder="Phone Number"
							inputStyle={{ width: '100%' }}
							country={localStorage.getItem('countryCode')}
							disableInitialCountryGuess={true}
							onChange={(value, country, e, phoneNumber) =>
								{
									// console.log(value)
									// console.log(country)
									// console.log(e)
									// console.log(phoneNumber)
								setPhoneNumber(phoneNumber)
								}
							}
							defaultMask="...-...-...-..."
						/>
					</Form.Item>
				</div>
				<div className="col-lg-6 col-12">
					<Form.Item
						label="Slack Member Id"
						name="slackUserId"
						rules={[
							{
								required: true,
								message: 'Please enter slack member id',
							},
							{
								pattern: new RegExp('[UuWw]([a-zA-Z0-9]{8}|[a-zA-Z0-9]{10})'),
								message: 'Enter valid slack member id',
							},
							{
								max: 11,
								message: 'Enter valid slack member id',
							},
						]}
						extra={
							<p>
								*Please add Slack Member Id for <strong>newstream</strong>{' '}
								workspace
							</p>
						}>
						<Input placeholder="Slack Member Id" />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="Address1"
						name="address1"
						rules={[
							{ required: true, message: 'Please enter address 1' },
							{ min: 3, message: 'Address must have atleast 3 characters' },
							{
								pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
								message: 'Invalid Address format',
							},
						]}>
						<Input placeholder="Enter address1" />
					</Form.Item>
				</div>
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="Address2"
						name="address2"
						rules={[
							{
								pattern: /([A-z0-9\u0080-\u024F/ \\-])\w+/gi,
								message: 'Invalid Address format',
							},
						]}>
						<Input placeholder="Enter address2" />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="City"
						name="city"
						rules={[
							{ required: true, message: 'Please enter city' },
							{ min: 3, message: 'City must have atleast 3 characters' },
							{
								pattern: /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/gim,
								message: 'Please enter a valid',
							},
						]}>
						<Input placeholder="Enter city" />
					</Form.Item>
				</div>
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="State"
						name="state"
						rules={[
							{ required: true, message: 'Please enter state' },
							{
								pattern: /^[a-z A-Z]+$/i,
								message: 'The entry can only contain characters',
							},
							{ min: 3, message: 'State must have atleast 3 characters' },
						]}>
						<Input placeholder="Enter state" />
					</Form.Item>
				</div>
			</div>
			<div className="row">
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="Country"
						name="country"
						rules={[
							{ required: true, message: 'Please enter country' },
							{
								pattern: /^[a-z A-Z]+$/i,
								message: 'The entry can only contain characters',
							},
							{ min: 3, message: 'Country must have atleast 3 characters' },
						]}>
						<Input placeholder="Enter country" />
					</Form.Item>
				</div>
				<div className="col-sm-6 col-12">
					<Form.Item
						className="mb-2"
						label="Pin Code"
						name="pincode"
						rules={[
							{ required: true, message: 'Please enter pincode' },
							{
								pattern: /^[A-Z0-9]+$/,
								message: 'The entry can only contain numbers/upparcase letters',
							},
							{
								min: 3,
								max: 8,
								message: 'Pincode must be between 3 to 8 characters',
							},
						]}>
						<Input placeholder="Enter pin code" />
					</Form.Item>
				</div>
			</div>
			{!isInvited && (
				<Row className="mt-3" justify="space-around" align="middle">
					<Col span={8}>
						<Form.Item
							name="resume"
							rules={[{ required: true, message: 'Please Upload your CV' }]}>
							<ResumeUploader
								setUploadingFlag={setIsUploading}
								getUploadedFile={handleFileUploaded}
							/>
						</Form.Item>
					</Col>
					<Col span={14}>
						{resumeFile.name && (
							<Fragment>
								<Button
									icon={<CustIcon type="paperclip" className="mr-2" />}
									type="link"
									href={resumeFile.url}
									target="_blank">
									{resumeFile.name}
								</Button>
							</Fragment>
						)}
					</Col>
				</Row>
			)}
			<Row justify="space-around">
				<Col>
					<Form.Item
						rules={[
							{
							  validator: (_, value) =>
								value ? Promise.resolve() : Promise.reject('You must agree to the Terms and Conditions'),
							},
						  ]}
						name="terms"
						valuePropName="checked">
						<Checkbox>
							<span style={{ fontSize: '12px' }}>
								I've read and accepted the <Link target="_blank"  to="/terms">Terms and Conditions</Link>
							</span>
						</Checkbox>
					</Form.Item>
				</Col>
				<Col>
					<Form.Item
						valuePropName="checked"
						rules={[
						  {
							validator: (_, value) =>
							  value ? Promise.resolve() : Promise.reject('You must agree to the Privacy Policy'),
						  },
						]}
						name="privacy"
						valuePropName="checked">
						<Checkbox>
							<span style={{ fontSize: '12px' }}>
								I've read and accepted the <Link target="_blank"  to="/policies">Privacy Policy</Link>
							</span>
						</Checkbox>
					</Form.Item>
				</Col>
			</Row>
			<Row justify="center">
				<Form.Item>
					<Button
						type="primary"
						className="primary mt-4"
						shape="round"
						htmlType="submit"
						loading={isUploading || isSubmitting}
						disabled={isUploading || isSubmitting}>
						{!isUploading
							? !isSubmitting
								? 'Continue'
								: 'Submitting'
							: 'Uploading Files'}
					</Button>
				</Form.Item>
			</Row>
		</Form>
	);
};

export { SignUpForm };
