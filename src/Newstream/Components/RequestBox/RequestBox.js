import React, { Component } from 'react';
import './RequestBox.css';
import { Link } from 'react-router-dom';
import { Button, Card } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { CustIcon } from '../Svgs/Svgs';
import moment from 'moment';
import { LiveTag } from '../Tags';

class RequestBox extends Component {
	render() {
		return (
			<React.Fragment>
				<Link to={`/myRequestDetails/${this.props.request.requestId}`}>
					<Card className="mt-4 requestBox_blk tour-listView-details-button">
						<div className="d-flex flex-md-row flex-column align-items-md-start justify-content-md-between mb-3">
							<div className="rbTitle">
								<h3 className="mb-lg-0">{this.props.request.title}</h3>
							</div>
							<div className=" viewCounter d-flex flex-row align-items-center">
								{/* {this.props.request.stories.length === 0 && <div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
              <Button type="primary" shape="round"><Link to={`/addNewRequest/${this.props.request.requestId}`}>Edit Price</Link></Button>
              </div>} */}
								{this.props.request.isLive && <LiveTag />}
								{this.props.request.storyMediaCount.audio > 0 && (
									<div className="d-flex flex-row align-items-center pl-lg-3 pl-md-2 pr-3">
										<span>{this.props.request.storyMediaCount.audio}</span>
										<CustIcon type="voice" className="ml-1" />
									</div>
								)}
								{this.props.request.storyMediaCount.video > 0 && (
									<div className="d-flex flex-row align-items-center pl-lg-3 pl-md-2 pr-3">
										<span>{this.props.request.storyMediaCount.video}</span>
										<CustIcon type="video" className="ml-1" />
									</div>
								)}
								{this.props.request.storyMediaCount.image > 0 && (
									<div className="d-flex flex-row align-items-center pl-lg-3 pl-md-2 pr-3">
										<span>{this.props.request.storyMediaCount.image}</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								)}
							</div>
						</div>
						<div className="d-flex flex-lg-row flex-column align-items-lg-end justify-content-lg-between">
							<div className="d-flex flex-column align-items-start mb-lg-0 mb-2">
								<div className="d-flex flex-row align-items-start mb-2 locTxt">
									<EnvironmentOutlined className="mr-2 mt-1" />
									<span className="gray-text-color">
										{this.props.request.location}
									</span>
								</div>
							</div>
						</div>
						<div className="d-flex flex-lg-row flex-column align-items-lg-end justify-content-lg-between">
							<div className="d-flex flex-row align-items-center mt-1 dateTxt">
								<img
									alt=""
									className="mr-1"
									src={require('../../Assets/images/cal-icon.png')}
								/>
								<span>
									{moment(
										new Date(parseFloat(this.props.request.createdDate))
									).format('MM/DD/YYYY')}
								</span>
							</div>
							<div className="d-flex flex-md-row flex-column align-items-md-center justify-content-md-end">
								<div className="d-flex align-items-center my-md-0 my-2">
									<div className="d-flex align-items-center">
										{this.props.request.purchasedStories.length > 0 && (
											<div className="d-flex flex-row align-items-center mr-2 lbl-purchased">
												<img
													alt=""
													src={require('../../Assets/images/purchased-icon.svg')}
												/>
												<span>
													{this.props.request.purchasedStories.length} Purchased
												</span>
											</div>
										)}
										{this.props.request.isOpen ? (
											<div className="d-flex align-items-center lbl-open">
												<img
													alt=""
													src={require('../../Assets/images/open-icon.png')}
												/>
												<span>Open</span>
											</div>
										) : (
											<div className="d-flex align-items-center lbl-assigned ">
												<img
													alt=""
													src={require('../../Assets/images/assign-icon.png')}
												/>
												<span>Assigned</span>
											</div>
										)}
									</div>
								</div>
								<div className="d-flex flex-row align-items-center justify-content-md-end justify-content-between">
									<div className="praposalTxt d-flex flex-row align-items-center pl-md-4 pr-md-4 pl-0">
										<strong className=" primary-text-color mr-2">
											{this.props.request.stories.length}
										</strong>
										<span>Proposals</span>
									</div>
									<Link
										to={
											this.props.request.isArchive === true
												? `/myRequestDetails/${this.props.request.requestId}`
												: `/addNewRequest/${this.props.request.requestId}`
										}>
										<Button className="price-btn">
											{this.props.request.isArchive === true
												? 'View Details'
												: ' Edit Request'}{' '}
											<span className="px-1">|</span>
											<span>${this.props.request.price}</span>
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</Card>
				</Link>
			</React.Fragment>
		);
	}
}

export default RequestBox;
