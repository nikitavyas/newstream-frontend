/* eslint-disable default-case */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
	Menu,
	Avatar,
	Dropdown,
	message,
	Button,
	Popover,
	Card,
	Input,
	Select,
	Spin,
	Modal,
} from 'antd';
import routes from '../routes/Routs';
import './HeaderPage.css';
import { Link, withRouter } from 'react-router-dom';
import {
	AimOutlined,
	CaretDownOutlined,
	CloseOutlined,
} from '@ant-design/icons';
import { GET_NOTIFICATIONS, READ_NOTIFICATION,SAVEREPORTERLOCATION_MUTATION } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import moment from 'moment-timezone';
import { useMutation } from '@apollo/react-hooks';
import { findIndex } from 'lodash';
import { analytics } from '../../utils/init-fcm';
import { ProfileAvatar } from '../Avatar/Avatar';
import { CustIcon } from '../Svgs/Svgs';
import { captureException as SentryError } from '@sentry/react';
import axios from 'axios';
import { MAPBOXTOKEN } from '../../Components/general/constant';
import Geocode from 'react-geocode';
import { geolocated } from 'react-geolocated';

moment.tz.setDefault(localStorage.getItem('timeZone'));

const { Search } = Input;
const { Option } = Select;

let AppHeader = (props) => {
	// console.log(moment.tz.guess())
	Geocode.setApiKey(MAPBOXTOKEN);
	const [notificationCount, setNotificationCount] = useState(0);
	const [notificationModal, setNotificationModalState] = useState(false);
	const [notificationLoader, setNotificationLoader] = useState(true);
	const [readNotification] = useMutation(READ_NOTIFICATION);
	// const {pathname} = useLocation();
	const [currentKey, setCurrentKey] = useState('allStories');
	const [notifications, setNotifications] = useState([]);
	// const [notificationCount, setNotificationCount] = useState(0);
	// const [dropdownOpen, toggleNotifications] = useState(false);
	const [humbergerMenuOpen, sethumbergerMenuOpen] = useState(0);
	const [isNotificationRead, setIsNotificationRead] = useState(true);
	const [notificationVisibility, setNotificationVisibility] = useState(false);
	const [searchType, setSearchType] = useState('marketplace');
	const [showLoadMore, setShowLoadMore] = useState(false);
	const [showAddressPicker, setShowAddressPicker] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState('');
	const [allLocations, setAllLocations] = useState([]);
	const [fetchingLocation, setFetchingLocation] = useState(false);
	const [currentLocation, setCurrentLocation] = useState(
		localStorage.getItem('location')
	);
	const [page, setPage] = useState(1);
	const ref = useRef(null);

	const handleClickOutside = (event) => {
		if (ref.current && !ref.current.contains(event.target)) {
			sethumbergerMenuOpen(false);
		}
	};

	useEffect(() => {
		setCurrentKey(props.location.pathname.split('/')[1]);
		sethumbergerMenuOpen(false);
	}, [props.location.pathname.split('/')[1]]);

	const notificationsModalHandler = (state) => {
		setNotificationModalState(state);
	};

	useEffect(() => {
		console.log('age',page)
		getNotifications();
		// navigator.serviceWorker.addEventListener('message', (message) => {
		// 	getNotifications(1);
		// });
	}, [page]);
	const getCurrentLocation =  () => {
		
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
					localStorage.setItem('userLat', parseFloat(position.coords.latitude));
					localStorage.setItem('userLng', parseFloat(position.coords.longitude));
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
							
							setCurrentLocation(feat.place_name);
							setSelectedLocation(feat.place_name);
						}
					});
					const data = props.client.mutate({
						mutation: SAVEREPORTERLOCATION_MUTATION,
						variables:value
					  });
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
	const getNotifications = async (count) => {
		try {
			// console.log(page);
			setNotificationLoader(true);
			const {
				data: { getMyNotification },
				refetch,
			} = await props.client.query({
				query: GET_NOTIFICATIONS,
				variables: {
					limit: 10,
					page: page,
				},
				fetchPolicy: 'no-cache',
			});
			let oldNotiifcationData = [];
			if(notifications.length > 10){
				oldNotiifcationData = notifications;
			}
			console.log(oldNotiifcationData)
			oldNotiifcationData.push(...getMyNotification);
			console.log(oldNotiifcationData)
			setNotifications(oldNotiifcationData);

			if (getMyNotification.length < 10) {
				setShowLoadMore(false);
			} else {
				setShowLoadMore(true);
			}
			const unreadNotifications = getMyNotification.filter((notification) => {
				return !notification.isRead;
			});
			setNotificationCount(unreadNotifications.length + (count || 0));
			setNotificationLoader(false);
		} catch (error) {
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			} else {
				SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later');
			}
			setNotificationLoader(false);
		}
	};

	const toggleNotificationsDropdown = async (event) => {
		console.log('event',event)
		setNotifications([])
	//	event.preventDefault();
		//await getNotifications();
	};

	const readNotificationHandler = async ({ notificationId, isRead }, nav) => {
		try {
			if (!isRead) {
				!!notificationCount && setNotificationCount(notificationCount - 1);
				await readNotification({
					variables: { notificationId },
				});
				const notificationsData = [...notifications];
				const index = findIndex(notificationsData, { notificationId });
				if (index >= 0) {
					notifications[index].isRead = true;
				}
				setNotifications(notificationsData);
			}
			setNotificationVisibility(false);
			props.history.push(nav);
		} catch (err) {}
	};
	const logout = () => {
		Modal.confirm({
			width: 500,
			className: 'notificationModal',
			icon: (
				<div className="popimageBox">
					<img alt="" src={require('../../Assets/images/logout-img.png')} />
				</div>
			),
			content: 'Are you sure you want to logout?',

			onOk() {
				analytics.setUserProperties({ dimension1: 'Loggedout' });
				localStorage.setItem('access_token', '');
				props.history.push('/login');
			},
			okText: 'Logout',
		});
	};
	const handleSearch = (value) => {
		try {
			
			if (value) {
				setFetchingLocation(true);
				// fetch(value, data => this.setState({ data }));
				const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
				axios
					.get(
						url +
							value +
							'.json?limit=10&language=en-EN&types=district,region,country&access_token=' +
							MAPBOXTOKEN
					)
					.then(async function (response) {
						let countryData = [];
						await response.data.features.map((feat) => {
							// console.log(feat.place_type[0]);
							countryData.push(feat);
						});
						setAllLocations(countryData);
						setFetchingLocation(false);
					})
					.catch((error, result) => {
						// console.log(error)
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
			} else {
				setFetchingLocation(false);
				setAllLocations([]);
			}
		} catch (error) {
			SentryError(error);
		}
	};
	const handleChange = async (value) => {
		setSelectedLocation(value);
		localStorage.setItem('location', allLocations[value].place_name);
		setCurrentLocation(allLocations[value].place_name);
		let locationData={
			lat:parseFloat(allLocations[value].center[1]),
			lng:parseFloat(allLocations[value].center[0]),
		};
		// console.log(allLocations[value])
		if(allLocations[value].place_type[0] == 'district'){
			locationData.city =allLocations[value].text;
		}
		if(allLocations[value].place_type[0] == 'region'){
			locationData.state = allLocations[value].text;
		}
		if(allLocations[value].place_type[0] == 'country'){
			locationData.country = allLocations[value].text;
		}
		await allLocations[value].context.map(data => {
			if(data.id.search("district") != -1 ){
				locationData.city =data.text;
			}else if(data.id.search("region") != -1 ){
				locationData.state = data.text;
			}else if(data.id.search("country") != -1){
				locationData.country = data.text;
			}
		})
		localStorage.setItem('userLat',allLocations[value].center[1]);
		localStorage.setItem('userLng',allLocations[value].center[0]);
		// console.log(localStorage.getItem('role'))
		if(localStorage.getItem('role') === 'reporter'){
			// console.log('in if')
			const data = props.client.mutate({
				mutation: SAVEREPORTERLOCATION_MUTATION,
				variables:locationData
			});
		}
		setShowAddressPicker(false);
	};

	const menu = (
			<Menu className="profileDropdown">
				<Menu.Item key="myProfile">
					<Link to={localStorage.getItem('role') == 'journalist' ?  "/settings/0" : "/settings/2"}>Settings</Link>
				</Menu.Item>
				<Menu.Item key="changePassword">
					<Link to="/settings/3">Feedback</Link>
				</Menu.Item>
				<Menu.Item key="login">
					<div onClick={logout}>Logout</div>
				</Menu.Item>
			</Menu>
	);
	const handleVisibleChange = (visible) => {
		if(visible){
			setNotifications([]);
			setPage(1);
			getNotifications();
		}
		setNotificationVisibility(visible);
	};
	const loadMoreClick = () => {
		setPage(page + 1);
	};
	return (
		<React.Fragment>
			<div onClick={props.toggleClassFunction} className="menuhamburgar">
				<CustIcon type="hamburger" />
			</div>
			<div className="headerlogo">
				<Link to="/marketplace">
					<img
						alt=""
						src={require('../../Assets/images/logo_newstream_v1.png')}
					/>
				</Link>
			</div>
			<div className="headerRight">
				<Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
					<div className="d-flex flex-row align-items-center mr-1 mr-lg-3 cursorPointer">
						<ProfileAvatar
							size={40}
							name={localStorage.getItem('name')}
							imageUrl={localStorage.getItem('profileImage')}
						/>{' '}
						<span className="text-truncate username">
							{localStorage.getItem('name')}
							<span className="text-truncate headesignation">
								{localStorage.getItem('role') == 'journalist' ?  localStorage.getItem('isManager') == 'true' ? 'Managing Content Buyer' : 'Content Buyer' : 
								localStorage.getItem('isApplicant') == 'true' ? 'Applicant' : 'Content Creator'
								}
							</span>
						</span>{' '}
						<CaretDownOutlined />
					</div>
				</Dropdown>
				<Popover
					placement="bottomRight"
					overlayClassName="notificationPopOver"
					trigger="click"
					visible={notificationVisibility}
					onVisibleChange={handleVisibleChange}
					title={
						<div className="d-flex justify-content-between align-items-center">
							<span>Notifications</span>
							{/* <Link>Clear all</Link> */}
						</div>
					}
					content={
						<div className="d-flex flex-column">
							{notificationLoader ? (
								<Spin />
							) : notifications.length ? (
								notifications.map((data, i) => {
									let nav;
									switch (data.function) {
										case 'request':
											nav = localStorage.getItem('role') == 'reporter' ? `/requests/${data.functionType}/${data.functionId}` : `/myRequest/${data.functionType}/proposals/${data.functionId}`;
											break;
										case 'reporter':
											nav = `/reportersProfile/${data.functionId}`;
											break;
										case 'story':
											nav = `/marketplace/${data.functionType}/storyDetails/${data.functionId}`;
											break;
										case 'transactions':
											nav = `/transactions`;
											break;
										case 'live':
											nav = `/storyDetails/${data.functionId}`;
											break;
										case 'user':
											nav = `/reportersProfile/${data.functionId}`;
										break;
									}
									return (
										<span
											key={i + 1}
											onClick={(e) => readNotificationHandler(data, nav)}>
											<Card className="mb-2 mb-lg-2">
												{data.isRead === false && <div className="unseen" />}
												<h6 className="notiTitle text-break mb-0 mb-lg-1">
													{data.title}
												</h6>
												{/* <p>{data.description}</p> */}
												<div className="notiDate">
													{moment(
														new Date(parseFloat(data.createdDate))
													).fromNow()}
												</div>
											</Card>
										</span>
									);
								})
							) : (
								<div className="d-flex flex-column py-2">
									<p>No notifications yet</p>
								</div>
							)}
							{!notificationLoader && showLoadMore && notifications.length && (
								<Button onClick={loadMoreClick}>Load More</Button>
							)}
						</div>
					}>
					<div className="notifications">
						<Button
							className="d-flex flex-row align-items-center justify-content-center"
							type="primary"
							//onClick={toggleNotificationsDropdown}
							disabled={notificationLoader}
							icon={<CustIcon type="notification" />}
						/>
						{!!notificationCount && <div className="badgeNot" />}
					</div>
				</Popover>
			</div>
			<div className="headerLeft">
				<div className="headerlocation">
					<div className="headlocationLeft">
						{showAddressPicker ? (
							<span>
								<Select
									placeholder="Select Address"
									showSearch
									value={selectedLocation}
									defaultActiveFirstOption={false}
									showArrow={false}
									filterOption={false}
									onSearch={handleSearch}
									onChange={handleChange}
									notFoundContent={
										fetchingLocation ? <Spin size="small" /> : null
									}>
									{allLocations.map((d, index) => (
										<Option key={index} value={index}>
											{d.place_name}
										</Option>
									))}
								</Select>
								<span
									className="ml-2"
									onClick={(e) => setShowAddressPicker(false)}>
									<CloseOutlined />
								</span>
							</span>
						) : (
							<span>
								<img								
									alt=""
									src={require('../../Assets/images/header-location.png')}
								/>
								<span className="text-truncate">
									{currentLocation ? currentLocation : 'Select Location'}
								</span>
								<span
									className="ml-2"
									onClick={(e) => setShowAddressPicker(true)}>
									<CaretDownOutlined />
								</span>
							</span>
						)}
						<p>{moment(new Date()).format('dddd DD MMM YYYY, h:mm:ss A z')}</p>
					</div>
					<div className="detectLocation">
						<span className="cursorPointer" isvisible="true" onClick={(e) => getCurrentLocation()}>
							<AimOutlined className="mr-0 mr-md-2" />
							Detect current location
						</span>
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};
AppHeader = withApollo(AppHeader);
if (
	localStorage.getItem('location') == "undefined" ||
	localStorage.getItem('location') == "null"
) {
	AppHeader = geolocated({
		positionOptions: {
			enableHighAccuracy: false,
		},
		userDecisionTimeout: 5000,
	})(AppHeader);
}
export default withRouter(AppHeader);
