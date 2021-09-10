import React, { Component } from 'react';
import './verification.css';
import { Card, Layout, Row, Col } from 'antd';
import { withApollo } from 'react-apollo';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import { CustIcon } from '../../Components/Svgs';

class Verification extends Component {
	render() {
		return (
			<>
				<Layout className="verificationPage">
					<Row justify="center">
						<Col span={6} col-offset={6}>
							<div className="invitationLogo">
								{/* <img alt="" src={require('../../../assets/images/transparent_logo.png')} /> */}
								<CustIcon type="logo" className="logoSvg" />
							</div>
						</Col>
						<Col span={20}>
							<Card className="invitationCard">
								<Row justify="center">
									<Col span={8} col-offset={6} className="invitation_title">
										<div className="thankyou_message">
											<span className="primary checkout" shape="circle">
												<CheckOutlined />
											</span>
											<h4>Thank you for filling up the details.</h4>
											<h5>
												Kindly wait while your profile is getting verified.
											</h5>
										</div>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
				</Layout>
			</>
		);
	}
}

Verification = withApollo(Verification);
export { Verification };
