import {
	CheckOutlined,
	RightCircleOutlined,
	LeftCircleOutlined,
} from '@ant-design/icons';
import { addBreadcrumb as SentryLog, Severity } from '@sentry/react';
import { length, lineString } from '@turf/turf';
import { Button, Card, Carousel } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import ReactMapboxGl, {
	Cluster,
	Feature,
	Layer,
	Marker,
	Popup,
	ScaleControl,
	ZoomControl,
} from 'react-mapbox-gl';
import { Link, withRouter } from 'react-router-dom';
import { CustIcon } from '../../Components/Svgs';
import { ProfileAvatar } from '../Avatar/Avatar';
import { MAPBOXTOKEN } from '../general/constant';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';
import { LiveTag } from '../Tags';
import './RequestMapView.css';

const Map = ReactMapboxGl({
	accessToken: MAPBOXTOKEN,
	center: [
		parseFloat(localStorage.getItem('userLng')),
		parseFloat(localStorage.getItem('userLat')),
	],
	zoom: [5],
});

class GoogleMap extends Component {
	constructor() {
		super();
		this.carousel = React.createRef();
		this.next = this.next.bind(this);
		this.previous = this.previous.bind(this);
		this.state = {
			popup: false,
			selectedStory: null,
			center: [
				localStorage.getItem('userLng'),
				localStorage.getItem('userLat'),
			],
			zoom: [11],
			request: {},
			showPopup: false,
		};
	}

	next() {
		this.carousel.next();
	}
	previous() {
		this.carousel.prev();
	}

	closeMarker = () => {
		SentryLog({
			category: 'map-marker',
			message: `Map Marker closed`,
			level: Severity.Debug,
		});
		this.setState({ popup: false });
	};

	clusterMarker = (coordinates, pointCount, getLeaves) => (
		<Marker
			key={coordinates.toString()}
			coordinates={coordinates}
			// eslint-disable-next-line react/jsx-no-bind
			onClick={this.clusterClick.bind(
				this,
				coordinates,
				pointCount,
				getLeaves
			)}>
			<div className="pin-price">
				<span>{pointCount}</span>
				<img alt="" src={require('../../Assets/images/cluster-icon.png')} />
			</div>
		</Marker>
	);

	onMove = () => {
		if (this.state.popup) {
			this.setState({ popup: undefined });
			SentryLog({
				category: 'map-marker',
				message: `Map Marker closed`,
				level: Severity.Debug,
			});
		}
	};

	clusterClick = (coordinates, story, getLeaves) => {
		let clusterRequestList = [];
		getLeaves().forEach((singleStory) => {
			clusterRequestList.push(
				' ' + singleStory.props['data-feature'].requestId
			);
		});
		SentryLog({
			category: 'map-marker',
			message: `Map Cluster Opened for Request Ids :${clusterRequestList}`,
			level: Severity.Debug,
		});
		this.setState({
			showPopup: true,
			request: story,
			popup: {
				coordinates,
				story,
				leaves: getLeaves(),
			},
		});
	};

	markerClicked = (story) => {
		SentryLog({
			category: 'map-marker',
			message: `Map Marker Opened for Request Id : ${story.requestId}`,
			level: Severity.Debug,
		});
		this.setState({
			showPopup: true,
			request: story,
			popup: {
				coordinates: [story.lng, story.lat],
				story: 1,
				leaves: story,
			},
		});
	};

	onDragCall = () => {
		if (this.state.showPopup) {
			SentryLog({
				category: 'map-marker',
				message: `Map Marker closed`,
				level: Severity.Debug,
			});
		}
		this.setState({ request: null, showPopup: false });
	};

	_submitStory = (request) => {
		if (!request?.isAccepted) {
			this.props.ViewRequest(request);
		} else {
			this.props.SubmitStory(request);
		}
	};

