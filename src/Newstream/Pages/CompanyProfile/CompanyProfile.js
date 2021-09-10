import { DownloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { captureException as SentryError } from '@sentry/react';
import {
	Button, Avatar,
	Card,
	Col,
	Comment,
	Empty,
	message,
	Modal,
	Row,
	Table,
	Rate,
} from 'antd';
import { saveAs } from 'file-saver';
import moment from 'moment';
import React, { Component, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../../Components/Avatar/Avatar';
import { ContactButton } from '../../Components/Buttons/Contact';
import { COULDBASEURL } from '../../Components/general/constant';
import { getAddress } from '../../Components/general/general';
import { Loader } from '../../Components/Loader/Loader';
import { CustIcon } from '../../Components/Svgs/Svgs';
import {
	GET_COMPANY_PROFILE
} from '../../graphql/query';
import { analytics } from '../../utils/init-fcm';
import './CompanyProfile.css';
import { NotFound } from '../NotFound';

const { Column } = Table;

class CompanyProfile extends Component {
	userId = this.props.match.params.id;
	constructor(props) {
		super(props);
		analytics.setCurrentScreen('content Creator`s Profile');
		this.state = {
			loading: false,
			show404: false,
			companyDetails: {}
		}
	}
	componentWillMount() {
		this.getData();
	}

	getData() {
		const { client } = this.props;
		this.setState({ isLoading: true })
		client
			.query({
				query: GET_COMPANY_PROFILE,
				variables: {
					publisherId: this.props.match.params.id,
				},
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					console.log(data)
					if (data.getCompanyDetails) {
						this.setState({ isLoading: false, companyDetails: data.getCompanyDetails })
					} else {
						this.setState(
							{ isLoading: false, show404: true })
					}
				}
			});
	}

	render() {
		return (
			<React.Fragment>
				{this.state.isLoading === true ? (
					<Loader />
				) : this.state.show404 ? <NotFound /> : (
					//	this.state.reporterData != null && (
					<div>
						<div className="globaltitle">
							<h3 className="mb-3"><CustIcon type="backarrow" className="mr-2" />Company Profile</h3>
						</div>
						<Card className="boxshadow p-0 p-lg-2">
							<div className="text-center mb-4 pb-2">
								<div >
									<ProfileAvatar
										size={80}
										name={this.state.companyDetails.title}
										imageUrl={
											this.state.companyDetails.logo_image
										}
									/>
								</div>
								<div className="font-weight-bold font21 mb-2">{this.state.companyDetails.title}</div>
								<div className="companyurl">
									{this.state.companyDetails.url}
								</div>
							</div>
							<Card className="companybox">
								{this.state.companyDetails.description &&
									<div className="font-bold mb-2">About</div>}
								<p>{this.state.companyDetails.description}</p>
								<Row gutter={10}>
									{getAddress(this.state.companyDetails) != "undefined" &&
										<Col md={8} sm={12} className="mb-2 mb-sm-0">
											<div className="font-bold mb-2">Head Office Address</div>
											<p>{getAddress(this.state.companyDetails)}</p>
										</Col>}
									{this.state.companyDetails.phone_number &&
										<Col md={8} sm={12} className="mb-2 mb-sm-0">
											<div className="font-bold mb-2">Contact Number</div>
											<p>{this.state.companyDetails.phone_number}</p>
										</Col>}
									{this.state.companyDetails.email && <Col md={8} sm={12} className="mb-2 mb-sm-0">
										<div className="font-bold mb-2">Email Address</div>
										<p>{this.state.companyDetails.email}</p>
									</Col>}
								</Row>
							</Card>
							<Card className="companybox mt-4">
								<div className="font-bold mb-3">Our Team</div>
								<Row gutter={20}>
									{this.state.companyDetails.users?.map((user, index) => {
										return (
											<Col lg={6} md={8} key={index} xs={12} className="mb-3">
												<div className="d-flex align-items-center">
													<ProfileAvatar
														size={36}
														name={user.name}
														imageUrl={
															user.profileImage
														}
													/>
													<div className="pl-3 text-ellipsis">{user.name}</div>
												</div>
											</Col>
										)
									})}
								</Row>
							</Card>
						</Card>
					</div>
					//	)
				)}
			</React.Fragment>
		);
	}
}
CompanyProfile = withApollo(CompanyProfile);
export { CompanyProfile };
