/* eslint-disable default-case */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Menu, Button, Layout } from 'antd';
import AppplicantRouts from '../routes/AppplicantRouts';

import { Link, withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import { CustIcon } from '../Svgs/Svgs';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Filter } from '../Filter';
import { RequestFilter } from '../RequestFilter';
import {TransactionsFilter} from '../TransactionsFilter';
const { Sider } = Layout;
const { SubMenu } = Menu;

let ApplicantReporterSider = (props,type) => {
	 const [currentKey, setCurrentKey] = useState('requests/open');
	 const [openKey, setOpenKey] = useState(props.location.pathname.split('/')[1]);
	 const [pageUpdated, setPageUpdated] = useState(true);
	 useEffect(() => {
		//  console.log(props.location.pathname.split('/'));
		if(!props.location.pathname.split('/')[2]){
			setCurrentKey('/'+props.location.pathname.split('/')[1]);
		}else{
			setCurrentKey('/'+props.location.pathname.split('/')[1] + '/' + props.location.pathname.split('/')[2]);
		}
		
		setOpenKey(props.location.pathname.split('/')[1]);
		if(props.location.pathname.split('/')[1]  == 'addNewStory') {
			setOpenKey([])
			setCurrentKey('addNewStory')	
		}
	}, [props.location.pathname]);
	const RedirectTopath = (path) => {
		// console.log(path, 'DDDD');
		props.history.push(path);
		setPageUpdated(true);
		// window.history.replaceState(null, null, path);
	//	window.location.href = path;
	};
	const onOpenChange = (items) => {
		// console.log(items);
		const latestOpenKey = items.find((key) => openKey.indexOf(key) === -1);
		// console.log(latestOpenKey);
		//if (rootKeys.indexOf(latestOpenKey) === -1) {
		// setOpenKeys(items);
		//} else {
		setOpenKey(latestOpenKey ? latestOpenKey : openKey);
		//}
	};
	return (
		<React.Fragment>
			<Sider className="sidebarMenu">
				<div className="logo" />
				{currentKey === 'addNewStory' ?  <div className="sidebarButtonactive">
					<Link to="/addNewStory">
							<PlusCircleOutlined  className="mr-2"/> Add New Story
					</Link>
				</div> : <div className="sidebarButton">
					<Link to="/addNewStory">
						<Button
						 	onClick={props.toggleClassFunction}
							shape="round"
							type="primary"
							className="font-medium tour-navbar-add-new-request d-block w-100">
							<PlusCircleOutlined /> Add New Story
						</Button>
					</Link>
				</div>}
				<Menu
				selectedKeys={[currentKey]}
				defaultOpenKeys={[openKey]}
				onOpenChange={onOpenChange}
					mode="inline"
					className="sidebarLink">
					{ AppplicantRouts.map(
						({ path, name, isVisible, key, icon, classList, children }) => {
							return (
								isVisible &&
								(children && children.length > 0 ? (
									<SubMenu
										key={key}
										title={<span onClick={(e) => {
											e.stopPropagation();
											RedirectTopath(path);
										}}>{name}
										</span>}
										icon={
											<span className="linkcircle">
												<CustIcon type={icon} />
											</span>
										}>
										{children &&
											children.map(
												({
													path,
													name,
													isVisible,
													key,
													icon,
													classList,
													children,
												}) => {
													return (
														<Menu.Item key={key}>
														<span className={classList}>
																<div
																	onClick={(e) => {
																		e.stopPropagation();
																		RedirectTopath(path);
																	}}>
																	{name}
																</div>
															</span>
														</Menu.Item>
													);
												}
											)}
									</SubMenu>
								) : (
										<Menu.Item key={key}>
											<span className={classList}>
												<Link to={path}>
													<span className="linkcircle">
														<CustIcon type={icon} />
													</span>
													<span className="linkname">{name}</span>
												</Link>
											</span>
										</Menu.Item>
									))
							);
						}
					)}
				</Menu>
				{props.location.pathname.indexOf('marketplace') !== -1 && props.location.pathname.indexOf('storyDetails') === -1 && (
					<Filter params={props.match.params} />
				)}
				{/* {props.location.pathname.indexOf('reporters') !== -1 && (
					// <ReporterFilter />
				)} */}
				{props.location.pathname.indexOf('myRequest') !== -1 && (
					<RequestFilter />
				)}
				{/* {props.location.pathname.indexOf('transactions') !== -1 && (
					<TransactionsFilter/>
				)} */}
			</Sider>
		</React.Fragment>
	);
};
ApplicantReporterSider = withApollo(ApplicantReporterSider);
export default withRouter(ApplicantReporterSider);
