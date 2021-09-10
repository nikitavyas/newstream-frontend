import React, { Component } from 'react';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Col,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Row,
	Select,
	Table,
	Tabs,
	Typography,
	Pagination,
} from 'antd';
import { withApollo } from 'react-apollo';
import { Loader } from '../../Components/Loader/Loader';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';
import ReporterGoogleMap from '../../Components/ReporterGoogleMap/ReporterGoogleMap';
import { ApplicantDetailsTable } from '../../Components/Tables';
import {
	ACCEPT_APPLICANT,
	GET_ALL_REPORTERS_WEB,
	GET_ALL_REPORTER_CONTRACTS,
	GET_APPLICANTS,
	GET_INVITED_REPORTERS,
	REJECT_APPLICANT,
	REPORTER_INVITE,
	RESEND_REPORTER_INVITE,
	SAVE_REPORTER,
	TOGGLE_BLOCK_REPORTER,
} from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import ContractSelect from '../../Components/ContractSelect';
import { ReporterModalForm } from './ReporterModalForm';
import './ApplicantReporters.css';
import queryString from 'query-string';
import {Helmet} from "react-helmet";


const { TabPane } = Tabs;
const { Column } = Table;
const { confirm } = Modal;
const { Title } = Typography;
let allFilters = [];
class ApplicantReporters extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('ApplicantReporters');
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
			contractData: [],
			selectedContracts: [],
			tableLoading: false,
			applicantReporters: [],
			reporterData: [],
			isLoading: true,
			totalReporters: 0,
			page: 1,
			limit: 10,
			type:undefined
		};
		this.onFinish = this.onFinish.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.OnReporterFilterChange = this.OnReporterFilterChange.bind(this);
		this.handleReporterCancel = this.handleReporterCancel.bind(this);
		this.updateApplicantStatus = this.updateApplicantStatus.bind(this);
		this.getApplicants = this.getApplicants.bind(this);
	}

	formRef = React.createRef();
	contractFormRef = React.createRef();
	componentDidMount() {
		SentryLog({
			category: 'Content Creator',
			message: 'Content Creator Page Loaded ',
			level: Severity.Info,
		});
		let variables = {
			page: this.state.page,
			limit: this.state.limit,
			isApplicant: true,
		};
		let pathname = this.props.location.pathname
		let type = '';
		if (pathname.search('/reporters/') != -1) 
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
			// if(data.getAllReporterData){
			if (params.order && params.orderby) {
				variables['order'] =
					params.order == 'ascend'
						? 'ASC'
						: params.order == 'descend'
						? 'DESC'
						: undefined;
				variables['orderby'] =
					params.order !== undefined ? params.orderby : undefined;
				this.setState({
					order: params.order,
					orderby: params.orderby,
				});
			// }
		}
		}
		this.getAllReporterData(variables);
		this.getAllContract();
	}
	getApplicants() {
		this.setState({ tableLoading: true });
		const { client } = this.props;
		client
			.watchQuery({
				query: GET_APPLICANTS,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading, error }) => {
				this.setState({ tableLoading: loading });
				this.loading = loading;
				if (data !== undefined) {
					this.setState({ applicantReporters: data.getReporters });
				}
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later2');
					}
				}
			});
	}

	getInvitedReporterData() {
		const { client } = this.props;
		client
			.watchQuery({
				query: GET_INVITED_REPORTERS,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading, error }) => {
				this.loading = loading;
				if (data !== undefined) {
					this.setState({ invitedReporters: data.getInviteReporterList });
				}
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);

						message.destroy();
						message.error('Something went wrong please try again later3');
					}
				}
			});
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
		this.getAllReporterData(value);
		return this.state.allReporters;
	}

	getAllReporterData(variables) {
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
					query: GET_ALL_REPORTERS_WEB,
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
							applicantReporters: data.getAllReportersWeb.reporters,
							totalReporters: data.getAllReportersWeb.totalReporters,
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
		} catch (error) {
			SentryError(error);
		}
	}

	handleCancel() {
		this.setState({ inviteFormvisible: false, showUpdateContract: false });
	}
	getData() {
		this.getAllReporterData();
	}
	toggleBlockReporter(data, status) {
		try {
			const userId = data.userId;
			if (status) {
				analytics.logEvent('blockReporter', {
					action: 'submit',
					label: 'email',
					value: data.email,
				});
			} else {
				analytics.logEvent('activateReporter', {
					action: 'submit',
					label: 'email',
					value: data.email,
				});
			}
			const { client } = this.props;
			let thisData = this;
			let msg = status
				? 'Are you sure you want to block ' + data.name + '?'
				: 'Are you sure you want to active ' + data.name + '?';
			confirm({
				icon: status ? (
					<div className="popDeleteicon">
						<img alt="" src={require('../../Assets/images/blocked.svg')} />
					</div>
				) : (
					<div className="popDeleteicon">
						<img alt="" src={require('../../Assets/images/active.svg')} />
					</div>
				),
				content: msg,
				className: 'notificationModal',
				width: 500,
				onCancel() {},
				onOk() {
					client
						.mutate({
							variables: { userId: userId, isActive: !status },
							mutation: TOGGLE_BLOCK_REPORTER,
						})
						.then((result) => {
							let reporters = thisData.state.allReporters.map((data) => {
								if (userId === data.userId) {
									data.isActive = result.data.toggleBlockReporter.isActive;
								}
								return data;
							});
							thisData.setState({ allReporters: reporters });
							Modal.success({
								content: 'Status changed succesfully!!',
								icon:(
									<div className="popimageBox">
										<img alt="" src={require('../../Assets/images/purchased-successfully.png')} />
									</div>
								),
								className: 'notificationModal',
								width:500,
							});
						})
						.catch((error, result) => {
							if (error.graphQLErrors && error.graphQLErrors.length > 0) {
								message.destroy();
							} else {
								SentryError(error);
								message.destroy();
								message.error('Something went wrong please try again later9');
							}
						});
				},
			});
		} catch (error) {
			SentryError(error);
		}
	}

	changeSelection = (event, record) => {
		this.props.history.push('/reporters/applicants/' + record.userId);
	};

	updateApplicantStatus = ({ action, userId }) => {
		this.setState({ tableLoading: true });
		const { client } = this.props;
		let mutation = '';
		if (action === 'accept') {
			mutation = ACCEPT_APPLICANT;
		}
		if (action === 'reject') {
			mutation = REJECT_APPLICANT;
		}
		try {
			client
				.mutate({
					mutation: mutation,
					variables: {
						userId,
					},
				})
				.then(() => {
					message.success(`Applicant ${action}ed successfully`);
					this.setState({ tableLoading: false });
					this.getApplicants();
				});
		} catch (error) {
			this.setState({ tableLoading: true });
			SentryError(error);
		}
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
				this.getAllReporterData();
				message.success('Contract updated successfully');
			} else {
				message.error('Contract should not be empty');
			}
		} catch (error) {
			// console.log('saveReorter error', error);
		}
	};
	onrowSelection = (row) => {
		// console.log(row);
		let contractsData = [];
		row.map((data) => {
			if (data != undefined) {
				contractsData.push(data.contractId);
			}
		});
		this.setState({ selectedContracts: contractsData });
	};

	getAllContract = async () => {
		const { client } = this.props;
		try {
			this.setState({ isContractLoading: true });
			const {
				data: { getReporterContract },
			} = await client.query({
				query: GET_ALL_REPORTER_CONTRACTS,
				fetchPolicy: 'network-only',
			});
			// console.log(getReporterContract);
			let selectedContracts = [];
			getReporterContract.map((data, key) => {
				if (data.isRequired == true) {
					selectedContracts.push(data.contractId);
				}
			});
			this.setState({
				isContractLoading: false,
				contractData: getReporterContract,
				selectedContracts: selectedContracts,
			});
		} catch (error) {
			if (error.graphQLErrors && error.graphQLErrors[0]) {
			} else {
				SentryError(error);
				message.error('Something went wrong please try again later.11');
			}
		}
	};
	updateContract = (reporterData) => {
		this.setState({ reporterData, showUpdateContract: true }, () => {});
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
		if (sorter.order != undefined) {
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
					{ this.state.type == 'active' ? "Active" :
					this.state.type == 'applicants' ? "Applicants" : "Invited"}
					)</title>
				</Helmet>
				<OnboardingTour tourName={['reporter']} />
				{allFilters.length > 0 ?
									<h3 className="mb-3 font-weight-bold font16"> Total {this.state.totalReporters > 0 ? this.state.totalReporters + ' results' : '0 result'}  found for {allFilters.join(',')} </h3>:
									<h3 className="mb-3 font-weight-bold font16">Applicants</h3>}
					{this.state.isLoading ? (
						<Loader />
					) : (
						<>
							<ApplicantDetailsTable
								refreshTable={this.getApplicants}
								contractList={this.state.contractData}
								loader={this.state.tableLoading}
								data={this.state.applicantReporters}
								viewReporter={this.changeSelection}
								updateStatus={this.updateApplicantStatus}
								onChange={this.onChange}
								order={this.state.order}
								orderby={this.state.orderby}
							/>

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
					width={1000}
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
						<Row>
							<Col md={12} xs={24}>
								<Form.Item
									label="First Name"
									className="px-2 mb-3"
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
								<Form.Item
									label="Last Name"
									className="px-2 mb-3"
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
						<Form.Item
							label="Email"
							className="px-2 mb-3"
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
					<div>
						{this.state.isContractLoading ? (
							<Loader />
						) : (
							<ContractSelect
								contractData={this.state.contractData}
								onrowSelection={this.onrowSelection}
							/>
						)}
					</div>
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
									className="mb-2"
									rules={[
										{
											type: 'number',
											min: 1,
											message: "Please enter positive number only",
										},
									]}>
									<InputNumber onKeyDown={this.handleKeypress}
								ref={this.inputRef}
								onWheel={this.onWheel}
								min={1}
								placeholder="Enter Grace Period"
								parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
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
							getData={(e) => this.getAllReporterData()}
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

ApplicantReporters = withApollo(ApplicantReporters);

export { ApplicantReporters };
