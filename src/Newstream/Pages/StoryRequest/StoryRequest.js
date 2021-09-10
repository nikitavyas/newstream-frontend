/* eslint-disable jsx-a11y/anchor-is-valid */
import {
	EnvironmentFilled,
	FilterOutlined,
	UnorderedListOutlined,
} from '@ant-design/icons';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Checkbox,
	Dropdown,
	message,
	Modal,
	Radio,
	Tabs,
	Row,
	Col,
} from 'antd';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { Loader } from '../../Components/Loader';
import { RequesListView } from '../../Components/RequestStories/RequestListView';
import GoogleMap from '../../Components/RequestStories/RequestMapViewNew';
import { CustIcon } from '../../Components/Svgs';
import { GETALLREQUEST } from '../../graphql/query';
import { analytics } from '../../utils/init-fcm';
import './Request.css';
import { Filter } from '../../Components/Filter';
import queryString from 'query-string';

const { TabPane } = Tabs;

class StoryRequest extends Component {
	constructor(props) {
		analytics.setCurrentScreen('/requests');
		super(props);
		this.state = {
			storyViewType: 'list',
			totalRequests: 0,
			requests: [],
			requestFilters: [],
			time: undefined,
			order: undefined,
			loading: false,
			activeTab: 'All',
			params: {
				page: 1,
				limit: 5,
				requestType: undefined,
				order: 'DESC',
				orderby: 'createdDate',
				isAccepted: undefined,
				time: undefined,
				lat: parseFloat(localStorage.getItem('userLat')),
				lng: parseFloat(localStorage.getItem('userLng')),
				distance: undefined,
				isAssigned:
					localStorage.getItem('userType') === 'Applicant' || undefined,
				search: null,
			},
			filterVisible: false,
			isListView: true,
		};
		this.child = React.createRef();
		this.changeData = this.changeData.bind(this);
		this.changeOrder = this.changeOrder.bind(this);
		this.changeTab = this.changeTab.bind(this);
		this.changeStatus = this.changeStatus.bind(this);
		this.ViewRequest = this.ViewRequest.bind(this);
	}

	componentDidMount() {
		let params = queryString.parse(this.props.location.search);
		let paramState = { page: 1, limit: 5 };
		if (params) {
			if (params.time) {
				paramState.time = params.time;
				this.setState({ time: params.time });
			}
			if (params.distance) {
				paramState.distance = +params.distance;
				//	this.setState({ di: params.time });
			}
			if (params.search) {
				paramState.search = params.search;
			}
			if (params.isAccepted) {
				paramState.isAccepted = true;
			}
		}
		this.setState({ params: paramState }, () => {
			this.getAllRequest();
		});
		SentryLog({
			category: 'page',
			message: 'Request List Page Loaded',
			level: Severity.Debug,
		});
	}

	/**
	 * viewRequest 
	 * 
	 * @param {*} request 
	 */
	
	
	ViewRequest = (request) => {
		SentryLog({
			category: 'page',
			message: `View Request Details for Request Id : ${request.requestId}`,
			level: Severity.Debug,
		});
		this.props.history.push(`/requests-details/${request.requestId}`);
	};

	SubmitStory = (request) => {
		SentryLog({
			category: 'page',
			message: `Submit Story for Request Id : ${request.requestId}`,
			level: Severity.Debug,
		});
		localStorage.setItem('request', JSON.stringify(request));
		this.props.history.push('/requests/story');
	};

	changeData = async (page, pageSize) => {
		analytics.logEvent('pager', {
			action: 'clickPageNumber',
			label: 'page',
			value: page,
		});
		const params = this.state.params;
		await this.setState({
			params: {
				...params,
				page: parseInt(page),
				limit: parseInt(pageSize),
			},
		});
		this.getAllRequest();
	};

