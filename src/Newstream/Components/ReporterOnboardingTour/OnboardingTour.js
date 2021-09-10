import { captureException as SentryError } from '@sentry/react';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import Joyride from 'react-joyride';
import { ONBOARDING_MUTATION } from '../../graphql/mutation';
import { GET_ONBOARDING_STATUS } from '../../graphql/query';
import {
	BreakingStoryTour,
	ListViewTour,
	MapCardTour,
	NavMenuTour,
	StoryDetailTour,
	SubmitStoryTour,
} from './TourSteps';

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
				setTourFlags(getWebScreenStatus);
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	const resetOnboardingFlags = async () => {
		await client
			.mutate({
				variables: {
					header: false,
					listView: false,
					navbar: false,
					mapCard: false,
					storyDetail: false,
					submitStory: false,
					breakingStory: false,
				},
				mutation: ONBOARDING_MUTATION,
			})
			.then(({ data: { saveWebScreenStatus } }) => {
				// console.log('Restting Onboarding Flags => ', saveWebScreenStatus);
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	const updateCurrentTour = async () => {
		if (Object.keys(tourFlags).length > 0) {
			if (tourName.includes('listView') && tourFlags.listView === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...ListViewTour,
				]);
			}
			if (tourName.includes('navbar') && tourFlags.navbar === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...NavMenuTour,
				]);
			}
			//Adding click event listener after Navbar Tour is done
			if (tourName.includes('navbar') && tourFlags.navbar === true) {
				document.addEventListener('click', afterRun, true);
			}
			if (tourName.includes('mapCard') && tourFlags.mapCard === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...MapCardTour,
				]);
			}
			if (tourName.includes('storyDetail') && tourFlags.storyDetail === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...StoryDetailTour,
				]);
			}
			if (tourName.includes('submitStory') && tourFlags.submitStory === false) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...SubmitStoryTour,
				]);
			}
			if (
				tourName.includes('breakingStory') &&
				tourFlags.breakingStory === false
			) {
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...BreakingStoryTour,
				]);
			}
		}
	};

	const endTour = async (data) => {
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
			if (tourName.includes('mapCard')) {
				updateVar.mapCard = true;
			}
			if (tourName.includes('storyDetail')) {
				updateVar.storyDetail = true;
			}
			if (tourName.includes('submitStory')) {
				updateVar.submitStory = true;
			}
			if (tourName.includes('breakingStory')) {
				updateVar.breakingStory = true;
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
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later.');
					}
				});
		}
	};

	if (window.innerWidth <= 991) {
		return <></>;
	}

	return (
		<>
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
				continuous
				hideBackButton
				callback={endTour}
				showSkipButton
			/>
		</>
	);
};

export { OnboardingTour };
