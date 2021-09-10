import React from 'react';
import { Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { ProfileAvatar } from '../../Avatar';
import { PurchaseTag } from '../../Tags';
import './LiveStory.css';

const LiveStoryCard = ({ story }) => {
	const browserHistory = useHistory();
	const bucketUrl = localStorage.getItem('cloudUrl');
	const timeDiff = moment(
		new Date(
			parseFloat(
				story?.storyLiveStream?.scheduleDate || story?.request?.scheduleDate
			)
		)
	).fromNow();
	const timeInFuture =
		new Date() <
		new Date(
			parseFloat(
				story?.storyLiveStream?.scheduleDate || story?.request?.scheduleDate
			)
		);
/**
 * viewLiveStoryDetails
 * Function calls to View LiveStory details when click on story
 */
	const viewLiveStoryDetails = () => {
		/* set Livestory data to localstorage*/
		localStorage.setItem('live-story', JSON.stringify(story));
		browserHistory.push(`/live-stream-details/${story?.storyId}`);
	};

	return (
		<Card onClick={viewLiveStoryDetails} className="liveStory_blk">
			<div className="liveStory_top mb-3 d-flex justify-content-between align-items-start">
				<div className="liveStoryAvatar d-flex align-items-center">
					<ProfileAvatar
						size={35}
						name={story?.createdBy?.name}
						imageUrl={story?.createdBy?.profileImage}
					/>
					<div className="d-flex flex-column pl-2">
						<div className="name">{story?.createdBy?.name}</div>
						<div className="location">
							{story?.location || story?.request?.location}
						</div>
					</div>
				</div>
				<div className="d-flex flex-column justify-content-end text-right">
					<p className="mb-1 scheduled">
						{timeInFuture && <CalendarOutlined className="mr-1" />}
						{timeInFuture ? 'Scheduled' : 'Streamed'} {timeDiff}
					</p>
					<p className="mb-0 price">
						Price: <strong>${story?.price.toFixed(0)}</strong>
					</p>
				</div>
			</div>
			<div className="liveStory_img d-flex justify-content-center align-items-center">
				{story?.isPurchased && <PurchaseTag />}
				<img
					src={
						story?.storyLiveStream?.thumbnail
							? bucketUrl + story?.storyLiveStream?.thumbnail
							: require('../../../Assets/images/ic_no_image.png')
					}
					alt="thumbnail"
				/>
			</div>
			<div className="mb-2 liveStory_title">
				<strong>{story?.title}</strong>
			</div>
		</Card>
	);
};

export default LiveStoryCard;
