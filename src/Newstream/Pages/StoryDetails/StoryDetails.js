/* eslint-disable react/no-did-update-set-state */
import { captureException as SentryError } from '@sentry/react';
import {
	Avatar,
	Button,
	Card,
	Col,
	Empty,
	Form,
	Input,
	message,
	Modal,
	Progress,
	Rate,
	Row,
	Tag,
	Tooltip,
	Select,
	Carousel
} from 'antd';
import {
	ExclamationCircleOutlined,
	ClockCircleFilled,
	EnvironmentFilled,
	CopyOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import moment from 'moment-timezone';
import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { ContactButton } from '../../Components/Buttons';
import { COULDBASEURL } from '../../Components/general/constant';
import { getAddress, onReporterClick } from '../../Components/general/general';
import { getStoryMediaCount } from '../../Components/general/getStoryMediaCount';
import { ImageSlider } from '../../Components/ImageSlider';
import { CustIcon } from '../../Components/Svgs';
import {Helmet} from "react-helmet";
import {
	FILE_DOWNLOADS,
	GET_STORY_BY_ID,
	PURCHASE_STORY,
	REPORT_ABUSE,
	SAVE_RATINGS,
	TOGGLE_GLOBAL_STORY,
	GET_GLOBAL_CATEGORIES
} from '../../graphql/APIs';
import { analytics } from '../../utils/init-fcm';
import './StoryDetails.css';
import { Loader } from '../../Components/Loader';
import { NotFound } from '../NotFound';
import { SlickArrowLeft,SlickArrowRight } from '../../Components/general/general';

// moment.tz.setDefault(localStorage.getItem('timeZone'));
const desc = ['Terrible', 'Poor', 'Average', 'Very good', 'Excellent'];

const { Option } = Select;
class StoryDetails extends Component {
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
			isGlobalLoading:false,
			loading : false,
			allCategory:[],
			show404:false,
			showRatingError:false
		};
		this.purchaseStory = this.purchaseStory.bind(this);
		this.showImage = this.showImage.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		//  this.fetchStory = this.fetchStory.bind(this);
	}
	getFileUrlHandler = async (fileName) => {
		//  return new Promise((resolve, reject) => {
		const { client } = this.props;
		client
			.mutate({
				variables: {
					fileName: fileName,
				},
				mutation: FILE_DOWNLOADS,
			})
			.then((result) => {
				return result.data.generateUrl;
			})
			.catch((error) => {});
		//  })
	};

	purchaseStory = (event) => {
		var thisdata = this
		if (this.state.purchased) {
			analytics.logEvent('storyDownload', {
				action: 'Click',
				label: 'Downloaded',
				value: 'Story Downloaded',
			});
			
			var zip = new JSZip();
			var count = 0;
			let files = this.state.stories.storyMedia;
			files.forEach((file) => {
				const { client } = this.props;
				client
					.mutate({
						variables: {
							fileName: file.mediaName,
						},
						mutation: FILE_DOWNLOADS,
					})
					.then((result) => {	
						if(event){
							this.setState({loading : true})
						}
						let fileName = result.data.generateDownloadUrl;
						let blob = fetch(fileName).then((r) => r.blob());
					
						zip.file(
							file.mediaName.substring(file.mediaName.indexOf('/') + 1),
							blob,
							{ binary: true }
						);	
						
						++count;
						if (count === files.length){
							zip
								.generateAsync({
									type: 'blob',
								})
								.then(function (content) {
									saveAs(content, new Date() + '.zip');
									thisdata.setState({loading : false})
								}
								);
						}	
						
					})
					.catch((error) => {});
			});
			
		} else {
			analytics.logEvent('storyPurchase', {
				action: 'Click',
				label: 'Purchased',
				value: 'Story purchased successfully',
			});
			const { client } = this.props;
			const thisPointer = this;
			Modal.confirm({
				width: 500,
				className: 'notificationModal',
				icon: (
					<div className="popimageBox">
						<img
							alt=""
							src={require('../../Assets/images/purchased-successfully.png')}
						/>
					</div>
				),
				content: 'Are you sure you want to purchase this story?',
				//'  icon: ,
				onOk() {
					client
						.mutate({
							variables: { storyId: thisPointer.props.match.params.id },
							mutation: PURCHASE_STORY,
						})
						.then(() => {
							thisPointer.setState({loading : true})
							Modal.success({
								width: 500,
								className: 'notificationModal',
								icon: (
									<div className="popimageBox">
										<img
											alt=""
											src={require('../../Assets/images/purchased-successfully.png')}
										/>
									</div>
								),
								content: 'Your story has been purchased successfully!',
								onOk() {
									thisPointer.setState({loading:false})
									thisPointer.setState({ purchased: true });
								},
								
							});
						})
						.catch(() => {});
				},
			});
		}
};
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
				console.log('dattaaaaa')
				if (data) {
					console.log('loaded')
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
					if(data.getStory.request){
						data.getStory.isArchive =  data.getStory.request.isArchive; 
						data.getStory.isLive =  data.getStory.request.isLive; 
					}else{
						data.getStory.isArchive =  false; 
						data.getStory.isLive =  false;
					}
					 
					let stories = filteredRating.forEach((data) => {
						const abusedReports = data.abusedReports;
						const reportedByMe = abusedReports.filter((data) => {
							return data.reportedBy.userId === localStorage.getItem('userId');
						});
						if (reportedByMe.length > 0) {
							data.isAbused = true;
						} else {
							data.isAbused = false;
						}
					});
					this.setState({
						stories: data.getStory,
						purchased: data.getStory.isPurchased,
						filteredRating: filteredRating,
						isLoaded: true,
					});
				}else{
					this.setState({isLoaded: true,show404:true})
				}
			}).catch((error, result) => {
				this.setState({isLoaded: true,show404:true})
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
			});
	}
	onAbuseReport = (ratingId) => {
		const { client } = this.props;
		// let props = this.props;
		let thisData = this;
		try {
			client
				.mutate({
					variables: { ratingId: ratingId },
					mutation: REPORT_ABUSE,
				})
				.then((result) => {
					Modal.success({
						width: 500,
						className: 'notificationModal',
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
	promotetoGlobal = (storyId,categoryId) => {
		console.log(categoryId)
		const { client } = this.props;
		let thisData= this;
				client
					.mutate({
						variables: {
							storyId: storyId,
							categoryId: categoryId
						},
						mutation: TOGGLE_GLOBAL_STORY,
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
							content: result.data.toggleGlobleStory.message,
							onOk() {
								let stories = thisData.state.stories;
								stories.isGlobal = true; 
								thisData.setState({
									stories,
									isGlobalLoading : false
								});
							},
						});
					});
	}
	onChange = (checked) => {
		// console.log(`switch to ${checked}`);
		let thisData = this;
		thisData.setState({
			isGlobalLoading:true
		});
		
		Modal.confirm({
			width: 500,
			className: 'notificationModal',
			icon: (
				<div className="popimageBox">
					<img alt="" src={require('../../Assets/images/move-story.png')} />
				</div>
			),
			content: checked
				? 'Are you sure want to publish this story to global market?'
				: 'Are you sure want to publish this story to inhouse market?',
			//'  icon: ,
			onOk() {
				if(thisData.state.stories.category && !thisData.state.stories.category.isGlobal){
					const{client} = thisData.props;
					client
			.query({
				query: GET_GLOBAL_CATEGORIES,
				fetchPolicy: 'no-cache',
			})
			.then(({ data, loading }) => {
				console.log(data)
					thisData.setState({allCategory:data.getAllGlobalCategories,showCategoryPOpup : true})
			})
				}else{
					thisData.promotetoGlobal(thisData.state.id,null);
				}
				
			},
			onCancel() {
				thisData.setState({
					isGlobalLoading : false
				})
			},
			okText: 'Publish',
		});
	};
	
	getYoutubeVideoId = (url) => {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length == 11) {
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
	handleAddCategory = (category) => {
		this.setState({showCategoryPOpup:false})
		this.promotetoGlobal(this.state.id,category.categoryId)
	}

	render() {
		const settings = {
			nextArrow: <SlickArrowRight />,
			prevArrow: <SlickArrowLeft />,
		};
		// const defaultImage = 'https://im-newsstream-assets.s3.amazonaws.com/journalist/2.png';
		const onFinishFailed = (values) => {

			// this.setState({ratingLoading : false})
		};
		const onFinish = (values) => {
			const { client } = this.props;
			
            this.setState({ratingLoading :true})
			// let props = this.props;
			values.storyId = this.state.id;
			values.rating = this.state.ratingValue;
			let thisData = this;
			if (values.rating == 0) {
				thisData.setState({showRatingError:true,ratingLoading: false})
			} else {	
				thisData.setState({showRatingError:false})
				try {
					client
						.mutate({
							variables: values,
							mutation: SAVE_RATINGS,
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
								content: result.data.addRating.message,
								onOk() {
									thisData.setState({
										showAddRating: false,
										ratingValue: 0,
										isLoaded: false,
										ratingLoading:false
									});
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
				}
				 
				catch (error) {
					SentryError(error);
				}
			}
		};

		const handleChange = (value) => {
			this.setState({ ratingValue: value });
		};
		const avarageRating = () => {
			let avg = 0;
			if (this.state.filteredRating.length > 0) {
				avg = this.state.filteredRating.reduce((r, c) => r + c.rating, 0);
				avg = avg / this.state.filteredRating.length;
			}
			return avg.toFixed(1);
		};
		const convertToPerc = (value) => {
			let avg = 0;
			if (this.state.filteredRating.length > 0) {
				let filteredData = this.state.filteredRating.filter(
					({ rating }) => Math.round(rating) == value
				);
				avg = filteredData.reduce((r, c) => r + c.rating, 0);
				return (filteredData.length * 100) / this.state.filteredRating.length;
			}
			return avg;
		};
		const filteredRatingCount = (percent) => {
			return (percent * this.state.filteredRating.length) / 100;
		};
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Buyer | Story Details</title>
				</Helmet>
				{this.state.isLoaded ? this.state.show404 ? <NotFound/>: (
					<div className="storyDetailPage">
						<div className="globaltitle mb-3 d-flex justify-content-between align-items-center">
							<h3 className="mb-lg-0"><CustIcon type="backarrow" className="mr-2" />{this.state.stories.isProposal ? "Story Proposal Details" : "Story Details"}</h3>
							{this.state.stories.isProposal ?
								 this.state.stories.request === null && (
								 <Button
								type="primary"
								className="purchasebtn"
								shape="round"
								onClick={() => this.props.history.push({
									pathname : '/addNewRequest/'+this.state.stories.storyId, 
									state : {
										title : this.state.stories.title,
										name : this.state.stories.createdBy.name
									}
								}
								)}
								loading={this.state.loading}
								>
								<CustIcon type="carticon" className="mr-2" />
								Request Full Story
							</Button>)
							 : (!this.state.purchased  && !this.state.stories.isArchive) ? (
								<Button
									type="primary"
									className="purchasebtn"
									shape="round"
									onClick={this.purchaseStory}
									loading={this.state.loading}
									>
									<CustIcon type="carticon" className="mr-2" />
									Purchase
								</Button>								
							) : (this.state.purchased && ( !this.state.stories.isLive)) && (
								<Button
									type="primary"
									className="downloadstory"
									shape="round"
									loading={this.state.loading}
									onClick={this.purchaseStory}>
									<CustIcon type="downloadicon" className="mr-2" />
									Download Media
								</Button>
								// <Button
								// 	type="primary"
								// 	className="purchasebtn"
								// 	shape="round"
								// 	onClick={this.purchaseStory}
								// 	loading={this.state.loading}
								// 	>
								// 	<CustIcon type="sendicon" className="mr-2" />
								// 	Request Full Story
								// </Button>
							)}
						</div>
						<Card className="detailsBox_blk boxshadow mb-3">
							{/* {(localStorage.getItem('isManager') == 'true' && !this.state.stories.isGlobal  
							&& ( !this.state.stories.isArchive))? (
								<Button
									type="primary"
									className="mb-3"
									loading={this.state.isGlobalLoading}
									onClick={e => this.onChange(true)}>
									Promote to Global
								</Button>
							):(
								<div className="badge global_badge mb-3 ">
									{this.state.stories.isGlobal ? 'Global' : 'Inhouse' }
								</div>
							)} */}
							{!this.state.stories.isProposal && 
							<div className="priceAmt">${this.state.stories.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
							}
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
									new Date(parseFloat(this.state.stories.storyDateTime))
								).fromNow()}
							</div>
							{this.state.stories.request != null && (
								<div className="d-flex flex-column">
									<div className="font16 font-weight-bold mb-2">
										Media Requested
									</div>
									<div className="d-flex flex-row align-items-center mb-1 mediaRequest">
										{this.state.stories.request.isAudio && (
											<Tag className="audioTag">
												<CustIcon type="audioicon" className="mr-2" />
												Audio
											</Tag>
										)}
										{this.state.stories.request.isVideo && (
											<Tag className="videoTag">
												<CustIcon type="videoicon" className="mr-2" />
												Video
											</Tag>
										)}
										{this.state.stories.request.isImage && (
											<Tag className="imageTag">
												<CustIcon type="imageicon" className="mr-2" />
												Image
											</Tag>
										)}
											{this.state.stories.request.isArticle && (
											<Tag className="imageTag">
												<CustIcon type="imageicon" className="mr-2" />
												Article
											</Tag>
										)}
										{this.state.stories.isLive && (
											<Tag className="liveTag">
												<CustIcon type="liveicon" className="mr-2" />
												Live
											</Tag>
										)}
									</div>
								</div>
							)}
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
														src=
															{
															this.state.stories.storyLiveStream.thumbnail
																?COULDBASEURL +
																this.state.stories.storyLiveStream.thumbnail
																: require('../../Assets/images/ic_no_image.png')
														}
													/>
													<CustIcon
														type="liveicon"
														className="imagetypeIcon"
													/>
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
												defaultValue={this.state.stories.storyLiveStream?.url}
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
							{this.state.stories.category && (
							<><div className="font18 font-weight-bold mb-2">Added Under</div>
								<div className="badge market_badge">
									{this.state.stories.category.title}
								</div></>
							)}
							{!this.state.stories.storyLiveStream && (
								<div className="d-flex flex-column">
									<div className="font16 font-weight-bold mb-2 pt-3">
										Submitted Media
									</div>
									<Row gutter={20} className="mediaStoryDetails">
									{this.state.stories.video.length > 0 && (
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
															<img alt="" className="brdrd"
																src={
																	 data.thumbnail
																		? COULDBASEURL + data.thumbnail
																		: require('../../Assets/images/ic_no_image.png')
																}
															/>

															<CustIcon
																type="videoicon"
																className="imagetypeIcon"
															/>
															<CustIcon type="playicon" className="videoPlay" />
														</div>
													</Col>
												);
											})
										)}
									{this.state.stories.images.length > 0 && (
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
												})
												)}
									{this.state.stories.audio.length > 0 && (
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
																			playAudioURL:
																				COULDBASEURL + data.mediaName,
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
												})
											)}
											{this.state.stories.article.length > 0 && (
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
																	onClick={() =>
																		this.setState({
																			showAudio: true,
																			playAudioURL:
																				COULDBASEURL + data.mediaName,
																			selectedIndex: index,
																		})
																	}
																	key={index}
																	className="brdrd"
																	src={require('../../Assets/images/ic_article.svg')}
																/>
															</div>
														</Col>
													);
												})
											)}
									</Row>
								</div>
							)}							
							{this.state.stories.note && (
								<div className="d-flex flex-column pt-2">
									<div className="font18 font-weight-bold mb-2">
										Content Creator's Note
									</div>
									<div className="d-flex flex-row align-items-center mb-1">
										<span className="text-break">
											{this.state.stories.note}
										</span>
									</div>
								</div>
							)}
						</Card>
						<div className="globaltitle mb-3">
							<h3 className="mb-lg-0">Posted by</h3>
						</div>
						{this.state.stories.isGlobal ? <Card className="requestBox_blk boxshadow mb-3">
							<Row gutter={20}>
								<Col lg={6} md={12} sm={24} xs={24}>
									<div
										// onClick={() =>
										// 	onReporterClick(
										// 		this.props.history,
										// 		this.state.stories.createdBy.userId,
										// 		this.state.stories.createdBy.deleted
										// 	)
										// }
										className="cursorPointer user_blk d-flex flex-row mb-lg-0 mb-2">
										
										<ProfileAvatar
											size={60}
											name={this.state.stories.publisher.user.name}
											imageUrl={this.state.stories.publisher.user.profileImage}
										/>
										<div className="d-flex flex-column justify-content-center pl-3">
											<h5 className="mb-0 userTop text-break font-weight-bold">
												{this.state.stories.publisher.title}
											</h5>
											{/* <span className="label_blk"><CustIcon type="calendaricon" className="mr-2"/>24/02/2020</span> */}
											<div className="d-flex flex-row align-items-center label_blk ">
											<span>
												<CustIcon type="calendaricon" className="mr-2" />
												{moment(
													new Date(
														parseFloat(this.state.stories.updatedDate)
													)
												)
												.local()
												.format('MM/DD/YYYY')}
											</span>
										</div>
										</div>
									</div>
								</Col>
								<Col lg={12} md={12} sm={12} xs={24}>
									<div className="d-flex flex-column mb-lg-0 mb-2">
										<div className="label_blk mb-1">Location</div>
										<div className="d-flex flex-row align-items-center dateTxt">
											<span className="font14 pline-2">
												<EnvironmentFilled className="mr-2" />
												{this.state.stories.publisher 
													? getAddress(this.state.stories.publisher)
													: 'No Location Detected'}
											</span>
										</div>
									</div>
								</Col>
								{/* <Col lg={6} md={12} sm={12} xs={24}>
									<div className="d-flex flex-column mb-lg-0 mb-2">
										<div className="label_blk mb-1">Published Date </div>
										<div className="d-flex flex-row align-items-center dateTxt">
											<span>
												<CustIcon type="calendaricon" className="mr-2" />
												{moment(
													new Date(
														parseFloat(this.state.stories.updatedDate)
													)
												)
												.local()
												.format('MM/DD/YYYY')}
											</span>
										</div>
									</div>
								</Col> */}
								<Col lg={6} md={12} sm={24} xs={24} className="text-right">
									<ContactButton
										name={this.state.stories.createdBy.name.split(' ')[0]}
										phoneNumber={this.state.stories.createdBy.phoneNumber}
										whatsAppOnly={true}
									/>
								</Col>
							</Row>
						</Card> : <Card className="requestBox_blk boxshadow mb-3">
							<Row gutter={20}>
								<Col lg={6} md={12} sm={24} xs={24}>
									<div
										onClick={() =>
											onReporterClick(
												this.props.history,
												this.state.stories.publisher.publisherId,
												this.state.stories.createdBy.deleted
											)
										}
										className="cursorPointer user_blk d-flex flex-row mb-lg-0 mb-2">
										<ProfileAvatar
											size={60}
											name={this.state.stories.createdBy.name}
											imageUrl={this.state.stories.createdBy.profileImage}
										/>
										<div className="d-flex flex-column justify-content-center pl-3">
											<h5 className="mb-0 userTop text-break font-weight-bold">
												{this.state.stories.createdBy.name}
											</h5>
											{/* <span className="label_blk"><CustIcon type="calendaricon" className="mr-2"/>24/02/2020</span> */}
										</div>
									</div>
								</Col>
								<Col lg={6} md={12} sm={12} xs={24}>
									<div className="d-flex flex-column mb-lg-0 mb-2">
										<div className="label_blk mb-1">Location</div>
										<div className="d-flex flex-row align-items-center dateTxt">
											<span className="font14 pline-2">
												<EnvironmentFilled className="mr-2" />
												{this.state.stories.createdBy && this.state.stories.createdBy.locations &&
												this.state.stories.createdBy.locations.length
													? getAddress(this.state.stories.createdBy.locations)
													: 'No Location Detected'}
											</span>
										</div>
									</div>
								</Col>
								{this.state.stories.createdBy.phoneNumber && <Col lg={6} md={12} sm={12} xs={24}>
									<div className="d-flex flex-column mb-lg-0 mb-2">
										<div className="label_blk mb-1">Contact </div>
										<div className="d-flex flex-row align-items-center dateTxt">
											<span>
												<CustIcon type="callicon" className="mr-2" />
												<a href={"tel:"+this.state.stories.createdBy.phoneNumber}>{this.state.stories.createdBy.phoneNumber}</a>
											</span>
										</div>
									</div>
								</Col>}
								<Col lg={6} md={12} sm={24} xs={24} className="text-right">
									<ContactButton
										name={this.state.stories.createdBy.name.split(' ')[0]}
										phoneNumber={this.state.stories.createdBy.phoneNumber}
										//slackUserId={this.state.stories.createdBy.slackUserId}
									/>
								</Col>
							</Row>
						</Card>}
						{/* {this.state.stories.request.length > 0 && (
												<Card className="boxshadow mb-3 d-none d-sm-block">
													<div className="d-flex justify-content-between">
														<h4 className="font-weight-bold font14 mb-1">
															Recent Proposals
														</h4>	
													</div>
													<Row gutter={20}>
														{this.state.stories.stories.map((data, index) => {
															return (
																	<Col lg={4} md={8} sm={12} xs={24} className="mt-3">
																		<Link to={`/myRequest/withProposal/storyDetails/${data.storyId}`}>
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
																									:<div className="ImagesSlider">
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
														})}
													</Row>
												</Card>
											)} */}
						{(this.state.purchased && !this.state.stories.isProposal) && (
							<div>
								<div className="globaltitle mb-3">
									<h3 className="mb-lg-0"> Reviews and Ratings</h3>
								</div>
								<Card className="rating_blk boxshadow">
									<Row gutter={18} className="mb-3">
										<Col xs={24} sm={24} md={24} lg={12} xl={12}>
											<div className="d-flex flex-column">
												<h4 className="font16 mb-3">Average story rating</h4>
												<Card className="averageStoryRating">
													<Row>
														<Col>
															<div className="d-flex flex-column overAllRating">
																<Avatar shape={'square'}>
																	<h2>{avarageRating()}</h2>
																	<p>
																		{this.state.filteredRating.length} reviews
																	</p>
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
														</Col>
														<Col flex="auto">
															{desc.map((data, index) => {
																return (
																	<Row className="d-flex pb-1" key={index}>
																		<Col>
																			<div className="status">{data}</div>
																		</Col>
																		<Col flex="auto">
																			<Progress
																				strokeColor="#FFBB00"
																				percent={+convertToPerc(index + 1)}
																				//format={+filteredRatingCount(index + 1)}
																				format={(percent) =>
																					`${filteredRatingCount(percent)}`
																				}
																			/>
																		</Col>
																	</Row>
																);
															})}
														</Col>
													</Row>
												</Card>
											</div>
										</Col>
										{this.state.showAddRating && (
											<Col
												xs={24}
												sm={24}
												md={24}
												lg={12}
												xl={12}
												className="pt-lg-0 pt-3 addYourrating">
												<div className="d-flex flex-column">
													<div className="d-flex flex-row align-items-start justify-content-between">
														<h4 className="font16 mb-2">Add your ratings</h4>
														<Rate
															tooltips={desc}
															onChange={handleChange}
															value={this.state.ratingValue}
															allowClear={false}
															allowHalf
															character={<CustIcon type="staricon" />}
														/>
														{/* {this.state.ratingValue ? <span className="ant-rate-text">{desc[this.state.ratingValue - 1]}</span> : ''} */}
													</div>
													<Card>
														<Form
															onFinish={onFinish}
															onFinishFailed={onFinishFailed}>
															<Row>
																<Col>
																	<div className="mr-3">
																		<ProfileAvatar
																			size={50}
																			name={localStorage.getItem('name')}
																			imageUrl={localStorage.getItem(
																				'profileImage'
																			)}
																		/>
																	</div>
																</Col>
																<Col flex="auto">
																	<Form.Item label="" name="comment">
																		<Input.TextArea rows={3} />
																	</Form.Item>
																	{this.state.showRatingError && 
																	<div className="errorLabel">Please add star ratings</div>}
																</Col>
															</Row>
															<div className="d-flex justify-content-end">
																<Button
																	type="primary"
																	shape="round"
																	className="px-4"
																	loading={this.state.ratingLoading}
																	htmlType="submit"
																	>
																	Submit
																</Button>
															</div>
														</Form>
													</Card>
												</div>
											</Col>
										)}
									</Row>
									<Row>
										<Col xs={24} sm={24} md={24} lg={24} xl={24}>
											<div className="globaltitle mb-3">
												<h3 className="mb-lg-0">
													Reviews and Ratings
													<small className="ml-2 lightGray-text-color">
														({this.state.filteredRating.length} reviews)
													</small>
												</h3>
											</div>
										</Col>
									</Row>
									{this.state.filteredRating.length > 0 ? (
										<Row>
											<Col xs={24} sm={24} md={24} lg={24} xl={24}>
												{' '}
												<Card className="mb-3 reviewsAndRatings">
													{this.state.filteredRating.length > 0 &&
														this.state.filteredRating.map((data, index) => {
															return (
																!data.isHidden && (
																	<div className="reviewRateBox" key={index}>
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
																						({desc[Math.round(data.rating) - 1]}
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
																		{data.createdBy.userId !==
																		localStorage.getItem('userId') ? (
																			data.isAbused ? (
																				'Reported Abused'
																			) : (
																				<div className="reportAbuse">
																					<Link
																						onClick={(e) =>
																							this.onAbuseReport(data.ratingId)
																						}>
																						Report abuse
																					</Link>
																					<Tooltip
																						placement="right"
																						title="If you find this content inappropriate and think it should be removed from the site, let us know by clicking this link">
																						<ExclamationCircleOutlined className="infoIcon" />
																					</Tooltip>
																				</div>
																			)
																		) : null}
																	</div>
																)
															);
														})}{' '}
												</Card>
											</Col>
										</Row>
									) : (
										<Empty image={<img src={require('../../Assets/images/review-rating.png')}/>} 
										description={
											<span className="font-bold">
											Uh-oh! No reviews yet.
											</span>
										}/>
									)}
								</Card>
							</div>
						)}
						<Modal
				title="Add Category"
				destroyOnClose={true}
				closable={false}
				visible={this.state.showCategoryPOpup}
				onCancel={() => this.setState({showCategoryPOpup:false})}
				wrapClassName="inviteReporterModel"
				onOk={this.handleAddCategory}
				okText="Add Category"
				footer={[
					<Button key="back" onClick={() => this.setState({showCategoryPOpup:false,isGlobalLoading:false})}>
						Cancel
					</Button>,
					<Button
						form="my-form"
						key="submit"
						type="primary"
						htmlType="submit"
						//loading={loading}
						>
						Add Category
					</Button>,
				]}
				//okButtonProps={{ disabled: isSavingNote, loading: isSavingNote }
			>
				<Form
					name="journalistForm"
					className="login-form"
					onFinish={this.handleAddCategory}
					id="my-form">
							<Form.Item name="categoryId">
								<Select>
									{this.state.allCategory.map((data,index) => {
										return <Option key={index} value={data.categoryId}>{data.title}</Option>
									})}
								</Select>
							</Form.Item>
				</Form>
			</Modal>
			
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
								// <video
								// 	style={{ width: '100%', height: 'auto' }}
								// 	controlsList="nodownload"
								// 	controls
								// 	// poster={
								// 	// 	COULDBASEURL + this.state.stories.storyLiveStream.thumbnail
								// 	// }
								// 	>
								// 	<source
								// 		src={this.state.stories.storyLiveStream.url}
								// 		type="video/mp4"
								// 	/>
								// 	Your browser does not support the video tag.
								// </video>
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
StoryDetails = withApollo(StoryDetails);
export { StoryDetails };
