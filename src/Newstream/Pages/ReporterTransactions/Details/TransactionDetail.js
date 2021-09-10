import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { Col, message, Row, Table } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { Link, useParams } from 'react-router-dom';
import { Loader } from '../../../Components/Loader';
import { CustIcon } from '../../../Components/Svgs';
import { LiveTag } from '../../../Components/Tags';
import { TRANSACTION_DETAILS } from '../../../graphql/APIs';

const TransactionDetailPage = (props) => {
	const [isLoading, setIsLoading] = useState(true);
	const [transactionDetails, setTransactionDetails] = useState(undefined);
	const { transactionId } = useParams();
	const client = useApolloClient();

	useEffect(() => {
		SentryLog({
			category: 'page',
			message: `Transaction Details Page Loaded for Transaction Id : ${transactionId}`,
			level: Severity.Debug,
		});
		getTransactionDetails();
	}, [transactionId]);

	const getTransactionDetails = () => {
		SentryLog({
			category: 'data-fetch',
			message: `Transaction Details fetch started`,
			level: Severity.Debug,
		});
		setIsLoading(true);
		client
			.query({
				variables: {
					transactionId: transactionId,
				},
				query: TRANSACTION_DETAILS,
			})
			.then(({ data: { transaction } }) => {
				SentryLog({
					category: 'data-fetch',
					message: `Transaction Details fetch started`,
					level: Severity.Debug,
				});
				setTransactionDetails(transaction);
				setIsLoading(false);
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
				setIsLoading(true);
				props.history.push('/transactions');

			});
	};

	const tableColumns = [
		{
			title: 'Story Title',
			key: 'title',
			render: ({ title, createdDate,storyId }) => (
				<>
					<Link to={`/storyDetails/${storyId}`}>
						<h6 className="text-break black-text-color">{title || 'N/A'}</h6>
					</Link>
					<div className="d-flex align-items-center darkGray-text-color">
						<CustIcon type="date" className="mr-1" />{' '}
						{moment(new Date(parseFloat(createdDate))).format('DD/MM/YYYY')}
					</div>
				</>
			),
		},
		{
			title: 'Price',
			key: 'price',
			render: ({ price, storyLiveStream, storyMediaWeb }) => (
				<>
					<h5 className="price text-nowrap primary-text-color d-flex justify-content-end px-2 mb-1">
						<span className="priceAmt primary-text-color">${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
					</h5>
					<div className=" viewCounter d-flex flex-row align-items-center justify-content-end">
						{storyLiveStream && <LiveTag />}
						{storyMediaWeb.audios.length > 0 ? (
							<div className="d-flex flex-row align-items-center px-2">
								<span>{storyMediaWeb.audios.length}</span>
								<CustIcon type="voice" className="ml-1" />
							</div>
						) : undefined}
						{storyMediaWeb.videos.length > 0 ? (
							<div className="d-flex flex-row align-items-center px-2">
								<span>{storyMediaWeb.videos.length}</span>
								<CustIcon type="video" className="ml-1" />
							</div>
						) : undefined}
						{storyMediaWeb.images.length > 0 ? (
							<div className="d-flex flex-row align-items-center px-2">
								<span>{storyMediaWeb.images.length}</span>
								<CustIcon type="image" className="ml-1" />
							</div>
						) : undefined}
					</div>
				</>
			),
			width: 50,
		},
		{
			title: 'Marketplace',
			key: 'isGlobal',
			render: ({ isGlobal }) => (
				<>
					<h6 className="text-break black-text-color">{isGlobal ? "Global" : "Inhouse"}</h6>
				</>
			),
		},
	];

	if (isLoading) {
		return <Loader />;
	}

	return (
		<>
			<Row
				justify="space-between"
				align="middle"
				className="transID_blk pt-4 mb-4">
				<Col>
					<Row>
						<b
							style={{ fontSize: '16px', fontWeight: '600' }}
							className="black-text-color">
							Transaction ID
						</b>
					</Row>
					<Row>{transactionId}</Row>
				</Col>
				<Col>
					<Row>
						<b
							style={{ fontSize: '16px', fontWeight: '600' }}
							className="black-text-color">
							Request ID
						</b>
					</Row>
					<Row className="tranIdTxt">{transactionDetails.paymentReciept}</Row>
				</Col>
				<Col>
					<Row>
						<b
							style={{ fontSize: '16px', fontWeight: '600' }}
							className="black-text-color">
							Date
						</b>
					</Row>
					<Row>
						<CustIcon type="date" className="mr-1" />
						{moment(
							new Date(parseFloat(transactionDetails.createdDate))
						).format('DD/MM/YYYY')}
					</Row>
				</Col>
				<Col>
					<Link
						to="/transactions"
						className="ant-btn ant-btn-default ant-btn-round">
						All Transactions
					</Link>
				</Col>
			</Row>
			<Table
			className="commontable"
				loading={isLoading}
				dataSource={transactionDetails.stories}
				columns={tableColumns}
				pagination={{ hideOnSinglePage: true }}
			/>
		</>
	);
};

export { TransactionDetailPage };
