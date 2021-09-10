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
import { CustIcon } from '../../../Components/Svgs';
import { GET_USER_CONTRACTS, SIGN_CONTRACT } from '../../../graphql/query';
import './Contracts.css';

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
		};
	}
	componentDidMount() {
		localStorage.removeItem('isApplicant');
		this.getData();
	}
/**
 * getData calling for API call to get the User contracts 
 */
async getData() {
		const { client } = this.props;
		client
		 .query({
				query: GET_USER_CONTRACTS,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading =await loading;
				
				/*checking the data which is getting or not*/
				if (data !== undefined) {
					let unsignedData = await data.getUserContracts.filter((data) => {
						return data.signed === false;
					});
					let unApprovedData =await data.getUserContracts.filter((data) => {
						return data.isApproved === false;
					});
					let signedData =await data.getUserContracts.filter((data) => {
						return data.signed === true;
					});
					if (unsignedData.length === 0) {
						if (unApprovedData.length === 0) {
							let refreshTime = new Date().valueOf() + 3600000;
							localStorage.setItem('contractRefreshTime', refreshTime);
							this.props.history.push('/marketplace/inHouse');
						} else {
							localStorage.clear();
							this.props.history.push('/login');
						}
					}
					let showSkip = false;
					let lastSignDatePassedContracts = unsignedData.filter((data) => {
						return data.lastSignDate <= new Date();
					});

					if (lastSignDatePassedContracts.length > 0) {
						showSkip = false;
					} else {
						showSkip = true;
					}
					/*Set the Value in the Localstorage */
					localStorage.setItem('showSkip', showSkip);
					if (signedData.length > 0) {
						this.setState({ isShowSkip: true });
					}
					/*Updating the state value of Contractdata and isLoading flag */
					this.setState({
						isLoading: false,
						contractData: data.getUserContracts,
					});
				}
			});
	}
/*Function calling when User Signs Contracts */

async onSignClick(id) {
		const { client } = this.props;
		client
			.query({
				variables: { contractId: id },
				query: SIGN_CONTRACT,
				fetchPolicy: 'network-only',
			})
			.then((result) => {
				SentryLog({
					category: 'Sign COntract',
					message: 'Contract signed successfully',
					level: Severity.Info,
				});
				this.setState({
					showSignModal: true,
					signUrl: result.data.signContract.signUrl,
				});
			})
			.catch((error, result) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	}
	/* Function call when cancelling SignContract Modal*/
	onCancel = () => {
		this.getData();
		this.setState({ showSignModal: !this.state.showSignModal });
	};
	/* Function Call when user Want to logout of the system */
	logout = () => {
		localStorage.clear();
		this.props.history.push('/login');
	};
	render() {
		return (
			<React.Fragment>
				<Layout className="signContractPage d-flex flex-column align-items-center justify-content-md-center justify-content-start">
					<Card className="signContractCard">
						<div className="signContractForm_blk">
							<Row>
								<Col xs={24} sm={24} md={24}>
									<div className="signContractFormLeft">
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
												<Col lg={24}>
													<div className="table-responsive">
														<Table
															bordered={true}
															pagination={{
																defaultPageSize: 10,
																hideOnSinglePage: true,
															}}
															dataSource={this.state.contractData}
															//loading={dataLoading}
														>
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
																dataIndex="email"
																key="email"
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
																		).format('DD/MM/YYYY')}
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
													</div>
												</Col>
											</Row>
											<Row gutter={30} className="mt-5 mr-5">
												<Col lg={20}> </Col>
												<Col lg={2}>
													{localStorage.getItem('showSkip') == 'true' && (
														<Button shape="round">
															<Link to={`/requests`}>Skip</Link>
														</Button>
													)}
												</Col>
												<Col lg={2}>
													<Button shape="round">
														<span onClick={this.logout}>Logout</span>
													</Button>
												</Col>
											</Row>
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
			</React.Fragment>
		);
	}
}

Contracts = withApollo(Contracts);
export { Contracts };
