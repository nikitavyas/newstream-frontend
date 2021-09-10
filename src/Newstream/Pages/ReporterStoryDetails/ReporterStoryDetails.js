/* eslint-disable react/no-did-update-set-state */
import { captureException as SentryError } from '@sentry/react';
import {
	Avatar,
	Button,
	Card,
	Col,
	Empty,
	Input,
	message,
	Modal,
	Rate,
	Row,
} from 'antd';
import {
	ClockCircleFilled,
	EnvironmentFilled,
	CopyOutlined,
} from '@ant-design/icons';
import moment from 'moment-timezone';
import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { COULDBASEURL } from '../../Components/general/constant';
import { getStoryMediaCount } from '../../Components/general/getStoryMediaCount';
import { ImageSlider } from '../../Components/ImageSlider';
import { CustIcon } from '../../Components/Svgs';
import { GET_STORY_BY_ID, REPORT_ABUSE } from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import {Helmet} from "react-helmet";
import './ReporterStoryDetails.css';
import { Loader } from '../../Components/Loader';
// moment.tz.setDefault(localStorage.getItem('timeZone'));
const desc = ['Terrible', 'Poor', 'Average', 'Very good', 'Excellent'];
class ReporterStoryDetails extends Component {
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('Story Details');
		this.state = {
			id: null,
			stories: [],
			isLoaded: false,
			media: { image: [], video: [] },
			purchased: false,
			showImage: false,
			image: null,
			showVideo: false,
			playVideoURL: null,
			playAudioURL: null,
			imageURL: null,
			selectedIndex: 0,
			ratingValue: 0,
			filteredRating: [],
			showAddRating: true,
			showLive: false,
		};
		this.showImage = this.showImage.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
	}
	showImage(data, index) {
		this.setState({ showImage: true, image: data, selectedIndex: index });
	}
	handleCancel() {
		this.setState({
			showImage: false,
			showVideo: false,
			showAudio: false,
			showLive: false,
			image: null,
		});
	}
	componentDidMount() {
		this.setState({ id: this.props.match.params.id }, () => this.getData());
		window.scrollTo(0, 0);
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps === undefined) {
			return false;
		}
		if (this.props && this.state.id !== this.props.match.params.id) {
			this.setState({ id: this.props.match.params.id }, () => {
				this.getData();
			});
		}
	}
	getData() {
		const { client } = this.props;
		client
			.query({
				query: GET_STORY_BY_ID,
				fetchPolicy: 'no-cache',
				variables: {
					storyId: this.state.id,
				},
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					data.getStory.storyMediaCount = getStoryMediaCount(
						data.getStory.storyMedia
					);
					data.getStory.images = data.getStory.storyMedia.filter((data) => {
						let text = data.type;
						text = text.toLowerCase();
						return text === 'image';
					});
					data.getStory.video = data.getStory.storyMedia.filter((data) => {
						let text = data.type;
						text = text.toLowerCase();
						return text === 'video';
					});
					data.getStory.audio = data.getStory.storyMedia.filter((data) => {
						let text = data.type;
						text = text.toLowerCase();
						return text === 'audio';
					});
					data.getStory.article = data.getStory.storyMedia.filter((data) => {
						let text = data.type;
						text = text.toLowerCase();
						return text === 'article' || text === 'raw';
					});
					if (data.getStory.isIndependant) {
						data.getStory.type = 'Breaking';
					} else {
						data.getStory.lat = data.getStory.request.lat;
						data.getStory.lng = data.getStory.request.lng;
						if (data.getStory.request.isOpen) {
							data.getStory.type = 'Open';
						} else {
							data.getStory.type = 'Assigned';
						}
					}
					let filteredRating = data.getStory.ratings.filter((data) => {
						if (data.createdBy.userId === localStorage.getItem('userId')) {
							this.setState({ showAddRating: false });
						}
						if (data.isHidden === false) {
							return data;
						}
					});
					// let stories = filteredRating.forEach((data) => {
					// 	const abusedReports = data.abusedReports;
					// 	const reportedByMe = abusedReports.filter((data) => {
					// 		return data.reportedBy.userId === localStorage.getItem('userId');
					// 	});
					// 	if (reportedByMe.length > 0) {
					// 		data.isAbused = true;
					// 	} else {
					// 		data.isAbused = false;
					// 	}
					// });
					this.setState({
						stories: data.getStory,
						purchased: data.getStory.isPurchased,
						filteredRating: filteredRating,
						isLoaded: true,
					});
				}
			});
	}
	onAbuseReport = (ratingId) => {
		const { client } = this.props;
		let thisData = this;
		try {
			client
				.mutate({
					variables: { ratingId: ratingId },
					mutation: REPORT_ABUSE,
				})
				.then((result) => {
					Modal.success({
						className: 'notificationModal',
						width: 500,
						icon: (
							<div className="popDeleteicon">
								<img
									alt=""
									src={require('../../Assets/images/thumb-icon.svg')}
								/>
							</div>
						),
						content: result.data.reportAbuse.message,
						onOk() {
							thisData.setState({ isLoaded: false });
							thisData.getData();
						},
					});
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
	getYoutubeVideoId = (url) => {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length === 11) {
			return match[2];
		} else {
			return 'error';
		}
	};
	copyStreamUrl = () => {
		navigator.clipboard.writeText(this.state.stories.storyLiveStream?.url);
	};
	copyEmbedUrl = () => {
		const embedCode = `<iframe width="100%" height="400" scrolling="no" frameborder="0" allowTransparency="true" src={"${this.getVideoEmbedUrl()}"} />`;
		navigator.clipboard.writeText(embedCode);
	};

	getVideoEmbedUrl = () => {
		if (this.state.stories.storyLiveStream?.type === 'youtube') {
			var youtubeURLFormatter = this.state.stories.storyLiveStream?.url.includes(
				'watch'
			)
				? `${this.state.stories.storyLiveStream?.url
						.replace('watch?v=', 'embed/')
						.replace('m.', 'www.')}`
				: `https://www.youtube.com/embed/${
						this.state.stories.storyLiveStream?.url.split('be/')[1]
				  }`;
			return youtubeURLFormatter;
		}
		if (this.state.stories.storyLiveStream?.type === 'facebook') {
			var facebookURLFormatter = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
				this.state.stories.storyLiveStream?.url
			)}&show_text=false&width=734&height=411&appId`;
			return facebookURLFormatter;
		}
	};
	render() {
		const avarageRating = () => {
			let avg = 0;
			if (this.state.filteredRating.length > 0) {
				avg = this.state.filteredRating.reduce((r, c) => r + c.rating, 0);
				avg = avg / this.state.filteredRating.length;
			}
			return avg.toFixed(1);
		};
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Creator | Story Details </title>
				</Helmet>
				{this.state.isLoaded ? (
					<div className="storyDetailPage">
						<div className="globaltitle mb-3 d-flex justify-content-between align-items-center">
							<h3 className="mb-lg-0">{this.state.stories.isProposal ? "Story Proposal Details" : "Story Details"}</h3>
						</div>
						<Card className="detailsBox_blk boxshadow mb-3">
							{/* <div className="badge global_badge mb-3">
								{this.state.stories.isGlobal ? 'Global' : 'Inhouse'}
							</div> */}
							{this.state.stories.isPurchased && (
								<div className="badge global_badge purchase_badge mb-3 ml-2">
									<CustIcon type="purchaseicon" className="mr-1" />
									Purchased
								</div>
							)}
							{!this.state.stories.isProposal && 
							<div className="priceAmt">
								${this.state.stories.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
								</div> }
							<div className="font18 font-weight-bold mb-2 wordbreak">
								{this.state.stories.title}
							</div>
							<div className="locationtxt mb-1">
								<EnvironmentFilled className="mr-2" />
								{this.state.stories.location}
							</div>
							<div className="locationtxt mb-3">
								<ClockCircleFilled className="mr-2" />
								{moment(
									new Date(parseFloat(this.state.stories.createdDate))
								).fromNow()}
							</div>
							{this.state.stories.storyLiveStream && (
								<Fragment>
									{!this.state.purchased ? (
										<Row gutter={20} className="mediaStoryDetails">
											<Col xs={12} sm={8} md={7} lg={6} xl={4} className="mb-3">
												<div
													className="imageThumb"
													onClick={() =>
														this.setState({
															showLive: true,
														})
													}>
													<img
														alt=""
														className="brdrd"
														src={
															this.state.stories.storyLiveStream.thumbnail
																? COULDBASEURL +
																  this.state.stories.storyLiveStream.thumbnail
																: require('../../Assets/images/ic_no_image.png')
														}
													/>
													<CustIcon type="liveicon" className="imagetypeIcon" />
												</div>
											</Col>
										</Row>
									) : (
										<Fragment>
											<div className="mb-3 storyCopy">
												<div className="font16 font-weight-bold mb-2">
													Live Stream Url
												</div>
												<div className="d-flex flex-row">
													<Input
														disabled
														defaultValue={
															this.state.stories.storyLiveStream?.url
														}
														id="streamUrl"
													/>
													<Button
														type="primary"
														htmlType="button"
														onClick={this.copyStreamUrl}>
														<CopyOutlined />
													</Button>
												</div>
											</div>
											<div className="mb-3 storyCopy">
												<div className="font16 font-weight-bold mb-2">
													Embed Live Stream
												</div>
												<div className="d-flex flex-row">
													<Input
														disabled
														defaultValue={`<iframe width="600" height="400" scrolling="no" frameborder="0" allowTransparency="true" src='${this.getVideoEmbedUrl()}' />`}
														id="streamUrl"
													/>
													<Button
														type="primary"
														htmlType="button"
														onClick={this.copyEmbedUrl}>
														<CopyOutlined />
													</Button>
												</div>
											</div>
										</Fragment>
									)}
								</Fragment>
							)}
							{!this.state.stories.storyLiveStream && (
								<div className="d-flex flex-column">
									<div className="font16 font-weight-bold mb-2">
										Submitted Media
									</div>
									<Row gutter={20} className="mediaStoryDetails">
										{this.state.stories.video.length > 0 &&
											this.state.stories.video.map((data, index) => {
												return (
													<Col
														xs={12}
														sm={8}
														md={7}
														lg={6}
														xl={4}
														key={index}
														className="mb-3">
														<div
															className="imageThumb"
															onClick={() =>
																this.setState({
																	showVideo: true,
																	playVideoURL: COULDBASEURL + data.mediaName,
																	selectedIndex: index,
																})
															}
															key={index}>
															<CustIcon
																type="videoicon"
																className="imagetypeIcon"
															/>
															<CustIcon type="playicon" className="videoPlay" />
															<img
																alt=""
																className="brdrd"
																src={
																	data.thumbnail
																		? COULDBASEURL + data.thumbnail
																		: require('../../Assets/images/video-holder.jpg')
																}
															/>
														</div>
													</Col>
												);
											})}
										{this.state.stories.images.length > 0 &&
											this.state.stories.images.map((data, index) => {
												return (
													<Col
														xs={12}
														sm={8}
														md={7}
														lg={6}
														xl={4}
														key={index}
														className="mb-3">
														<div className="imageThumb" key={index}>
															<CustIcon
																type="imageicon"
																className="imagetypeIcon"
															/>
															<img
																width=""
																alt=""
																onClick={() =>
																	this.showImage(
																		COULDBASEURL + data.mediaName,
																		index
																	)
																}
																className="brdrd"
																src={COULDBASEURL + data.mediaName}
															/>
														</div>
													</Col>
												);
											})}
										{this.state.stories.audio.length > 0 &&
											this.state.stories.audio.map((data, index) => {
												return (
													<Col
														xs={12}
														sm={8}
														md={7}
														lg={6}
														xl={4}
														key={index}
														className="mb-3">
														<div className="imageThumb audiowaves">
															<CustIcon
																type="audioicon"
																className="imagetypeIcon"
															/>
															<img
																width=""
																alt=""
																onClick={() =>
																	this.setState({
																		showAudio: true,
																		playAudioURL: COULDBASEURL + data.mediaName,
																		selectedIndex: index,
																	})
																}
																key={index}
																className="brdrd"
																src={require('../../Assets/images/ic_audio-waves.svg')}
															/>
														</div>
													</Col>
												);
											})}
												{this.state.stories.article.length > 0 &&
											this.state.stories.article.map((data, index) => {
												return (
													<Col
														xs={12}
														sm={8}
														md={7}
														lg={6}
														xl={4}
														key={index}
														className="mb-3">
														<div className="imageThumb articleimg">
															<CustIcon
																type="articleicon"
																className="imagetypeIcon"
															/>
															<img
																width=""
																alt=""
																// onClick={() =>
																// 	this.setState({
																// 		showAudio: true,
																// 		playAudioURL: COULDBASEURL + data.mediaName,
																// 		selectedIndex: index,
																// 	})
																// }
																key={index}
																className="brdrd"
																src={require('../../Assets/images/ic_article.svg')}
															/>
														</div>
													</Col>
												);
											})}
									</Row>
								</div>
							)}
							{this.state.stories.category && (
								<>
									<div className="font18 font-weight-bold mb-2">
										Added Under
									</div>
									<div className="badge market_badge">
										{this.state.stories.category.title}
									</div>
								</>
							)}
						</Card>

						{this.state.purchased && (
							<>
								<div className="globaltitle mb-3">
									<h3 className="mb-lg-0">Purchased by</h3>
								</div>
								<Card className="requestBox_blk boxshadow mb-3">
									<Row gutter={20}>
										{this.state.stories.purchased.map((data, index) => {
											return (
												<Col
													xl={6}
													lg={8}
													md={12}
													sm={12}
													xs={24}
													key={index}
													className="cardwidth">
													<div className="cursorPointer user_blk d-flex flex-row mb-2 mt-2">
														<ProfileAvatar
															size={60}
															name={data.purchasedBy.name}
															imageUrl={data.purchasedBy.profileImage}
														/>
														<div className="d-flex flex-column justify-content-center pl-3">
															<h5 className="mb-0 userTop text-break font-weight-bold">
																{data.purchasedBy.name}
															</h5>
															<div className="lightGray-text-color font12">
																<ClockCircleFilled className="mr-2" />
																{moment(
																	new Date(parseFloat(data.purchasedDate))
																).fromNow()}
															</div>
														</div>
													</div>
												</Col>
											);
										})}
									</Row>
								</Card>
								<div>
									<div className="globaltitle mb-3">
										<h3 className="mb-lg-0"> Reviews and Ratings</h3>
									</div>
									<Card className="rating_blk boxshadow">
										<h4 className="font16 mb-3">Average story rating</h4>
										<div className="mb-3 d-flex flex-sm-row flex-column">
											<div className="d-flex flex-column pr-sm-4 pr-0 mb-3 md-sm-0">
												<div className="averageStoryRating border-0">
													<div className="d-flex flex-column overAllRating pr-0">
														<Avatar shape={'square'}>
															<h2>{avarageRating()}</h2>
															<p>{this.state.filteredRating.length} reviews</p>
														</Avatar>

														<div>
															<Rate
																tooltips={desc}
																value={+avarageRating()}
																disabled
																allowClear={false}
																allowHalf
																character={<CustIcon type="staricon" />}
															/>
														</div>
													</div>
												</div>
											</div>

											{this.state.filteredRating.length > 0 ? (
												<div className="flex-sm-fill">
													{this.state.filteredRating.length > 0 &&
														this.state.filteredRating.map((data, index) => {
															return (
																!data.isHidden && (
																	<Card key={index} className="mb-3 reviewsAndRatings">
																		<div className="reviewRateBox">
																			<div className="d-flex flex-md-row flex-column justify-content-between align-items-center">
																				<div className="d-flex flex-row user_blk align-items-center">
																					<div className="mr-3">
																						<ProfileAvatar
																							size={40}
																							name={data.createdBy.name}
																							imageUrl={
																								data.createdBy.profileImage
																							}
																						/>
																					</div>
																					<div className="d-flex flex-column">
																						<div className="font-weight-bold font14 text-capitalize">
																							{data.createdBy &&
																								data.createdBy.name}
																						</div>
																						<div className="reviewtime">
																							reviewed{' '}
																							{moment(
																								new Date(
																									parseFloat(data.createdDate)
																								)
																							).fromNow()}
																						</div>
																					</div>
																				</div>
																				<div className="pt-md-0 pt-2">
																					<Rate
																						tooltips={desc}
																						disabled
																						allowHalf
																						defaultValue={data.rating}
																						character={
																							<CustIcon type="staricon" />
																						}
																					/>
																					{data.rating ? (
																						<span className="ant-rate-text">
																							(
																							{
																								desc[
																									Math.round(data.rating) - 1
																								]
																							}
																							)
																						</span>
																					) : (
																						''
																					)}
																				</div>
																			</div>
																			<div className="py-2 reviewsTxt">
																				{data.comment}
																			</div>
																		</div>
																	</Card>
																)
															);
														})}
												</div>
											) : (
												<Empty image={<img src={require('../../Assets/images/review-rating.png')} alt="rating"/>} 
												description={
													<span className="font-bold">
													Uh-oh! No reviews yet.
													</span>
												  }/>
											)}
										</div>
									</Card>
								</div>
							</>
						)}
						<Modal
							width={500}
							destroyOnClose={true}
							title="Live"
							centered
							visible={this.state.showLive}
							onOk={this.handleCancel}
							onCancel={this.handleCancel}
							header={[]}
							footer={null}
							wrapClassName="videoPop">
							{this.state.stories.storyLiveStream != null && (
								<iframe
									width="100%"
									height="auto"
									src={
										'//www.youtube.com/embed/' +
										this.getYoutubeVideoId(
											this.state.stories.storyLiveStream.url
										)
									}
									frameborder="0"
									allowfullscreen></iframe>
							)}
						</Modal>
						<Modal
							width={500}
							destroyOnClose={true}
							title="Video"
							centered
							visible={this.state.showVideo}
							onOk={this.handleCancel}
							onCancel={this.handleCancel}
							header={[]}
							footer={null}
							wrapClassName="videoPop">
							<ImageSlider
								medias={this.state.stories.video}
								mediaUrl={COULDBASEURL}
								selectedIndex={this.state.selectedIndex}
							/>
						</Modal>
						<Modal
							title="Image"
							destroyOnClose={true}
							centered
							visible={this.state.showImage}
							onOk={this.handleCancel}
							onCancel={this.handleCancel}
							footer={null}
							wrapClassName="imagePop">
							{this.state.image ? (
								<ImageSlider
									medias={this.state.stories.images}
									mediaUrl={COULDBASEURL}
									selectedIndex={this.state.selectedIndex}
								/>
							) : null}
						</Modal>
						<Modal
							width={400}
							title="Audio"
							destroyOnClose={true}
							centered
							visible={this.state.showAudio}
							onOk={this.handleCancel}
							onCancel={this.handleCancel}
							footer={null}
							wrapClassName="audioPop">
							<ImageSlider
								medias={this.state.stories.audio}
								mediaUrl={COULDBASEURL}
								selectedIndex={this.state.selectedIndex}
							/>
						</Modal>
					</div>
				) : <Loader/>}
			</React.Fragment>
		);
	}
}
ReporterStoryDetails = withApollo(ReporterStoryDetails);
export { ReporterStoryDetails };
