import React, { Fragment,useState } from 'react';
import { Dropdown, Menu } from 'antd';
import './ReporterHelpPopover.css';
import Joyride from 'react-joyride';
import { QuestionCircleFilled } from '@ant-design/icons';
import {
	ListViewTour,
	SubmitStoryTour,
	StoryDetailTour,
	BreakingStoryTour,
} from '../ReporterOnboardingTour/TourSteps';

const ReporterHelpPopover = () => {
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
		if (document.location.pathname.includes('/addNewStory')) {
			// console.log('Current TourSteps => ', tourSteps);
			setTourSteps([...BreakingStoryTour]);
		}
		if (document.location.pathname.includes('/storyDetails/')) {
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
		<Fragment>
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
					continuous={true}
					hideBackButton={true}
					callback={endTour}
					run={tourRun}
					showSkipButton={true}
				/>
			) : null}
			<Dropdown overlay={menu} placement="topRight" trigger="click">
				<div className="fixed-widgets ml-2">
					<span className="fixed-widgets-avatar ant-dropdown-trigger cursorPointer">
						<QuestionCircleFilled className="mr-1" /> Help
					</span>
				</div>
			</Dropdown>
		</Fragment>
	);
};

export { ReporterHelpPopover };
