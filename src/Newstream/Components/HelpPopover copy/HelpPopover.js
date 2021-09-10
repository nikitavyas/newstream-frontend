import React, { useState } from 'react';
import { Dropdown, Menu } from 'antd';
import './HelpPopover.css';
import Joyride from 'react-joyride';
import {
	ListViewTour,
	SubmitStoryTour,
	StoryDetailTour,
	BreakingStoryTour,
} from '../ReporterOnboardingTour/TourSteps';

const HelpPopover = () => {
	const [tourRun, setTourRun] = useState(false);
	const [tourSteps, setTourSteps] = useState([]);

	const startTour = () => {
		// console.log('URL path => ', document.location.pathname);
		updateTourSteps();
		setTourRun(true);
	};

	const updateTourSteps = () => {
		if (document.location.pathname.includes('/requests')) {
			setTourSteps([...ListViewTour]);
		}
		if (document.location.pathname.includes('/requests/story')) {
			setTourSteps([...SubmitStoryTour]);
		}
		if (document.location.pathname.includes('/story/add')) {
			// console.log('Current TourSteps => ', tourSteps);
			setTourSteps([...BreakingStoryTour]);
		}
		if (document.location.pathname.includes('/requests-details/')) {
			setTourSteps([...StoryDetailTour]);
		}
	};
	const menu = (
		<Menu onClick={startTour}>
			<Menu.Item key="resetTutorial">Show Tutorial</Menu.Item>
		</Menu>
	);

	const endTour = (data) => {
		const { status, type } = data;
		if (status === 'finished' || ('skipped' && type === 'tour:end')) {
			setTourSteps([]);
			setTourRun(false);
		}
	};

	if (window.innerWidth <= 991) {
		return <></>;
	}

	return (
		<>
			{tourRun ? (
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
			) : null}
			<Dropdown overlay={menu} placement="topRight">
				<div className="fixed-widgets">
					<span className="ant-avatar fixed-widgets-avatar ant-dropdown-trigger ant-avatar-circle ant-avatar-icon">
						<span role="img" className="anticon">
							?
						</span>
					</span>
				</div>
			</Dropdown>
		</>
	);
};

export { HelpPopover };