	render() {
		const props = {
			dots: true,
			infinite: true,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
		};
		const { request } = this.state;
		return (
			<React.Fragment>
				<Map
					onClick={() => {
						if (this.state.showPopup) {
							SentryLog({
								category: 'map-marker',
								message: `Map Marker closed`,
								level: Severity.Debug,
							});
						}
						this.setState({ showPopup: false });
					}}
					// eslint-disable-next-line react/style-prop-object
					style="mapbox://styles/mapbox/streets-v11"
					containerStyle={{
						height: '80vh',
					}}
					onDrag={this.onDragCall}
					zoom={this.state.zoom}
					center={this.state.center}
					className="mapview_blk">
					{/* Controls */}
					<ScaleControl />
					<ZoomControl />
					<Layer
						type="symbol"
						id="marker"
						layout={{ 'icon-image': 'marker-15' }}>
						<Feature
							coordinates={[
								localStorage.getItem('userLat'),
								localStorage.getItem('userLng'),
							]}
						/>
					</Layer>
					<Cluster ClusterMarkerFactory={this.clusterMarker}>
						{this.props.stories.map((story, key) => (
							<Marker
								key={key}
								data-feature={story}
								coordinates={[story.lng, story.lat]}
								anchor="bottom"
								onClick={() => this.markerClicked(story)}>
								{story.isLive ? (
									<div className="pin-price">
										<span>${story.price}</span>
										<img
											alt=""
											src={require('../../Assets/images/live_map_pin.png')}
										/>
									</div>
								) : story.isOpen ? (
									<div className="pin-price">
										<span>${story.price}</span>
										<img
											alt=""
											src={require('../../Assets/images/open_map_pin.png')}
										/>
									</div>
								) : (
									<div className="pin-price">
										<span>${story.price}</span>
										<img
											alt=""
											src={require('../../Assets/images/assigned_map_pin.png')}
										/>
									</div>
								)}
							</Marker>
						))}
					</Cluster>
					{this.state.showPopup ? (
						<OnboardingTour tourName={['mapCard']} />
					) : null}
					{this.state.showPopup && (
						<Popup
							placement="top"
							className="requestsMapsPopup"
							coordinates={this.state.popup.coordinates}>
							{this.state.popup.story > 1 ? (
								<div>
									<LeftCircleOutlined onClick={this.previous} />
									<Carousel ref={(node) => (this.carousel = node)} {...props}>
										{this.state.popup.leaves.map((leaf, index) => {
											const request = leaf.props['data-feature'];
											return (
												<Card
													key={index}
													className={index === 0 && 'tour-mapView-card'}>
													<div className="d-flex flex-sm-row flex-column justify-content-between mb-3">
														<div className="d-flex flex-column">
															<div className="userInCard d-flex flex-row align-items-start">
																<div className="uicAvatar d-flex align-items-center justify-content-center">
																	<ProfileAvatar
																		imageUrl={request?.createdBy?.profileImage}
																		name={request?.createdBy?.name}
																		size={48}
																	/>
																</div>
																<div className="d-flex flex-column pl-3">
																	<div className="uicTop">
																		{request?.createdBy?.name}
																	</div>
																	<div className="uicBottom d-flex flex-row align-items-center">
																		<span>
																			{moment(new Date()).to(
																				moment(
																					new Date(
																						parseFloat(request?.createdDate)
																					)
																				)
																			)}{' '}
																		</span>
																	</div>
																</div>
															</div>
														</div>
														<div className="d-flex flex-row  justify-content-sm-end mt-sm-0 mt-2">
															<div className="d-flex flex-column align-items-start">
																<div className="d-flex flex-row align-items-center acbB_bottom">
																	{request?.isOpen ? (
																		<div
																			className={`d-flex align-items-center lbl lbl-open ${
																				index === 0 &&
																				'tour-mapView-card-job-type'
																			}`}>
																			<img
																				alt=""
																				src={require('../../Assets/images/open-icon.png')}
																			/>
																			<span>open</span>
																		</div>
																	) : (
																		<div
																			className={`d-flex ml-2 align-items-center lbl lbl-assigned ${
																				index === 0 &&
																				'tour-mapView-card-job-type'
																			}`}>
																			<img
																				alt=""
																				src={require('../../Assets/images/assign-icon.png')}
																			/>
																			<span>assigned</span>
																		</div>
																	)}
																	{request?.isAccepted ? (
																		<div className="d-flex ml-2 align-items-center lbl lbl-accepted">
																			<CheckOutlined /> <span>accepted</span>
																		</div>
																	) : null}
																</div>
															</div>
														</div>
													</div>
													<div className="acb_Top d-flex flex-lg-row mb-3">
														<Link
															to={`/requests/${request?.requestId}`}>
															<div className="rbTitle">
																<h3 className="mb-lg-0">{request?.title}</h3>
															</div>
														</Link>
													</div>
													<div className="acb_Bottom">
														<div className="d-flex flex-column">
															<div className=" d-flex flex-row align-items-center justify-content-between mb-2">
																<div className="viewCounter d-flex flex-row align-items-center">
																	{request?.isAudio ? (
																		<div className="d-flex flex-row align-items-center pr-3">
																			{/* <span> fdf</span> */}
																			<CustIcon type="voice" />
																		</div>
																	) : (
																		''
																	)}
																	{request?.isVideo ? (
																		<div className="d-flex flex-row align-items-center pr-3">
																			<CustIcon type="video" />
																		</div>
																	) : (
																		''
																	)}
																	{request?.isImage ? (
																		<div className="d-flex flex-row align-items-center pr-3">
																			<CustIcon type="image" />
																		</div>
																	) : (
																		''
																	)}
																	{request?.isLive ? (
																		<div className="d-flex flex-row align-items-center pr-3">
																			<LiveTag />
																		</div>
																	) : (
																		''
																	)}
																</div>

																<Button
																	onClick={() => this._submitStory(request)}
																	className={`action-btn ${
																		index === 0 && 'tour-mapView-card-accept'
																	}`}
																	type="primary"
																	shape="round">
																	{this.getSubmitBtn(request)}{' '}
																	<span className="px-2">|</span>{' '}
																	<span>${request?.price}</span>
																</Button>
															</div>
															<div className="d-flex flex-sm-row flex-column align-items-sm-center justify-content-sm-between">
																<div className="d-flex flex-row align-items-center">
																	<CustIcon
																		type="clock"
																		className="pr-2 d-flex"
																	/>
																	<small>Expires&nbsp;</small>
																	{request?.expiryDateTime !== '0' ? (
																		<small className="text-nowrap expiryDateTime">
																			{' '}
																			{moment(
																				new Date(
																					parseFloat(request?.expiryDateTime)
																				)
																			).fromNow()}
																		</small>
																	) : (
																		''
																	)}
																</div>
																<div className="">
																	{/* <span className="text-nowrap mt-2 requestaway">{request.distance.toFixed(2) || 0} m away</span> */}
																	<span className="text-nowrap mt-2 requestaway">
																		{request?.distance?.toFixed(2)
																			? request?.distance?.toFixed(2)
																			: this.calculateDistance(
																					request?.lat,
																					request?.lng
																			  )}{' '}
																		m away
																	</span>
																</div>
															</div>
														</div>
													</div>
												</Card>
											);
										})}
									</Carousel>
									<RightCircleOutlined onClick={this.next} />{' '}
								</div>
							) : (
								<Card className="tour-mapView-card">
									<div className="d-flex flex-sm-row flex-column justify-content-between mb-3">
										<div className="d-flex flex-column">
											<div className="userInCard d-flex flex-row align-items-start">
												<div className="uicAvatar d-flex align-items-center justify-content-center">
													<ProfileAvatar
														imageUrl={request?.createdBy?.profileImage}
														name={request?.createdBy?.name}
														size={48}
													/>
												</div>
												<div className="d-flex flex-column pl-3">
													<div className="uicTop">
														{request?.createdBy?.name}
													</div>
													<div className="uicBottom d-flex flex-row align-items-center">
														<span>
															{moment(new Date()).to(
																moment(
																	new Date(parseFloat(request?.createdDate))
																)
															)}{' '}
														</span>
													</div>
												</div>
											</div>
										</div>
										<div className="d-flex flex-row  justify-content-sm-end mt-sm-0 mt-2">
											<div className="d-flex flex-column align-items-start">
												<div className="d-flex flex-row align-items-center acbB_bottom">
													{request?.isOpen ? (
														<div className="d-flex align-items-center lbl lbl-open tour-mapView-card-job-type">
															<img
																alt=""
																src={require('../../Assets/images/open-icon.png')}
															/>
															<span>open</span>
														</div>
													) : (
														<div className="d-flex ml-2 align-items-center lbl lbl-assigned tour-mapView-card-job-type">
															<img
																alt=""
																src={require('../../Assets/images/assign-icon.png')}
															/>
															<span>assigned</span>
														</div>
													)}
													{request?.isAccepted ? (
														<div className="d-flex ml-2 align-items-center lbl lbl-accepted">
															<CheckOutlined /> <span>accepted</span>
														</div>
													) : null}
												</div>
											</div>
										</div>
									</div>
									<div className="acb_Top d-flex flex-lg-row mb-3">
										<Link to={`/requests/${request?.requestId}`}>
											<div className="rbTitle">
												<h3 className="mb-lg-0">{request?.title}</h3>
											</div>
										</Link>
									</div>
									<div className="acb_Bottom">
										<div className="d-flex flex-column">
											<div className=" d-flex flex-row align-items-center justify-content-between mb-2">
												<div className="viewCounter d-flex flex-row align-items-center">
													{request?.isAudio ? (
														<div className="d-flex flex-row align-items-center pr-3">
															{/* <span> fdf</span> */}
															<CustIcon type="voice" />
														</div>
													) : (
														''
													)}
													{request?.isVideo ? (
														<div className="d-flex flex-row align-items-center pr-3">
															<CustIcon type="video" />
														</div>
													) : (
														''
													)}
													{request?.isImage ? (
														<div className="d-flex flex-row align-items-center pr-3">
															<CustIcon type="image" />
														</div>
													) : (
														''
													)}
													{request?.isLive ? (
														<div className="d-flex flex-row align-items-center pr-3">
															<LiveTag />
														</div>
													) : (
														''
													)}
												</div>

												<Button
													onClick={() => this._submitStory(request)}
													className="action-btn tour-mapView-card-accept"
													type="primary"
													shape="round">
													{this.getSubmitBtn(request)}{' '}
													<span className="px-2">|</span>{' '}
													<span>${request?.price}</span>
												</Button>
											</div>
											<div className="d-flex flex-sm-row flex-column align-items-sm-center justify-content-sm-between">
												<div className="d-flex flex-row align-items-center">
													<CustIcon type="clock" className="pr-2 d-flex" />
													<small>Expires&nbsp;</small>
													{request?.expiryDateTime !== '0' ? (
														<small className="text-nowrap expiryDateTime">
															{' '}
															{moment(
																new Date(parseFloat(request?.expiryDateTime))
															).fromNow()}
														</small>
													) : (
														''
													)}
												</div>
												<div className="">
													<span className="text-nowrap mt-2 requestaway">
														{request?.distance?.toFixed(2)
															? request?.distance?.toFixed(2)
															: this.calculateDistance(
																	request?.lat,
																	request?.lng
															  )}{' '}
														m away
													</span>
												</div>
											</div>
										</div>
									</div>
								</Card>
							)}
						</Popup>
					)}
				</Map>
			</React.Fragment>
		);
	}

	calculateDistance = (lat, lng) => {
		const userLat = localStorage.getItem('userLat');
		const userLng = localStorage.getItem('userLng');

		const line = lineString([
			[userLat, userLng],
			[lat ? parseFloat(lat) : 0, lng ? parseFloat(lng) : 0],
		]);
		const distance = length(line, { units: 'miles' });
		return distance.toFixed(1);
	};

	getSubmitBtn = (request) => {
		return request?.isSubmitted
			? 'Submit again'
			: request.isAccepted
			? 'Submit story'
			: 'View details';
	};
}

export default withApollo(withRouter(GoogleMap));
