import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
// import './Transactions.css';
import {
	Row,
	Col,
	Select,
	Tabs,
	Typography,
	Button,
	Table,
	Switch,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { GET_PURCHASED_STORIES, GET_ALL_REPORTERS } from '../../graphql/APIs';
import moment from 'moment';
import { CSVLink } from 'react-csv';
import { analytics } from '../../utils/init-fcm';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { onReporterClick } from '../../Components/general/general';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { Link } from 'react-router-dom';
import {
	PlusOutlined,
	ExclamationCircleOutlined,
	UserOutlined,
	EditOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
const { Column } = Table;
const headers = [
	{ label: 'Title', key: 'title' },
	{ label: 'Reporter', key: 'createdBy.name' },
	{ label: 'Amount', key: 'priceFormatted' },
	{ label: 'Created Date', key: 'createdDate' },
	{ label: 'Purchased Date', key: 'purchased.purchasedDate' },
];
const { Title } = Typography;

class ContractsList extends Component {
	changeSelection = (record) => {
		//  this.props.history.push("/storyDetails/" + record.storyId)
	};

	constructor(props) {
		super(props);
		SentryLog({
			category: 'Transaction',
			message: 'Transaction Page Loaded',
			level: Severity.Info,
		});
		analytics.setCurrentScreen('Transaction');
		this.state = {
			stories: [],
			isPaid: true,
			selectedReporter: null,
			reporters: [],
			activeKey: 1,
		};
		this.onReporterChange = this.onReporterChange.bind(this);
	}
	columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			sorter: {
				compare: (a, b) => a.title - b.title,
				multiple: 3,
			},
		},
		{
			title: 'Content Creator',
			dataIndex: 'createdBy',
			render: (text) => (
				<div
					className="cursorPointer"
					onClick={(e) =>
						onReporterClick(this.props.history, text.userId, text.deleted)
					}>
					<div className="d-flex flex-row align-items-center userReporter">
						<ProfileAvatar
							size={32}
							name={text.name}
							imageUrl={text.profileImage}
						/>
						<span className="pl-3 userReporterName">{text.name}</span>
					</div>
				</div>
			),
		},

		{
			title: 'Created Date',
			dataIndex: 'createdDate',
			render: (text) => (
				<span>
					<img
						alt=""
						className="mr-2"
						src={require('../../Assets/images/cal-icon.png')}
					/>
					{text}
				</span>
			),
		},
		{
			title: 'Amount',
			dataIndex: 'priceFormatted',
			sorter: {
				compare: (a, b) => a.price - b.price,
				multiple: 3,
			},
			render: (text) => (
				<span className="primary-text-color font-bold">{text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
			),
		},
	];
	componentDidMount() {
		const variables = { isPaid: this.state.isPaid };
		this.getData(variables);
		this.getAllReporterData(null);
	}
	onReporterChange(key) {
		analytics.logEvent('Filter', {
			action: 'set',
			label: 'filterByReporter',
			value: key,
		});
		let variables = {};
		variables.reporterId = key;
		this.setState({ selectedReporter: key });
		variables.isPaid = this.state.isPaid;
		this.getData(variables);
	}
	getData(variables) {
		const { client } = this.props;
		client
			.watchQuery({
				query: GET_PURCHASED_STORIES,
				variables: variables,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					data.getPurchasedStories.map((result) => {
						const createdDate = result.createdDate;
						if (createdDate.indexOf('/') === -1) {
							result.createdDate = moment(
								new Date(parseFloat(createdDate))
							).format('MM/DD/YYYY');
						}
						const purchasedDate = result.purchased.purchasedDate;
						if (purchasedDate.indexOf('/') === -1) {
							result.purchased.purchasedDate = moment(
								new Date(parseFloat(purchasedDate))
							).format('MM/DD/YYYY');
						}
						result.priceFormatted = '$' + result.price;
						return {
							...result,
						};
					});
					this.setState({ stories: data.getPurchasedStories });
				}
			});
	}
	onChange = (value) => {
		const variables = {};
		this.setState({ defaultCurrent: 1, activeKey: value });
		if (value === '2') {
			variables.isPaid = false;
			this.setState({ isPaid: false });
		} else {
			variables.isPaid = true;
			this.setState({ isPaid: true });
		}

		if (this.state.selectedReporter != null) {
			variables.reporterId = this.state.selectedReporter;
		}
		this.getData(variables);
	};
	getAllReporterData(search) {
		try {
			const { client } = this.props;
			client
				.query({
					query: GET_ALL_REPORTERS,
					variables: { search: search },
				})
				.then(({ data, loading }) => {
					this.loading = loading;
					if (data !== undefined) {
						data.getReporters.forEach((result) => {
							result.show = false;
							result.type = '6_hours';
						});
						//  let reporters = this.getReporterDataFormatted(data.getReporters);
						this.setState({ reporters: data.getReporters });
					}
				});
		} catch (error) {
			SentryError(error);
		}
	}
	render() {
		return (
			<React.Fragment>
				<div className="container pt-3">
					<div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							Notification Settings
						</Title>
					</div>
					<Row gutter={30} className="pt-2">
						<Col lg={6} className="d-none d-lg-block">
							<ProfileSideMenu page="notificationSettings" />
						</Col>
						<Col lg={18} xs={24}>
							<Table
								bordered={true}
								pagination={{ defaultPageSize: 10, hideOnSinglePage: true }}>
								<Column
									title="Title"
									key="name"
									render={(rowData, record) => (
										<Link
											className="tour-journalist-name"
											to={`/journalist/${rowData.userId}`}>
											{rowData.name}
										</Link>
									)}
								/>
								<Column title="Document Type" dataIndex="email" key="email" />
								<Column
									title="Version"
									dataIndex="phoneNumber"
									key="phoneNumber"
								/>

								<Column
									width={120}
									title="Published Date"
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
								/>
								<Column
									width={100}
									title="Status"
									key="action"
									dataIndex="isActive"
									render={(isActive, record) => (
										<span>
											<Switch
												className="tour-journalist-status"
												checked={!!isActive}
												//onChange={(isActive) => onStatusChangeHandler(record, isActive)}
											/>
										</span>
									)}
								/>
								<Column
									width={100}
									title="Action"
									key="action"
									render={(isActive, record) => (
										<span className="d-flex flex-row align-items-center">
											<Button
												type="link"
												//onClick={() => editJournalist(record)}
												icon={<EditOutlined />}
											/>
											<Button
												className="tour-journalist-delete"
												type="link"
												// onClick={() => userDeleteHandler(record)}
												icon={<DeleteOutlined />}
											/>
										</span>
									)}
								/>
							</Table>
						</Col>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}
ContractsList = withRouter(ContractsList);
ContractsList = withApollo(ContractsList);
export { ContractsList };
