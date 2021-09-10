import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Card,
	Col,
	Layout,
	message,
	Modal,
	Row,
	Table,
	Typography,
	Button,
} from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { CustIcon } from '../../Components/Svgs';
import { GET_USER_CONTRACTS, SIGN_CONTRACT } from '../../graphql/APIs';
import './Contracts.css';
import { Loader } from '../../Components/Loader/Loader';
import {Helmet} from "react-helmet";

const { Title } = Typography;
const { Column } = Table;
class Contracts extends Component {
	constructor(props) {
		super(props);
		this.state = {
			contractData: [],
			signUrl: null,
			showSignModal: false,
			isLoading: true,
			isShowSkip: false,
			isLoaded: false,
		};
	}
	componentDidMount() {
		this.getData();
	}
	getData() {
		const { client } = this.props;
		client
			.query({
				query: GET_USER_CONTRACTS,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					// console.log(data);
					let unsignedData = data.getUserContracts.filter((data) => {
						return data.signed === false;
					});
					let unapprovedData = data.getUserContracts.filter((data) => {
						return data.isApproved === false;
					});
					let signedData = data.getUserContracts.filter((data) => {
						return data.signed === true;
					});
					// console.log(unsignedData);
					if (unsignedData.length === 0) {
						if (unapprovedData.length === 0) {
							let refreshTime = new Date().valueOf() + 3600000;
							localStorage.setItem('contractRefreshTime', refreshTime);
							this.props.history.push('/marketplace/inHouse');
						} else {
							localStorage.clear();
							this.props.history.push('/login');
						}
					}
					if (signedData.length > 0) {
						this.setState({ isShowSkip: true });
					}
					this.setState({
						isLoading: false,
						contractData: data.getUserContracts,
					});
					let showSkip = false;
					let lastSignDatePassedContracts = unsignedData.filter((data) => {
						return data.lastSignDate <= new Date();
					});

					if (lastSignDatePassedContracts.length > 0) {
						showSkip = false;
					} else {
						showSkip = true;
					}
					localStorage.setItem('showSkip', showSkip);
					this.setState({ isLoaded: true });
				}
			});
	}
	onSignClick(id) {
		this.setState({ isLoading: true });
		// console.log('Api Call for -> ', id);
		const { client } = this.props;
		client
			.query({
				variables: { contractId: id },
				query: SIGN_CONTRACT,
				fetchPolicy: 'network-only',
			})
			.then((result) => {
				// console.log(result);
				SentryLog({
					category: 'Sign COntract',
					message: 'Contract signed successfully',
					level: Severity.Info,
				});
				this.setState({
					showSignModal: true,
					signUrl: result.data.signContract.signUrl,
					isLoading: false,
				});
			})
			.catch((error, result) => {
				this.setState({ isLoading: false });
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
			});
	}
	onCancel = () => {
		this.setState({ isLoading: true });
		this.getData();
		this.setState({ showSignModal: !this.state.showSignModal });
	};
	logout = () => {
		//analytics.setUserProperties({ dimension1: 'Loggedout' });
		localStorage.setItem('access_token', '');
		this.props.history.push('/login');
	};
	render() {
		return (
			<React.Fragment>
				<Helmet>
				<title>{localStorage.getItem('role') === 'journalist' ? 'Journalist | Contracts' : 'Content Creator | Contracts'}
					</title>
				</Helmet>
				{this.state.isLoaded ? (
					<Layout className="signContractPage d-flex flex-column align-items-center justify-content-center">
						<Card className="signContractCard">
							<div className="signContractForm_blk">
								<Row>
									<Col xs={24} sm={24} md={24}>
										<div className="signContractFormLeft ml-lg-3">
											<div className="">
												<div className="signContractLogo">
													<CustIcon type="logo" className="logoSvg" />
													<p className="pt-2">
														Kindly read and sign the required contracts in order
														to access the system.
													</p>
												</div>
												<div className="d-flex flex-row align-items-center justify-content-between my-2">
													<Title
														level={4}
														strong="false"
														className="pageTitle m-0">
														Sign Contract
													</Title>
												</div>
												<Row gutter={30} className="pt-2">
													<Col lg={24} className="d-none d-lg-block">
														<Table
															bordered={true}
															pagination={{
																defaultPageSize: 10,
																hideOnSinglePage: true,
															}}
															dataSource={this.state.contractData}
															loading={this.state.isLoading}>
															<Column
																title="Publisher Name"
																key="publisher"
																render={(rowData, record) => (
																	<React.Fragment>
																		{record.contract.publisher.title}
																	</React.Fragment>
																)}
															/>
															<Column
																title="Document Title"
																key="title"
																render={(rowData, record) => (
																	<React.Fragment>
																		{record.contract.name}
																	</React.Fragment>
																)}
															/>
															<Column
																title="Version"
																key="version"
																render={(rowData, record) => (
																	<React.Fragment>
																		{record.contract.version}
																	</React.Fragment>
																)}
															/>
															<Column
																width={120}
																title="Published Date"
																key="createdDate"
																render={(createdBy, record) => (
																	<React.Fragment>
																		{moment(
																			new Date(
																				parseFloat(
																					record.updatedDate ||
																						record.createdDate
																				)
																			)
																		).format('MM/DD/YYYY')}
																	</React.Fragment>
																)}
															/>
															<Column
																title="Action"
																key="name"
																render={(rowData, record) =>
																	!rowData.signed ? (
																		<Link
																			className="signLink"
																			onClick={() =>
																				this.onSignClick(rowData.contractId)
																			}>
																			Sign Contract
																		</Link>
																	) : (
																		'Contract Signed'
																	)
																}
															/>
														</Table>
													</Col>
												</Row>
												<Row gutter={30} className="pt-2 mr-5">
													{' '}
													<Col lg={20}> </Col>
													<Col lg={2}>
														{localStorage.getItem('showSkip') === 'true' && (
															<Button shape="round">
																<Link to={`/marketplace/inHouse`}>Skip</Link>
															</Button>
														)}
													</Col>
													<Col lg={2}>
														<Button shape="round">
															<Link onClick={this.logout}>Logout</Link>
														</Button>
													</Col>
												</Row>{' '}
												<Modal
													destroyOnClose={true}
													title="Sign Contract"
													centered
													visible={this.state.showSignModal}
													onCancel={() => this.onCancel()}
													header={[]}
													footer={null}
													wrapClassName="contractPop">
													{this.state.showSignModal && (
														<iframe
															title={'Hello'}
															src={this.state.signUrl}
															width="100%"
															height="100%"
														/>
													)}
												</Modal>
											</div>
										</div>
									</Col>
								</Row>
							</div>
						</Card>
					</Layout>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}

Contracts = withApollo(Contracts);
export { Contracts };
