import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Card,
	Col,
	message,
	Row,
	Select,
	Carousel,
	Radio,
	Empty,
	Pagination,
} from 'antd';
import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import {
	ClockCircleFilled,
	EnvironmentFilled,
	StarFilled,
	RightOutlined,
	AppstoreFilled,
	LeftOutlined,
} from '@ant-design/icons';
import { GET_STORIES } from '../../graphql/APIs';
import { useApolloClient } from 'react-apollo';
import moment from 'moment';
import { CustIcon } from '../../Components/Svgs/Svgs';
import './ReporterMarketplace.css';
import { Loader } from '../../Components/Loader/Loader';
import { Link } from 'react-router-dom';
import { COULDBASEURL } from '../../Components/general/constant';
import { GoogleMap } from '../../Components/GoogleMap';
import { Helmet } from 'react-helmet';
import { SlickArrowLeft, SlickArrowRight } from '../../Components/general/general';
const { Option } = Select;
let allFilters = [];
const ReporterMarketplace = (props) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [defaultCurrent, setDefaultCurrent] = useState(1);
	const [limit, setLimit] = useState(12);
	const [storyCount, setStoryCount] = useState(null);
	const [storyList, setStoryList] = useState([]);
	const [type, setType] = useState(undefined);
	const [isMapView, setIsMapView] = useState(false);
	const [isMapLoading, setIsMapLoading] = useState(false);
	const [selectedSorting, setSelectedSorting] = useState('Price');
	const client = useApolloClient();
	useEffect(() => {
		window.scrollTo(0, 0);
		allFilters = []
		let proposalVariables = {
			isProposal: true,
			isGlobal: true,
			isIndependent: true,
			page: 1,
			limit,
			lat: +localStorage.getItem('userLat'),
			lng: +localStorage.getItem('userLng'),
		};
		let fullVariables = {
			isProposal: false,
			isGlobal: true,
			page: 1,
			limit,
			lat: +localStorage.getItem('userLat'),
			lng: +localStorage.getItem('userLng'),
		};
		let params = queryString.parse(props.location.search);
		if (params.time) {
			proposalVariables['time'] = params.time;
			fullVariables['time'] = params.time;
			allFilters.push(params.time)
		}
		if (params.distance) {
			let miles = [];
			miles = params.distance.replace(' miles', '');
			proposalVariables['distance'] = +miles;
			fullVariables['distance'] = +miles;
			allFilters.push(params.distance)
		}
		if (params.type) {
			const mediaTypes = params.type.split(',');
			proposalVariables['mediaType'] = mediaTypes;
			fullVariables['mediaType'] = mediaTypes;
			allFilters.push(params.type)
		}
		if (params.isPurchased) {
			proposalVariables['isPurchased'] = true;
			fullVariables['isPurchased'] = true;
			allFilters.push('Is Purchased')
		}
		if (params.search) {
			proposalVariables['search'] = params.search;
			fullVariables['search'] = params.search;
			allFilters.push(params.search)
		}
		if (params.categories) {
			const categories = params.categories.split(',');
			proposalVariables['categories'] = categories;
			fullVariables['categories'] = categories;
			allFilters.push(params.categories)
		}
		if (params.rating) {
			proposalVariables['rating'] = +params.rating;
			fullVariables['rating'] = +params.rating;
			allFilters.push('rating:' + params.rating)
		}
		if (params.order && params.orderby) {
			proposalVariables['order'] = params.order;
			proposalVariables['orderby'] = params.orderby;
			fullVariables['order'] = params.order;
			fullVariables['orderby'] = params.orderby;
			setSelectedSorting(params.order);
		}
		if (params.page) {
			proposalVariables['page'] = +params.page;
			fullVariables['page'] = +params.page;
			setDefaultCurrent(+params.page);
		}
		if (params.limit) {
			proposalVariables['limit'] = +params.limit;
			fullVariables['limit'] = +params.limit;
			setLimit(+params.limit);
		}
		if (props.match.params.type !== undefined) {
			setType(props.match.params.type);
			if (params.isMap === 'true') {
				proposalVariables['limit'] = -1;
				fullVariables['limit'] = -1;
				setIsMapView(true);
			} else {
				setIsMapView(false);
			}
			if (props.match.params.type === 'proposal') {
				getData(proposalVariables);
			} else if (props.match.params.type === 'full') {
				getData(fullVariables);
			}
		} else {
			getData(proposalVariables);
		}
	}, [props.location.search]);
	const handleChange = (value) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.set('order', value);
		search_params.set('orderby', 'price');
		url.search = search_params.toString();
		props.history.push('/marketplace/' + type + url.search);
		setSelectedSorting(value);
	};
	const getData = (variables) => {
		try {
			client
				.query({
					query: GET_STORIES,
					variables: variables,
					fetchPolicy: 'network-only',
				})
				.then(({ data: { getAllstoryWeb } }) => {
					//this.loading = loading;
					if(getAllstoryWeb.stories.length > 0){
					getAllstoryWeb.stories.forEach((result) => {
						result.show = false;
						if (result.isIndependant) {
							result.type = 'Breaking';
						} else {
							if (result.request.isOpen) {
								result.type = 'Open';
							} else {
								result.type = 'Assigned';
							}
						}
						if (result.storyMediaWeb != null) {
							const {
								storyMediaWeb: { videos, audios, images },
							} = result;
							result.storyMediaCount = {
								video: videos.length,
								audio: audios.length,
								image: images.length,
							};
						} else {
							result.storyMediaCount = {
								video: 0,
								audio: 0,
								image: 0,
							};
						}
					}); 
					setStoryCount(getAllstoryWeb.storyCount);
					setStoryList(getAllstoryWeb.stories);
					setIsLoaded(true);
					setIsMapLoading(false);
				}else{
					props.history.push('/errorMessages/noData')
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
	};
	const getImages = (media, mediaUrl, index) => (
		<div key={index} className="ImagesSlider">
			<div className="marketimgbox">
				<img alt="" className="brdrd" src={mediaUrl + media.mediaName} />
			</div>
			<CustIcon type="imageicon" className="imagetypeIcon" />
			{type == 'proposal' && <div className="marketproposal">
				Proposal
			</div>}
		</div>
	);
	const getVideos = (media, mediaUrl, index) => (
		<div key={index} className="ImagesSlider">
			<div className="marketimgbox">
				<img
					alt=""
					className="brdrd"
					src={
						mediaUrl + media.thumbnail
							? mediaUrl + media.thumbnail
							: require('../../Assets/images/ic_no_image.png')
					}
				/>

				<CustIcon type="videoicon" className="imagetypeIcon" />
				<CustIcon type="playicon" className="videoPlay" />
			</div>
			{type == 'proposal' && <div className="marketproposal">
				Proposal
			</div>}
		</div>
	);
	const getAudios = (media, mediaUrl, index) => (
		<div key={index} className="ImagesSlider">
			<div className="marketimgbox audiowaves">
				<img
					width=""
					alt=""
					className="brdrd"
					src={require('../../Assets/images/ic_audio-waves.svg')}
				/>
				<CustIcon type="audioicon" className="imagetypeIcon" />
			</div>
			{type == 'proposal' && <div className="marketproposal">
				Proposal
			</div>}
		</div>
	);
	const getArticles = (media, mediaUrl, index) => (
		<div key={index} className="ImagesSlider">
			<div className="marketimgbox articleimg">
				<img
					width=""
					alt=""
					className="brdrd"
					src={require('../../Assets/images/ic_article.svg')}
				/>
				<CustIcon type="articleicon" className="imagetypeIcon" />
			</div>
			{type == 'proposal' && <div className="marketproposal">
				Proposal
			</div>}
		</div>
	);
	const getMediaContents = (medias) => {
		const mediaUrl = COULDBASEURL;
		return medias.map((media, index) => {
			switch (media.type) {
				case 'image':
					return getImages(media, mediaUrl, index);
				case 'video':
					return getVideos(media, mediaUrl, index);
				case 'audio':
					return getAudios(media, mediaUrl, index);
				case 'article':
					return getArticles(media, mediaUrl, index);
				default:
					return null;
			}
		});
	};
	const settings = {
		nextArrow: <SlickArrowRight />,
		prevArrow: <SlickArrowLeft />,
	};
	const onPaginationChange = (key, size) => {
		// console.log(size);
		try {
			setDefaultCurrent(key);
			setLimit(size);
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.set('limit', size);
			search_params.set('page', key);
			url.search = search_params.toString();
			props.history.push('/marketplace/' + type + url.search);
		} catch (error) {
			SentryError(error);
		}
	};
	const onListViewClick = () => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.set('isMap', !isMapView);
		url.search = search_params.toString();
		props.history.push('/marketplace/' + type + url.search);
	};
	const onChildClickCallback = () => { };
	return (
		<React.Fragment>
			<Helmet>
				<title>
					Content Creator | Marketplace ({type === 'proposal' ? 'Proposal' : 'Full Stories'})
				</title>
			</Helmet>
			{!isLoaded ? (
				<Loader />
			) : (
				<div className="reporterMarketpage">
					<div className="globalcard">
						<div className="d-flex flex-row align-items-center justify-content-between mb-3">
							<div className="globaltitle">
								{allFilters.length > 0 ?
									<h3 className="mb-0"> Total  {storyCount > 0 ? storyCount + ' results' : '0 result'} found for {allFilters.join(',')} </h3> :
									<h3 className="mb-0 font-italic font-medium"> {type === 'proposal' ? 'Showing all your proposals' : 'Showing all your full stories'} </h3>}
							</div>
							{storyCount > 0 && (
								<div className="d-flex align-items-center justify-content-end">
									{/* <div className="sortByDrop mr-md-3 mr-0">
										<label className="d-md-inline d-none">Sort by:</label>
										<Select
											value={selectedSorting}
											placeholder="Price"
											onChange={handleChange}>
											<Option value="ASC">Price Low to High</Option>
											<Option value="DESC">Price High to Low</Option>
										</Select>
									</div> */}
									<Radio.Group
										value={isMapView}
										onChange={onListViewClick}
										buttonStyle="solid"
										className="switchRound d-md-inline-block d-none">
										<Radio.Button value={false}>
											<AppstoreFilled />
										</Radio.Button>
										<Radio.Button value={true}>
											<EnvironmentFilled />
										</Radio.Button>
									</Radio.Group>
								</div>)}
						</div>
						{isMapLoading ? (
							<Loader />
						) : isMapView ? (
							<GoogleMap
								type="story"
								client={props.client}
								//popup={showPopup}
								activeKey={type}
								stories={storyList}
								onChildClickCallback={(e) => onChildClickCallback(e)}
							/>
						) : (
							<Row gutter={20}>
								{storyCount > 0 ? (
									storyList.map((data, index) => {
										return (
											<Col
												xl={6}
												lg={8}
												md={12}
												sm={12}
												xs={24}
												key={index}
												className="mb-3 cardwidth">
												<Link to={`/marketplace/${type}/storyDetails/${data.storyId}`}>
													<Card
														className="market_card tour-marketplace-details"
														bordered={false}
														cover={
															<div>
																<Carousel
																	dots={false}
																	arrows={true}
																	{...settings}>
																	{data.storyMediaWeb != null &&
																		data.storyMediaWeb.images.length > 0 &&
																		getMediaContents(
																			data.storyMediaWeb.images
																		)}
																	{data.storyMediaWeb != null &&
																		data.storyMediaWeb.article.length > 0 &&
																		getMediaContents(
																			data.storyMediaWeb.article
																	)}
																	{data.storyMediaWeb != null &&
																		data.storyMediaWeb.videos.length > 0 &&
																		getMediaContents(
																			data.storyMediaWeb.videos
																	)}
																	{data.storyMediaWeb != null &&
																		data.storyMediaWeb.audios.length > 0 &&
																		getMediaContents(
																			data.storyMediaWeb.audios
																		)}
																	{data.storyLiveStream != null && (
																		<div className="ImagesSlider">
																			<div className="marketimgbox">
																				<img
																					alt=""
																					className="brdrd"
																					src={
																						COULDBASEURL +
																						data.storyLiveStream.thumbnail
																					}
																				/>
																				<CustIcon
																					type="liveicon"
																					className="imagetypeIcon"
																				/>
																			</div>
																		</div>
																	)}
																</Carousel>
															</div>
														}>
														{data.category && (
															<div className="market_badge badge">
																{/* added under{' '} */}
																<strong>{data.category.title}</strong>
															</div>
														)}
														<div className="d-flex flex-column h-100">
															<div>
																<h3>{data.title}</h3>
																<div className="market_location mb-2">
																	<EnvironmentFilled className="mr-2" />
																	{data.location}
																</div>
																<div className="market_location mb-3">
																	<ClockCircleFilled className="mr-2" />
																	{moment(
																		new Date(parseFloat(data.createdDate))
																	).fromNow()}
																</div>
																{!data.isProposal && <div className="makert_rate d-flex align-items-center mb-3">
																	<StarFilled className="mr-2" />
																	{data.avgrating}
																	<span className="ml-1">
																		({data.ratings.length} Reviews)
																	</span>
																</div>}
															</div>
														{!data.isProposal && <div className="d-flex align-items-center justify-content-between w-100 mt-auto">
																<div className="reportPurhcase inactive">
																	<CustIcon
																		type="purchaseicon"
																		className="mr-2"
																	/>
																	Purchased: <b>{data.purchased.length}</b>
																</div>
																<div className="marketprice font-weight-bold">
																	${data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
																</div>
															</div>}
														</div>
													</Card>
												</Link>
											</Col>
										);
									})
								) : (
									<Col xs={24}>
										<Card className="mt-4 mb-4">
											<Empty description={<span>No data available</span>} />
										</Card>
									</Col>
								)}
							</Row>
						)}
					</div>

					{!isMapView &&
						storyCount > 0 && (
							<Pagination
								total={storyCount}
								showTotal={(total) =>
									`Total ${total} ${total > 1 ? 'items' : 'item'}`
								}
								showSizeChanger
								defaultPageSize={limit}
								current={defaultCurrent}
								onChange={onPaginationChange}
								pageSizeOptions={[12, 24, 36, 48, 60]}
							/>
						)
					}
				</div>
			)}
		</React.Fragment>
	);
};
export { ReporterMarketplace };
