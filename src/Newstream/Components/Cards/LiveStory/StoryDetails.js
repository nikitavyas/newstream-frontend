import { Button, Card, Col, Input, message, Modal, Row } from 'antd';
import moment from 'moment';
import React, { Fragment, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { PURCHASE_STORY } from '../../../graphql/APIs';
import { CustIcon } from '../../Svgs/Svgs';
import './StoryDetails.css';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';

const LiveStoryDetails = ({ storyDetails, onPurchase }) => {
	const client = useApolloClient();
	const bucketUrl = localStorage.getItem('cloudUrl');
	const [storyIsPurchased, setStoryIsPurchased] = useState(
		storyDetails?.isPurchased
	);
	const [showVideoModal, setShowVideoModal] = useState(false);
	const onPurchaseStory = () => {
		onPurchase();
	};

	/**
	 * purchaseStory
	 * Function Call when user purchase story
	 */
	const purchaseStory = () => {
		client
			.mutate({
				variables: { storyId: storyDetails?.storyId },
				mutation: PURCHASE_STORY,
			})
			.then(() => {
				Modal.success({
					width: 500,
					className: 'notificationModal',
					icon: (
						<div className="popDeleteicon">
							<img
								alt="Thumbs Up"
								src={require('../../../Assets/images/thumb-icon.svg')}
							/>
						</div>
					),
					content: (
						<div className="d-flex flex-column align-items-center">
							<h5>Congratulations</h5>
							<p>Your story has been purchased successfully!</p>
						</div>
					),
					onOk() {
						/*Update StoryIspurchased flag */
						setStoryIsPurchased(true);
						var details = storyDetails;
						details.isPurchased = true;
						
						/*set storydetails into localstorage */
						localStorage.setItem('live-story', JSON.stringify(details));
						onPurchaseStory();
					},
				});
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
			});
	};
/**
 * copyStreamUrl
 * Function call on copy Storydetails url to clipboard
 */
	const copyStreamUrl = () => {
		navigator.clipboard.writeText(storyDetails?.storyLiveStream?.url);
	};

/**
 * copyEmbedUrl
 * Function call to copy embed url to clipboard
 */
	const copyEmbedUrl = () => {
		const embedCode = `<iframe width="100%" height="400" scrolling="no" frameborder="0" allowTransparency="true" src={"${getVideoEmbedUrl()}"} />`;
		navigator.clipboard.writeText(embedCode);
	};


/**
 * getVideoEmbedUrl
 * Function call When Frame get youtube and Facebook URL   
 */
const getVideoEmbedUrl = () => {
	    /* Checking srtorydetails url type*/
		if (storyDetails?.storyLiveStream?.type === 'youtube') {
			var youtubeURLFormatter = storyDetails?.storyLiveStream?.url.includes(
				'watch'
			)
				? `${storyDetails?.storyLiveStream?.url
						.replace('watch?v=', 'embed/')
						.replace('m.', 'www.')}`
				: `https://www.youtube.com/embed/${
						storyDetails?.storyLiveStream?.url.split('be/')[1]
				  }`;
			return youtubeURLFormatter;
		}
		/* Checking srtorydetails url type*/
		if (storyDetails?.storyLiveStream?.type === 'facebook') {
			var facebookURLFormatter = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
				storyDetails?.storyLiveStream?.url
			)}&show_text=false&width=734&height=411&appId`;
			return facebookURLFormatter;
		}
	};

	/**
	 * openVideoModal
	 * Function call when open Video Content Modal
	 */
	const openVideoModal = () => {
		/*Update VideoModal Flag*/
		setShowVideoModal(true);
	};

	/**
	 * closeVideoModal
	 * Function call when close Video content Modal
	 */
	const closeVideoModal = () => {
		/*Update ShowVideomodal flag*/
		setShowVideoModal(false);
	};

	return (
		<Card className=" px-3 mt-xl-0 mt-3 storyDetails_blk h-100 detailsBox_blk">
			<Row className="d-flex align-items-center justify-content-between mb-3">
				<div className="mb-0 textTitle">{storyDetails?.title}</div>
			</Row>
			<Row>
				<Col xs={24} lg={17}>
					<Row>
						<Col flex={24}>
							<p className="label_blk mt-2 mb-2">Location</p>
							<span>{storyDetails?.request?.location}</span>
						</Col>
					</Row>
					<Row className="mt-4">
						<Col className="mb-lg-0 mb-4" xs={24} lg={12}>
							<p className="label_blk mt-2 mb-2">
								{storyDetails?.storyLiveStream
									? 'Story Date & Time'
									: 'Request Accepted Date & Time'}
							</p>
							<span>
								{moment(new Date(parseFloat(storyDetails?.createdDate)))
									.local()
									.format('DD MMMM, YYYY h:mm a') || '-'}
							</span>
						</Col>
						<Col className="mb-lg-0 mb-4" xs={24} lg={12}>
							<p className="label_blk mt-2 mb-2">Scheduled Date & Time</p>
							<span>
								{moment(
									new Date(
										parseFloat(
											storyDetails?.storyLiveStream?.scheduleDate ||
												storyDetails?.request?.scheduleDate
										)
									)
								)
									.local()
									.format('DD MMMM, YYYY h:mm a')}
							</span>
						</Col>
					</Row>
				</Col>
				<Col xs={24} lg={7}>
					<Modal
						title="Live Stream"
						visible={showVideoModal}
						onCancel={closeVideoModal}
						width={700}
						cancelText="Close"
						footer={
							<Button
								type="primary"
								shape="round"
								htmlType="button"
								onClick={closeVideoModal}>
								Close
							</Button>
						}>
						{showVideoModal && (
							<iframe
								width="100%"
								height="400"
								scrolling="no"
								frameBorder="0"
								allowTransparency="true"
								src={getVideoEmbedUrl()}
							/>
						)}
					</Modal>
					<div
						className="liveStreamImg d-flex align-items-center justify-content-center"
						style={{ cursor: !storyDetails?.storyLiveStream && 'default' }}
						onClick={storyDetails?.storyLiveStream && openVideoModal}>
						{storyDetails?.storyLiveStream && <CustIcon type="play" />}
						<img
							alt=""
							className="img-fluid"
							src={
								storyDetails?.storyLiveStream?.thumbnail
									? bucketUrl + storyDetails?.storyLiveStream?.thumbnail
									: require('../../../Assets/images/ic_no_image.png')
							}
						/>
					</div>
				</Col>
			</Row>
			{storyDetails?.note && (
				<Row className="d-flex align-items-center justify-content-between mb-4">
					<Col xs={12} lg={24}>
						<p className="label_blk mt-2 mb-2">content Creator's Note</p>
						<div className="note">{storyDetails?.note}</div>
					</Col>
				</Row>
			)}
			{!storyIsPurchased ? (
				<Fragment>
					{!storyDetails?.storyLiveStream && (
						<Row justify="center" className="mt-4">
							<p className="mt-2 mb-1">
								<span className="primary-text-color">*</span>The stream will be
								available to preview & purchase on{' '}
								{moment(
									new Date(parseFloat(storyDetails?.request?.scheduleDate))
								)
									.local()
									.format(`DD MMMM, YYYY h:mm a`)}
							</p>
						</Row>
					)}
					<Row justify="center" className="mt-3">
						<Button
							type="primary"
							shape="round"
							htmlType="submit"
							onClick={purchaseStory}
							disabled={!storyDetails?.storyLiveStream}>
							Purchase
						</Button>
					</Row>
				</Fragment>
			) : (
				<Fragment>
					<Row className="mt-4 mb-2">
						<Col xs={24} flex={24}>
							<Row>
								<p className="label_blk mb-2">Live Stream Url</p>
							</Row>
							<Row justify="space-between" align="middle">
								<Col xs={24} md={17} lg={18}>
									<Input
										disabled
										defaultValue={storyDetails?.storyLiveStream?.url}
										id="streamUrl"
									/>
								</Col>
								<Col
									className="d-flex flex-row flex-md-column"
									xs={24}
									md={6}
									lg={5}>
									<Button
										className="mt-lg-0 mt-3"
										type="primary"
										shape="round"
										htmlType="button"
										onClick={copyStreamUrl}>
										Copy Link
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
					<Row className="mt-3 mb-2">
						<Col flex={24}>
							<Row>
								<p className="label_blk mb-2">Embed Live Stream </p>
							</Row>
							<Row justify="space-between" align="middle">
								<Col xs={24} md={17} lg={18}>
									<Input.TextArea
										autoSize
										disabled
										defaultValue={`<iframe width="600" height="400" scrolling="no" frameborder="0" allowTransparency="true" src='${getVideoEmbedUrl()}' />`}
										id="streamUrl"
									/>
								</Col>
								<Col
									className="d-flex flex-row flex-md-column"
									xs={24}
									md={6}
									lg={5}>
									<Button
										className="mt-lg-0 mt-3"
										type="primary"
										shape="round"
										htmlType="button"
										onClick={copyEmbedUrl}>
										Copy Embed Code
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>
				</Fragment>
			)}
		</Card>
	);
};

export { LiveStoryDetails };
