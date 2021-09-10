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
	EyeFilled,
	EnvironmentFilled,
	StarFilled,
	RightOutlined,
	AppstoreFilled,
} from '@ant-design/icons';
import { GET_STORIES } from '../../graphql/APIs';
import { useApolloClient } from 'react-apollo';
import moment from 'moment';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { CustIcon } from '../../Components/Svgs/Svgs';
import './Marketplace.css';
import { Loader } from '../../Components/Loader/Loader';
import { Link } from 'react-router-dom';
import { COULDBASEURL } from '../../Components/general/constant';
import { GoogleMap } from '../../Components/GoogleMap';
import { Helmet } from "react-helmet";
import { SlickArrowLeft, SlickArrowRight } from '../../Components/general/general';
import { ErrorMessages } from '../ErrorMessages';

const { Option } = Select;
let allFilters = [];
const Marketplace = (props) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [defaultCurrent, setDefaultCurrent] = useState(1);
	const [limit, setLimit] = useState(12);
	const [storyCount, setStoryCount] = useState(0);
	const [storyList, setStoryList] = useState([]);
	const [type, setType] = useState(undefined);
	const [isMapView, setIsMapView] = useState(false);
	const [isMapLoading, setIsMapLoading] = useState(false);
	const [selectedSorting, setSelectedSorting] = useState('Price');
	//const token = query.get('type');
	const client = useApolloClient();
	//var domRefs = {};
	//this.next = this.next.bind(this);
	//  this.previous = this.previous.bind(this);
	//const carousel = React.createRef();
	// const LIMIT = 9;
	// const defaultCurrent =  1
	// {allFilters} = props;

	useEffect(() => {
		window.scrollTo(0, 0);
		allFilters = []
		let fullVariables = {
			isProposal: false,
			isIndependent: true,
			page: 1,
			limit,
			lat: +localStorage.getItem('userLat'),
			lng: +localStorage.getItem('userLng'),
		};
		let proposalVariables = {
			isProposal: true,
			page: 1,
			limit,
			lat: +localStorage.getItem('userLat'),
			lng: +localStorage.getItem('userLng'),
		};
		let params = queryString.parse(props.location.search);
		if (params.time) {
			fullVariables['time'] = params.time;
			proposalVariables['time'] = params.time;
			allFilters.push(params.time)
		}
		if (params.distance) {
			let miles = [];
			miles = params.distance.replace(' miles', '');
			fullVariables['distance'] = +miles;
			proposalVariables['distance'] = +miles;
			allFilters.push(params.distance)
		}
		if (params.type) {
			const mediaTypes = params.type.split(',');
			fullVariables['mediaType'] = mediaTypes;
			proposalVariables['mediaType'] = mediaTypes;
			allFilters.push(params.type)
		}
		if (params.isPurchased) {
			fullVariables['isPurchased'] = true;
			proposalVariables['isPurchased'] = true;
			allFilters.push('Is Purchased')
		}
		if (params.search) {
			fullVariables['search'] = params.search;
			proposalVariables['search'] = params.search;
			allFilters.push(params.search)
		}
		if (params.categories) {
			const categories = params.categories.split(',');
			fullVariables['categories'] = categories;
			proposalVariables['categories'] = categories;
			allFilters.push(params.categories)
		}
		if (params.rating) {
			fullVariables['rating'] = +params.rating;
			proposalVariables['rating'] = +params.rating;
			allFilters.push('rating :' + params.rating)
		}
		if (params.order && params.orderby) {
			fullVariables['order'] = params.order;
			fullVariables['orderby'] = params.orderby;
			proposalVariables['order'] = params.order;
			proposalVariables['orderby'] = params.orderby;
			setSelectedSorting(params.order);
		}
		if (params.page) {
			fullVariables['page'] = +params.page;
			proposalVariables['page'] = +params.page;
			setDefaultCurrent(+params.page);
		}
		if (params.limit) {
			fullVariables['limit'] = +params.limit;
			proposalVariables['limit'] = +params.limit;
			setLimit(+params.limit);
		}
		if (props.match.params.type !== undefined) {
			setType(props.match.params.type);
			if (params.isMap === "true") {
				setIsMapView(true);
			} else {
				setIsMapView(false);
			}
			if (props.match.params.type === 'proposal') {
				if (params.isMap === "true") {
					proposalVariables['limit'] = -1;
				}
				getData(proposalVariables);
			} else if (props.match.params.type === 'full') {
				if (params.isMap === "true") {
					fullVariables['limit'] = -1;
				}
				getData(fullVariables);
			}
		} else {
			props.history.push('/marketplace/full')
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
					if (getAllstoryWeb.stories.length > 0) {
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
					} else {
						props.history.push('/errorMessages/noData')
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong, please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	};
	const getImages = (media, mediaUrl) => (
		<div className="ImagesSlider">
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
				{type == 'proposal' && <div className="marketproposal">
					Proposal
				</div>}
			</div>
		</div>
	);
	const getAudios = (media, mediaUrl) => (
		<div className="ImagesSlider">
			<div className="marketimgbox audiowaves">
				<img
					width=""
					alt=""
					className="brdrd"
					src={require('../../Assets/images/audio-waves.png')}
				/>
				<CustIcon type="audioicon" className="imagetypeIcon" />
				{type == 'proposal' && <div className="marketproposal">
					Proposal
				</div>}
			</div>
		</div>
	);
	const getMediaContents = (medias) => {
		const mediaUrl = COULDBASEURL;
		return medias.map((media, index) => {
			return <span key={index}>{
				setMedia(media, mediaUrl, index)
			}</span>
		});
	};
	const setMedia = (media, mediaUrl, index) => {
		console.log('Media type',media.type)
		switch (media.type) {
			case 'image':
				return getImages(media, mediaUrl);
			case 'video':
				return getVideos(media, mediaUrl, index);
			case 'audio':
				return getAudios(media, mediaUrl);
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
					{type == 'proposal' && <div className="marketproposal">
						Proposal
					</div>}
				</div>
			</div>;

		}
	}

	const settings = {
		prevArrow: <SlickArrowLeft />,
		nextArrow: <SlickArrowRight />,
		infinite: false,

	};
	const onPaginationChange = (key, size) => {
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
				<title>Content Buyer |
					Marketplace (
					{type == 'proposal' ? "Proposal" : "Full"}
					)</title>
			</Helmet>
			<div className="">
				{isLoaded ?
					<div className="globalcard">
						<div className="d-flex flex-row align-items-md-start align-items-center justify-content-between mb-3">
							<div className="globaltitle">
								{allFilters.length > 0 ?
									<h3 className="mb-0"> Total {storyCount > 0 ? storyCount + ' results' : '0 result'}  found for {allFilters.join(',')} </h3> :
									<h3 className="mb-0"> {type === 'proposal' ? 'Proposal ' : 'Full'}  Marketplace </h3>}

							</div>
							{storyCount > 0 && (
								<div className="d-flex align-items-center justify-content-end">
									{type === 'full' && <div className="sortByDrop mr-md-3 mr-0">
										<label className="d-md-inline d-none">Sort by:</label>
										<Select
											value={selectedSorting}
											placeholder="Price"
											onChange={handleChange}>
											<Option value="ASC">Price Low to High</Option>
											<Option value="DESC">Price High to Low</Option>
										</Select>
									</div>}
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
								</div>
							)}
						</div>
						{(isMapLoading ? (
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
												className="mb-4 cardwidth">
												<Link to={`/marketplace/${type}/storyDetails/${data.storyId}`}>
													<Card
														className="market_card tour-marketplace-details"
														bordered={false}
														cover={
															<Carousel
																dots={false}
																arrows={true}
																{...settings}>
																{data.storyMediaWeb != null &&
																	data.storyMediaWeb.images.length > 0 &&
																	getMediaContents(data.storyMediaWeb.images)}
																{data.storyMediaWeb != null &&
																	data.storyMediaWeb.videos.length > 0 &&
																	getMediaContents(data.storyMediaWeb.videos)}

																{data.storyMediaWeb != null &&
																	data.storyMediaWeb.audios.length > 0 &&
																	getMediaContents(data.storyMediaWeb.audios)}

																{data.storyMediaWeb != null &&
																	data.storyMediaWeb.article.length > 0 &&
																	getMediaContents(data.storyMediaWeb.article)}
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
																			{type == 'proposal' && <div className="marketproposal">
																				Proposal
																			</div>}
																		</div>
																	</div>
																)}
																{data.storyLiveStream === null && data.storyMediaWeb === null && (
																	<div className="ImagesSlider">
																	<div className="marketimgbox">
																		<img
																			width=""
																			alt=""
																			className="brdrd"
																			src={require('../../Assets/images/audio-waves.png')}
																		/>
																		<CustIcon type="audioicon" className="imagetypeIcon" />
																		{type == 'proposal' && <div className="marketproposal">
																			Proposal
																		</div>}
																	</div>
																</div>
																)}
															</Carousel>
														}
														actions={[
															data.isPurchased ? (
																<div className="market_view_green">
																	<CustIcon
																		type="purchaseicon"
																		className="mr-2"
																	/>
																	Purchased | <b>${data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>
																</div>
															) : data.isProposal ? (
																<div className="market_view_purple">
																	<EyeFilled className="mr-2" />
																	Request Full Story
																</div>
															) : (
																<div className="market_view_purple">
																	<EyeFilled className="mr-2" />
																	View and Purchase | <b>${data.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</b>
																</div>
																// <div className="market_view_yellow">
																// 		<CustIcon
																// 		type="sendicon"
																// 		className="mr-2"
																// 	/>
																// 	Request Full Story
																// </div>
															),
														]}>
														{data.category && (
															<div className="market_badge badge">
																{/* added under{' '} */}
																<strong>{data.category.title}</strong>
															</div>
														)}
														{/* <div className="badge inhouse_badge">In-house</div> */}
														<div className="markert_body_top mb-2 mb-lg-4 d-flex justify-content-between align-items-center">
															<div className="d-flex align-items-center">
																<ProfileAvatar
																	size={50}
																	name={data.createdBy.name}
																	imageUrl={data.createdBy.profileImage}
																/>
																<div className="pl-0 pl-sm-3">
																	<h5>{data.createdBy.name}</h5>
																	{data.createdBy.isApplicant && (
																		<div className="badge applicant_badge">
																			Applicant
																		</div>
																	)}
																</div>
															</div>
															<div className="d-flex flex-column justify-content-end text-right">
																<div className="postedtime">
																	{moment(
																		new Date(parseFloat(data.createdDate))
																	).fromNow()}
																</div>
															</div>
														</div>
														<h3 className="pline-2">{data.title}</h3>
														<div className="d-flex align-items-center justify-content-between mb-3">
															<div className="market_location w-75">
																<EnvironmentFilled className="mr-2" />
																{data.location}
															</div>
															<div className="market_location d-sm-none d-block">
																{data.distance}
															</div>
														</div>
														<div className="d-flex align-items-center justify-content-between">
															{!data.isProposal && <div className="makert_rate">
																<StarFilled className="mr-2" />
																{/* <Rate
																	value={+data.avgrating}
																	disabled
																	allowClear={false}
																	allowHalf
																	character={<CustIcon type="staricon" />}
																/> */}
																{data.avgrating}
																<span className="ml-1">
																	({data.ratings.length} Reviews)
																</span>
															</div>}
															<div className="market_location  d-none d-sm-block">
																{Math.round(data.distance)}{' '}
																{Math.round(data.distance) > 1
																	? 'Miles'
																	: 'Mile'}
															</div>
														</div>
													</Card>
												</Link>
											</Col>
										);
									})
								) : (
									props.history.push('/errorMessages/noData')
								)}
							</Row>
						))}
					</div>
					:
					<Loader />}
			</div>
			{!isMapView &&
				(props.match.params.type === 'proposal' && storyCount > 0 ? (
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
				) : (
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
				))}
		</React.Fragment>
	);
};
export { Marketplace };
