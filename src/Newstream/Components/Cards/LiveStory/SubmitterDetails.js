import React from 'react';
import { Card, Row, Col } from 'antd';
import { ProfileAvatar } from '../../Avatar';
import { getAddress } from '../../../Components/general/general';
import { ContactButton } from '../../Buttons';
import moment from 'moment';
import { LiveTag } from '../../Tags';

const LiveStorySubmitterDetails = ({
	storyCreatedBy,
	storyPrice,
	scheduleDate,
}) => {
	const timeDiff = moment(new Date(parseFloat(scheduleDate))).fromNow();
	const timeInFuture = new Date() < new Date(parseFloat(scheduleDate));

	if (!storyCreatedBy) {
		return null;
	}

	return (
		<Card>
			<Row gutter={8}>
				<Col xl={24} lg={24} md={24} sm={24} xs={24}>
					<div className="mb-2">Posted By</div>
					<div className="user_blk d-flex flex-row align-items-start mb-lg-3 mb-2">
						<div className="pt-1">
							<ProfileAvatar
								size={35}
								className=""
								name={storyCreatedBy?.name}
								imageUrl={storyCreatedBy?.profileImage}
							/>
						</div>
						<div className="d-flex flex-column justify-content-center pl-3">
							<h5 className="mb-0 userTop text-break">
								{storyCreatedBy?.name}
							</h5>
							<span className="locTxt userBottom text-break">
								{storyCreatedBy?.address && getAddress(storyCreatedBy?.address)}
							</span>
						</div>
					</div>
				</Col>
				<Col xl={24} lg={6} md={12} sm={12} xs={24}>
					<div className="d-flex flex-column mb-2">
						<div className="label_blk mb-1">Content Creator's Contact </div>
						<div className="d-flex flex-row align-items-center dateTxt">
							<span>
							<a href={"tel:"+storyCreatedBy.phoneNumber}>{storyCreatedBy.phoneNumber}</a></span>
						</div>
					</div>
				</Col>
				<Col xl={24} lg={6} md={12} sm={12} xs={24}>
					<ContactButton
						name={storyCreatedBy?.name.split(' ')[0]}
						phoneNumber={storyCreatedBy?.phoneNumber}
						slackUserId={storyCreatedBy?.slackUserId}
					/>
				</Col>
				<Col xl={24} lg={6} md={12} sm={12} xs={14}>
					<div className="d-flex flex-column">
						<div className="label_blk mb-1 mt-3">Price</div>
						<div>
							<span className="text-nowrap priceAmt font-medium primary-text-color">
								$ {storyPrice}
							</span>
						</div>
					</div>
				</Col>
				<Col xl={24} lg={6} md={12} sm={12} xs={14}>
					<div className="d-flex flex-column">
						<div className="label_blk mb-1 mt-3">Story Type</div>
						<LiveTag />
					</div>
				</Col>
				{scheduleDate && (
					<Col xl={24} lg={6} md={12} sm={12} xs={14}>
						<div className="d-flex flex-column">
							<div className="label_blk mb-1 mt-3">
								{timeInFuture ? 'Live event starting in ' : 'Streamed '}
							</div>
							<div className="text-nowrap priceAmt font-medium primary-text-color">
								{timeDiff.replace('in ', '')}
							</div>
						</div>
					</Col>
				)}
			</Row>
		</Card>
	);
};

export { LiveStorySubmitterDetails };
