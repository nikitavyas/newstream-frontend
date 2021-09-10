import React, { Component } from 'react';
import './TransactionDetails.css';
import { Link } from 'react-router-dom';
import { Avatar, Card, Pagination } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { CustIcon } from '../../Components/Svgs';
class TransactionDetails extends Component {
	render() {
		return (
			<React.Fragment>
				<div className="container">
					<div className="d-flex flex-row align-items-center justify-content-between my-4">
						<div className="d-flex align-items-center">
							<div className="mr-3">
								<Avatar
									src={require('../../Assets/images/Brett-Shaw.jpg')}
									size={40}
								/>{' '}
							</div>
							<div className="d-flex flex-column">
								{' '}
								<h6 className="mb-0">
									<b>Femiko Sakai</b>{' '}
								</h6>
								<div className="locTxt">Belgium, Germany </div>{' '}
							</div>
						</div>
						<div className="d-flex flex-column">
							{' '}
							<div>
								<b>Month</b>{' '}
							</div>
							<div className="d-flex align-items-center dateTxt">
								<CalendarOutlined className="mr-1" /> February
							</div>{' '}
						</div>
						<div className="d-flex flex-column">
							{' '}
							<div>
								<b>Amount</b>{' '}
							</div>
							<div className="priceAmt primary-text-color">
								<b>$110</b>
							</div>{' '}
						</div>
						<div className="d-flex">
							<Link
								to="/transactions"
								className="ant-btn ant-btn-default ant-btn-round">
								All Transactions
							</Link>
						</div>
					</div>
					<Card>
						<div className="d-flex flex-row align-items-center justify-content-between mb-4">
							<div className="d-flex">
								<div className="d-flex flex-column">
									{' '}
									<h6>New York City bands music </h6>
									<div className="d-flex align-items-center">
										<CalendarOutlined className="mr-1" /> 02/28/2020
									</div>{' '}
								</div>
							</div>
							<div className="d-flex flex-column">
								<h5 className="price text-nowrap primary-text-color text-right px-2 mb-1">
									{' '}
									<span className="priceAmt primary-text-color">$15</span>
								</h5>
								<div className=" viewCounter d-flex flex-row align-items-center">
									<div className="d-flex flex-row align-items-center px-2">
										<span>2</span>
										<CustIcon type="voice" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>2</span>
										<CustIcon type="video" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>2</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								</div>
							</div>
						</div>

						<hr />

						<div className="d-flex flex-row align-items-center justify-content-between mb-4">
							<div className="d-flex">
								<div className="d-flex flex-column">
									{' '}
									<h6>Moments from Tomorrowland 2020 </h6>
									<div className="d-flex align-items-center">
										<CalendarOutlined className="mr-1" /> 02/27/2020
									</div>{' '}
								</div>
							</div>
							<div className="d-flex flex-column">
								<h5 className="price text-nowrap primary-text-color text-right px-2 mb-1">
									{' '}
									<span className="priceAmt primary-text-color">$15</span>
								</h5>

								<div className=" viewCounter d-flex flex-row align-items-center">
									<div className="d-flex flex-row align-items-center px-2">
										<span>5</span>
										<CustIcon type="video" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>1</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								</div>
							</div>
						</div>
						<hr />

						<div className="d-flex flex-row align-items-center justify-content-between mb-4">
							<div className="d-flex">
								<div className="d-flex flex-column">
									{' '}
									<h6>
										Our streets, our way! Moments from Happy Streets opening
									</h6>
									<div className="d-flex align-items-center">
										<CalendarOutlined className="mr-1" /> 02/25/2020
									</div>{' '}
								</div>
							</div>
							<div className="d-flex flex-column">
								<h5 className="price text-nowrap primary-text-color text-right px-2 mb-1">
									{' '}
									<span className="priceAmt primary-text-color">$20</span>
								</h5>

								<div className=" viewCounter d-flex flex-row align-items-center">
									<div className="d-flex flex-row align-items-center px-2">
										<span>1</span>
										<CustIcon type="voice" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>3</span>
										<CustIcon type="video" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>1</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								</div>
							</div>
						</div>

						<hr />

						<div className="d-flex flex-row align-items-center justify-content-between mb-4">
							<div className="d-flex">
								<div className="d-flex flex-column">
									{' '}
									<h6>NYC Winter Wine and Food Festival </h6>
									<div className="d-flex align-items-center">
										<CalendarOutlined className="mr-1" /> 02/18/2020
									</div>{' '}
								</div>
							</div>
							<div className="d-flex flex-column">
								<h5 className="price text-nowrap primary-text-color text-right px-2 mb-1">
									{' '}
									<span className="priceAmt primary-text-color">$30</span>
								</h5>

								<div className=" viewCounter d-flex flex-row align-items-center">
									<div className="d-flex flex-row align-items-center px-2">
										<span>4</span>
										<CustIcon type="video" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>1</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								</div>
							</div>
						</div>
						<hr />

						<div className="d-flex flex-row align-items-center justify-content-between mb-4">
							<div className="d-flex">
								<div className="d-flex flex-column">
									{' '}
									<h6>New York city arts festival 2020</h6>
									<div className="d-flex align-items-center">
										<CalendarOutlined className="mr-1" /> 02/15/2020
									</div>{' '}
								</div>
							</div>
							<div className="d-flex flex-column">
								<h5 className="price text-nowrap primary-text-color text-right px-2 mb-1">
									{' '}
									<span className="priceAmt primary-text-color">$30</span>
								</h5>

								<div className=" viewCounter d-flex flex-row align-items-center">
									<div className="d-flex flex-row align-items-center px-2">
										<span>2</span>
										<CustIcon type="video" className="ml-1" />
									</div>
									<div className="d-flex flex-row align-items-center px-2">
										<span>2</span>
										<CustIcon type="image" className="ml-1" />
									</div>
								</div>
							</div>
						</div>
					</Card>
				</div>
				<Pagination  
							  showTotal={(total) =>
								`Total ${total} ${total > 1 ? 'items' : 'item'}`
							 }
							  total={this.state.storyCount} 
							  defaultPageSize={this.state.LIMIT} 
							  defaultCurrent={this.state.defaultpage}
							   onChange={this.onPagination} />
			</React.Fragment>
		);
	}
}

export { TransactionDetails };
