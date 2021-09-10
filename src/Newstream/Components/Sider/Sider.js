/* eslint-disable default-case */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Menu, Button, Layout } from 'antd';
import routes from '../routes/Routs';
import ReporterRouts from '../routes/ReporterRouts';

import { Link, withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import { CustIcon } from '../Svgs/Svgs';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Filter } from '../Filter';
import { ReporterFilter } from '../ReporterFilter';
import { RequestFilter } from '../RequestFilter';
import { TransactionsFilter } from '../TransactionsFilter';
import { HelpPopover } from '../HelpPopover/HelpPopover';
import { from } from 'apollo-boost';
const { Sider } = Layout;
const { SubMenu } = Menu;

let AppSider = (props) => {
	const [currentKey, setCurrentKey] = useState('');
	const [openKey, setOpenKey] = useState('');
	const [pageUpdated, setPageUpdated] = useState(true);

	useEffect(() => {

		//  console.log(props.location.pathname);
		// console.log('props----------', props.location.pathname.split('/')[1] + '/' + props.location.pathname.split('/')[2]);
		if(!props.location.pathname.split('/')[2]){
			setCurrentKey('/'+props.location.pathname.split('/')[1]);
		}else{
			setCurrentKey('/'+props.location.pathname.split('/')[1] + '/' + props.location.pathname.split('/')[2]);
		}
		
		setOpenKey(props.location.pathname.split('/')[1]);
		if(props.location.pathname.split('/')[1]  == 'addNewRequest') {
			setOpenKey([])
			setCurrentKey('addNewRequest')	
		}
	}, [props.location.pathname]);
	const RedirectTopath = (path) => {
		props.history.push(path);
		setPageUpdated(true);
		// window.history.replaceState(null, null, path);
		//window.location.href = path;
	};
	const onOpenChange = (items) => {
		const latestOpenKey = items.find((key) => openKey.indexOf(key) === -1);
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
				{currentKey === 'addNewRequest' ? <div className="sidebarButtonactive">
					<Link to="/addNewRequest">
						
							<PlusCircleOutlined className="mr-1"/> Add New Request
					</Link>
				</div> : <div className="sidebarButton">
					<Link to="/addNewRequest">
						<Button 
						    onClick={props.toggleClassFunction}
							shape="round"
							type="primary"
							className="font-medium tour-navbar-add-new-request d-block w-100">
							<PlusCircleOutlined /> Add New Request
						</Button>
					</Link>
				</div>}
				<Menu
					selectedKeys={[currentKey]}
					openKeys={[openKey]}
					onOpenChange={onOpenChange}
					// onClick={e => {e.stopPropagation()
					// 	RedirectTopath(path)}}
					mode="inline"
					className="sidebarLink">
					{routes.map(
						({ path, name, isVisible, key, icon, classList, children }) => {
							return (
								isVisible &&
								(children && children.length > 0 ? (
									<SubMenu
										key={key}
										title={<span onClick={(e) => {
											e.stopPropagation();
											RedirectTopath(path);
										}}>
										{name}
									</span>}
										icon={
											<span className="linkcircle">
												<CustIcon type={icon} />
											</span>
										}
										>
										{children &&
											children.map(
												({
													path,
													name,
													key,
													classList,
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
														// <Menu.Item key={key}>
														// 	<span className={classList}>
														// 		<span
														// 			onClick={(e) => {
														// 				e.stopPropagation();
														// 				RedirectTopath(path);
														// 			}}>
														// 			{name}
														// 		</span>
														// 	</span>
														// </Menu.Item>
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
				{/* {props.location.pathname.indexOf('storyDetails') === 1 || (
					<Filter params={props.match.params} />
				)} */}

				{props.location.pathname.indexOf('reporters') !== -1 && (
					<ReporterFilter />
				)}
				{props.location.pathname.indexOf('myRequest') !== -1 && (
					<RequestFilter />
				)}
				{/* {props.location.pathname.indexOf('transactions') !== -1 && (
					<TransactionsFilter />
				)} */}
				{/* <HelpPopover /> */}
			</Sider>
		</React.Fragment>
	);
};
AppSider = withApollo(AppSider);
export default withRouter(AppSider);
