
import React, {  useState, useEffect } from 'react';
import './Settings.css';
import {
	message
} from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { Loader } from '../../Components/Loader/Loader';
import { withApollo } from 'react-apollo';
import { MyProfile } from '../../Components/MyProfile';
import { ChangePassword } from '../../Components/ChangePassword';
import { NotificationSettings } from '../../Components/NotificationSettings';
import { getAddress } from '../../Components/general/general';
import {Helmet} from "react-helmet";
import { Redirect } from "react-router-dom";

import {
	GET_ACTIVE_PAGES,
	GET_PROFILE,
	GET_REPORTER_PROFILE,
	GET_NOTIFICATION_SETTINGS,
} from '../../graphql/APIs';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { Feedback } from '../../Components/Feedback';
import { propEach } from '@turf/meta';

let Settings = ({ client, match, history }) => {
	const [activeTab, setActiveTab] = useState(
		match.params.tabId 
	);
	const [cmsPageData, setCmsPageData] = useState('0');
	const [pages, setPages] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const [profileData, setProfileData] = useState({});
	const [notificationData, setNotificationData] = useState({});
if(match.params.tabId  <= 3 && match.params.tabId  >= 0 ){

}else{
	history.push('/settings/0')
}
	useEffect(() => {
		SentryLog({
			category: 'settings',
			message: 'Settings Loaded',
			level: Severity.Info,
		});
		getPages();
		if (activeTab == '0') {
			if(localStorage.getItem('role') === 'journalist'){
				getProfileData()
			}else{
				getReporterProfileData()
			}
		}
		if (activeTab == '2') {
			getNotificationData();
		}
	}, [activeTab]);
	const getReporterProfileData = () => {
		try {
			client
				.query({
					query: GET_REPORTER_PROFILE,
					fetchPolicy: 'no-cache',
				})
				.then(({ data, loading }) => {
					if (data !== undefined) {
						let profileData = data.getReporterProfile;
						profileData.address1 = data.getReporterProfile.address.address1;
						profileData.address2 = data.getReporterProfile.address.address2;
						profileData.city = data.getReporterProfile.address.city;
						profileData.state = data.getReporterProfile.address.state;
						profileData.country = data.getReporterProfile.address.country;
						profileData.pincode = data.getReporterProfile.address.pincode;
						profileData.location = getAddress(
							data.getReporterProfile.address
						);
						profileData.profileImage =  data.getReporterProfile.profileImage != null
								?  data.getReporterProfile.profileImage
								: null;
						profileData.prefix = '91';
						// profileData.phoneNumber = '9187654443';
						let profileDataObj = {
							profileData: profileData,
							phoneNumber: data.getReporterProfile.phoneNumber,
						};
						setProfileData(profileDataObj);
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
				});
		} catch (error) {
			SentryError(error);
		}
	};
	
	const getProfileData = () => {
		try {
			client
				.query({
					query: GET_PROFILE,
					fetchPolicy: 'no-cache',
				})
				.then(({ data, loading }) => {
					if (data !== undefined) {
						let profileData = data.getJournalistProfile;
						profileData.address1 = data.getJournalistProfile.address.address1;
						profileData.address2 = data.getJournalistProfile.address.address2;
						profileData.city = data.getJournalistProfile.address.city;
						profileData.state = data.getJournalistProfile.address.state;
						profileData.country = data.getJournalistProfile.address.country;
						profileData.pincode = data.getJournalistProfile.address.pincode;
						profileData.location = getAddress(
							data.getJournalistProfile.address
						);
						profileData.profileImage =
							localStorage.getItem('profileImage') !== 'null'
								? localStorage.getItem('profileImage')
								: null;
						profileData.prefix = '91';
						// profileData.phoneNumber = '9187654443';
						let profileDataObj = {
							profileData: profileData,
							phoneNumber: data.getJournalistProfile.phoneNumber,
						};
						setProfileData(profileDataObj);
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
				});
		} catch (error) {
			SentryError(error);
		}
	};
	
	const getNotificationData = () => {
		try {
			client
				.watchQuery({
					query: GET_NOTIFICATION_SETTINGS,
					fetchPolicy: 'no-cache',
				})
				.subscribe(({ data, loading, error }) => {
					if (data !== undefined) {
						setNotificationData(data.getMyNotificationSettings);
					}
					if (error) {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
						} else {
							SentryError(error);
							message.destroy();
							message.error('Something went wrong please try again later');
						}
					}
				});
		} catch (error) {
			SentryError(error);
		}
	};
	const getPages = () => {
		client
			.watchQuery({
				query: GET_ACTIVE_PAGES,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading, error }) => {
				SentryLog({
					category: 'Profile Side Menu',
					message: 'Get active CMS pages API called successfully ',
					level: Severity.Info,
				});
				//		this.loading = loading;
			
				// console.log('pages  =>>> ',data )
				if (data !== undefined) {
					setPages(data.getActivePages);
				}
				if(activeTab > 3){
					setCmsPageData(data.getActivePages[activeTab - 4] )
				}
				setIsLoaded(true);
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				}
			}
		);
	};

	const onMenuSelect = (tab, cmsData) => {
		if (tab === '0' && Object.keys(profileData).length === 0) {
			if(localStorage.getItem('role') === 'journalist'){
				getProfileData()
			}else{
				getReporterProfileData()
			}
		} else if (tab === '2' && Object.keys(notificationData).length === 0) {
			getNotificationData();
		}
		setCmsPageData(cmsData);
		setActiveTab(tab);
	};

	return (
		<React.Fragment>

{isLoaded ? ( <>
				<Helmet>
					<title>{localStorage.getItem('role') === 'journalist' ? 'Content Buyer': 'Content Creator'} |
					{(() => {
							switch (activeTab) {
								case '0':
									return ' View Profile';
								case '1':
									return " Change Password";
								case '2':
									return " Notification Settings ";
								case '3':
									return " Feedback";
								default :
									return <Redirect to="/settings/0"/>
					}
					})()}
					</title>
				</Helmet>
				<div className="">
					{/* <div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							{renderSwitch()}
						</Title>
					</div> */}
					{activeTab <= 3 && <div className="profiletab">
						<ProfileSideMenu
							activeTab={activeTab}
							pages={pages}
							onMenuSelect={onMenuSelect}
						/>
					</div>}
					<div className="profiletabcontent">
						{(() => {
							switch (activeTab) {
								case '0':
									return Object.keys(profileData).length ? (
										<MyProfile profileData={profileData} />
									) : (
										<Loader />
									);
								case '1':
									return <ChangePassword />;
								case '2':
									return Object.keys(notificationData).length ? (
										<NotificationSettings
											notificationData={notificationData}
											getData={(e) => getNotificationData()}
										/>
									) : <Loader />;
								case '3':
									return <Feedback />;
							}
						})()}
					</div>
				</div>
			 </>)

: (
	<Loader />
)}
		</React.Fragment>
	);
};

Settings = withApollo(Settings);
export { Settings };
