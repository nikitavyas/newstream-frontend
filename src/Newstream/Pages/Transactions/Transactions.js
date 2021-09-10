import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import './Transactions.css';
import { Row, Col, Select, Tabs, Typography, Button, Empty } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Table, Pagination } from 'antd';
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
import queryString from 'query-string';
import { Helmet } from "react-helmet";
import { Loader } from '../../Components/Loader';
const { Option } = Select;

const headers = [
	{ label: 'Title', key: 'title' },
	{ label: 'Reporter', key: 'createdBy.name' },
	{ label: 'Amount', key: 'priceFormatted' },
	{ label: 'Created Date', key: 'createdDate' },
	// { label: 'Purchased Date', key: 'purchased[0].purchasedDate' },
];
// const { Title } = Typography;
// const { TabPane } = Tabs;

const operations = (activeKey, stories, reporters, onReporterChange) => {
	return (
		<div className="d-flex flex-row align-items-center mt-1">
			<div className="d-flex flex-row align-items-center mr-2">
				<span className="mx-lg-3 mr-3">Filter By </span>
				<Select
					defaultValue=""
					className="filterbySelect"
					onChange={onReporterChange}>
					<Select.Option value="">Select Content Creators</Select.Option>
					{reporters.length > 0 &&
						reporters.map((data, index) => (
							<Select.Option key={index} value={data.userId}>
								<div className=" selectboxOption d-flex flex-row align-items-center">
									<ProfileAvatar
										size={32}
										name={data.name}
										imageUrl={data.profileImage}
									/>
									<span className="pl-2 selectBoxName"> {data.name} </span>
								</div>
							</Select.Option>
						))}
				</Select>
			</div>
			<CSVLink
				data={stories}
				filename={
					activeKey === 1
						? 'paid-transactions-' + new Date() + '.csv'
						: 'unpaid-transactions-' + new Date() + '.csv'
				}
				headers={headers}>
				<Button
					type="primary"
					className="download_btn"
					shape="round"
					disabled={stories.length > 0 ? false : true}>
					<DownloadOutlined />
					Download
				</Button>
			</CSVLink>
		</div>
	);
};

class Transactions extends Component {
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
		let params = queryString.parse(props.location.search);

