import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { message, Select, Table, Pagination } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { Link } from 'react-router-dom';
import { GET_ALL_REPORTER_TRANSACTIONS } from '../../../graphql/APIs';
import './Transaction.css';
import queryString from 'query-string';
import {Helmet} from "react-helmet";

const { Option } = Select;

const TransactionListPage = (props) => {
	const [isLoading, setIsLoading] = useState(true);
	const [month, setMonth] = useState(undefined);
	const [transactionList, setTransactionList] = useState(undefined);
	const [transactionId, setTransactionId] = useState(undefined);
	const [amount, setamount] = useState(undefined);
	const [createdDate, setCreatedDate] = useState(undefined);
	const [totalTransactions, settotalTransactions] = useState(undefined);
	const [defaultCurrentPage, setDefaultCurrentPage] = useState(1);
	const isLoaded = true;

	const client = useApolloClient();
	let LIMIT = 10;

	useEffect(() => {
		SentryLog({
			category: 'page',
			message: 'Transaction List Page Loaded',	
			level: Severity.Debug,
		});
	}, []);

	useEffect(() => {
		let variables = {
			limit: LIMIT,
		};
		let params = queryString.parse(props.location.search);
		if (params.page) {
			variables['page'] = +params.page;
			setDefaultCurrentPage(+params.page);
		}
		if (month) {
			variables['month'] = +month;
			setDefaultCurrentPage(+params.page);
		}
		getTransactionList(variables);
	}, [month]);

	const getTransactionList = (variables) => {
		SentryLog({
			category: 'data-fetch',
			message: `Transaction List fetch for ${
				MonthList[month - 1] ? MonthList[month - 1].name : 'All Months'
			}`,
			level: Severity.Debug,
		});
		setIsLoading(true);
		client
			.query({
				query: GET_ALL_REPORTER_TRANSACTIONS,
				variables: variables,
			})
			.then(
				({
					data: {
						getAllTransactions: { transactions, totalTransactions },
					},
				}) => {
					SentryLog({
						category: 'data-fetch',
						message: `Transaction List fetched Successfully`,
						level: Severity.Debug,
					});
					// transactions.forEach((result) => {
					// 	result.show = false;
					// });

					// setDefaultCurrentPage(page)
					if(totalTransactions > 0){
						settotalTransactions(totalTransactions);
						let transactionData = transactions.map((data,index) => {
							data.key = index;
							return data;
						})
						setTransactionList(transactionData);
						setIsLoading(false);
					}else{
						props.history.push('/errorMessages/noData')
					}
				}
			)

			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
				setIsLoading(false);
			});
	};

	const MonthList = [
		{ name: 'January', id: 1 },
		{ name: 'February', id: 2 },
		{ name: 'March', id: 3 },
		{ name: 'April', id: 4 },
		{ name: 'May', id: 5 },
		{ name: 'June', id: 6 },
		{ name: 'July', id: 7 },
		{ name: 'August', id: 8 },
		{ name: 'September', id: 9 },
		{ name: 'October', id: 10 },
		{ name: 'November', id: 11 },
		{ name: 'December', id: 12 },
	];

	const tableColumns = [
		{
			title: 'Transaction Id',
			dataIndex: 'transactionId',
			key: 'transactionId',
			render: (text) => <Link to={`/transactions/${text}`}>{text}</Link>,
		},
		{
			title: 'Receipt ID',
			dataIndex: 'paymentReciept',
			key: 'paymentReciept',
			render: (text) => <span>{text}</span>,
		},
		{
			title: 'Date',
			dataIndex: 'createdDate',
			key: 'createdDate',
			render: (createdDate) => (
				<span className="d-flex align-items-center">
					<img
						alt="iconImage"
						src={require('../../../Assets/icon/ic_date.png')}
						className="mr-2"
					/>{' '}
					<span className="text-nowrap">
						{moment(new Date(parseFloat(createdDate))).format('DD/MM/YYYY')}
					</span>
				</span>
			),
		},
		{
			title: 'Amount',
			dataIndex: 'amount',
			key: 'amount',
			render: (text) => <span className="primary-text-color font-bold">{text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>,
			width: 50,
		},
	];
	 const tableStoriesColumns = [
		{
			title: 'Story Title',
			dataIndex: 'title',
			key: 'title',
			render: (text) => <span>{text}</span>,
		},
		// {
		// 	title: 'Date',
		// 	dataIndex: 'createdDate',
		// 	key: 'createdDate',
		// 	render: (createdDate) => (
		// 		<span className="d-flex align-items-center">
		// 			<img
		// 				alt="iconImage"
		// 				src={require('../../../Assets/icon/ic_date.png')}
		// 				className="mr-2"
		// 			/>{' '}
		// 			<span className="text-nowrap">
		// 				{moment(new Date(parseFloat(createdDate))).format('DD/MM/YYYY')}
		// 			</span>
		// 		</span>
		// 	),
		// },
		{
			title: 'Price',
			dataIndex: 'price',
			key: 'price',
			render: (text) => <span className="primary-text-color font-bold">{
				text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>,
			width: 50,
		},
		{
			title: 'Purchased By',
			dataIndex: 'purchased',
			key: 'purchased',
			render: (text) => <span>{text[0].purchasedBy.name}</span>,
		},
	];
	const onPagination = (key) => {
		try {
			setDefaultCurrentPage(key);
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.set('page', key);
			url.search = search_params.toString();
			props.history.push('/transactions/' + url.search);
		} catch (error) {
			SentryError(error);
		}
	};

	return (
		<React.Fragment>
			<Helmet>
					<title>{localStorage.getItem('role') == 'journalist' ? 'Content Buyer' : 'Content Creator'} |
					Transactions</title>
				</Helmet>
					<div className="transaction-container">
						<div className="d-flex flex-row align-items-center justify-content-between mb-3">
							<h3 className="mb-0 font16 font-weight-bold">All Transaction</h3>
							<div className="viewByDrop">
								<Select
									size="small"
									placeholder="Select Month"
									allowClear
									onChange={setMonth}
									disabled={isLoading}>
									{MonthList.map(({ name, id }) => (
										<Option key={id} value={id}>
											{name}
										</Option>
									))}
								</Select>
							</div>
						</div>
						<div className="transactionTable">
							<Table
								className="commontable"
								pagination={false}
								disabled
								loading={isLoading}
								dataSource={transactionList}
								columns={tableColumns}
								expandable={{
									expandedRowRender: record => <Table className="commontable"
									pagination={true}
									//disabled
									//loading={isLoading}
									dataSource={record.stories}
									columns={tableStoriesColumns}/>,
									rowExpandable: record => record.name !== 'Not Expandable',
								  }} 
								// pagination={{ hideOnSinglePage: true }}
							/>
						</div>
					</div>
					{!isLoading && <Pagination
						total={totalTransactions}
						showTotal={(total) =>
							`Total ${total} ${total > 1 ? 'items' : 'item'}`
						}
						pageSize={LIMIT}
						current={defaultCurrentPage}
						onChange={onPagination}
					/>}
		</React.Fragment>
	);
};

export { TransactionListPage };
