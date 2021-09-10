import React, { Component } from 'react';

import './Proposals.css';
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
	Avatar,
	Carousel,
	Tabs,
	Empty,
	Button,
	Select,
} from 'antd';
import { Link } from 'react-router-dom';
import { GoogleMap } from '../../Components/GoogleMap';
import { GET_REQUEST_BY_ID, GET_REQUEST_FILTER } from '../../graphql/APIs';
import { getStoryMediaCount } from '../../Components/general/getStoryMediaCount';
import { Loader } from '../../Components/Loader/Loader';
import { analytics } from '../../utils/init-fcm';
import { OnboardingTour } from '../../Components/OnboardingTour';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { COULDBASEURL } from '../../Components/general/constant';
import queryString from 'query-string';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { SlickArrowLeft,SlickArrowRight } from '../../Components/general/general';

import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';

const contentStyle = {
	height: '160px',
	color: '#fff',
	lineHeight: '160px',
	textAlign: 'center',
	margin: '0',
	background: '#364d79',
};
const LIMIT = 5;
class Proposals extends Component {
	constructor(props) {
		SentryLog({
			category: 'My Request',
			message: 'My Request Page Loaded',
			level: Severity.Info,
		});
		super(props);
		this.domRefs = {};
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
			search_text: this.props.location.state
				? this.props.location.state.search_text
				: null,
			showProposalSection: true,
		};
	}
	componentDidMount() {
		try {
			this.getData();
		} catch (error) {
			SentryError(error);
		}
		//var domRefs = null;
	}
	componentDidUpdate() {
		// console.log('updated props');
		// console.log(this.props);
	}
	getData() {
		try {
			this.setState({ requestLoaded: false });
			const { client } = this.props;
			client
				.watchQuery({
					query: GET_REQUEST_BY_ID,
					fetchPolicy: 'network-only',
					variables: { 'requestId': this.props.match.params.id },
				})
				.subscribe(({ data, loading, error }) => {
					this.loading = loading;
					if (data !== undefined) {
						//.getRequest.requests.forEach((element) => {
						let image = 0;
						let video = 0;
						let audio = 0;
						data.getRequest.purchasedStories = data.getRequest.stories.filter((data) => {
							return data.isPurchased === true;
						});
						if (data.getRequest.isOpen) {
							data.getRequest.type = 'Open';
						} else {
							data.getRequest.type = 'Assigned';
						}
						if (data.getRequest.isLive) {
							data.getRequest.type = 'Live';
						}
						// element.storyMediaCount = {
						// 	image: image,
						// 	video: video,
						// 	audio: audio,
						// };
						//});
						this.setState({
							requestLoaded: true,
							loaded: true,
							stories: data.getRequest
						});
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
		<>
		<CustIcon
		type="videoicon"
		className="imagetypeIcon"
	/>
	<CustIcon type="playicon" className="videoPlay" />
	<img alt="" className="brdrd"
		src={
			 media.thumbnail 
				?  mediaUrl + media.thumbnail 
				: require('../../Assets/images/ic_no_image.png')
		}
	/></>
	);
	getLive = (thumbnail) => (
		<>
		<CustIcon
			type="liveicon"
			className="imagetypeIcon"
		/>
	<img alt="" className="brdrd"
		src={
			 thumbnail 
				? thumbnail 
				: require('../../Assets/images/ic_no_image.png')
		}
	/></>
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
					return null;
			}
		});
	};
	render() {
		const settings = {
			nextArrow: <SlickArrowRight />,
			prevArrow: <SlickArrowLeft />,
		};
		let story = this.state.stories;
		return (
			<React.Fragment>
				{this.state.loaded ? (
					<div className="myrequest-page">
						<div className="globaltitle mb-3">
							<h3 className="mb-lg-0">
								Showing request with submitted proposals
							</h3>
							{/* <p>Showing list of request with submitted proposals</p> */}
						</div>

						<>
							<Card key={story.index} className="request_card mb-4">
								{story.isOpen ? (
									<div className="badge badge_open mb-3">Open</div>
								) : (
										<div className="badge badge_assign mb-3">Assigned</div>
									)}

								<h5 className="mb-3">{story.title}</h5>
								<div className="request_location mb-1">
									<EnvironmentFilled className="mr-2" />
									{story.location}
								</div>
								<div className="request_location mb-3">
									<ClockCircleFilled className="mr-2" />
									{moment(
										new Date(parseFloat(story.createdDate))
									).fromNow()}
								</div>
								<div className="font16 font-weight-bold mb-3">
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
										<CustIcon type="audioicon" className="mr-2" />
												Article
											</Button>

									<Button
										type="default"
										className={story.isLive ? 'active' : ''}>
										<CustIcon type="liveicon" className="mr-2" />
												Live
											</Button>
									{/* <Button type="default">
												<CustIcon type="articlesicon" className="mr-2" />
												Articles
											</Button> */}
								</div>
								{this.state.activeKey !== '2' &&
									<div className="d-flex justify-content-between align-items-center mb-2 mb-lg-4">
										<div className="reqProposal">
											{story.stories.length}{' '}
											{story.stories.length > 1 ? 'proposals' : 'proposal'}{' '}
												submitted
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
													onClick={(e) =>
														this.setState({
															showProposalSection: !this.state
																.showProposalSection,
														})
													}>
													<CustIcon type="downarrow" className="ml-2" />
												</Button>
											</div>)}
									</div>}
								{this.state.showProposalSection &&
									story.stories.length > 0 && (
										<Card className="boxshadow mb-3 d-none d-sm-block cardSpace">
											{/* <div className="d-flex justify-content-between">
												<h4 className="font-weight-bold font14 mb-3">
													Recent Proposals
														</h4>
											</div> */}
											<Row gutter={20}>
												{story.stories.map((data, index) => {
													return (
															<Col lg={6} md={8} sm={12} xs={24} className="mb-3">
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
																					: data.storyLiveStream && 
																					(
																					this.getLive(COULDBASEURL+ data.storyLiveStream.thumbnail)
																						)	}
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
												})}
											</Row>
										</Card>
									)}
								<div className="d-flex justify-content-between align-items-center">
									<div className="reqPrice">$ {story.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
									{story.isArchive  ? 
											undefined :
											<Link
											className="requesteditbtn"
											to={`/addNewRequest/${story.requestId}`}>
											<FormOutlined className="mr-2" />
											Edit Request
											</Link>}
								    </div>
							</Card>
							<OnboardingTour
								tourName={[
									'header',
									window.innerWidth > 1199 ? 'navbar' : null,
								]}
							/>{' '}
						</>

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
Proposals = withApollo(Proposals);
export { Proposals };
