import React, { Fragment, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import Joyride from 'react-joyride';
import { captureException as SentryError } from '@sentry/react';
import { message } from 'antd';
import { GET_ONBOARDING_STATUS, ONBOARDING_MUTATION } from '../../graphql/APIs';
import { AddRequestTour } from './TourSteps/addRequest';
import { HeaderTour, NavbarTour } from './TourSteps/Header';
import { ListViewTour } from './TourSteps/listView';
import { MapCardTour, MapViewTour } from './TourSteps/mapView';
import { MarketplaceTour } from './TourSteps/marketplace';
import { ReporterTour } from './TourSteps/reporter';

const OnboardingTour = ({ resetFlags, tourName, afterRun }) => {
	const client = useApolloClient();
	const [tourFlags, setTourFlags] = useState({});
	const [tourSteps, setTourSteps] = useState([]);

	useEffect(() => {
		getOnboardingFlags();
	}, []);

	useEffect(() => {
		if (Object.keys(tourFlags).length > 0) {
			updateCurrentTour();
		}
		if (resetFlags) {
			resetOnboardingFlags();
		}
	}, [tourFlags]);

	//Helper Functions
	const getOnboardingFlags = async () => {
		await client
			.query({
				query: GET_ONBOARDING_STATUS,
				fetchPolicy: 'no-cache',
			})
			.then(({ data: { getWebScreenStatus } }) => {
				// console.log(getWebScreenStatus)
				setTourFlags(getWebScreenStatus);
			})
			.catch((error) => {});
	};

	const resetOnboardingFlags = async () => {
		await client
			.mutate({
				variables: {
					header: false,
					listView: false,
					mapView: false,
					navbar: false,
					mapCard: false,
					reporterPage: false,
					addrequest: false,
				},
				mutation: ONBOARDING_MUTATION,
			})
			.then(({ data: { saveWebScreenStatus } }) => {
				// console.log('Restting Onboarding Flags => ', saveWebScreenStatus);
			})
			.catch((error) => {});
	};

	const updateCurrentTour = async () => {
		if (Object.keys(tourFlags).length > 0) {
			// var newTourSteps = [];
			if (tourName.includes('listView') && tourFlags.listView === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...ListViewTour,
				]);
			}
			if (tourName.includes('mapView') && tourFlags.mapView === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...MapViewTour,
				]);
			}
			if (tourName.includes('mapCard') && tourFlags.mapCard === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...MapCardTour,
				]);
			}
			if (tourName.includes('addRequest') && tourFlags.addrequest === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...AddRequestTour,
				]);
			}
			if (tourName.includes('reporters') ) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...ReporterTour,
				]);
			}
			if (tourName.includes('marketplace') && tourFlags.marketplace === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...MarketplaceTour,
				]);
			}
			if (tourName.includes('header') && tourFlags.header === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...HeaderTour,
				]);
			}
			if (tourName.includes('navbar') && tourFlags.navbar === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...NavbarTour,
				]);
			}

			//Adding click event listener after Navbar Tour is done
			if (tourName.includes('navbar') && tourFlags.navbar === true) {
				document.addEventListener('click', afterRun, true);
			}
		}
	};

	const endTour = async (data) => {
		// console.log('Tour Details => ', data);
		const { status, type } = data;
		if (
			status === 'finished' ||
			('skipped' && type === 'tour:end' && tourName.length > 0)
		) {
			var updateVar = {};
			if (tourName.includes('header')) {
				updateVar.header = true;
			}
			if (tourName.includes('navbar')) {
				updateVar.navbar = true;
			}
			if (tourName.includes('listView')) {
				updateVar.listView = true;
			}
			if (tourName.includes('mapView')) {
				updateVar.mapView = true;
			}
			if (tourName.includes('mapCard')) {
				updateVar.mapCard = true;
			}
			if (tourName.includes('addRequest')) {
				updateVar.addrequest = true;
			}
			if (tourName.includes('reporters')) {
				updateVar.reporterPage = true;
			}
			if (tourName.includes('marketplace')) {
				updateVar.marketplace = true;
			}
			await client
				.mutate({
					variables: updateVar,
					mutation: ONBOARDING_MUTATION,
				})
				.then(() => {
					getOnboardingFlags();
				})
				.catch((error) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		}
	};

	if (window.innerWidth <= 991) {
		return <Fragment></Fragment>;
	}
// console.log(tourSteps)
	return (
		<Fragment>
			<Joyride
				steps={tourSteps}
				locale={{
					close: 'Ok, Got it!',
					last: 'Ok, Got it!',
					next: 'Ok, Got it!',
					skip: 'Skip Tutorial',
				}}
				styles={{
					options: {
						primaryColor: '#7721D1',
						textColor: '#000',
						zIndex: 10000,
					},
					buttonClose: {
						display: 'none',
					},
				}}
				continuous={true}
				hideBackButton={true}
				callback={endTour}
				showSkipButton={true}
			/>
		</Fragment>
	);
};

export { OnboardingTour };
