import React, {  useState, useEffect } from 'react';
import {
	message,
	Card,
} from 'antd';
import { Loader } from '../../Components/Loader/Loader';
import { withApollo } from 'react-apollo';
import {GET_ACTIVE_PAGES} from '../../graphql/APIs';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {Helmet} from "react-helmet";
import { set } from 'lodash';

let AppPolicy = ({client,match}) =>{

    const [pages, setPages] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
		SentryLog({
			category: 'settings',
			message: 'Settings Loaded',
			level: Severity.Info,
		});
		getPages();
}, []);
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
				// 		this.loading = loading;
			
				// console.log('pages  =>>> ',data )
				let data1;
				
				// console.log(params.match ,"KKKKKKKKKKK");
				if (data !== undefined) {
					let activePAge=	data.getActivePages.filter((data1) =>{
						return data1.slug === match.params.slug		
						})
						console.log(activePAge)
						setPages(activePAge[0])
				}
				setIsLoaded(true);
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				}
			}
		);
	};
    return (
		<React.Fragment>

{isLoaded ? ( <>
				<Helmet>
					<title>{localStorage.getItem('role') === 'journalist' ? 'Content Buyer' : 'Content Creator'} |
					{pages.title}</title>
				</Helmet>
				{/* {console.log(pages,"UUUUUUUUUUUUU")} */}
			<div className="">
					<div className="profiletabcontent">
						{(() => {
						   	return (
								   <Card className="rightSideSetting myProfile_blk">
											<div className="myTerms_blk">
												<h3 className="font16 font-weight-bold mb-3 text-capitalize">
													<div
														dangerouslySetInnerHTML={{
															__html: pages.title,
														}}></div>
												</h3>
												<div className="profileScroll">
													<p
														dangerouslySetInnerHTML={{
															__html: pages.description,
														}}></p>
												</div>
											</div>
									</Card>
									);
							})()}
					</div>
				</div>
			 </>)
: (
	<Loader />
)}
		</React.Fragment>
	);
}
AppPolicy = withApollo(AppPolicy);
export default AppPolicy