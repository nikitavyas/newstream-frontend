import React from 'react';
import { Typography,Card } from 'antd';
import { FeedbackForm } from '../Forms';
import { addBreadcrumb as SentryLog, Severity } from '@sentry/react';
const { Title } = Typography;

const Feedback = () => {
	SentryLog({
		category: 'Feedback',
		message: 'Feedback Page Loaded',
		level: Severity.Info,
	});
	return (
		<Card className="rightSideSetting">
			<FeedbackForm />
		</Card>
	);
};

export { Feedback };
