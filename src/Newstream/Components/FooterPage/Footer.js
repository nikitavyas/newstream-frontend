import React, { useEffect, useState } from 'react';
import { Layout,Menu } from 'antd';
import { Link } from 'react-router-dom';
import './FooterPage.css';
import { GET_VERSION_UPDATES,GET_ACTIVE_PAGES } from '../../graphql/APIs';
import { useApolloClient } from 'react-apollo';
import { message } from 'antd';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { HelpPopover } from '../HelpPopover/HelpPopover';
import { ReporterHelpPopover } from '../ReporterHelpPopover/ReporterHelpPopover';

const { Footer } = Layout;

const AppFooter = () => {
	const [latestVersion, setLatestVersion] = useState('1.0.0');
	const [pages, setPages] = useState([]);
	const [isLoaded, setIsLoaded] = useState(false);
	var d = new Date();
	var n = d.getFullYear();

	useEffect(() => {
		getVersionNumber();
		getPages();
	}, []);

	const client = useApolloClient();
	const getPages = () => {
		client
			.watchQuery({
				query: GET_ACTIVE_PAGES,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading, error }) => {
				SentryLog({
					category: 'Profile Side Menu',
					message: 'Get active CMS pages API called successfully ',
					level: Severity.Info,
				});
				//		this.loading = loading;
				setIsLoaded(true);
				if (data !== undefined) {
					setPages(data.getActivePages);
				}
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				}
			});
	};
	/**
	 * getVersionNumber
	 * This Function Calls when get a version through Api call 
	 */
	
	const getVersionNumber = async () => {
		await client
			.query({
				query: GET_VERSION_UPDATES,
			})
			.then(({ data }) => {
				console.log('version data',data)
				/*Get version Information from api call and set updated version information*/
				if(data.getAllReleaseNote.length > 0){
				 setLatestVersion(data.getAllReleaseNote[0]?.version);
				}
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later');
				}
			});
	};

	return (
		<Footer style={{ textAlign: 'center' }}>
			<div className="d-flex align-items-center justify-content-between">
					<span>Copyright © {n}, Newstream | Version {latestVersion} |{' '}
					<Link to="/whatsNew" className="d-inline-block">
						What's new
					</Link>
					{pages.map((data, index) => {
					return  <span key={index}> {' | '} 
					<Link to={'/cms/'+ data.slug} className="d-inline-block">{data.title}</Link></span>;
					})}
					</span>
					{localStorage.getItem('role') === 'reporter' ? 
					<ReporterHelpPopover/> :
					<HelpPopover />}
			</div>
		</Footer>
	);
};

export default AppFooter;
