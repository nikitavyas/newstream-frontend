import { EyeFilled } from '@ant-design/icons';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Col,
	Empty,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Row,
	Select,
	Table,
	Tooltip,
	Typography,
	Pagination,
} from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { withApollo } from 'react-apollo';
import { Loader } from '../../Components/Loader/Loader';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';
import ReporterGoogleMap from '../../Components/ReporterGoogleMap/ReporterGoogleMap';
import {
	DELETE_INVITE,
	GET_ALL_REPORTERS_INVITEE,
	GET_ALL_REPORTER_CONTRACTS,
	REPORTER_INVITE,
	RESEND_REPORTER_INVITE,
	SAVE_REPORTER,
} from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import ContractSelect from '../../Components/ContractSelect';
import { ReporterModalForm } from './ReporterModalForm';
import './InvitedReporters.css';
import queryString from 'query-string';

import {Helmet} from "react-helmet";

const { Column } = Table;
const { confirm } = Modal;
const { Title } = Typography;
let allFilters = [];
class InvitedReporters extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Reporters');
		this.state = {
			firstName: null,
			lastName: null,
			email: null,
			inviteId: null,
			allReporters: [],
			invitedReporters: [],
			inviteFormvisible: false,
			inviteData: {},
			isViewDetails: false,
			expiryDate: 0,
			contractData: [],
			selectedContracts: [],
			tableLoading: false,
			applicantReporters: [],
			reporterData: [],
			isLoading: true,
			totalReporters: 0,
			page: 1,
			limit: 10,
			type:undefined,
			isButtonDisabled: false
		};
		this.onFinish = this.onFinish.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.OnReporterFilterChange = this.OnReporterFilterChange.bind(this);
		this.handleReporterCancel = this.handleReporterCancel.bind(this);
		this.inputRef = React.createRef();
	}

	formRef = React.createRef();
	contractFormRef = React.createRef();
	componentDidMount() {
		SentryLog({
			category: 'Reporters',
			message: 'Reporters Page Loaded ',
			level: Severity.Info,
		});
		let variables = {
			page: this.state.page,
			limit: this.state.limit,
			isActive: false,
		};
		let pathname = this.props.location.pathname
		let type = '';
		if (pathname.search('/reporters/') !== -1) 
		{
			type = pathname.replace('/reporters/', '');
			
		}
		this.setState({type : type})
		let params = queryString.parse(this.props.location.search);
		if (params) {
			if (params.page) {
				variables['page'] = +params.page;
				this.setState({
					page: +params.page,
				});
			}
			if (params.limit) {
				variables['limit'] = +params.limit;
				this.setState({
					limit: +params.limit,
				});
			}
			if (params.order && params.orderby) {
				variables['order'] =
					params.order === 'ascend'
						? 'ASC'
						: params.order === 'descend'
						? 'DESC'
						: undefined;
				variables['orderby'] =
					params.order !== undefined ? params.orderby : undefined;
				this.setState({
					order: params.order,
					orderby: params.orderby,
				});
			}
		}
		
		this.getInvitedReporterData(variables);
		this.getAllContract();
	}

	showModal = () => {
		this.setState({
			showReporterModel: true,
		});
	};

	handleReporterCancel = (e) => {
		this.setState({
			showReporterModel: false,
		});
	};

	OnReporterFilterChange(value) {
		this.setState({ allReporters: [] });
		this.getInvitedReporterData(value);
		return this.state.allReporters;
	}

	getInvitedReporterData(variables) {
		try {
			this.setState({ isLoading: true });
			const { client } = this.props;
			let params = queryString.parse(this.props.location.search);
			if(params.search){
				variables['search'] = params.search;
				allFilters.push(params.search)
			}
			client
				.query({
					query: GET_ALL_REPORTERS_INVITEE,
					fetchPolicy: 'network-only',
					variables: variables,
				})
				.then(({ data, loading, error }) => {
					this.loading = loading;
					if (data !== undefined) {
						if (error) {
							if (error.graphQLErrors && error.graphQLErrors.length > 0) {
								message.destroy();
							} else {
								SentryError(error);
								message.destroy();
								message.error('Something went wrong please try again later4');
							}
						}
						this.setState({
							isLoading: false,
							allReporters: data.getAllReporterInvites.invites,
							totalReporters: data.getAllReporterInvites.totalInvites,
						});
					}
				});
		} catch (error) {
			// console.log(error);
			SentryError(error);
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				message.destroy();
			} else {
				SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later6');
			}
		}
	}

	onFinish(values) {
		try {
			analytics.logEvent('inviteReporter', {
				action: 'submit',
				label: 'email',
				value: values.email,
			});
			const { client } = this.props;
			values.contracts = this.state.selectedContracts;
			if (this.state.inviteId != null) {
				client
					.mutate({
						mutation: REPORTER_INVITE,
						variables: { ...values },
					})
					.then((result) => {
						if (result.data) {
							this.setState({ inviteFormvisible: false });
							Modal.success({
								icon:(
									<div className="popimageBox">
										<img alt="" src={require('../../Assets/images/purchased-successfully.png')} />
									</div>
								),
								className: 'notificationModal',
								width:500,
								content: 'Invitation sent',
							});
							this.getInvitedReporterData();
						} else if (result.errors) {
							Modal.error({
								content: result.errors[0].message,
							});
						}
					})
					.catch((error, result) => {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);
							message.destroy();
							message.error('Something went wrong please try again later7');
						}
					});
			} else {
				client
					.mutate({
						variables: { ...values },
						mutation: REPORTER_INVITE,
					})
					.then((result) => {
						this.getInvitedReporterData();
						if (result.data) {
							this.setState({ inviteFormvisible: false });
							Modal.success({
								icon:(
									<div className="popimageBox">
										<img alt="" src={require('../../Assets/images/purchased-successfully.png')} />
									</div>
								),
								className: 'notificationModal',
								width:500,
								content: 'Invitation sent',
							});
						} else if (result.errors) {
							Modal.error({
								content: result.errors[0].message,
							});
						}
					})
					.catch((error, result) => {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);

							message.destroy();
							message.error('Something went wrong please try again later8');
						}
					});
			}
		} catch (error) {
			SentryError(error);
		}
	}

	_viewDetails = (data) => {
		// console.log(data);
		this.setState({
			inviteData: data,
			isViewDetails: true,
		});
	};

	resentInvitation(data) {
		
		try {
			analytics.logEvent('resendReporterInvitation', {
				action: 'submit',
				label: 'email',
				value: data.email,
			});
			const { client } = this.props;
			this.setState({isLoading:true})
			client
				.mutate({
					variables: { inviteId: data.inviteId },
					mutation: RESEND_REPORTER_INVITE,
				})
				.then((result) => {
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
						content: 'Invitation resent successfully!',
					});
					
					this.getInvitedReporterData();
					if (data.resendReporterInvite.status === 'resend') {
					}
				})
				
				.catch((error) => {});
				if(data.inviteId){
					setTimeout(() => this.setState({ isButtonDisabled: true }), 30000);
				}

		} catch (error) {
			SentryError(error);
		}
	}

	handleCancel() {
		this.setState({ inviteFormvisible: false, showUpdateContract: false });
	}
	getData() {
		this.getInvitedReporterData();
	}
	changeSelection = (event, record) => {
		this.props.history.push('/reportersProfile/' + record.userId);
	};

	handleUpdateContract = async (e) => {
		try {
			const { client } = this.props;
			const {
				reporterData: { userId, email, name },
				selectedContracts,
			} = this.state;
			if (selectedContracts.length > 0) {
				this.setState({ isLoading: true, showUpdateContract: false });
				await client.mutate({
					mutation: SAVE_REPORTER,
					variables: {
						userId,
						email,
						name,
						gracePeriod: e.gracePeriod,
						contracts: selectedContracts,
					},
				});
				this.getInvitedReporterData();
				message.success('Contract updated successfully');
			} else {
				message.error('Contract should not be empty');
			}
		} catch (error) {
			// console.log('saveReorter error', error);
		}
	};
	deleteReporter = (data) => {
		// console.log(data);
		analytics.logEvent('deleteReporter', {
			action: 'submit',
			label: 'email',
			value: data.email,
		});
		const inviteId = data.inviteId;
		const { client } = this.props;
		let thisData = this;
		let msg = (
			<div>
				Are you sure you want to delete <span>"{data.email}"</span>?
			</div>
		);
		confirm({
			icon: (
				<div className="popDeleteicon">
					<img alt="" src={require('../../Assets/images/trash-icon.svg')} />
				</div>
			),
			content: msg,
			okText:"Delete",
			className: 'notificationModal',
			width: 500,
			onCancel() {},
			onOk() {
				client
					.mutate({
						variables: { inviteId: inviteId },
						mutation: DELETE_INVITE,
					})
					.then((result) => {
						thisData.getInvitedReporterData();
						Modal.success(
							{
								
								content: 'Content Creator deleted succesfully!!',
								icon:(
									<div className="popimageBox">
										<img alt="" src={require('../../Assets/images/purchased-successfully.png')} />
									</div>
								),
								className: 'notificationModal',
								width:500,
							},
							() => {}
						);
					})
					.catch((error, result) => {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);
							message.destroy();
							message.error('Something went wrong please try again later10');
						}
					});
			},
		});
	};

	onrowSelection = (row) => {
		let contractsData = [];
		row.map((data) => {
			if (data !== undefined) {
				contractsData.push(data.contractId);
			}
		});
		this.setState({ selectedContracts: contractsData });
	};

	getAllContract = async () => {
		const { client } = this.props;
		try {
			this.setState({ isContractLoading: true });
			//setTableLoader(true);
			const {
				data: { getReporterContract },
			} = await client.query({
				query: GET_ALL_REPORTER_CONTRACTS,
				fetchPolicy: 'network-only',
			});
			//setContractData(getReporterContract);
			let selectedContracts = [];
			getReporterContract.map((data, key) => {
				if (data.isRequired === true) {
					selectedContracts.push(data.contractId);
				}
			});
			this.setState({
				isContractLoading: false,
				contractData: getReporterContract,
				selectedContracts: selectedContracts,
			});
			// setTableLoader(false);
		} catch (error) {
			if (error.graphQLErrors && error.graphQLErrors[0]) {
			} else {
				SentryError(error);
				message.error('Something went wrong please try again later.11');
			}
		}
	};
	updateContract = (reporterData) => {
		//this.getAllContract();
		this.setState({ reporterData, showUpdateContract: true }, () => {
			// this.contractFormRef.current.setFieldsValue({
			// 	gracePeriod:reporterData.gracePeriod
			// })
		});
	};
	onPageChange = (val, size) => {
		let pathname = this.props.location.pathname;
		let searchParams = new URLSearchParams(this.props.location.search);
		searchParams.set('page', val);
		searchParams.set('limit', size);
		this.props.history.push({
			pathname: pathname,
			search: searchParams.toString(),
		});
	};
	onChange = (pagination, filters, sorter, extra) => {
		let pathname = this.props.location.pathname;
		let searchParams = new URLSearchParams(this.props.location.search);
		if (sorter.order !== undefined) {
			searchParams.set('order', sorter.order);
			searchParams.set('orderby', sorter.columnKey);
		} else {
			searchParams.delete('order');
			searchParams.delete('orderby');
		}
		searchParams.set('page', 1);
		this.props.history.push({
			pathname: pathname,
			search: searchParams.toString(),
		});
	};
	handleKeypress = (e)=> {
		const characterCode = e.key
		if (characterCode === 'Backspace') return
	
		const characterNumber = Number(characterCode)
		if (characterNumber >= 0 && characterNumber <= 9) {
		  if (e.currentTarget.value && e.currentTarget.value.length) {
			return
		  } else if (characterNumber === 0) {
			e.preventDefault()
		  }
		} else {
		  e.preventDefault()
		}
	  }
	onWheel = () => {
		this.inputRef.current.blur();
	  };
	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Buyer |
					Reporters (
					{ this.state.type === 'active' ? "Active" :
					this.state.type === 'applicants' ? "Applicants" : "Invited"}
					)</title>
				</Helmet>

				<OnboardingTour tourName={['reporter']} />
				<div className="d-flex align-items-center justify-content-between mb-3">
				{allFilters.length > 0 ?
							<h3 className="mb-0 font-weight-bold font16"> Total {this.state.totalReporters > 0 ? this.state.totalReporters + ' results' : '0 result'}  found for {allFilters.join(',')} </h3>:
							<h3 className="mb-0 font-weight-bold font16">Invited </h3>}
					<div className="text-right">
						<Button
							type="primary"
							className="tour-reporter-invite"
							// loading={this.state.isLoading}
							onClick={() => {
								//	this.getAllContract();
								this.setState({ inviteFormvisible: true });
							}}>
							Invite Content Creator
						</Button>
					</div>
				</div>
					{this.state.isLoading ? (
						<Loader />
					) : (
						<>
							<Table
								className="commontable mb-3"
								//scroll={{ y: 500 }}
								locale={{
									emptyText: (
										<Empty description={<span>No data available</span>} />
									),
								}}
								dataSource={this.state.allReporters}
								pagination={false}
								onChange={this.onChange}>
								<Column
									title="Email"
									data-title="Email"
									dataIndex="email"
									key="email"
									ellipsis="true"
									sorter={true}
									sortOrder={
										this.state.order && this.state.orderby === 'email'
											? this.state.order
											: null
									}
								/>
								<Column
									title="Status"
									key="status"
									render={(rowData) => (
										<React.Fragment>
											{rowData.status === 'resent' ? (
												<div className="badge reportactive reportresent">
													{rowData.status}
												</div>
											) : rowData.status === 'unused' ? (
												<div className="badge reportactive reportunused">
													{rowData.status}
												</div>
											) : rowData.status ===	 'clicked' ? (
												<div className="badge reportactive">
													{rowData.status}
												</div>
											) : null}
										</React.Fragment>
									)}
									sorter={true}
									sortOrder={
										this.state.order && this.state.orderby === 'status'
											? this.state.order
											: null
									}
								/>
								<Column
									title="Created By"
									key="createdBy"
									render={(rowData) => (
										<React.Fragment>
											{rowData.createdBy && rowData.createdBy.name
												? rowData.createdBy.name
												: null}
										</React.Fragment>
									)}
									sorter={true}
									sortOrder={
										this.state.order && this.state.orderby === 'createdBy'
											? this.state.order
											: null
									}
								/>
								<Column
									title="Created Date"
									key="createdDate"
									render={(createdBy, record) => (
										<React.Fragment>
											{moment(
												new Date(
													parseFloat(record.updatedDate || record.createdDate)
												)
											).format('MM/DD/YYYY')}
										</React.Fragment>
									)}
									sorter={true}
									sortOrder={
										this.state.order && this.state.orderby === 'createdDate'
											? this.state.order
											: null
									}
								/>
								
								<Column
									className="actionLast"
									title="Action"
									render={(rowData) => {
										const invitedDate = moment(
											new Date(
												parseFloat(rowData.updatedDate || rowData.createdDate)
											)
										);
										const today = moment();
										return (
											<div className="action-btns">
												<Tooltip placement="top" title="View details">
													<Button
														shape="circle"
														icon={<EyeFilled />}
														className="cursorpointer"
														onClick={(e) => this._viewDetails(rowData)}
													/>
												</Tooltip>
												<Tooltip placement="top" title="Resend invitation">
													
													<Button
														shape="circle"
														icon={<CustIcon type="sendicon" />}
														className="cursorpointer"
														onClick={() => this.resentInvitation(rowData)}
														disabled={
															!(
																today.diff(invitedDate, 'hours') >=
																24
															)	
														}
														/>
												</Tooltip>
												<Tooltip placement="top" title="Delete invitation">
													<Button
														shape="circle"
														icon={<CustIcon type="deleteicon" />}
														className="cursorpointer"
														onClick={(event) => this.deleteReporter(rowData)}
													/>
												</Tooltip>
											</div>
										);
									}}
								/>
							</Table>
							<Pagination
								current={this.state.page}
								total={this.state.totalReporters}
								onChange={this.onPageChange}
								showSizeChanger
								defaultPageSize={this.state.limit}
								showTotal={(total) => `Total ${total} items`}
							/>
						</>
					)}

				<Modal
					title=""
					visible={this.state.showReporterModel}
					footer={null}
					onCancel={this.handleReporterCancel}
					width={1170}
					wrapClassName="addReqMapPopup">
					<div className="d-flex flex-md-row flex-column align-items-md-center justify-content-md-between">
						<Title level={4} strong="false" className="pageTitle mt-0">
							Content Creator map view
						</Title>
						<div className="d-flex flex-row align-items-center">
							<span className="mr-2">Filter By </span>
							<Select
								className="filterbySelect"
								placeholder="Last Activity"
								onChange={this.OnReporterFilterChange}>
								<Select.Option value="">
									<span className="timeCir col3"></span>All
								</Select.Option>
								<Select.Option value="6 HOUR">
									<span className="timeCir col1"></span>Before 6 Hours
								</Select.Option>
								<Select.Option value="48 HOUR">
									<span className="timeCir col2"></span>Before 48 Hours
								</Select.Option>
								<Select.Option value="1 WEEK">
									<span className="timeCir col3"></span>Before 1 Week
								</Select.Option>
							</Select>
						</div>
					</div>
					<ReporterGoogleMap
						reporters={this.state.allReporters}
						showSelection={false}
					/>
				</Modal>

				<Modal
					title="Invite Content Creator"
					destroyOnClose={true}
					visible={this.state.inviteFormvisible}
					onCancel={this.handleCancel}
					width={1024}
					wrapClassName="inviteReporterModel"
					footer={[
						<Button form="myForm" htmlType="submit" type="primary">
							Send Invitation
						</Button>,
						<Button key="back" onClick={this.handleCancel}>
							Cancel
						</Button>,
					]}>
					<Form
						layout="vertical"
						id="myForm"
						name="myForm"
						ref={this.formRef}
						onFinish={this.onFinish}
						className="inviteReporterForm">
						<Row gutter={10}>
							<Col md={12} xs={24}>
								<div className="ant-col ant-form-item-label d-flex flex-row">
									<label htmlFor="First Name" title="First Name">
										First Name
									</label>
								</div>
								<Form.Item
									//	label="First Name"
									className="mb-3"
									name="firstName"
									rules={[
										{
											required: true,
											message: 'Please input first name',
										},
										{
											pattern: /^[a-zA-Z]+$/i,
											message: 'The entry can only contain characters',
										},
										{
											min: 2,
											message: 'First name must have atleast 2 characters',
										},
									]}>
									<Input value={this.state.firstName} />
								</Form.Item>
							</Col>
							<Col md={12} xs={24}>
								<div className="ant-col ant-form-item-label d-flex flex-row">
									<label htmlFor="Last Name" title="Last Name">
										Last Name
									</label>
								</div>
								<Form.Item
									//label="Last Name"
									className="mb-3"
									name="lastName"
									rules={[
										{
											required: true,
											message: 'Please input last name',
										},
										{
											pattern: /^[a-zA-Z]+$/i,
											message: 'The entry can only contain characters',
										},
										{
											min: 2,
											message: 'Last name must have atleast 2 characters',
										},
									]}>
									<Input value={this.state.lastName} />
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
							className="mb-3"
							name="email"
							rules={[
								{
									type: 'email',
									message: 'Kindly enter a valid email address',
								},
								{
									required: true,
									message: 'Please input email address',
								},
							]}>
							<Input value={this.state.email} />
						</Form.Item>
					</Form>
					{/* <div>
						{this.state.isContractLoading ? (
							<Loader />
						) : (
							<ContractSelect
								contractData={this.state.contractData}
								onrowSelection={this.onrowSelection}
							/>
						)}
					</div> */}
				</Modal>
				<Modal
					title="Update Contract"
					destroyOnClose={true}
					visible={this.state.showUpdateContract}
					onCancel={this.handleCancel}
					width={1100}
					wrapClassName="updateContractModel"
					footer={[
						<Button form="myForm" htmlType="submit" type="primary">
							Update Contract
						</Button>,
						<Button key="back" onClick={this.handleCancel}>
							Cancel
						</Button>,
					]}>
					<Form
						layout="vertical"
						id="myForm"
						name="myForm"
						onFinish={this.handleUpdateContract}
						ref={this.contractFormRef}
						fields={[
							{
								name: ['gracePeriod'],
								value: this.state.reporterData.gracePeriod,
							},
						]}
						className="inviteReporterForm">
						<Row>
							<Col md={24} xs={24}>
								<Form.Item
									name="gracePeriod"
									label="Grace Period (In Days)"
									className="mb-3"
									rules={[
										{ type: 'number',min: 1, message: 'Please enter number only' },
									]}>
									<InputNumber onKeyDown={this.handleKeypress}
									ref={this.inputRef}
									onWheel={this.onWheel}
									min="1"  placeholder="Enter Grace Period" />
								</Form.Item>
							</Col>
						</Row>
					</Form>
					{this.state.isContractLoading ? (
						<Loader />
					) : (
						<ContractSelect
							contractData={this.state.contractData}
							selectedContracts={this.state.reporterData.contracts}
							onrowSelection={this.onrowSelection}
							userId={this.state.reporterData.userId}
							getData={(e) => this.getInvitedReporterData()}
						/>
					)}
				</Modal>
				{this.state.isViewDetails &&
					this._renderShowDetailsForm(this.state.isViewDetails)}
			</React.Fragment>
		);
	}

	_renderShowDetailsForm = (show) => {
		return (
			<Modal
				title="View Content Creator"
				visible={show}
				onCancel={(e) => {
					this.setState({ isViewDetails: false });
				}}
				width={700}
				wrapClassName="inviteReporterModel"
				footer={[
					!show && (
						<Button form="myForm" htmlType="submit" type="primary">
							Send Invitation
						</Button>
					),
					<Button
						key="back"
						onClick={(e) => {
							this.setState({ isViewDetails: false });
						}}>
						Close
					</Button>,
				]}>
				{show && <ReporterModalForm {...this.state.inviteData} />}
			</Modal>
		);
	};
}

InvitedReporters = withApollo(InvitedReporters);

export { InvitedReporters };
