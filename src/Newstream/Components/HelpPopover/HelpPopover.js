import React, { Fragment, useState } from 'react';
import { Dropdown, Menu } from 'antd';
import './HelpPopover.css';
import Joyride from 'react-joyride';
import { QuestionCircleFilled } from '@ant-design/icons';
import {
	ListViewTour,
	ReporterTour,
	AddRequestTour,
} from '../OnboardingTour/TourSteps';
import { MarketplaceTour } from '../OnboardingTour/TourSteps/marketplace';

const HelpPopover = () => {
	const [tourRun, setTourRun] = useState(false);
	const [tourSteps, setTourSteps] = useState([]);

	const startTour = () => {
		updateTourSteps();
		setTourRun(true);
	};

	const updateTourSteps = () => {
		// console.log("eror")
		const browserUrlPath = document.location.pathname;
	
		//  console.log(browserUrlPath)
		switch (browserUrlPath) {
			case '/myRequest/withProposal':
			case '/myRequest/withoutProposal':
			case '/myRequest/withProposal/':
			case '/myRequest/withoutProposal/':
			case '/myRequest/archived':
			case '/myRequest/archived/':
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...ListViewTour,
				]);
				break;
			case '/marketplace/proposal':
			case '/marketplace/full':
			case '/marketplace/proposal/':
			case '/marketplace/full/':
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...MarketplaceTour,
				]);
				break;
			case '/addNewRequest':
			case '/addNewRequest/':
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...AddRequestTour,
				]);
				break;

			case '/reporters/active':
			case '/reporters/invited':
			case '/reporters/applicants':
				setTourSteps((currentTourSteps) => [
					...currentTourSteps,
					...ReporterTour,
				]);
				break;
				case '/requests/open':
					case '/myRequest/withoutProposal':
					case '/myRequest/withoutProposal/':
					case '/myRequest/withProposal/':
					case '/myRequest/archived':
					case '/myRequest/archived/':
						setTourSteps((currentTourSteps) => [
							...currentTourSteps,
							...ListViewTour,
						]);
						break;
			default:
				setTourSteps([]);
				break;
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
		return <Fragment></Fragment>;
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

export { HelpPopover };
