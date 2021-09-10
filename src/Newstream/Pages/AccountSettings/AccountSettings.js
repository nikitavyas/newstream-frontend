import React, { Component } from 'react';
import './AccountSettings.css';
import { Row, Col, Typography, Card } from 'antd';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { LogoutOutlined } from '@ant-design/icons';

const { Title } = Typography;

class AccountSettings extends Component {
	render() {
		return (
			<React.Fragment>
				<div className="container pt-3">
					<div className="d-flex flex-row align-items-center justify-content-between my-2">
						<Title level={4} strong="false" className="pageTitle m-0">
							Account Settings
						</Title>
					</div>
					<Row gutter={30} className="pt-2">
						<Col lg={6} className="d-none d-lg-block">
							<ProfileSideMenu page="accountSettings" />
						</Col>
						<Col lg={18} xs={24}>
							<Card className="rightSideSetting myAccountSettings_blk">
								<Card className="accountSettingsAction">
									<div className="d-flex flex-row align-items-center justify-content-between">
										<div className="d-flex flex-column accountSettingsActionTxt">
											<strong>Logout</strong>
											<span></span>
										</div>
										<div className="accountSettingsActionIcon d-flex">
											<LogoutOutlined />
										</div>
									</div>
								</Card>
							</Card>
						</Col>
					</Row>
				</div>
			</React.Fragment>
		);
	}
}

export { AccountSettings };
