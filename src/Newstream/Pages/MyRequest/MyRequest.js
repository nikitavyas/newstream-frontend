import React, { Component } from 'react';

import './MyRequest.css';
import moment from 'moment';
import {
	EnvironmentFilled,
	ClockCircleFilled,
	FormOutlined,
	DownOutlined,
	RightOutlined,
	LeftOutlined,
} from '@ant-design/icons';
import { withApollo } from 'react-apollo';
import {
	Row,
	Col,
	Card,
	Pagination,
	message,
	Carousel,
	Empty,
	Button
} from 'antd';
import { Link } from 'react-router-dom';
import { GoogleMap } from '../../Components/GoogleMap';
import { GET_REQUESTS, GET_REQUEST_FILTER } from '../../graphql/APIs';
import { getStoryMediaCount } from '../../Components/general/getStoryMediaCount';
import { Loader } from '../../Components/Loader/Loader';
import { analytics } from '../../utils/init-fcm';
import { OnboardingTour } from '../../Components/OnboardingTour';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { COULDBASEURL } from '../../Components/general/constant';
import queryString from 'query-string';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { Helmet } from "react-helmet";
import { SlickArrowLeft, SlickArrowRight } from '../../Components/general/general';

import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { size } from 'lodash';
function onChange(a, b, c) {
	// console.log(a, b, c);
}

