import React, { Component } from 'react';
import './StoryBox.css';
import { Link } from 'react-router-dom';
import { Button, Card } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { CustIcon } from '../Svgs';
import moment from 'moment';
import { ProfileAvatar } from '../Avatar/Avatar';

class StoryBox extends Component {
	render() {
		return (
			<Link to={`/storyDetails/${this.props.stories.storyId}`}>
				<Card
					className={`mt-md-4 mt-3 allCardBox_blk tour-marketplace-details ${
						this.props.stories.createdBy?.isApplicant && 'applicantStory'
					}`}
					key={this.props.stories.id}>
					<div className="d-flex flex-lg-row flex-column align-items-lg-start justify-content-lg-between mb-3">
						<div className="rbTitle">
							<h3 className="mb-lg-0">{this.props.stories.title}</h3>
						</div>
						<div className=" viewCounter d-flex flex-row align-items-center">
							{this.props.stories.storyMediaCount.audio > 0 && (
								<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
									<span> {this.props.stories.storyMediaCount.audio}</span>
									<CustIcon type="voice" className="ml-1" />
								</div>
							)}
							{this.props.stories.storyMediaCount.video > 0 && (
								<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
									<span> {this.props.stories.storyMediaCount.video}</span>
									<CustIcon type="video" className="ml-1" />
								</div>
							)}
							{this.props.stories.storyMediaCount.image > 0 && (
								<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
									<span> {this.props.stories.storyMediaCount.image}</span>
									<CustIcon type="image" className="ml-1" />
								</div>
							)}
						</div>
					</div>
					<div className="row">
						<div className="col-xl-5 col-md-6 d-flex flex-column align-items-start">
							<div className="userInCard d-flex flex-row align-items-start">
								<div className="uicAvatar d-flex align-items-start justify-content-center">
									<div
										onClick={(e) =>
											this.props.onReporterClick(
												this.props.stories.createdBy.userId,
												this.props.stories.createdBy.deleted
											)
										}>
										<ProfileAvatar
											size={40}
											name={this.props.stories.createdBy.name}
											imageUrl={this.props.stories.createdBy.profileImage}
										/>
									</div>
								</div>
								<div className="d-flex flex-column pl-3">
									<div
										onClick={(e) =>
											this.props.onReporterClick(
												this.props.stories.createdBy.userId,
												this.props.stories.createdBy.deleted
											)
										}>
										<strong className="uicTop mb-1">
											{this.props.stories.createdBy &&
												this.props.stories.createdBy.name}
										</strong>
									</div>
									<div className="uicBottom d-flex flex-row align-items-start">
										<img
											alt=""
											className="mr-1 mt-1"
											src={require('../../Assets/images/cal-icon.png')}
										/>
										<span>
											submitted{' '}
											{moment(
												new Date(parseFloat(this.props.stories.createdDate))
											).fromNow()}
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="col-xl-4 col-md-6 d-flex flex-row align-items-center pt-2 pt-md-0">
							<div className="d-flex flex-column w-100 align-items-start">
								<div className="d-flex flex-row align-items-lg-center align-items-start mb-2 locTxt">
									<EnvironmentOutlined className="mr-2" />
									<span className="allStoryLocation text-nowrap">
										{this.props.stories.location}
									</span>
								</div>
								{/* <div className="d-flex flex-row align-items-center ">
                {this.props.stories.type === 'Assigned' ?
                  <div className="d-flex align-items-center lbl-assigned ">
                    <img alt="" src={require('../../Assets/images/assign-icon.png')} />
                    <span>Assigned</span>
                  </div> : this.props.stories.type === 'Breaking' ?
				  <div className="d-flex align-items-center lbl lbl-pending mr-2">
				  <CustIcon type="flash" className="mr-1" />{' '}
				  <span>Marketplace</span>
			  </div> :
                    <div className="d-flex align-items-center lbl-open">
                      <img alt="" src={require('../../Assets/images/open-icon.png')} />
                      <span>Open</span>
                    </div>
                }
                {this.props.stories.isPurchased && <div className="d-flex flex-row align-items-center  pr-2 ml-2 lbl-purchased">
                  <img alt="" src={require('../../Assets/images/purchased-icon.svg')} />
                  <span> Purchased</span>
                </div>}
              </div> */}
							</div>
						</div>
						<div className="col-xl-3 col-12 d-flex flex-row align-items-end justify-content-end pt-2 pt-lg-0">
							<div className="d-flex flex-column align-items-center">
								<div className="d-flex flex-row align-items-center mb-1">
									<span className="text-nowrap primary-text-color priceAmt mr-4">
										{' '}
									</span>{' '}
									<Button className="price-btn">
										{' '}
										<Link to={`/storyDetails/${this.props.stories.storyId}`}>
											View Details <span className="px-1">|</span> $
											{this.props.stories.price}
										</Link>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			</Link>
		);
	}
}

export default StoryBox;
