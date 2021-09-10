import React, { Fragment } from 'react';
import { Typography, Row, Col, Card } from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { FeedbackForm } from '../../Components/Forms';

const { Title } = Typography;

const Feedback = (props) => {
	return (
		<Fragment>
			<div className="d-flex flex-row align-items-center justify-content-between my-2">
				<Title level={4} strong="false" className="pageTitle m-0">
					Feedback
				</Title>
			</div>
			<Row gutter={30} className="pt-2">
				<Col lg={6} className="d-none d-lg-block">
					<ProfileSideMenu page="feedback" />
				</Col>
				<Col lg={18} xs={24}>
					<Card className="rightSideSetting">
						<FeedbackForm />
					</Card>
				</Col>
			</Row>
		</Fragment>
	);
};

export { Feedback };
