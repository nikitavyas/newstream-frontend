/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, Fragment } from 'react';
import { Loader } from '../../../Components/Loader/Loader';
import { useApolloClient } from 'react-apollo';
import { GET_LIVE_STORIES } from '../../../graphql/APIs';
import {
	Empty,
	Card,
	Row,
	Col,
	Radio,
	Typography,
	Pagination,
	message,
} from 'antd';
import LiveStoryCard from '../../../Components/Cards/LiveStory/LiveStory';
import { EnvironmentFilled, UnorderedListOutlined } from '@ant-design/icons';
import { GoogleMap } from '../../../Components/GoogleMap';

import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import queryString from 'query-string';

const { Title } = Typography;
const LiveStreamStoryPage = (props) => {
	const [isLoading, setIsLoading] = useState(true);
	const [storyCount, setStoryCount] = useState(null);
	const [storyList, setStoryList] = useState([]);
	const [viewType, setViewType] = useState('List');
	const [purchaseFilter, setPurchaseFilter] = useState(undefined);
	const [requestTypeFilter, setRequestTypeFilter] = useState(undefined);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageLimit, setPageLimit] = useState(9);
	const [isOpen, setIsOpen] = useState(undefined);
	const [isAssigned, setIsAssigned] = useState(undefined);
	const [search, setSearch] = useState('');
	const [showPopup, setShowPopup] = useState(false, () => {
		return true;
	});
	const client = useApolloClient();
	var url = new URL(window.location.href);
	var params = url.searchParams;

	useEffect(() => {
		// console.log(params.get('isOpen'));
		if (params) {
			if (params.get('isOpen')) {
				setIsOpen(params.get('isOpen') === 'true' ? true : false);
			}
			if (params.get('isAssigned')) {
				setIsAssigned(params.get('isAssigned') === 'true' ? true : false);
			}
			if (params.get('isPurchased')) {
				setPurchaseFilter(params.get('isPurchased') === 'true' ? true : false);
			}
			if (params.search) {
				setSearch(params.search);
			}
		}
		getLiveStreamStories();
	}, [isOpen, isAssigned, search, purchaseFilter, pageNumber, pageLimit]);

	useEffect(() => {
		SentryLog({
			category: 'Liverstream',
			level: Severity.Info,
			message: 'Live Stream Page Loaded',
			type: 'default',
		});
	}, []);

	const getLiveStreamStories = () => {
		try {
			setIsLoading(true);
			let variables = {
				page: pageNumber,
				limit: pageLimit,
			};
			if (isOpen === false && isAssigned === false) {
				variables.isOpen = true;
				variables.isAssigned = true;
			} else {
				if (isOpen) {
					variables.isOpen = isOpen;
				}
				if (isAssigned) {
					variables.isAssigned = isAssigned;
				}
			}
			if (purchaseFilter) {
				variables.isPurchased = purchaseFilter;
			}
			if (search !== '') {
				variables.search = search;
			}
			client
				.query({
					query: GET_LIVE_STORIES,
					variables,
					fetchPolicy: 'no-cache',
				})
				.then(({ data: { getAllstoryWeb } }) => {
					setStoryCount(getAllstoryWeb?.storyCount);
					setStoryList(getAllstoryWeb?.stories);
					setIsLoading(false);
				})
				.catch((error) => {
					setIsLoading(false);

					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						if (error.graphQLErrors[0].message.includes('Cannot return null')) {
							setStoryCount(0);
							setIsLoading(false);
						}
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	};

	const onViewChange = ({ target: { value } }) => {
		setViewType(value);
		if (value === 'Map') {
			setPageLimit(undefined);
		}
		if (value === 'List') {
			setPageLimit(9);
			setPageNumber(1);
		}
		SentryLog({
			category: 'viewType',
			level: Severity.Info,
			message: `${value} view selected`,
			type: 'default',
		});
	};

	const handlePurchasedFilter = ({ target: { checked } }) => {
		// console.log(props);
		// console.log(queryString.parse(props.location.search).isPurchased);
		setPurchaseFilter(checked ? true : undefined);
		setPageNumber(1);
	};

	const handleRequestTypeFilter = (event) => {
		setIsOpen(false);
		setIsAssigned(false);
		if (event.length > 0) {
			event.map((data) => {
				if (data === 'isOpen') {
					setIsOpen(true);
				}
				if (data === 'isAssigned') {
					setIsAssigned(true);
				}
			});
		}
		setPageNumber(1);
	};

	const clearRequestFilter = (value) => {
		if (Object.keys(value).length > 0) {
			if (value.type === 'type') {
				if (value.value === 'isOpen') {
					setIsOpen(false);
				}
				if (value.value === 'isAssigned') {
					setIsAssigned(false);
				}
			} else if (value.type === 'search') {
				setSearch('');
			} else if (value.type === 'isPurchased') {
				setPurchaseFilter(false);
			}
		} else {
			setIsOpen(false);
			setIsAssigned(false);
			setPurchaseFilter(false);
			setSearch('');
		}
		setPageNumber(1);
	};

	const pageChange = (pageNumber) => {
		setPageNumber(pageNumber);
	};

	const onMapChildCallback = (key) => {
		setShowPopup(key);
	};

	const onSearchChange = (text) => {
		setSearch(text);
	};
	return (
		<div className="">
			{search && (
				<div>
					{' '}
					Total {storyCount} results found for "{search}".
				</div>
			)}{' '}
			<Row justify="space-between" className="mt-3 mb-3">
				<Col>
					<Title level={4} strong="false" className="pageTitle">
						Live Stream
					</Title>
				</Col>
				<Col>
					<Radio.Group
						value={viewType}
						onChange={onViewChange}
						buttonStyle="solid"
						className="viewSwitchround">
						<Radio.Button value={'Map'}>
							<EnvironmentFilled className="mr-2" />
							Map View
						</Radio.Button>
						<Radio.Button value={'List'}>
							<UnorderedListOutlined className="mr-2" />
							List View
						</Radio.Button>
					</Radio.Group>
				</Col>
			</Row>
			<Fragment>
				{/*	<Col className="filterCol mt-xl-n4">
						 <Filter
							type="liveStory"
							purchaseFilter={
								!isLoading
									? purchaseFilter
									: params.get('isPurchased')
									? true
									: false
							}
							onFilterChange={handlePurchasedFilter}
							onSearchChange={onSearchChange}
							searchValue={!isLoading ? search : params.get('search')}
							clearFilter={clearRequestFilter}
							onFilterTypeChange={handleRequestTypeFilter}
							filterByTypeData={[
								{
									isOpen: !isLoading
										? isOpen
										: params.get('isOpen')
										? true
										: false,
									isAssigned: !isLoading
										? isAssigned
										: params.get('isAssigned')
										? true
										: false,
								},
							]}
						/>
					</Col> */}
				<Col className="allListing">
					{isLoading ? (
						<Loader />
					) : viewType === 'List' ? (
						storyCount === 0 ? (
							<Col lg={24} md={24} sm={24} xs={24}>
								<Card className="">
									<Empty description={<span>No live stories available</span>} />
								</Card>
							</Col>
						) : (
							<>
								<Row gutter={20}>
									{storyList.map((singleStory, index) => (
										<Col
											lg={8}
											md={12}
											sm={24}
											xs={24}
											key={index}
											className="cardwidth">
											<LiveStoryCard story={singleStory} />
										</Col>
									))}
								</Row>
								<Row justify="end">
									<Col lg={24} md={24} sm={24} xs={24}>
										<Pagination
											current={pageNumber}
											onChange={pageChange}
											total={storyCount}
											pageSize={pageLimit}
										/>
									</Col>
								</Row>
							</>
						)
					) : (
						<Row className="googleMap_blk">
							<GoogleMap
								type="story"
								client={client}
								popup={showPopup}
								stories={storyList}
								onChildClickCallback={(key) => onMapChildCallback(key)}
							/>
						</Row>
					)}
				</Col>
			</Fragment>
		</div>
	);
};

export { LiveStreamStoryPage };
