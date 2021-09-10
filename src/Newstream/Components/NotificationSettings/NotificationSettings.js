import React, { Component } from 'react';
import './NotificationSettings.css';
import { Row, Col, Switch, Typography, Card, Collapse, Checkbox, Button, message } from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { SAVE_NOTIFICATION_SETTINGS } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { Loader } from '../../Components/Loader';
import { MailFilled, BellFilled } from '@ant-design/icons';
import Form from 'antd/lib/form/Form';
const { Panel } = Collapse;

const { Title } = Typography;

class NotificationSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			request: false,
			story: false,
			other: false,
			loading: false,
			selectedNotificationKeys: ['1'],
			notificationData: props.notificationData,
			SubmitLoading: false
		};

		this.onSettingChange = this.onSettingChange.bind(this);
		this.onPanelChange = this.onPanelChange.bind(this);
	}
	componentDidMount() {
		//	this.getData();
	}
	componentWillReceiveProps(nextProps) {
		// console.log(this.state.selectedNotificationKeys);
		// console.log(nextProps);
		if (nextProps.notificationData != this.state.notificationData) {
			this.setState({
				notificationData: nextProps.notificationData,
				loading: false,
			});
		}

		// console.log('dfdf');
	}
	onSettingChange(e, other, value, i) {
		// this.setState({ loading: true });
		// let variable = {};
		// variable.notificationGroupSettingId = e.target.name;
		// if (value === 'email') {
		// 	variable.email = e.target.checked;
		// 	variable.push = other;
		// } else if (value === 'push') {
		// 	variable.push = e.target.checked;
		// 	variable.email = other;
		// }
		// const { client } = this.props;
		// client
		// 	.mutate({
		// 		variables: variable,
		// 		mutation: SAVE_NOTIFICATION_SETTINGS,
		// 	})
		// 	.then((result) => {
		this.setState({ selectedNotificationKeys: [(i + 1).toString()] });
		//			this.props.getData();
		//this.setState({loading:false})
		// 	})
		// 	.catch((error) => {});
		// //this.setState({loading:false})
	}
	onPanelChange(key) {
		this.setState({ selectedNotificationKeys: key });
	}
	saveNotication() {
		this.setState({ SubmitLoading: true })
		let updatingData = [];
		console.log(this.state.notificationData);
		this.state.notificationData.map((data, index) => {
			data.notgroupsettings.map((data1, index1) => {
				updatingData.push({ email: data1.notificationSettings.email, push: data1.notificationSettings.push, notificationGroupSettingId: data1.notificationGroupSettingId })
			})
		})
		console.log(updatingData)
		const { client } = this.props;
		client
			.mutate({
				variables: { notificationData: updatingData },
				mutation: SAVE_NOTIFICATION_SETTINGS,
			})
			.then((result) => {
				this.setState({ SubmitLoading: false })
				message.success(result.data.saveMyNotificationSettings.message)
			})
			.catch((error) => {
				this.setState({ SubmitLoading: false })
			});

	}
	render() {
		return (
			<React.Fragment>
				{!this.state.loading ? (

					<Card className="rightSideSetting notificationbox">
						<Collapse
							expandIconPosition="right"
							defaultActiveKey={this.state.selectedNotificationKeys}
							onChange={this.onPanelChange}>
							{/* <Form>
									<Form.List name="notificationSettings">

									</Form.List>
								</Form> */}

							{this.state.notificationData.map((data, index) => {
								return (
									<Panel
										header={data.name}
										key={(index + 1).toString()}
										extra={
											this.state.selectedNotificationKeys.indexOf(
												(index + 1).toString()
											) > -1 && (
												<>
													<span className="notifylabel">
														<MailFilled />
														Email
													</span>
													<span className="notifylabel">
														<BellFilled />
														Push
													</span>
												</>
											)
										}>
										{data.notgroupsettings.map((data1, index1) => {
											return (
												<div key={index1} className="notifylist">
													<Row>
														<Col xl={16} md={14} xs={12}>
															<label>{data1.title}</label>
														</Col>
														<Col
															xl={4}
															md={5}
															xs={6}
															className="notifycheckbox">
															<Checkbox
																name={data1.notificationGroupSettingId}
																checked={data1.notificationSettings.email}
																disabled={this.state.SubmitLoading}
																onChange={(e) => {
																	let currectObj = this.state.notificationData;
																	console.log(e)
																	console.log(currectObj[index].notgroupsettings[index1].notificationSettings.email)
																	currectObj[index].notgroupsettings[index1].notificationSettings.email = !currectObj[index].notgroupsettings[index1].notificationSettings.email;
																	console.log(currectObj[index].notgroupsettings[index1].notificationSettings.email)
																	this.setState({ notificationData: currectObj })
																}
																}
															/>
														</Col>
														<Col
															xl={4}
															md={5}
															xs={6}
															className="notifycheckbox">
															<Checkbox
																name={data1.notificationGroupSettingId}
																checked={data1.notificationSettings.push}
																disabled={this.state.SubmitLoading}
																onChange={(e) => {
																	let currectObj = this.state.notificationData;
																	currectObj[index].notgroupsettings[index1].notificationSettings.push = !currectObj[index].notgroupsettings[index1].notificationSettings.push;
																	this.setState({ notificationData: currectObj })
																}
																}
															/>
														</Col>
													</Row>
												</div>
											);
										})}
									</Panel>
								);
							})}
						</Collapse>
						<div className="text-center pt-0 pt-lg-5">		
						<Button type="primary" size="large" onClick={e => this.saveNotication()} loading={this.state.SubmitLoading}>Save</Button>
						</div>
					</Card>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}

NotificationSettings = withApollo(NotificationSettings);
export { NotificationSettings };
