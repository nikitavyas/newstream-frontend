import { DownloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { captureException as SentryError } from '@sentry/react';
import {
	Button,
	Card,
	Col,
	Comment,
	Empty,
	message,
	Modal,
	Row,
	Table,
	Rate,
} from 'antd';
import { saveAs } from 'file-saver';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { ContactButton } from '../../Components/Buttons/Contact';
import ContractSelect from '../../Components/ContractSelect';
import { COULDBASEURL } from '../../Components/general/constant';
import { getAddress } from '../../Components/general/general';
import { Loader } from '../../Components/Loader/Loader';
import { CustIcon } from '../../Components/Svgs/Svgs';
import {
	GET_ALL_REPORTER_CONTRACTS,
	GET_REPORTER_BY_ID,
	SEND_CONTRACTS_TO_APPLICANT,
	ACCEPT_APPLICANT,
	REJECT_APPLICANT,
} from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import './ReportersProfile.css';
import { ReportersProfileModal } from './ReportersProfileModal';
import { NotFound } from '../NotFound';

const { Column } = Table;

const columns = [
	{
		title: 'Title',
		dataIndex: 'title',
		key: 'title',
		sorter: {
			compare: (a, b) =>
				(a.title.toLowerCase() > b.title.toLowerCase()) * 2 - 1,
		},
	},
	{
		title: 'Price',
		dataIndex: 'price',
		key: 'price',
		sorter: {
			compare: (a, b) => a.price - b.price,
		},
		render: (text) => '$ ' + text,
	},
	{
		title: 'Created Date',
		dataIndex: 'createdDate',
		key: 'createdDate',
		sorter: {
			compare: (a, b) => a.createdDate - b.createdDate,
		},
		render: (text) => (
			<span>{moment(new Date(parseFloat(text))).format('MM/DD/YYYY')}</span>
		),
	},
];
class ReportersProfile extends Component {
	userId = this.props.match.params.id;
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('content Creator`s Profile');
		this.state = {
			reporterData: null,
			stories: [],
			showStories: false,
			contractData: [],
			isLoading: true,
			sendContractModalVisiblity: false,
			selectedContracts: [],
			isSendingContract: false,
			applicantsList: [],
			show404:false
		};
	}
	componentWillMount() {
		this.getData();
		this.getReporterContracts();
	}

	onStatusChange = ({ userId, action }) => {
		this.setState({ isLoading: true });
		const { client } = this.props;

		client
			.mutate({
				variables: {
					userId,
				},
				mutation: action === 'accept' ? ACCEPT_APPLICANT : REJECT_APPLICANT,
			})
			.then(() => {
				message.success(`Applicant ${action}ed successfully`);
				this.getData();
			})
			.catch((error) => {
				this.setState({ isLoading: false });
				SentryError(error);
				message.error(`Unable to ${action} the applicant`);
			});
	};
	getData() {
		const { client } = this.props;
		client
			.query({
				query: GET_REPORTER_BY_ID,
				variables: {
					reporterId: this.userId,
				},
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					if(data.getReporter){
					data.getReporter.location = '';
					if (data.getReporter.locations.length > 0) {
						data.getReporter.location = getAddress(
							data.getReporter.locations
						);
					}
					this.setState({
						reporterData: data.getReporter,
						stories: data.getReporter.stories,
						isLoading: false,
					});
				}else{
					this.setState(
						{ isLoading: false, show404 :true})
				}
				}
			});
	}
	onDownloadInvoice = async (fileName) => {
		saveAs(
			COULDBASEURL + fileName,
			fileName.substring(fileName.indexOf('/') + 1)
		);
	};

	render() {
		return (
			<React.Fragment>
				{this.state.isLoading === true ? (
					<Loader />
				) : this.state.show404 ? <NotFound/> : (
					this.state.reporterData != null && (
						<>
							<div className="globaltitle mb-3">
								<h3 className="mb-lg-0"> Reporter's Profile</h3>
							</div>
							<Card className="mb-3 boxshadow">
								<Row gutter={20}>
									<Col
										lg={3}
										md={4}
										className="d-flex flex-column pr_profile align-items-center">
										<Link
											to={`/reportersProfile/${this.state.reporterData.userId}`}>
											<ProfileAvatar
												size={78}
												name={this.state.reporterData.name}
												imageUrl={this.state.reporterData.profileImage}
											/>
										</Link>
									</Col>
									<Col lg={21} md={20}>
										<div className="d-flex flex-column">
											<div className="pb-2 border-bottom">
												<Row gutter={10}>
													<Col lg={14} md={12} className="mb-2 mb-md-0">
														<h5 className="mb-lg-0 mb-2 font-weight-bold text-break">
															{this.state.reporterData.name}
														</h5>
														{this.state.reporterData.address && (
															<div className="d-flex flex-row text-break ">
																<EnvironmentOutlined className="mr-2 mt-1" />
																{getAddress(this.state.reporterData.address)}
															</div>
														)}
														<div className="d-flex flex-row text-break ">
															<Rate
																disabled
																allowHalf={true}
																character={<CustIcon type="staricon" />}
																defaultValue={this.state.reporterData.ratings}
															/>
														</div>
													</Col>
													<Col lg={10} md={12}>
														<div className="d-flex flex-row  flex-wrap mb-2 mb-md-0">
															<div className="mb-2">
																<ContactButton
																	name={
																		this.state.reporterData.name.split(' ')[0]
																	}
																	phoneNumber={
																		this.state.reporterData.phoneNumber
																	}
																	slackUserId={
																		this.state.reporterData.slackUserId
																	}
																	justButtons={true}
																/>
															</div>
															{!this.state.reporterData.isApplicant && (
																<Button
																	type="primary"
																	className="mb-2 mr-1 mr-lg-2"
																	shape="round"
																	onClick={() => {
																		//this.getReporterContracts();
																		this.setState({
																			inviteFormvisible: true,
																		});
																	}}>
																	Update Reporter
																</Button>
															)}
															{this.state.reporterData.isApplicant && (
																<Fragment>
																	<Button
																		shape="round"
																		className="mb-2 mr-2 rejectBtn"
																		icon={
																			<span role="img" className="anticon">
																				<CustIcon type="reject" />
																			</span>
																		}
																		onClick={() =>
																			this.onStatusChange({
																				userId: this.userId,
																				action: 'reject',
																			})
																		}
																		style={{
																			display:
																				(this.state.reporterData
																					.applicantStatus === 'Rejected' ||
																					this.state.reporterData
																						.applicantStatus === 'Accepted') &&
																				'none',
																		}}>
																		Reject
																	</Button>
																	<Button
																		shape="round"
																		className="mr-2 mb-2 acceptBtn"
																		icon={
																			<span role="img" className="anticon">
																				<CustIcon type="accept" />
																			</span>
																		}
																		onClick={() =>
																			this.onStatusChange({
																				userId: this.userId,
																				action: 'accept',
																			})
																		}
																		style={{
																			display:
																				(this.state.reporterData
																					.applicantStatus === 'Accepted' ||
																					this.state.reporterData
																						.applicantStatus === 'Rejected') &&
																				'none',
																		}}>
																		Accept
																	</Button>
																	{localStorage.getItem("isManager") == 'true' ? 
																	<Button
																		type="primary"
																		onClick={() => {
																			//	this.getReporterContracts();
																			this.setState({
																				sendContractModalVisiblity: true,
																			});
																		}}
																		style={{
																			display:
																				(this.state.reporterData
																					.applicantStatus !== 'Accepted' ||
																					!localStorage.getItem('isManager')) &&
																				'none',
																		}}
																		className="mr-2 mb-2"
																		shape="round">
																		Send Contract
																	</Button> : undefined}
																	<Button
																		type="primary"
																		ghost
																		href={
																			localStorage.getItem('cloudUrl') +
																			this.state.reporterData.resume
																		}
																		target="_blank"
																		className="mb-2"
																		shape="round">
																		View CV
																	</Button>
																	{/* <div d-flex>
																			<Tooltip
																				placement="top"
																				title="Accept applicant">
																				<img
																					alt="Accept"
																					className="cursorpointer tour-reporter-block ActionButton"
																					onClick={() =>
																						this.onStatusChange({
																							userId: this.userId,
																							action: 'accept',
																						})
																					}
																					src={require('../../Assets/images/accept.svg')}
																				/>
																			</Tooltip>
																			<Tooltip
																				placement="top"
																				title="Reject applicant">
																				<img
																					alt="Reject"
																					className="cursorpointer tour-reporter-block ActionButton"
																					onClick={() =>
																						this.onStatusChange({
																							userId: this.userId,
																							action: 'reject',
																						})
																					}
																					src={require('../../Assets/images/reject.svg')}
																				/>
																			</Tooltip>
																		</div> */}
																</Fragment>
															)}
														</div>
													</Col>
												</Row>
											</div>
											<div className="d-flex flex-row mt-3 row">
												<div className="col-lg-4 col-sm-6 col-12 d-flex mb-lg-0 mb-2 flex-column">
													<div className="d-flex">Email Address</div>
													<div className="d-flex">
														<strong className="text-break">
															{this.state.reporterData.email}
														</strong>
													</div>
												</div>
												<div className="col-lg-3 col-6 d-flex mb-lg-0 mb-2 flex-column">
													<div className="d-flex">Phone Number</div>
													<div className="d-flex">
														<strong className="text-break">
															<a
																href={
																	'tel:' + this.state.reporterData.phoneNumber
																}>
																{this.state.reporterData.phoneNumber}
															</a>
														</strong>
													</div>
												</div>
												<div className="col-lg-3 col-6 d-flex mb-lg-0 mb-2 flex-column">
													<div className="d-flex">Last Known Location</div>
													<div className="d-flex">
														<strong className="text-break">
															{this.state.reporterData.location
																? this.state.reporterData.location
																: 'No known location'}
														</strong>
													</div>
												</div>
												{this.state.reporterData.isApplicant && (
													<div className="col-lg-2 col-6 d-flex mb-lg-0 mb-2 flex-column">
														<div className="d-flex">User Type</div>
														<div className="d-flex">
															<strong className="text-break">Applicant</strong>
														</div>
													</div>
												)}
											</div>
										</div>
									</Col>
								</Row>
							</Card>

							<div className="globaltitle mb-3">
								<h3 className="mb-lg-0"> Stories Summary</h3>
							</div>
							<div className="rp_storiesSummary mb-0 d-flex flex-column mb-3">
								<Row gutter={16} className="pt-2">
									<Col xl={6} lg={6} md={12} xs={24} className="mb-lg-0 mb-3">
										<Card className="requestStatusTxt completed boxshadow">
											<h3>{this.state.stories.length} </h3>
											<span>
												Submitted Stories
											</span>
										</Card>
									</Col>
									<Col xl={6} lg={6} md={12} xs={24} className="mb-lg-0 mb-3">
										<Card className="requestStatusTxt ongoing boxshadow">
											<h3>
												$
												{this.state.reporterData.unpaidAmount
													? (
															Math.round(
																this.state.reporterData.unpaidAmount * 100
															) / 100
													  ).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
													: 0}{' '}
											</h3>
											<span>
												Unpaid Amount
											</span>
										</Card>
									</Col>
									<Col xl={6} lg={6} md={12} xs={24} className="mb-lg-0 mb-3">
										<Card className="requestStatusTxt ongoing boxshadow">
										<h3>
												$
												{this.state.reporterData.paidAmount
													? (
															Math.round(
																this.state.reporterData.paidAmount * 100
															) / 100
													  ).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
													: 0}
											</h3>
											<span>
												Total Amount Paid
											</span>
										</Card>
									</Col>
									<Col xl={6} lg={6} md={12} xs={24} className="">
										<Card className="requestStatusTxt ongoing boxshadow">
											<h3>
												{this.state.reporterData.unPaidStories.length}
											</h3>
											<span className="text-right">Unpaid Stories</span>
											<small
												className="mt-1 cursorPointer"
												onClick={() =>
													this.setState({
														showStories: !this.state.showStories,
													})
												}>
												 {this.state.showStories ? ' Hide List' : ' View List'}{' '}
											</small>
										</Card>
									</Col>
								</Row>
							</div>

							{this.state.showStories && (
								<Table
									className="mt-3 transationTable commontable mb-3"
									columns={columns}
									dataSource={this.state.reporterData.unPaidStories}
									rowKey="key"
									onRow={() => {
										return {
											onClick: () => {
												this.changeSelection();
											},
										};
									}}
								/>
							)}
							<div className="globaltitle mb-3">
								<h3 className="mb-lg-0"> Content Creator Contract</h3>
							</div>
							<Card className="boxshadow rp_ReporterContractList mb-3 px-2">
								{this.state.reporterData.contracts.length > 0 ? (
									<Table
										className="commontable applicantList"
										pagination={{
											defaultPageSize: 10,
											hideOnSinglePage: true,
										}}
										dataSource={this.state.reporterData.contracts}
										//loading={this.state.dataLoading}
									>
										<Column
											title="Document Title"
											key="contract.name"
											dataIndex="contract.name"
											ellipsis="true"
											sorter={{
												compare: (a, b) =>
													(a.contract.name.toLowerCase() >
														b.contract.name.toLowerCase()) *
														2 -
													1,
												multiple: 3,
											}}
											render={(rowData, record) => (
												<React.Fragment>{record.contract.name}</React.Fragment>
											)}
										/>
										<Column
											title="Signed"
											key="signedDate"
											dataIndex="signedDate"
											sorter={{
												compare: (a, b) => a.signedDate - b.signedDate,
											}}
											render={(rowData, record) => (
												<React.Fragment>
													{record.signed
														? 'Signed (' +
														  moment(
																new Date(parseFloat(record.signedDate))
														  ).format('MM/DD/YYYY') +
														  ')'
														: 'Not Signed'}
												</React.Fragment>
											)}
										/>
										<Column
											title="Assigned Date"
											key="createdDate"
											dataIndex="createdDate"
											sorter={{
												compare: (a, b) => a.createdDate - b.createdDate,
											}}
											render={(rowData, record) => (
												<React.Fragment>
													{moment(
														new Date(parseFloat(record.createdDate))
													).format('MM/DD/YYYY')}
												</React.Fragment>
											)}
										/>
										<Column
											className="text-center"
											title="Action"
											key="contractPdf"
											render={(signed, record) => (
												<React.Fragment>
													{record.contractPdf !== '' ? (
														<Button
															className="downloadbtn"
															type="primary"
															shape="round"
															icon={<CustIcon type="downloadicon1" />}
															onClick={() =>
																this.onDownloadInvoice(record.contractPdf)
															}>
															{/* <DownloadOutlined className="mr-2" /> Download */}
														</Button>
													) : null}
												</React.Fragment>
											)}
										/>
									</Table>
								) : (
									<Empty description={<span>No data available</span>} />
								)}
							</Card>
							<div className="globaltitle mb-3">
								<h3 className="mb-lg-0">Content Creator Notes</h3>
							</div>
							<Card className="boxshadow rp_ReporterContractList mb-3">
								{this.state.reporterData.notes.length > 0 ? (
									this.state.reporterData.notes.map((singleNote, index) => (
										<Row align="middle" justify="start" key={index}>
											<Comment
												author={singleNote.createdBy?.name}
												content={singleNote.description}
												datetime={moment(
													new Date(parseFloat(singleNote.createdDate))
												).format('MM/DD/YYYY')}
												avatar={
													<ProfileAvatar
														name={singleNote.createdBy?.name}
														imageUrl={singleNote.createdBy?.profileImage}
														size="24"
													/>
												}
											/>
										</Row>
									))
								) : (
									<Empty description={<span>No data available</span>} />
								)}
							</Card>
							<div className="globaltitle mb-3">
								<h3 className="mb-lg-0"> Content Creator Invoice</h3>
							</div>
							<Card className="boxshadow rp_ReporterInvoiceList px-2">
								{this.state.reporterData.invoices.length > 0 ? (
									<Table
										className="commontable applicantList"
										pagination={{
											defaultPageSize: 10,
											hideOnSinglePage: true,
										}}
										dataSource={this.state.reporterData.invoices}
										//loading={this.state.dataLoading}
									>
										<Column
											title="File Name"
											key="invoice"
											dataIndex="invoice"
											ellipsis="true"
											sorter={{
												compare: (a, b) =>
													(a.invoice.toLowerCase() > b.invoice.toLowerCase()) *
														2 -
													1,
												multiple: 3,
											}}
											render={(rowData, record) => (
												<React.Fragment>
													{record.invoice.substring(
														record.invoice.indexOf('/') + 1
													)}
												</React.Fragment>
											)}
										/>
										<Column
											title="Date of Signature"
											key="title"
											dataIndex="title"
											sorter={{
												compare: (a, b) => a.createdDate - b.createdDate,
												multiple: 3,
											}}
											render={(rowData, record) => (
												<React.Fragment>
													{moment(
														new Date(parseFloat(record.createdDate))
													).format('MM/DD/YYYY')}
												</React.Fragment>
											)}
										/>
										<Column
											className="text-center"
											title="Action"
											key="signed"
											render={(signed, record) => (
												<React.Fragment>
													<Button
														shape="round"
														onClick={() =>
															this.onDownloadInvoice(record.invoice)
														}>
														<DownloadOutlined className="mr-2" /> Download
													</Button>
												</React.Fragment>
											)}
										/>
									</Table>
								) : (
									<Empty description={<span>No data available</span>} />
								)}
							</Card>

							{this.state.reporterData && this._renderReporterProfilePopup()}
						</>
					)
				)}
				<Modal
					title="Send Contracts to Applicant"
					destroyOnClose={true}
					visible={this.state.sendContractModalVisiblity}
					onCancel={() => {
						this.setState({ sendContractModalVisiblity: false });
					}}
					width={800}
					wrapClassName="inviteReporterModel"
					onOk={this.handleContractSend}
					okText="Send Contracts"
					okButtonProps={{ disabled: this.state.isSendingContract }}>
					<ContractSelect
						contractData={this.state.contractData}
						onrowSelection={this.handleContractSelection}
						userId={
							this.state.reporterData ? this.state.reporterData.userId : null
						}
					/>
				</Modal>
			</React.Fragment>
		);
	}

	handleCancel = () => {
		this.setState({ inviteFormvisible: false });
	};

	handleContractSend = () => {
		const { client } = this.props;
		this.setState({ isSendingContract: true });
		client
			.mutate({
				variables: {
					userId: this.state.reporterData.userId,
					contracts: this.state.selectedContracts,
				},
				mutation: SEND_CONTRACTS_TO_APPLICANT,
			})
			.then(() => {
				this.setState({
					selectedContracts: [],
					sendContractModalVisiblity: false,
					isSendingContract: false,
				});
				this.getData();
				message.success('Contracts Sent Successfully');
			})
			.catch((error) => {
				this.setState({ isSendingContract: false });
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					this.setState({
						selectedContracts: [],
						sendContractModalVisiblity: false,
					});
					message.destroy();
					message.error('Trouble Sending Contracts. Please try again later');
				}
			});
	};

	handleContractSelection = (selectedRows) => {
		this.setState({ selectedContracts: [] });
		let tempVar = [];
		selectedRows.map(({ contractId }) => {
			tempVar.push(contractId);
		});
		this.setState({ selectedContracts: tempVar });
	};

	onFinishSaveReporter = (email) => {
		analytics.logEvent('updateReporter', {
			action: 'submit',
			label: 'email',
			value: email,
		});
		this.setState({ inviteFormvisible: false });
		this.setState({ isLoading: true }, () => {
			this.getData();
		});

		// let reportersData = this.state.reporterData;
		// reportersData.email = email;

		// this.setState({ reporterData: reportersData });

		// window.location.reload();
	};
	/**
	 * @name getContracts
	 * @description get all contracts belong to publisher
	 * */
	getReporterContracts = async () => {
		const { client } = this.props;
		try {
			this.setState({ isContractLoading: true });
			const {
				data: { getReporterContract },
			} = await client.query({
				query: GET_ALL_REPORTER_CONTRACTS,
				fetchPolicy: 'network-only',
			});
			let selectedContracts = [];
			getReporterContract.map((data, key) => {
				if (data.isRequired === true) {
					selectedContracts.push(data);
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
				message.error('Something went wrong please try again later.');
			}
		}
	};
	_renderReporterProfilePopup = () => {
		const { reporterData } = this.state;
		return (
			<Modal
				title="Update Reporter"
				visible={this.state.inviteFormvisible}
				onCancel={this.handleCancel}
				destroyOnClose={true}
				width={1100}
				footer={[
					<Button key="back" onClick={this.handleCancel}>
						Cancel
					</Button>,
					<Button form="myForm" htmlType="submit" type="primary">
						Submit
					</Button>,
				]}>
				{this.state.isContractLoading ? (
					<Loader />
				) : (
					<ReportersProfileModal
						{...reporterData}
						contractData={this.state.contractData}
						selectedContracts={this.state.selectedContracts}
						getData={(e) => this.getData()}
						onFinishSaveReporter={(e) => this.onFinishSaveReporter(e)}
					/>
				)}
			</Modal>
		);
	};
}
ReportersProfile = withApollo(ReportersProfile);
export { ReportersProfile };
