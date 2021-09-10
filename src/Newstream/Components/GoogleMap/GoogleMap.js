/* eslint-disable react/jsx-no-bind */
import React, { Component } from 'react';
import ReactMapboxGl, {
	Layer,
	Feature,
	Marker,
	Popup,
	ScaleControl,
	ZoomControl,
	Cluster,
} from 'react-mapbox-gl';
import { MAPBOXTOKEN } from '../general/constant';
import { Button, Carousel, message,Modal } from 'antd';
import {
	EnvironmentOutlined,
	RightCircleOutlined,
	LeftCircleOutlined,
} from '@ant-design/icons';
import { CustIcon } from '../../Components/Svgs';
import { Link } from 'react-router-dom';
import moment from 'moment';
import './GoogleMap.css';
import { OnboardingTour } from '../OnboardingTour/OnboardingTour';
import { ProfileAvatar } from '../Avatar/Avatar';
import { LiveTag } from '../Tags';
import { captureException as SentryError } from '@sentry/react';
import axios from 'axios';
import { SAVEREPORTERLOCATION_MUTATION } from '../../graphql/APIs';

const Map = ReactMapboxGl({
	accessToken: MAPBOXTOKEN,
	center: [localStorage.getItem('userLng'), localStorage.getItem('userLat')],
});
class GoogleMap extends Component {
	state = {
		showPopup: false,
		selectedStory: null,
		popup: {},
		center: [+localStorage.getItem('userLng'), +localStorage.getItem('userLat')],
		zoom: [7],
	};
	constructor(props) {
		super(props);
		this.next = this.next.bind(this);
		this.previous = this.previous.bind(this);
		this.carousel = React.createRef();
		let thisData = this;
		navigator.permissions && navigator.permissions.query({name: 'geolocation'})
    .then(function(PermissionStatus) {
		console.log(PermissionStatus.state )
        if (PermissionStatus.state == 'granted') {
              //allowed
        } else{
			Modal.error({
				width: 550,
				className: 'notificationModal enableModal',
				icon: (
					<div className="popimageBox">
						<img
							alt="Thumbs Up"
							src={require('../../Assets/images/enable-location.svg')}
						/>
					</div>
				),
				 title:'Enable Browser Location Permission',
				content:
					'You need to allow browser`s location permission in order to set your region to current location.',
				onOk () {
					thisData.getCurrentLocation(thisData);
				},
			});
		}
    })
	}
	getCurrentLocation =  (thisData) => {
		console.log(navigator.geolocation)
		navigator.geolocation.getCurrentPosition(function (position) {
			// console.log(position);
			if(position.code === 1){
				Modal.success({
					content:
						'Please allow browser to share location',
				});
			}else{
			const url =
				'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
				position.coords.longitude +
				',' +
				position.coords.latitude;
			axios
				.get(url + '.json?&access_token=' + MAPBOXTOKEN)
				.then( async function(response) {
					let value={
						lat:parseFloat(position.coords.latitude),
						lng:parseFloat(position.coords.longitude),
					};
					await response.data.features.map((feat) => {
						//  console.log(feat);
						if(localStorage.getItem('role') == 'reporter'){
							if(feat.place_type[0] === 'district'){
								value.city = feat.text;
							}else if(feat.place_type[0] === 'region'){
								value.state = feat.text;
							}else if(feat.place_type[0] === 'country'){
								value.country = feat.text;
							}
						}
						if (feat.place_type[0] === 'district') {
							// console.log(feat.place_name);
							localStorage.setItem('location', feat.place_name);
							localStorage.setItem('userLat', parseFloat(position.coords.latitude));
							localStorage.setItem('userLng',parseFloat(position.coords.longitude));
							thisData.setState({center:[parseFloat(position.coords.longitude),parseFloat(position.coords.latitude)]})
							//setCurrentLocation(feat.place_name);
							//setSelectedLocation(feat.place_name);
						}
					});
					if(localStorage.getItem('role') == 'reporter'){
					const data = thisData.props.client.mutate({
						mutation: SAVEREPORTERLOCATION_MUTATION,
						variables:value
					  });
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				})
				.finally(function () {
					// always executed
				});
			}
			// 	Geocode.fromLatLng(position.coords.latitude,position.coords.longitude).then(
			// 		response => {
			// 		  const address = response.results[0].formatted_address;
			// 		  console.log(address);
			// 		  localStorage.setItem('location',address)
			// 		},
			// 		error => {
			// 		  console.error(error);
			// 		}
			// 	  );
		},function(error) {
			// console.log("error")
			// console.log(error)
			if(error.code === 1){
				Modal.error({
					width: 550,
					className: 'notificationModal enableModal',
					icon: (
						<div className="popimageBox">
							<img
								alt="Thumbs Up"
								src={require('../../Assets/images/enable-location.svg')}
							/>
						</div>
					),
					// content: (
					// 	<div className="d-flex flex-column align-items-center">
					// 		<h5>Enable Browser Location Permission</h5>
					// 		<p>You need to allow browser`s location permission in order to set your region to current location.</p>
					// 	</div>
					// ),
					 title:'Enable Browser Location Permission',
					content:
						'You need to allow browser`s location permission in order to set your region to current location.',
				});
			}
		});
	};
	next() {
		this.carousel.next();
	}
	previous() {
		this.carousel.prev();
	}
	markerClicked = (story) => {
		this.setState({
			showPopup: true,
			popup: {
				coordinates: [story.lng, story.lat],
				total: 1,
				leaves: story,
			},
		});
	};
	onDragCall = () => {
		//  this.props.popup = false;
		this.props.onChildClickCallback(false);
		this.setState({ selectedStory: null, showPopup: false });
	};
	navigateHandler = () => {
		this.props.onChildClickCallback(false);
		this.setState({ selectedStory: null, showPopup: false });
	};

	clusterMarker = (coordinates, pointCount, getLeaves) => (
		<Marker
			key={coordinates.toString()}
			coordinates={coordinates}
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
	clusterClick = (coordinates, total, getLeaves) => {
		this.setState({
			showPopup: true,
			popup: {
				coordinates,
				total,
				leaves: getLeaves(),
			},
		});
	};

	render() {
		const props = {
			dots: true,
			infinite: true,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
		};
		return (
			<React.Fragment>
				<OnboardingTour tourName={['mapView']} />
				{this.state.showPopup ? (
					<OnboardingTour tourName={['mapCard']} />
				) : null}
				<Map
					style="mapbox://styles/mapbox/streets-v9"
					containerStyle={{
						height: '100vh',
						width: '100%',
					}}
					onDrag={this.onDragCall}
					onClick={this.navigateHandler}
					zoom={this.state.zoom}
					center={this.state.center}
					className="mt-4 tour-mapView-map">
					{/* Controls */}
					<ScaleControl />
					<ZoomControl />
					<Layer
						type="symbol"
						id="marker"
						layout={{ 'icon-image': 'marker-15' }}>
						<Feature
							coordinates={[
								+localStorage.getItem('userLng'),
								+localStorage.getItem('userLat'),
							]}
						/>
					</Layer>
					<Cluster ClusterMarkerFactory={this.clusterMarker}>
						{this.props.stories.map((story, key) => (
							<Marker
								key={key}
								data-feature={story}
								coordinates={[+story.lng, +story.lat]}
								anchor="bottom"
								onClick={() => this.markerClicked(story)}>
								{story.type === 'Assigned' ? (
									<div className="pin-price">
										<span>${story.price}</span>
										<img
											alt=""
											src={require('../../Assets/images/assigned_map_pin.png')}
										/>
									</div>
								) : story.type === 'Breaking' ? (
									<div className="pin-price">
										<span>${story.price}</span>
										<img
											alt=""
											src={require('../../Assets/images/independent_map_pin.png')}
										/>
									</div>
								) : story.type === 'Open' ? (
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
											src={require('../../Assets/images/live_map_pin.png')}
										/>
									</div>
								)}
							</Marker>
						))}
					</Cluster>
					{this.state.showPopup && (
						<Popup
							placement="top"
							className="googleMapPop tour-mapView-card"
							coordinates={this.state.popup.coordinates}>
							{this.state.popup.total > 1 ? (
								<div>
									<LeftCircleOutlined onClick={this.previous} />
									<Carousel ref={(node) => (this.carousel = node)} {...props}>
										{this.state.popup.leaves.map((leaf, index) => {
											let selectedStory = leaf.props['data-feature'];

											return (
												<div key={index}>
													{this.props.type === 'story' ? (
														<Link to={`/marketplace/${this.props.activeKey}/storyDetails/${selectedStory.storyId}`}>
															<div className="d-flex flex-column">
																<div className="rbTitle">
																	<h3 className="mb-2">
																		{selectedStory.title}
																	</h3>
																</div>
															</div>
															<div className="d-flex flex-row align-items-top justify-content-between  mb-2">
																<div className="d-flex flex-column">
																	<div className="mb-2 d-flex sdLocation align-items-top">
																		<EnvironmentOutlined className="mr-2 mt-1" />
																		<span className="text-break sdLocationTxt">
																			{selectedStory.location}
																		</span>
																	</div>
																</div>
															</div>
															{!selectedStory.isLive && (
																<div className="d-flex flex-row align-items-top justify-content-between  mb-2">
																	<div className="viewCounter d-flex flex-row align-items-center">
																		{selectedStory.storyMediaCount.audio >
																			0 && (
																			<div className="d-flex flex-row align-items-center pr-3">
																				<span>
																					{selectedStory.storyMediaCount.audio}
																				</span>
																				<CustIcon
																					type="voice"
																					className="ml-1"
																				/>
																			</div>
																		)}
																		{selectedStory.storyMediaCount.video >
																			0 && (
																			<div className="d-flex flex-row align-items-center pr-3">
																				<span>
																					{selectedStory.storyMediaCount.video}
																				</span>
																				<CustIcon
																					type="video"
																					className="ml-1"
																				/>
																			</div>
																		)}
																		{selectedStory.storyMediaCount.image >
																			0 && (
																			<div className="d-flex flex-row align-items-center">
																				<span>
																					{selectedStory.storyMediaCount.image}
																				</span>
																				<CustIcon
																					type="image"
																					className="ml-1"
																				/>
																			</div>
																		)}
																	</div>
																	<div className="">
																		{selectedStory.type === 'Assigned' ? (
																			<div className="d-flex align-items-center lbl-assigned ">
																				<img
																					alt=""
																					src={require('../../Assets/images/assign-icon.png')}
																				/>
																				<span>Assigned</span>
																			</div>
																		) : selectedStory.type === 'Breaking' ? (
																			<div className="ml-3">
																				<div className="align-items-center d-flex lbl lbl-marketplace">
																					<CustIcon
																						type="flash"
																						className="mr-1"
																					/>{' '}
																					Marketplace
																				</div>
																			</div>
																		) : (
																			<div className="d-flex align-items-center lbl-open">
																				<img
																					alt=""
																					src={require('../../Assets/images/open-icon.png')}
																				/>
																				<span>Open</span>
																			</div>
																		)}
																	</div>
																</div>
															)}
															{selectedStory.isLive && (
																<div className="d-flex align-items-center justify-content-end">
																	<LiveTag />
																</div>
															)}
															<div className="d-flex flex-sm-row flex-column align-items-sm-end justify-content-between">
																<div className="userInCard d-flex flex-row align-items-start">
																	<div className="uicAvatar d-flex align-items-center justify-content-center">
																		<Link
																			to={`/reportersProfile/${selectedStory.createdBy.userId}`}>
																			<ProfileAvatar
																				size={40}
																				name={selectedStory.createdBy.name}
																				imageUrl={
																					selectedStory.createdBy.profileImage
																				}
																			/>
																		</Link>
																	</div>
																	<div className="d-flex flex-column pl-2">
																		<Link
																			to={`/reportersProfile/${selectedStory.createdBy.userId}`}>
																			<strong className="uicTop">
																				{selectedStory.createdBy.name}
																			</strong>
																		</Link>
																		<div className="gDate d-flex flex-row align-items-center">
																			<img
																				alt=""
																				className="mr-2"
																				src={require('../../Assets/images/cal-icon.png')}
																			/>
																			<span>
																				{moment(
																					new Date(
																						parseFloat(
																							selectedStory.updatedDate ||
																								selectedStory.createdDate
																						)
																					)
																				).format('MM/DD/YYYY')}
																			</span>
																		</div>
																	</div>
																</div>
																<div className="d-flex flex-column mt-sm-0 mt-2">
																	{selectedStory.isLive && (
																		<p className="mb-0">
																			<strong>
																				{new Date() <
																				new Date(
																					parseFloat(
																						selectedStory.storyLiveStream
																							?.scheduleDate
																					)
																				)
																					? 'Scheduled '
																					: 'Streamed '}{' '}
																				{moment(
																					new Date(
																						parseFloat(
																							selectedStory.storyLiveStream
																								?.scheduleDate
																						)
																					)
																				).fromNow()}
																			</strong>
																		</p>
																	)}
																	<div className="text-nowrap primary-text-color mb-1 priceAmt">
																		Price :{' '}
																		<strong>${selectedStory.price}</strong>
																	</div>
																</div>
															</div>
														</Link>
													) : (
														<Link
															to={`/myRequestDetails/${selectedStory.requestId}`}>
															<div className="d-flex flex-column">
																<div className="rbTitle">
																	<h3 className="mb-2">
																		{selectedStory.title}
																	</h3>
																</div>
															</div>
															<div className="d-flex flex-md-row flex-column align-items-top justify-content-between  mb-2">
																<div className="d-flex flex-column">
																	<div className="d-flex sdLocation align-items-top">
																		<EnvironmentOutlined className="mr-2 mt-1" />
																		<span className="text-break sdLocationTxt myReQLocation">
																			{selectedStory.location}
																		</span>
																	</div>
																	<div className="gDate d-flex flex-row align-items-center">
																		<img
																			alt=""
																			className="mr-2"
																			src={require('../../Assets/images/cal-icon.png')}
																		/>
																		<span>
																			{moment(
																				new Date(
																					parseFloat(
																						selectedStory.updatedDate ||
																							selectedStory.createdDate
																					)
																				)
																			).format('MM/DD/YYYY')}
																		</span>
																	</div>
																</div>
																<div className="d-flex">
																	{selectedStory.isLive ? (
																		<div className="d-flex align-items-center justify-content-end">
																			<LiveTag />
																		</div>
																	) : selectedStory.type === 'Assigned' ? (
																		<div className="d-flex align-items-center lbl-assigned ">
																			<img
																				alt=""
																				src={require('../../Assets/images/assign-icon.png')}
																			/>
																			<span>Assigned</span>
																		</div>
																	) : selectedStory.type === 'Breaking' ? (
																		<div className="ml-3">
																			<div className="align-items-center d-flex lbl lbl-marketplace">
																				<CustIcon
																					type="flash"
																					className="ml-1"
																				/>{' '}
																				Marketplace
																			</div>
																		</div>
																	) : (
																		<div className="d-flex align-items-center lbl-open">
																			<img
																				alt=""
																				src={require('../../Assets/images/open-icon.png')}
																			/>
																			<span>Open</span>
																		</div>
																	)}
																</div>
															</div>
															<div className="d-flex flex-row align-items-top justify-content-end  mb-2">
																<div className="viewCounter d-flex flex-row align-items-center">
																	{selectedStory.storyMediaCount.audio > 0 && (
																		<div className="d-flex flex-row align-items-center pr-3">
																			<span>
																				{selectedStory.storyMediaCount.audio}
																			</span>
																			<CustIcon type="voice" className="ml-1" />
																		</div>
																	)}
																	{selectedStory.storyMediaCount.video > 0 && (
																		<div className="d-flex flex-row align-items-center pr-3">
																			<span>
																				{selectedStory.storyMediaCount.video}
																			</span>
																			<CustIcon type="video" className="ml-1" />
																		</div>
																	)}
																	{selectedStory.storyMediaCount.image > 0 && (
																		<div className="d-flex flex-row align-items-center">
																			<span>
																				{selectedStory.storyMediaCount.image}
																			</span>
																			<CustIcon type="image" className="ml-1" />
																		</div>
																	)}
																</div>
															</div>
															<div className="d-flex flex-row align-items-end justify-content-between">
																<div className="d-flex flex-row align-items-center pr-4 invitedthumbs">
																	{selectedStory.stories.map((story, index) => {
																		if (index < 2) {
																			return (
																				<ProfileAvatar
																					size={40}
																					name={story.createdBy.name}
																					imageUrl={
																						story.createdBy.profileImage
																					}
																				/>
																			);
																		}
																	})}
																	{selectedStory.stories.length > 2 && (
																		<Button type="primary" shape="circle">
																			{' '}
																			{selectedStory.stories.length - 2}+
																		</Button>
																	)}
																</div>
																<div className="d-flex flex-column">
																	<div className="text-nowrap primary-text-color mb-1 priceAmt">
																		Price :{' '}
																		<strong>${selectedStory.price}</strong>
																	</div>
																</div>
															</div>
														</Link>
													)}
												</div>
											);
										})}
									</Carousel>
									<RightCircleOutlined onClick={this.next} />{' '}
								</div>
							) : (
								<div>
									{
										// let selectedStory = this.state.popup.leaves
										this.props.type === 'story' ? (
											<Link
												to={`/marketplace/${this.props.activeKey}/storyDetails/${this.state.popup.leaves.storyId}`}>
												<div className="d-flex flex-column">
													<div className="rbTitle">
														<h3 className="mb-2">
															{this.state.popup.leaves.title}
														</h3>
													</div>
												</div>
												<div className="d-flex flex-row align-items-top justify-content-between  mb-2">
													<div className="d-flex flex-column">
														<div className="mb-2 d-flex sdLocation align-items-top">
															<EnvironmentOutlined className="mr-2 mt-1" />
															<span className="text-break sdLocationTxt">
																{this.state.popup.leaves.location}
															</span>
														</div>
													</div>
												</div>
												{!this.state.popup.leaves.isLive && (
													<div className="d-flex flex-row align-items-top justify-content-between  mb-2">
														<div className="viewCounter d-flex flex-row align-items-center">
															{this.state.popup.leaves.storyMediaCount.audio >
																0 && (
																<div className="d-flex flex-row align-items-center pr-3">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.audio
																		}
																	</span>
																	<CustIcon type="voice" className="ml-1" />
																</div>
															)}
															{this.state.popup.leaves.storyMediaCount.video >
																0 && (
																<div className="d-flex flex-row align-items-center pr-3">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.video
																		}
																	</span>
																	<CustIcon type="video" className="ml-1" />
																</div>
															)}
															{this.state.popup.leaves.storyMediaCount.image >
																0 && (
																<div className="d-flex flex-row align-items-center">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.image
																		}
																	</span>
																	<CustIcon type="image" className="ml-1" />
																</div>
															)}
														</div>
														<div className="">
															{this.state.popup.leaves.type === 'Assigned' ? (
																<div className="d-flex align-items-center lbl-assigned ">
																	<img
																		alt=""
																		src={require('../../Assets/images/assign-icon.png')}
																	/>
																	<span>Assigned</span>
																</div>
															) : this.state.popup.leaves.type ===
															  'Breaking' ? (
																<div className="ml-3">
																	<div className="align-items-center d-flex lbl lbl-marketplace">
																		<CustIcon type="flash" className="mr-1" />{' '}
																		Marketplace
																	</div>
																</div>
															) : (
																<div className="d-flex align-items-center lbl-open">
																	<img
																		alt=""
																		src={require('../../Assets/images/open-icon.png')}
																	/>
																	<span>Open</span>
																</div>
															)}
														</div>
													</div>
												)}
												{this.state.popup.leaves.isLive && (
													<div className="d-flex align-items-center justify-content-end">
														<LiveTag />
													</div>
												)}
												<div className="d-flex flex-sm-row flex-column align-items-sm-end justify-content-between">
													<div className="userInCard d-flex flex-row align-items-start">
														<div className="uicAvatar d-flex align-items-center justify-content-center">
															<Link
																to={`/reportersProfile/${this.state.popup.leaves.createdBy.userId}`}>
																<ProfileAvatar
																	size={40}
																	name={this.state.popup.leaves.createdBy.name}
																	imageUrl={
																		this.state.popup.leaves.createdBy
																			.profileImage
																	}
																/>
															</Link>
														</div>
														<div className="d-flex flex-column pl-2">
															<Link
																to={`/reportersProfile/${this.state.popup.leaves.createdBy.userId}`}>
																<strong className="uicTop">
																	{this.state.popup.leaves.createdBy.name}
																</strong>
															</Link>
															<div className="gDate d-flex flex-row align-items-center">
																<img
																	alt=""
																	className="mr-2"
																	src={require('../../Assets/images/cal-icon.png')}
																/>
																<span>
																	{moment(
																		new Date(
																			parseFloat(
																				this.state.popup.leaves.updatedDate ||
																					this.state.popup.leaves.createdDate
																			)
																		)
																	).format('MM/DD/YYYY')}
																</span>
															</div>
														</div>
													</div>
													<div className="d-flex flex-column mt-sm-0 mt-2">
														{this.state.popup.leaves.isLive && (
															<p className="mb-0">
																<strong>
																	{new Date() <
																	new Date(
																		parseFloat(
																			this.state.popup.leaves.storyLiveStream
																				?.scheduleDate
																		)
																	)
																		? 'Scheduled '
																		: 'Streamed '}{' '}
																	{moment(
																		new Date(
																			parseFloat(
																				this.state.popup.leaves.storyLiveStream
																					?.scheduleDate
																			)
																		)
																	).fromNow()}
																</strong>
															</p>
														)}
														<div className="text-nowrap primary-text-color mb-1 priceAmt">
															Price :{' '}
															<strong>${this.state.popup.leaves.price}</strong>
														</div>
													</div>
												</div>
											</Link>
										) : (
											<Link
												to={`/myRequestDetails/${this.state.popup.leaves.requestId}`}>
												<div className="d-flex flex-column">
													<div className="rbTitle">
														<h3 className="mb-2">
															{this.state.popup.leaves.title}
														</h3>
													</div>
												</div>
												<div className="d-flex flex-md-row flex-column align-items-top justify-content-between  mb-2">
													<div className="d-flex flex-column">
														<div className="d-flex sdLocation align-items-top">
															<EnvironmentOutlined className="mr-2 mt-1" />
															<span className="text-break sdLocationTxt myReQLocation">
																{this.state.popup.leaves.location}
															</span>
														</div>
														<div className="gDate d-flex flex-row align-items-center">
															<img
																alt=""
																className="mr-2"
																src={require('../../Assets/images/cal-icon.png')}
															/>
															<span>
																{moment(
																	new Date(
																		parseFloat(
																			this.state.popup.leaves.updatedDate ||
																				this.state.popup.leaves.createdDate
																		)
																	)
																).format('MM/DD/YYYY')}
															</span>
														</div>
													</div>
													<div className="d-flex">
														{this.state.popup.leaves.type === 'Assigned' ||
														!this.state.popup.leaves.isOpen ? (
															<div className="d-flex align-items-center lbl-assigned ">
																<img
																	alt=""
																	src={require('../../Assets/images/assign-icon.png')}
																/>
																<span>Assigned</span>
															</div>
														) : this.state.popup.leaves.type === 'Breaking' ? (
															<div className="align-items-center d-flex lbl lbl-marketplace">
																<CustIcon type="flash" className="mr-1" />{' '}
																Marketplace
															</div>
														) : (
															<div className="d-flex align-items-center lbl-open">
																<img
																	alt=""
																	src={require('../../Assets/images/open-icon.png')}
																/>
																<span>Open</span>
															</div>
														)}
													</div>
												</div>
												{!this.state.popup.leaves.isLive && (
													<div className="d-flex flex-row align-items-top justify-content-end  mb-2">
														<div className="viewCounter d-flex flex-row align-items-center">
															{this.state.popup.leaves.storyMediaCount.audio >
																0 && (
																<div className="d-flex flex-row align-items-center pr-3">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.audio
																		}
																	</span>
																	<CustIcon type="voice" className="ml-1" />
																</div>
															)}
															{this.state.popup.leaves.storyMediaCount.video >
																0 && (
																<div className="d-flex flex-row align-items-center pr-3">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.video
																		}
																	</span>
																	<CustIcon type="video" className="ml-1" />
																</div>
															)}
															{this.state.popup.leaves.storyMediaCount.image >
																0 && (
																<div className="d-flex flex-row align-items-center">
																	<span>
																		{
																			this.state.popup.leaves.storyMediaCount
																				.image
																		}
																	</span>
																	<CustIcon type="image" className="ml-1" />
																</div>
															)}
														</div>
													</div>
												)}
												{this.state.popup.leaves.isLive && (
													<div className="d-flex align-items-center justify-content-end">
														<LiveTag />
													</div>
												)}
												<div className="d-flex flex-row align-items-end justify-content-between">
													<div className="d-flex flex-row align-items-center pr-4 invitedthumbs">
														{this.state.popup.leaves.stories.map(
															(story, index) => {
																if (index < 2) {
																	return (
																		<ProfileAvatar
																			size={40}
																			name={story.createdBy.name}
																			imageUrl={story.createdBy.profileImage}
																		/>
																	);
																}
															}
														)}
														{this.state.popup.leaves.stories.length > 2 && (
															<Button type="primary" shape="circle">
																{' '}
																{this.state.popup.leaves.stories.length - 2}+
															</Button>
														)}
													</div>
													<div className="d-flex flex-column">
														<div className="text-nowrap primary-text-color mb-1 priceAmt">
															Price :{' '}
															<strong>${this.state.popup.leaves.price}</strong>
														</div>
													</div>
												</div>
											</Link>
										)
									}
								</div>
							)}
							{this.state.popup.total > this.state.popup.leaves.length ? (
								<div>And more...</div>
							) : null}
						</Popup>
					)}
				</Map>
			</React.Fragment>
		);
	}
}

export default GoogleMap;
