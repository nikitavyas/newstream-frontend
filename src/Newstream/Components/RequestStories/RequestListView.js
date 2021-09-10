import React from 'react';
import { Button, Card, Col, Pagination, Row, Empty } from 'antd';
import moment from 'moment';
import { CustIcon } from '../Svgs';
import { CheckOutlined } from '@ant-design/icons';
import { Loader } from '../Loader';
import { LiveTag } from '../Tags';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';

const RequesListView = (props) => {
	const {
		totalRequests,
		params,
		requests,
		SubmitStory,
		ViewRequest,
		loading,
		changeData,
	} = props;
	return (
		<Row>
			<Col span={24} className="mb-3">
				{totalRequests > 0 && (
					<OnboardingTour
						tourName={[
							window.location.pathname === '/requests' ? 'listView' : null,
							window.innerWidth > 1199 ? 'navbar' : null,
						]}
					/>
				)}
				{requests
					? requests.map((request, index) => (
							<Card
								className="mb-md-3 allCardBox_blk tour-listView-details"
								key={index}>
								<div className="acb_Top d-flex flex-lg-row flex-column align-items-lg-start justify-content-lg-between mb-3">
									<div className="rbTitle">
										<h3
											className="mb-lg-0 cursorPointer"
											onClick={() => ViewRequest(request)}>
											{request.title}
										</h3>
									</div>
									<div
										className={`${
											!request.isLive && 'viewCounter'
										} requestCounter d-flex flex-row align-items-center`}>
										{request.isLive && <LiveTag />}
										{request.isAudio ? (
											<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
												<CustIcon type="voice" className="" />
											</div>
										) : (
											''
										)}
										{request.isVideo ? (
											<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
												<CustIcon type="video" className="" />
											</div>
										) : (
											''
										)}
										{request.isImage ? (
											<div className="d-flex flex-row align-items-center pl-lg-2 pr-2">
												<CustIcon type="image" className="" />
											</div>
										) : (
											''
										)}
									</div>
								</div>
								<div className="row acb_Bottom">
									<div className="col-lg-4 acb_Bottom_left col-md-6 d-flex flex-column align-items-start">
										<div className="userInCard d-flex flex-row align-items-start">
											<div className="uicAvatar d-flex align-items-center justify-content-center">
												<ProfileAvatar
													size={48}
													name={request.createdBy.name}
													imageUrl={request.createdBy.profileImage}
												/>
											</div>
											<div className="d-flex flex-column pl-3">
												<strong className="uicTop">
													{request.createdBy.name}
												</strong>
												<div className="uicBottom d-flex flex-row align-items-center">
													<span>
														{moment(new Date()).to(
															moment(new Date(parseFloat(request.createdDate)))
														)}{' '}
													</span>
												</div>
											</div>
										</div>
									</div>
									<div className="col-lg-4 acb_Bottom_center col-md-6 d-flex flex-row align-items-center pt-2 pt-md-0">
										<div className="d-flex flex-column align-items-start">
											{request.expiryDateTime !== '0' ? (
												<div className="d-flex flex-row align-items-center mb-1 acbB_top">
													<span className="text-nowrap expiryDateTime">
														Expires{' '}
														{moment(
															new Date(parseFloat(request.expiryDateTime))
														).fromNow()}
													</span>
												</div>
											) : (
												''
											)}
											<div className="d-flex flex-row align-items-center acbB_bottom tour-header-job-type">
												{request.isOpen ? (
													<div className="d-flex align-items-center lbl lbl-open mr-2 tour-header-open-job">
														<CustIcon type="unlock" className="mr-2" />
														<span>open</span>
													</div>
												) : (
													<div className="d-flex align-items-center lbl lbl-assigned mr-2 tour-header-assigned-job">
														<CustIcon type="lock" className="mr-2" />
														<span>assigned</span>
													</div>
												)}
												{request.isAccepted ? (
													<div className="d-flex align-items-center lbl lbl-accepted">
														<CheckOutlined className="mr-2" />{' '}
														<span>accepted</span>
													</div>
												) : null}
											</div>
										</div>
									</div>
									<div className="col-lg-4 acb_Bottom_right col-12 d-flex flex-lg-row flex-column align-items-lg-end justify-content-lg-end pt-2 pt-lg-0">
										<div className="d-flex flex-lg-column flex-row-reverse justify-content-between align-items-center align-items-lg-end">
											<div className="d-flex flex-row align-items-center mb-lg-1">
												{request.isSubmitted ? (
													<Button
														className="action-btn"
														type="primary"
														shape="round"
														onClick={() => SubmitStory(request)}>
														Submit again <span className="px-2">|</span>{' '}
														<span>${request.price}</span>
													</Button>
												) : undefined}

												{request.isAccepted && !request.isSubmitted ? (
													<Button
														className="action-btn"
														type="primary"
														shape="round"
														onClick={() => SubmitStory(request)}>
														Submit story <span className="px-2">|</span>{' '}
														<span>${request.price}</span>
													</Button>
												) : undefined}

												{!request.isSubmitted && !request.isAccepted ? (
													<Button
														className="action-btn"
														type="primary"
														shape="round"
														onClick={() => ViewRequest(request)}>
														View details <span className="px-2">|</span>{' '}
														<span>${request.price}</span>
													</Button>
												) : undefined}
											</div>
											<span className="text-nowrap mt-lg-2 pr-2 requestaway">
												{request?.distance?.toFixed(2)} miles away
											</span>
										</div>
									</div>
								</div>
							</Card>
					  ))
					: ''}
				{!loading && requests.length === 0 ? (
					<Card className="emptyCard">
						<Empty description="No requests are available." />
					</Card>
				) : (
					''
				)}
				{loading ? <Loader /> : ''}
			</Col>
			{requests.length > 0 ? (
				<Col span={24} className="pagination mt-4">
					<Pagination
						size="small"
						pageSize="5"
						current={params.page}
						onChange={changeData}
						total={totalRequests}
					/>
				</Col>
			) : (
				''
			)}
		</Row>
	);
};

export { RequesListView };
