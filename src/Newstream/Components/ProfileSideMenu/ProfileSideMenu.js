import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import './ProfileSideMenu.css';
import { withApollo } from 'react-apollo';
import {
	addBreadcrumb as SentryLog,
	
	Severity,
} from '@sentry/react';
let ProfileSideMenu = ({ onMenuSelect, pages, client, activeTab }) => {
	useEffect(() => {
		SentryLog({
			category: 'Profile side menu',
			message: 'Profile side menu Loaded',
			level: Severity.Info,
		});
	}, []);
	const onSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
		let cmsData = {};
		if (key > 3) {
			cmsData = {
				title: pages[key - 4].title,
				description: pages[key - 4].description,
			};
		}
		onMenuSelect(key, cmsData);
	};
	return (
		<React.Fragment>
			<Menu
				theme="light"
				selectedKeys={[activeTab]}
				mode="horizontal"
				onSelect={onSelect}>
				{//localStorage.getItem('role') === 'journalist' && 
				<Menu.Item key="0">My profile</Menu.Item>}
				{localStorage.getItem('role') === 'journalist' && 
				<Menu.Item key="1">Change password</Menu.Item>}
				<Menu.Item key="2">Notification settings</Menu.Item>
				<Menu.Item key="3">Feedback</Menu.Item>
				{/* {pages.map((data, index) => {
					return <Menu.Item key={+'4' + index}>{data.title}</Menu.Item>;
				})} */}
			</Menu>	
		</React.Fragment>
	);
};
ProfileSideMenu = withApollo(ProfileSideMenu);

export default ProfileSideMenu;