	async getAllRequest() {
		const { client } = this.props;
		const params = { ...this.state.params };
		if (this.state.storyViewType === 'map') {
			delete params.page;
			delete params.limit;
		}
		this.setState({
			loading: true,
			requests: [],
		});
		SentryLog({
			category: 'data-fetch',
			message: `Fetch Requests for ${JSON.stringify(params)}`,
			level: Severity.Debug,
		});

		await client
			.query({
				query: GETALLREQUEST,
				variables: params,
				fetchPolicy: 'no-cache',
			})
			.then(({ data }) => {
				SentryLog({
					category: 'data-fetch',
					message: `Requests List Fetch Successful`,
					level: Severity.Debug,
				});
				const requestData = data.getAllRequestsWeb.requests;
				// const mapData = data.getAllRequestsWeb.requests.map(req => {
				//   return {
				//     "type": "Feature",
				//     "properties": {
				//       "id": req.requestId,
				//       ...req
				//     },
				//     "geometry": {"type": "Point", "coordinates": [parseFloat(req.lng), parseFloat(req.lat)]}
				//   }
				// });
				//mapData,
				this.setState({
					requests: requestData,
					totalRequests: data.getAllRequestsWeb.totalRequests,
					requestFilters: data.getAllRequestsWeb.requestFilters,
					loading: false,
				});
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors[0]) {
				} else {
					message.error('Something went wrong please try again later.');
				}
				SentryError(error);
			});
	}

	changeTab = async (key) => {
		if (key === 'Open' && localStorage.getItem('userType') === 'Applicant') {
			this.setState({ activeTab: 'All' });
			Modal.error({
				centered: true,
				title: 'Sorry',
				content:
					'You currently do not have the required authorization to access this feature',
				onOk() {
					return null;
				},
				cancelButtonProps: { style: { display: 'none' } },
			});
		} else {
			this.setState({ activeTab: key });
			analytics.setCurrentScreen('/requests/' + key);
			SentryLog({
				category: 'filter',
				message: `Filter requests by ${key} Request Types`,
				level: Severity.Debug,
			});
			const params = this.state.params;
			const requestFilters = this.state.requestFilters;
			let filters = requestFilters[0].filters;
			let requestType = filters.find((filter) => filter.title === key)
				? filters.find((filter) => filter.title === key)['filterId']
				: undefined;
			await this.setState({
				params: {
					...params,
					page: 1,
					limit: 5,
					requestType: requestType,
				},
			});
			//if (this.state.storyViewType === 'map') this.child.current.closeMarker();
			this.getAllRequest();
			//	this.clearAll();
		}
	};

	changeOrder = async (key) => {
		analytics.logEvent('sortBy', {
			action: 'set',
			label: 'sortByPrice',
			value: key.target.value === 'DESC' ? 'highToLow' : 'lowToHigh',
		});
		SentryLog({
			category: 'filter',
			message: `Sort requests by price ${key.target.value}`,
			level: Severity.Debug,
		});
		const params = this.state.params;
		await this.setState({
			params: {
				...params,
				page: 1,
				limit: 5,
				order: key.target.value,
				orderby: 'price',
			},
			order: key.target.value,
		});
		this.getAllRequest();
	};

	clearOrder = async () => {
		SentryLog({
			category: 'filter',
			message: `Clear Sort by price`,
			level: Severity.Debug,
		});
		const params = this.state.params;
		await this.setState({
			params: {
				...params,
				page: 1,
				limit: 5,
				order: 'DESC',
				orderby: 'createdDate',
			},
			order: undefined,
		});
		this.getAllRequest();
	};

	changeTime = async (key) => {
		const requestFilter = this.state.requestFilters[1].filters;
		// console.log(requestFilter);
		let selectedFilters = requestFilter.find(
			(el) => el.slug === key.target.value
		);
		analytics.logEvent('filters', {
			action: 'set',
			label: 'filterByTime',
			value: selectedFilters.title,
		});
		SentryLog({
			category: 'filter',
			message: `Filter requests received in ${selectedFilters.title}`,
			level: Severity.Debug,
		});
		const params = this.state.params;
		let filters = selectedFilters.filterId;
		await this.setState({
			params: {
				...params,
				time: selectedFilters.slug,
			},
			time: selectedFilters.slug,
		});
		this.getAllRequest();
	};

	changeDistance = async (key) => {
		// console.log(this.state.requestFilters[2].filters);
		analytics.logEvent('filters', {
			action: 'set',
			label: 'filterByDistance',
			value: key.target.value + ' Miles',
		});
		SentryLog({
			category: 'filter',
			message: `Filter requests ${key.target.value} miles from the user`,
			level: Severity.Debug,
		});
		const params = this.state.params;
		await this.setState({
			params: {
				...params,
				distance: +key.target.value,
			},
			distanceValue: key.target.value,
		});
		this.getAllRequest();
	};

	changeStatus = async (event) => {
		analytics.logEvent('filters', {
			action: 'set',
			label: 'filterByType',
			value: this.state.requestFilters[3].filters[0]['title'],
		});
		const params = this.state.params;
		if (event.target.checked) {
			SentryLog({
				category: 'filter',
				message: `Show only Assigned Requests`,
				level: Severity.Debug,
			});
			const requestFilters = this.state.requestFilters;
			let isAccepted = requestFilters[3].filters[0]['filterId'];
			await this.setState({
				params: {
					...params,
					isAccepted: true,
					page: 1,
				},
			});
		} else {
			SentryLog({
				category: 'filter',
				message: `Show both Assigned and Open Requests`,
				level: Severity.Debug,
			});
			await this.setState({
				params: {
					...params,
					isAccepted: undefined,
					page: 1,
				},
			});
		}
		this.getAllRequest();
	};
	onSearchChange = async (value) => {
		analytics.logEvent('filters', {
			action: 'set',
			label: 'search',
			value: value,
		});
		const params = this.state.params;
		await this.setState({
			params: {
				...params,
				search: value,
				page: 1,
			},
		});
		this.getAllRequest();
	};

	viewChangeHandler = async (event) => {
		analytics.logEvent('viewMode', {
			action: event.target.value,
		});
		SentryLog({
			category: 'view-mode',
			message: `Changed View to ${event.target.value}`,
			level: Severity.Debug,
		});
		let isListView = true;
		if (event.target.value === 'map') {
			isListView = false;
		}
		this.setState({ storyViewType: event.target.value, isListView }, () => {
			this.getAllRequest();
		});
	};

	clearFilter = (value) => {
		SentryLog({
			category: 'filter',
			message: `Clear all filters`,
			level: Severity.Debug,
		});
		const params = this.state.params;
		if (Object.keys(value).length > 0) {
			if (value.type === 'search') {
				params.search = null;
			} else if (value.type === 'isAccepted') {
				params.isAccepted = null;
			} else if (value.type === 'distance') {
				params.distance = null;
			} else if (value.type === 'time') {
				params.time = undefined;
				this.setState({
					time: undefined,
				});
			}
			this.setState(
				{
					params: {
						...params,
					},
				},
				() => {
					this.getAllRequest();
				}
			);
		} else {
			this.setState(
				{
					params: {
						...params,
						time: undefined,
						isAccepted: undefined,
						distance: undefined,
						search: undefined,
					},
					time: undefined,
				},
				() => {
					this.getAllRequest();
				}
			);
		}
	};

	render() {
		const { requests, totalRequests, params, time, order } = this.state;
		const radioStyle = {
			display: 'block',
			height: '30px',
			lineHeight: '30px',
		};

		const menu = (
			<div className="filterMenu_blk">
				<div className="label_blk">Filter by status</div>
				<div className="py-1">
					<Checkbox
						onChange={this.changeStatus}
						checked={params.isAccepted}
						className="black-text-color">
						Accepted
					</Checkbox>
				</div>
				<div className="border-top mt-1 pb-2"></div>
				<div className="label_blk">Filter by time</div>
				<Radio.Group onChange={this.changeTime} value={time}>
					<Radio style={radioStyle} value={0} className="black-text-color">
						Last 6 hours
					</Radio>
					<Radio style={radioStyle} value={1} className="black-text-color">
						Last 2 days
					</Radio>
					<Radio style={radioStyle} value={2} className="black-text-color">
						Last 1 week
					</Radio>
				</Radio.Group>
				<div className="border-top mt-1 pb-2"></div>
				<div className="label_blk">Filter by distance</div>
				<Radio.Group onChange={this.changeDistance} value={params.distance}>
					<Radio style={radioStyle} value={10} className="black-text-color">
						10 miles
					</Radio>
					<Radio style={radioStyle} value={50} className="black-text-color">
						50 miles
					</Radio>
					<Radio style={radioStyle} value={100} className="black-text-color">
						100 miles
					</Radio>
					<Radio style={radioStyle} value={200} className="black-text-color">
						200 miles
					</Radio>
					<Radio style={radioStyle} value={300} className="black-text-color">
						300 miles
					</Radio>
				</Radio.Group>
				<a
					onClick={() => this.clearAll()}
					className="d-flex mt-1 border-top pt-1 w-100">
					Clear all
				</a>
			</div>
		);
		const sortBy = (
			<div className="filterMenu_blk">
				<div className="label_blk">Price</div>
				<Radio.Group onChange={this.changeOrder} value={order}>
					<Radio style={radioStyle} value={'DESC'} className="black-text-color">
						High to low
					</Radio>
					<Radio style={radioStyle} value={'ASC'} className="black-text-color">
						Low to high
					</Radio>
				</Radio.Group>
				<a
					onClick={() => this.clearOrder()}
					className="d-flex mt-1 border-top pt-1 w-100">
					Clear all
				</a>
			</div>
		);

		const operations = (
			<div className="filterSection_blk d-flex justify-content-lg-end align-items-start">
				<div className="d-flex flex-sm-row flex-column ml-lg-auto sort-container">
					<Radio.Group
						defaultValue={this.state.storyViewType}
						buttonStyle="solid"
						onChange={this.viewChangeHandler}
						className="viewSwitchround mr-md-3 mb-md-0 mb-2">
						<Radio.Button value="map" className="tour-header-map-view">
							<EnvironmentFilled className="mr-2" />
							Map View
						</Radio.Button>
						<Radio.Button value="list" className="tour-header-list-view">
							<UnorderedListOutlined className="mr-2" />
							List View
						</Radio.Button>
					</Radio.Group>
					<div className="d-flex justify-content-between">
						{this.state.isListView && (
							<Dropdown overlay={sortBy} trigger="click" placement="bottomLeft">
								<Button shape="round" className="sortby_btn mr-3">
									<img
										src={require('../../Assets/icon/ic_sort.png')}
										alt="sort"
										className="mr-2"
									/>
									Sort By
								</Button>
							</Dropdown>
						)}

						{/* <Dropdown
							overlay={menu}
							trigger="click"
							placement="bottomLeft"
							visible={this.state.filterVisible}
							onVisibleChange={this.handleVisibleChange}>
							<Button shape="round" type="primary">
								<FilterOutlined className="" /> Filters
							</Button>
						</Dropdown> */}
					</div>
				</div>
			</div>
		);

		return (
			<div className="request-container">
				<div className="alltabUI">
					<Tabs
						className=""
						activeKey={this.state.activeTab}
						onChange={this.changeTab}
						tabBarExtraContent={operations}>
						<TabPane tab="All Requests" key="All"></TabPane>
						<TabPane tab="Open" key="Open"></TabPane>
						<TabPane tab="Assigned" key="Assigned"></TabPane>
					</Tabs>
				</div>
				<React.Fragment>
					<Row gutter={20}>
						<Col xs={24} lg={6} className="mb-3">
							{this.state.requestFilters.length > 0 && (
								<Filter
									timeFilters={this.state.requestFilters[1].filters}
									filterId={time}
									onFilterChange={this.changeTime}
									onAcceptedFilterChange={this.changeStatus}
									AcceptedFilter={params.isAccepted}
									type="request"
									params={params}
									clearFilter={this.clearFilter}
									changeDistance={this.changeDistance}
									distanceFilters={this.state.requestFilters[2].filters}
									distanceValue={params.distance}
									searchValue={params.search}
									onSearchChange={this.onSearchChange}
								/>
							)}
						</Col>
						<Col xs={24} lg={18}>
							{this.state.loading ? (
								<Loader />
							) : (
								<React.Fragment>
									{this.state.storyViewType === 'map' && (
										<GoogleMap
											SubmitStory={this.SubmitStory}
											ViewRequest={this.ViewRequest}
											ref={this.child}
											stories={requests}
											client={this.props.client}
										/>
									)}
									{this.state.storyViewType === 'list' && (
										<RequesListView
											loading={this.state.loading}
											changeData={this.changeData}
											requests={requests}
											totalRequests={totalRequests}
											params={params}
											SubmitStory={this.SubmitStory}
											ViewRequest={this.ViewRequest}
										/>
									)}
								</React.Fragment>
							)}
						</Col>
					</Row>
				</React.Fragment>
			</div>
		);
	}

	handleVisibleChange = (flag) => {
		this.setState({
			filterVisible: flag,
		});
	};
}

StoryRequest = withApollo(StoryRequest);
export { StoryRequest };