const contentStyle = {
	height: '160px',
	color: '#fff',
	lineHeight: '160px',
	textAlign: 'center',
	margin: '0',
	background: '#364d79',
};
// const LIMIT = 5;
let allFilters = [];
class MyRequests extends Component {
	constructor(props) {
		SentryLog({
			category: 'My Request',
			message: 'My Request Page Loaded',
			level: Severity.Info,
		});
		super(props);
		analytics.setCurrentScreen('/myRequests');
		this.state = {
			loaded: false,
			activeKey: this.props.match.params.tabId,
			value: '',
			allStories: [],
			defaultCurrent: 1,
			stories: [],
			showMap: false,
			filters: [],
			showPopup: false,
			visible: false,
			requestLoaded: false,
			size: 5,
			limit: 5,
			search_text: this.props.location.state
				? this.props.location.state.search_text
				: null,
			showProposalSection: false,
		};
		this.onListViewClick = this.onListViewClick.bind(this);
		this.onPaginationChange = this.onPaginationChange.bind(this);
		this.onFilterTypeChange = this.onFilterTypeChange.bind(this);
		this.domRefs = {};
	}
	componentDidMount() {
		window.scrollTo(0, 0);
		try {
			allFilters = [];
			const variables = {};
			variables.page = 1;
			variables.limit = this.state.limit;
			let params = queryString.parse(this.props.location.search);
			// console.log(this.props);
			if (params) {
				if (params.time) {
					variables['time'] = params.time;
					this.setState({
						filterId: params.time,
					})
					allFilters.push('Last ' + params.time.replace('-', ' '));
				}
				if (params.isOpen) {
					variables['isOpen'] = true;
					this.setState({
						isOpen: true,
					});
					allFilters.push('Is Open');
				}
				if (params.isAssigned) {
					variables['isAssigned'] = true;
					this.setState({
						isAssigned: true,
					});
					allFilters.push('Is Assigned');
				}
				if (params.search) {
					variables['search'] = params.search;
					this.setState({
						search: params.search,
					});
					allFilters.push(params.search);
				}
				if (params.page) {
					variables['page'] = +params.page;
					this.setState({
						defaultCurrent: +params.page,
					});
				}
				if (params.limit) {
					variables['limit'] = +params.limit;
					this.setState({
						limit: +params.limit
					})
				}
			}

			this.setState({ activeKey: this.props.match.params.tabId });
			if (this.props.match.params.tabId === 'withProposal') {
				variables.isProposal = true;
			} else if (this.props.match.params.tabId === 'withoutProposal') {
				variables.isProposal = false;
			} else if (this.props.match.params.tabId === 'archived') {
				variables.isArchive = true;
			}
			this.getData(variables);
			this.getFilterData();
		} catch (error) {
			SentryError(error);
		}
	}
	componentDidUpdate() {
		// console.log('updated props');
		// console.log(this.props);
	}
	getData(variables) {
		try {
			this.setState({ requestLoaded: false });
			const { client } = this.props;
			client
				.watchQuery({
					query: GET_REQUESTS,
					fetchPolicy: 'network-only',
					variables: variables,
				})
				.subscribe(({ data, loading, error }) => {
					this.loading = loading;
					if (data !== undefined) {
						if (data.getAllRequestsWeb.requests.length > 0) {
							data.getAllRequestsWeb.requests.forEach((element) => {
								let image = 0;
								let video = 0;
								let audio = 0;
								// element.stories.forEach((result) => {
								// 	let storyMediaCount = getStoryMediaCount(result.storyMedia);
								// 	image += storyMediaCount.image;
								// 	video += storyMediaCount.video;
								// 	audio += storyMediaCount.audio;
								// });
								element.purchasedStories = element.stories.filter((data) => {
									return data.purchased.length > 0;
								});
								if (element.isOpen) {
									element.type = 'Open';
								} else {
									element.type = 'Assigned';
								}
								if (element.isLive) {
									element.type = 'Live';
								}
								element.showProposalSection = true;
								// element.storyMediaCount = {
								// 	image: image,
								// 	video: video,
								// 	audio: audio,
								// };
							});
							this.setState({
								requestLoaded: true,
								loaded: true,
								stories: data.getAllRequestsWeb.requests,
								requestCount: data.getAllRequestsWeb.totalRequests,
							});
						} else {
							this.props.history.push("/errorMessages/noData")
						}
					}
					if (error) {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);
							message.destroy();
							message.error('Something went wrong please try again later');
						}
					}
				});
		} catch (error) {
			SentryError(error);
		}
	}
	onPaginationChange = (key, size) => {
		try {
			analytics.logEvent('pager', {
				action: 'clickPageNumber',
				label: 'page',
				value: key,
			});
			this.setState({ defaultCurrent: key, size: size });
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.set('limit', size)
			search_params.set('page', key);
			url.search = search_params.toString();
			var new_url = url.toString();
			//window.history.replaceState(null, null, new_url);
			var tabId = new_url.substr(new_url.indexOf('?') - 1, 1);
			this.props.history.push('/myRequest/' + this.state.activeKey + url.search);
		} catch (error) {
			SentryError(error);
		}
	};
	getFilterData() {
		try {
			const { client } = this.props;
			client
				.query({
					query: GET_REQUEST_FILTER,
					//fetchPolicy: "cache-and-network",
					//variables: variables
				})
				.then(({ data, loading }) => {
					this.loading = loading;
					if (data !== undefined) {
						let filterData = data.getRequestFilter.filter((data) => {
							return data.slug === 'time';
						});
						this.setState({ filters: filterData[0].filters });
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	}
	onChange = (value) => {
		try {
			const variables = {};
			this.setState({
				stories: [],
				showPopup: false,
				defaultCurrent: 1,
				activeKey: value,
				//	search: null,
				//	filterId: null,
				//	isOpen: false,
				//	isAssigned: false,
			});
			if (value === '1') {
				analytics.setCurrentScreen('/myRequest/withProposals');
				variables.withProposal = true;
			} else if (value === '2') {
				analytics.setCurrentScreen('/myRequest/withoutProposals');
				variables.withProposal = false;
			} else if (value === '3') {
				analytics.setCurrentScreen('/myRequest/Archived');
				variables.isArchive = true;
			}
			if (this.state.filterId) {
				variables.time = this.state.filterId;
			}
			if (this.state.isOpen === true) {
				variables['isOpen'] = true;
			}
			if (this.state.isAssigned === true) {
				variables['isAssigned'] = true;
			}
			variables.page = 1;
			variables.limit = this.state.limit;
			this.getData(variables);
		} catch (error) {
			SentryError(error);
		}
	};
	onListViewClick() {
		try {
			analytics.logEvent('viewMode', {
				action: this.state.showMap ? 'list' : 'map',
			});
			this.setState({ showPopup: false, showMap: !this.state.showMap }, () => {
				let variables = {};
				if (this.state.activeKey === 'withProposal') {
					variables.withProposal = true;
				} else if (this.state.activeKey === 'withoutProposal') {
					variables.withProposal = false;
				} else if (this.state.activeKey === 'archived') {
					variables.isArchive = true;
				}
				if (this.state.isOpen === true) {
					variables['isOpen'] = true;
				}
				if (this.state.isAssigned === true) {
					variables['isAssigned'] = true;
				}
				variables['time'] = this.state.filterId;
				variables['search'] = this.state.search;
				if (!this.state.showMap) {
					variables['page'] = 1;
					variables['limit'] = this.state.limit;
				}
				this.getData(variables);
			});
		} catch (error) {
			SentryError(error);
		}
	}
	// onChildClick callback can take two arguments: key and childProps
	onChildClickCallback = async (key) => {
		try {
			this.setState(
				{
					showPopup: key,
				},
				() => {
					return true;
				}
			);
		} catch (error) {
			SentryError(error);
		}
	};
	onFilterChange = (event) => {
		try {
			this.setState({
				showPopup: false,
				visible: false,
			});
			this.setState({
				filterId: event.target.value,
				defaultCurrent: 1,
			});
			let variables = {};
			if (this.state.activeKey === 'withProposal') {
				variables.withProposal = true;
			} else if (this.state.activeKey === 'withoutProposal') {
				variables.withProposal = false;
			} else if (this.state.activeKey === 'archived') {
				variables.isArchive = true;
			}
			if (this.state.isOpen === true) {
				variables['isOpen'] = true;
			}
			if (this.state.isAssigned === true) {
				variables['isAssigned'] = true;
			}
			variables.time = event.target.value;
			variables['search'] = this.state.search;
			variables.page = 1;
			// variables.limit = LIMIT;
			const filterData = this.state.filters.filter((data) => {
				return data.filterId === event.target.value;
			});
			// console.log(filterData);
			if (filterData.length > 0) {
				analytics.logEvent('filters', {
					action: 'set',
					label: 'filterByTime',
					value: filterData[0]['title'],
				});
			}
			this.getData(variables);
		} catch (error) {
			SentryError(error);
		}
	};
	onFilterTypeChange = (event) => {
		try {
			this.setState({
				showPopup: false,
				currentPage: 1,
			});
			//	const name = event.target.name;
			let state = {};
			this.setState({ isOpen: false, isAssigned: false }, () => {
				if (event.length > 0) {
					event.map((data) => {
						if (data === 'isOpen') {
							state['isOpen'] = true;
						}
						if (data === 'isAssigned') {
							state['isAssigned'] = true;
						}
					});
				} else {
					state['isOpen'] = false;
					state['isAssigned'] = false;
				}
				if (Object.keys(state).length > 0) {
					this.setState(state, () => {
						let variables = {};
						if (this.state.isOpen === true) {
							variables['isOpen'] = true;
						}
						if (this.state.isAssigned === true) {
							variables['isAssigned'] = true;
						}
						if (this.state.activeKey === 'withProposal') {
							variables['withProposal'] = true;
						} else if (this.state.activeKey === 'withoutProposal') {
							variables['withProposal'] = false;
						} else if (this.state.activeKey === 'archived') {
							variables['isArchive'] = true;
						}
						variables['time'] = this.state.filterId;
						variables['search'] = this.state.search;
						if (!this.state.showMap) {
							variables['page'] = 1;
							variables['limit'] = this.state.limit;
						}
						this.getData(variables);
					});
				}
			});
		} catch (error) {
			SentryError(error);
		}
	};
	handleVisibleChange = (visible) => {
		this.setState({ visible });
	};
	onSearchChange = (value) => {
		try {
			this.setState({
				showPopup: false,
				currentPage: 1,
			});
			this.setState({ search: value }, () => {
				let variables = {};
				if (this.state.isOpen === true) {
					variables['isOpen'] = true;
				}
				if (this.state.isAssigned === true) {
					variables['isAssigned'] = true;
				}
				if (this.state.activeKey === 'withProposal') {
					variables['withProposal'] = true;
				} else if (this.state.activeKey === 'withoutProposal') {
					variables['withProposal'] = false;
				} else if (this.state.activeKey === 'archived') {
					variables['isArchive'] = true;
				}
				variables['time'] = this.state.filterId;
				variables['search'] = value;
				if (!this.state.showMap) {
					variables['page'] = 1;
					variables['limit'] = this.state.limit;
				}
				this.getData(variables);
			});
		} catch (error) {
			SentryError(error);
		}
	};
	clearFilter = (value = {}) => {

		try {
			if (Object.keys(value).length > 0) {
				if (value.type === 'time') {
					this.setState({ filterId: null }, () => {
						this.setClearData();
					});
				} else if (value.type === 'type') {
					let state = {};
					state[value.value] = false;
					this.setState(state, () => {
						this.setClearData();
					});
				} else if (value.type === 'search') {
					this.setState({ search: null }, () => {
						this.setClearData();
					});
				}
			} else {
				this.setState(
					{
						filterId: null,
						isOpen: false,
						isAssigned: false,
						search: null,
					},
					() => {
						this.setClearData();
					}
				);
			}
			SentryLog({
				category: 'Marketplace',
				//	message: 'Filter Applied of categories - ' + value,
				level: Severity.Info,
			});

			analytics.logEvent('filters', {
				action: 'set',
				label: 'clearFilter',
				//value: filterData[0]['title'],
			});
		} catch (error) {
			SentryError(error);
		}
	};
	setClearData() {
		let variables = {};
		if (this.state.isOpen === true) {
			variables['isOpen'] = true;
		}
		if (this.state.isAssigned === true) {
			variables['isAssigned'] = true;
		}

		if (this.state.activeKey === 'withProposal') {
			variables['withProposal'] = true;
		} else if (this.state.activeKey === 'withoutProposal') {
			variables['withProposal'] = false;
		} else if (this.state.activeKey === 'archived') {
			variables['isArchive'] = true;
		}
		variables['time'] = this.state.filterId;
		variables['search'] = this.state.search;
		if (!this.state.showMap) {
			variables['page'] = 1;
			variables['limit'] = this.state.limit;
		}
		this.getData(variables);
	}
	getImages = (media, mediaUrl) => (
		<div className="ImagesSlider">
			<div className="marketimgbox">
				<img alt="" className="brdrd" src={mediaUrl + media.mediaName} />
				<CustIcon type="imageicon" className="imagetypeIcon" />
			</div>
		</div>
	);
	playVideo = (index) => {
		this.domRefs[index].play();
	};
	getVideos = (media, mediaUrl, index) => (
		<div className="ImagesSlider">
			<div className="marketimgbox">
				<img alt="" className="brdrd"
					src={
						mediaUrl + media.thumbnail
							? mediaUrl + media.thumbnail
							: require('../../Assets/images/ic_no_image.png')
					}
				/>
				<CustIcon type="videoicon" className="imagetypeIcon" />
				<CustIcon type="playicon" className="videoPlay" />
			</div>
		</div>
	);
	getAudios = (media, mediaUrl) => (
		<div className="ImagesSlider">
			<div className="marketimgbox">
				<img
					width=""
					alt=""
					className="brdrd"
					src={require('../../Assets/images/audio-waves.png')}
				/>
				<CustIcon type="audioicon" className="imagetypeIcon" />
			</div>
		</div>
	);
	getMediaContents = (medias) => {

		const mediaUrl = COULDBASEURL;
		return medias.map((media, index) => {
			switch (media.type) {
				case 'image':
					return this.getImages(media, mediaUrl);
				case 'video':
					return this.getVideos(media, mediaUrl, index);
				case 'audio':
					return this.getAudios(media, mediaUrl);
				default:
					return <div className="ImagesSlider">
					<div className="marketimgbox articleimg">
						<img
							width=""
							alt=""
							className="brdrd"
							src={require('../../Assets/images/ic_article.svg')}
						/>
						<CustIcon type="audioicon" className="imagetypeIcon" />
					</div>
				</div>;;
			}
		});
	};
	render() {
		const settings = {
			nextArrow: <SlickArrowRight />,
			prevArrow: <SlickArrowLeft />,
		};
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Buyer |
						My Request (
						{this.state.activeKey == 'withProposal' ? "With Proposal" :
							this.state.activeKey == 'withoutProposal' ? "Without Proposal" : "Archived"}
						)</title>
				</Helmet>
				{this.state.loaded ? (
					<div className="myrequest-page">
						<div className="globaltitle mb-3">
							{allFilters.length === 0 ? <h3 className="mb-lg-0">
								{this.state.activeKey === 'withProposal'
									? 'Showing list of request with submitted proposals'
									: this.state.activeKey === 'withoutProposal'
										? 'Showing list of request without proposals'
										: 'Showing list of Archived requests'}
							</h3> : <h3 className="mb-lg-0"> Total {this.state.requestCount > 0 ? this.state.requestCount + ' results' : '0 result'} found for {allFilters.join(',')} </h3>}
						</div>
						{this.state.stories.length > 0 ? (
							<>
								{this.state.stories.map(((story, index) => (
									<Card key={index} className="request_card mb-4 tour-listView-details-button">
										{/* {story.isOpen ? (
											<div className="badge badge_open mb-3">Open</div>
										) : (
											<div className="badge badge_assign mb-3">Assigned</div>
										)} */}
										<h5 className="mb-1">{story.title}</h5>
										<div className="request_location">
											<EnvironmentFilled className="mr-2" />
											{story.location}
										</div>
										<div className="request_location mb-3">
											<ClockCircleFilled className="mr-2" />
											{moment(
												new Date(parseFloat(story.createdDate))
											).fromNow()}
										</div>
										<div className="font16 font-weight-bold mb-2">
											Media Requested
										</div>
										<div className="request-media-btn mb-2">
											<Button
												type="primary"
												className={story.isVideo ? 'active' : ''}>
												<CustIcon type="videoicon" className="mr-2" />
												Video
											</Button>
											<Button
												type="default"
												className={story.isImage ? 'active' : ''}>
												<CustIcon type="imageicon" className="mr-2" />
												Image
											</Button>
											<Button
												type="default"
												className={story.isAudio ? 'active' : ''}>
												<CustIcon type="audioicon" className="mr-2" />
												Audio
											</Button>
											<Button
												type="default"
												className={story.isArticle ? 'active' : ''}>
												<CustIcon type="articlesicon" className="mr-2" />
												Article
											</Button>
											<Button
												type="default"
												className={story.isLive ? 'active' : ''}>
												<CustIcon type="liveicon" className="mr-2" />
												Live
											</Button>
											<Button
												type="default"
												className={story?.isRaw ? 'active' : ''}>
												<CustIcon type="articlesicon" className="mr-2" />
												Raw Data
											</Button>
											{/* <Button type="default">
												<CustIcon type="articlesicon" className="mr-2" />
												Articles
											</Button> */}
										</div>
										{this.state.activeKey !== 'withoutProposal' &&
											<div className="d-flex justify-content-between align-items-center mb-2 mb-lg-4">
												<div className="reqProposal">
													{story.stories.length}{' '}
													{story.stories.length > 1 ? "stories" : "Story"} submitted
													<span className="ml-2">
														({story.purchasedStories.length}/
														{story.stories.length} purchased)
													</span>
												</div>
												{story.stories.length > 0 && (
													<div className="reqSelect d-none d-sm-block">
														<Button
															className={story.showProposalSection ? 'active' : ''}
															type="link"
															className={story.showProposalSection ? 'active' : ''}
															onClick={(e) => {
																let stories = this.state.stories;
																stories[index].showProposalSection = !stories[index].showProposalSection
																this.setState({
																	stories: stories
																})
															}
															}>
															<CustIcon type="downarrow" className="ml-2" />
														</Button>
													</div>)}
											</div>}
										{story.showProposalSection &&
											story.stories.length > 0 && (
												<Card className="boxshadow mb-3 d-none d-sm-block">
													<div className="d-flex justify-content-between">
														<h4 className="font-weight-bold font14 mb-1">
															Recent {this.state.activeKey === 'withProposal' ? 'Stories' : 'Proposals'}
														</h4>
														{story.stories.length > 4 ? <Link
															className="viewAll"
															to={`/myRequest/${this.state.activeKey}/proposals/${story.requestId}`}>
															View all
															<RightOutlined className="ml-2" />
														</Link> : undefined}
													</div>
													<Row gutter={20}>
														{story.stories.map((data, index) => {
															return (
																index < 4 && (
																	<Col lg={4} md={8} sm={12} xs={24} className="mt-3">
																		<Link to={`/myRequest/${this.state.activeKey}/storyDetails/${data.storyId}`}>
																			<Card
																				key={index}
																				className="market_card recentProposal"
																				bordered={false}
																				cover={
																					<Carousel
																						dots={false}
																						arrows={true}
																						{...settings}>
																						{data.storyMedia.length > 0
																							? this.getMediaContents(
																								data.storyMedia
																							)
																							: data.storyLiveStream ?
																								<div className="ImagesSlider">
																									<div className="marketimgbox">
																										<img alt="" className="brdrd" src={COULDBASEURL + data.storyLiveStream.thumbnail} />
																										<CustIcon type="liveicon" className="imagetypeIcon" />
																									</div>
																								</div>
																								: <div className="ImagesSlider">
																									<div className="marketimgbox">
																										<img alt="" className="brdrd" src={require('../../Assets/images/ic_no_image.png')} />
																										<CustIcon type="liveicon" className="imagetypeIcon" />
																									</div>
																								</div>
																						}
																					</Carousel>
																				}
																			>
																				<div className="markert_body_top d-flex justify-content-between align-items-center">
																					<div className="d-flex align-items-center">
																						<ProfileAvatar
																							size={36}
																							name={data.createdBy.name}
																							imageUrl={
																								data.createdBy.profileImage
																							}
																						/>
																						<div className="d-flex flex-column pl-3">
																							<h5 className="text-white">
																								{data.createdBy.name}
																							</h5>
																							<div className="postedtime text-white">
																								{moment(
																									new Date(
																										parseFloat(data.createdDate)
																									)
																								).fromNow()}
																							</div>
																						</div>
																					</div>
																				</div>
																			</Card>
																		</Link>
																	</Col>
																)
															);
														})}
													</Row>
												</Card>
											)}
										<div className="d-flex justify-content-between align-items-center">
											<div className="reqPrice">$ {story.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
											{this.state.activeKey == 'archived' ? <Link
												className="requesteditbtn"
												to={`/myRequest/${this.state.activeKey}/proposals/${story.requestId}`}>
												<FormOutlined className="mr-2" />
												View Details
											</Link> : <Link
												className="requesteditbtn"
												to={`/myRequest/${this.state.activeKey}/editRequest/${story.requestId}`}>
												<FormOutlined className="mr-2" />
												Edit Request
											</Link>}
										</div>
									</Card>
								)))}
								<Pagination
									total={this.state.requestCount}
									showTotal={(total) =>
										`Total ${total} ${total > 1 ? 'items' : 'item'}`
									}
									showSizeChanger
									defaultPageSize={this.state.limit}
									current={this.state.defaultCurrent}
									onChange={this.onPaginationChange}
									pageSizeOptions={[5, 10, 20, 50, 100]}
								/>
								{' '}
								<OnboardingTour
									tourName={[
										'header',
										window.innerWidth > 1199 ? 'navbar' : null,
									]}
								/>{' '}
							</>
						) : (
							<Card className="mt-4">
								<Empty description={<span>No data available</span>} />
							</Card>
						)}

						<OnboardingTour
							tourName={['header', window.innerWidth > 1199 ? 'navbar' : null]}
						/>
						{/* <div className="filter-block my-sm-2 mb-2">
							<div className="d-flex flex-row align-items-md-center align-items-end justify-content-between justify-content-md-end">
								<div className="d-flex flex-row  align-items-sm-center align-items-end justify-content-between justify-content-md-end">
									<Radio.Group
										value={this.state.showMap}
										onChange={this.onListViewClick}
										buttonStyle="solid"
										className="viewSwitchround">
										<Radio.Button value={true}>
											<EnvironmentFilled className="mr-2" />
											Map View
										</Radio.Button>
										<Radio.Button value={false}>
											<UnorderedListOutlined className="mr-2" />
											List View
										</Radio.Button>
									</Radio.Group>
								</div>
							</div>
						</div> */}
					</div>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}
let MyRequest = withApollo(MyRequests);
export { MyRequest };
