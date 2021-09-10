import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { GET_USER_CONTRACTS } from '../../graphql/APIs';

export const PrivateRoutes = ({ component: Component,matchProps, ...rest }) => {
	const client = useApolloClient();
	const browserHistory = useHistory();
	const [showContractsModal, setShowContractsModal] = useState(false);
	const [allowDismiss, setAllowDismiss] = useState(true);

	useEffect(() => {
		checkInternet();
		if(localStorage.getItem('access_token')){
			getContractStatus();
		}
	}, [Component]);
	const checkInternet = () => {
		var condition = navigator.onLine ? 'online' : 'offline';
		if (condition === 'online') {
		  console.log('ONLINE');
			fetch('https://www.google.com/', { // Check for internet connectivity
				mode: 'no-cors',
				})
			.then(() => {
				console.log('CONNECTED TO INTERNET');
			}).catch(() => {
			   console.log('INTERNET CONNECTIVITY ISSUE');
			   window.location.href = "/errorMessages/noInternet"
			})
	
		}else if(condition === 'offline'){
		   console.log('OFFLINE')
		   this.props.history.push("/errorMessages/noInternet");
		}
	}
	const getContractStatus = () => {
		let refreshStored = localStorage.getItem('contractRefreshTime');

		let contractRefresh = new Date(parseFloat(refreshStored)) || undefined;
		let now = new Date();
		let showSkip = true;
		if (!refreshStored || contractRefresh < now) {
			client
				.query({
					query: GET_USER_CONTRACTS,
					fetchPolicy: 'network-only',
				})
				.then(({ data: { getUserContracts } }) => {
					let unsignedData = getUserContracts.filter((data) => {
						return data.signed === false;
					});

					let lastSignDatePassedContracts = unsignedData.filter((data) => {
						return data.lastSignDate <= new Date();
					});
					if (lastSignDatePassedContracts.length > 0) {
						setAllowDismiss(false);
						showSkip = false;
					}
					let storedSkipTime = localStorage.getItem('skipUntil');
					if (
						(storedSkipTime && now < new Date(parseFloat(storedSkipTime))) ||
						unsignedData.length === 0
					) {
						setShowContractsModal(false);
					} else {
						setShowContractsModal(true);
					}

					let refreshTime = new Date().valueOf() + 3600000;
					localStorage.setItem('contractRefreshTime', refreshTime);
					localStorage.setItem('showSkip', showSkip);
				});
		}
	};
	 // let matchProps = { test: 'ing' };
	return (
		<Route
			{...rest}
			data={'reporters'}
			render={(props) => {
				if (showContractsModal) {
					Modal.confirm({
						content: 'You have new contracts to sign',
						closable: false,
						centered: true,
						cancelText: 'Dismiss for 24 Hours',
						okText: `Let's Sign Now`,
						onOk() {
							setShowContractsModal(false);
							browserHistory.push('/contracts');
						},
						onCancel() {
							setShowContractsModal(false);
							if (allowDismiss) {
								var date = new Date().valueOf() + 86400000;
								localStorage.setItem('skipUntil', date);
							} else {
								browserHistory.push('/contracts');
							}
						},
						cancelButtonProps: !allowDismiss && {
							style: { display: 'none' },
						},
					});
				}
				if (!localStorage.access_token || localStorage.access_token === 'null' ) {
					// not logged in so redirect to login page with the return url
					// console.log('login')
					return (
						<Redirect
							to={{ pathname: '/login', state: { from: props.location } }}
						/>
					);
				}
				// authorised so return component
				props.match.type = {...matchProps};
				return (
					<Component
						key={
							props.location.state
								? props.location.state.search_text
								: props.location.key
						}
						{...props}
						//{...matchProps}
					/>
				);
			}}
		/>
	);
};