		this.state = {
			stories: [],
			isPaid: params.isPaid ? (params.isPaid === 'true' ? true : false) : undefined,
			selectedReporter: null,
			reporters: [],
			storyCount: 0,
			activeKey: 1,
			defaultpage: 1,
			LIMIT: 10,
			isLoaded: false,
			isGlobal: this.props.match.params.type === 'global' ? true : false
		};
		this.onReporterChange = this.onReporterChange.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.onPagination = this.onPagination.bind(this);
	}

	columns = [
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
			ellipsis: 'true',
			sorter: {
				compare: ((a, b) => (a.title.toLowerCase() > b.title.toLowerCase()) * 2 - 1),
				multiple: 3,
			},
		},
		{
			title: 'Content Creators',
			dataIndex: 'createdBy',
			// key : 'createdBy',
			sorter: {
				compare: ((a, b) => (a.createdBy.name.toLowerCase() > b.createdBy.name.toLowerCase()) * 2 - 1),
				multiple: 3,
			},
			render: (text) => (
				<div
					className="cursorPointer"
					onClick={(e) =>
						onReporterClick(this.props.history, text.userId, text.deleted)
					}>
					<div className="d-flex flex-row align-items-center userReporter">
						<ProfileAvatar
							size={40}
							name={text.name}
							imageUrl={text.profileImage}
						/>
						<span className="px-2 username text-capitalize userReporterName">
							{text.name}
						</span>
					</div>
				</div>
			),
		},
		{
			title: 'Status',
			dataIndex: 'ispaid',
			key: 'ispaid',
			sorter:
			{
				compare: (a, b) =>
					b.isPaid - a.isPaid,
				multiple: 3,
			},
			render: (text, record) => {
				return record.isPaid ? <div className="badge reportactive">Paid</div> : <div className="badge reportactive reportresent">Unpaid</div>
			},
		},

		{
			title: 'Created Date',
			dataIndex: 'createdDate',
			key: 'createdDate',
			sorter: {
				compare: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
				multiple: 3,
			},
			render: (text) => (
				<span>
					{/* <img
						alt=""
						className="mr-2"
						src={require('../../Assets/images/cal-icon.png')}
					/> */}
					{text}
				</span>
			),
		},
		{
			title: 'Amount',
			// className: 'actionLast',
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
		let params = queryString.parse(this.props.location.search);
		let pagedata = {
			isPaid: this.state.isPaid,
			isPurchased: true,
			page: 1,
			limit: 10,
			isGlobal: false
		};
		if (params.page) {
			pagedata['page'] = +params.page ? +params.page : 1
			this.setState({ defaultpage: params.page })
		}
		if (this.props.match.params.type) {
			pagedata['isGlobal'] = this.props.match.params.type === 'global' ? true : false;
		}
		if (params.limit) {
			pagedata['limit'] = +params.limit;
			this.setState({ LIMIT: +params.limit })
		}
		this.getData(pagedata);
		//	this.getAllReporterData(null);
	}

	onReporterChange(key) {
		analytics.logEvent('Filter', {
			action: 'set',
			label: 'filterByReporter',
			value: key,
		});
		let variables = { 'isPurchased': true };
		variables.reporterId = key;
		this.setState({ selectedReporter: key });
		variables.isPurchased = true;
		variables.isPaid = this.state.isPaid;
		this.getData(variables);
	}
	handleChange(value) {
		let variables = {};
		if (value === 'inhouse') {
			variables.isGlobal = false;
		} else if (value === 'global') {
			variables.isGlobal = true;
		}
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.delete('page');
		search_params.set('isGlobal', variables.isGlobal);
		url.search = search_params.toString();
		this.props.history.push('/transactions/' + url.search);
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
					if (data.getPurchasedStories.storyCount > 0) {
						data.getPurchasedStories.stories.map((result) => {
							const createdDate = result.createdDate;
							if (createdDate.indexOf('/') === -1) {
								result.createdDate = moment(
									new Date(parseFloat(createdDate))
								).format('MM/DD/YYYY');
							}
							result.purchased.map((result1) => {
								if (result1.purchasedBy.userId === localStorage.getItem("userId")) {
									result.purchasedDate = result1.purchasedDate;
									if (result1.purchasedDate.indexOf('/') === -1) {
										result.purchasedDate = moment(
											new Date(parseFloat(result1.purchasedDate))
										).format('MM/DD/YYYY');
									}
									result.isPaid = result1.isPaid;
								}
								result.priceFormatted = '$' + result.price;
								return {
									...result,
								};
							})
							if (data.getPurchasedStories.storyCount) {
								this.storyCount = data.getPurchasedStories.storyCount
							}
						});
						this.setState({
							isLoaded: true,
							stories: data.getPurchasedStories.stories,
							storyCount: data.getPurchasedStories.storyCount
						})
					} else {
						this.props.history.push('/errorMessages/noData')
					}
				}
			});
	}
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
	onPagination = (page, size) => {
		let path = window.location.pathname
		try {
			this.setState({ defaultpage: page })
			this.setState({ LIMIT: size })
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.set('page', page);
			search_params.set('limit', size);
			url.search = search_params.toString();
			if (path == '/transactions/inHouse') {
				this.props.history.push('/transactions/inHouse' + url.search);
			}
			else {
				this.props.history.push('/transactions/global' + url.search);
			}
		} catch (error) {
			SentryError(error);
		}
	};
	render() {
		return (
			<React.Fragment>
				<Helmet>
					<title>{localStorage.getItem('role') === 'journalist' ? 'Content Buyer' : 'Content Creators'} |
						Transactions</title>
				</Helmet>
				{this.state.isLoaded ?
					<>
						<div className="">
							<div className="d-flex flex-sm-row flex-column align-items-sm-center justify-content-between mb-3">
								<h3 className="mb-0 font16">
									Total {this.state.storyCount} results found for{' '}
									<span className="font-weight-bold">transactions</span>
								</h3>
								{/* <div className="d-flex align-items-center justify-content-end mt-3 mt-sm-0">
							<div className="viewByDrop">
								<label>View :</label>
								<Select value={this.state.isGlobal == 'true' ? 'global' : 'inhouse'} onChange={this.handleChange}>
									<Option value="global">Global</Option>
									<Option value="inhouse">In-house</Option>
								</Select>
							</div>
						</div> */}
							</div>
							<Table
								pagination={false}
								className="transationTable commontable"
								columns={this.columns}
								dataSource={this.state.stories}
								rowKey="key"

								onRow={(record, rowIndex) => {
									return {
										onClick: (event) => {
											this.changeSelection();
										},
									};
								}}
								locale={{
									emptyText: (
										<Empty description={<span>No data available</span>} />
									),
								}}

							/>

						</div>
						{/* <div className="pt-3 d-flex flex-row align-items-center justify-content-end"> */}
						{this.state.stories.length > 0 &&
							<Pagination
								showTotal={(total) =>
									`Total ${total} ${total > 1 ? 'items' : 'item'}`
								}
								total={this.state.storyCount}
								defaultPageSize={this.state.LIMIT}
								defaultCurrent={this.state.defaultpage}
								onChange={this.onPagination}
								showSizeChanger
								pageSizeOptions={[10, 20, 30, 40, 50]}
							/>
						}
						{/* </div> */}
					</>
					: <Loader />}
			</React.Fragment>
		);
	}
}
Transactions = withRouter(Transactions);
Transactions = withApollo(Transactions);
export { Transactions };
