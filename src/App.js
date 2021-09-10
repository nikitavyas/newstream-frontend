import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Template } from './Newstream/Template';
import {
	Switch,
	Redirect,
	BrowserRouter as Router,
	Route,
} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Login } from './Newstream/Auth/Login';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { ResetPassword } from './Newstream/Auth/ResetPassword';
import { SetUpProfilePage } from './Newstream/Pages/SetUpProfile';
import { Information } from './Newstream/Pages/Information';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
} from '@sentry/react';
import { withRouter } from 'react-router-dom';

import { Contracts } from './Newstream/Pages/ContractSign';
import { Loader } from './Newstream/Components/Loader/Loader';
import { Modal, message } from 'antd';
import { SignUpPage } from './Newstream/Auth/Signup';
import { ContractUpload } from './Newstream/Auth/ContractUpload';
import { Verification } from './Newstream/Auth/Verification';
import { parse as parseParams } from 'query-string';
import { Policy } from './Newstream/Pages/Policy';
import { NotFound } from './Newstream/Pages/NotFound';
import { Settings } from './Newstream/Pages/Settings/Settings';
import { ErrorMessages } from './Newstream/Pages/ErrorMessages';

const history = createBrowserHistory();

message.config({
	top: 100,
	duration: 2,
	maxCount: 1,
});
const uuidv4 = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
const loading = () => (
	<div className="animated fadeIn pt-3 text-center">
		<Loader />
	</div>
);
function App(props) {
	
	const getToken = () => {
		const urlParameters = parseParams(props.location.search);
		const token = urlParameters.invite;
		if (localStorage.getItem('access_token')) {
			return localStorage.getItem('access_token') ? `Bearer ${localStorage.getItem('access_token')}` : '';
		} else if (token) {
			return token ? `Bearer ${token}` : '';
		} else {
			return '';
		}
	};
	const client = new ApolloClient({
		uri: 'https://apiv3-stage.thenewstream.com/api/v2',
		// uri: 'https://api-stage.thenewstream.com/api/v2',
	//	uri: 'https://apistage.thenewstream.com/api/v2',
		request: (operation) => {
			operation.setContext({
				headers: {
					Authorization: getToken(),
					//USERTYPE: 'journalist',
					requestId: uuidv4(),	
				},
			});
		},
		onError: ({ graphQLErrors, networkError }) => {
			if (graphQLErrors) {
				SentryError(graphQLErrors);
				let exception = graphQLErrors[0].extensions.exception;
				if (exception) {
					switch (exception.status) {
						case 500:
							// props.history.push({
							// 	pathname: '/errorMessages/502',
							// 	state: graphQLErrors[0].message
							// })
							// if (typeof graphQLErrors[0].message === 'string') {

							// 	// Modal.error({
							// 	// 	title: graphQLErrors[0].message,
							// 	// 	onOk() {
							// 	// 		//localStorage.clear();
							// 	// 		//window.location.href = "/login"
							// 	// 		window.location.href = "/errorMessages/502"
							// 	// 	},
							// 	// });
							// } else {
							// 	Modal.error({
							// 		title: graphQLErrors[0].message.message,
							// 		content:
							// 			graphQLErrors[0].message.requestId &&
							// 			'Request Id : ' + graphQLErrors[0].message.requestId,
							// 		onOk() {
							// 			//localStorage.clear();
							// 			//.location.href = "/login"
							// 		},
							// 	});
							// };
							break;
							case 404:
								props.history.push({
									pathname: '/errorMessages/404',
									state: graphQLErrors[0].message
								})
							break;
						case 401:
							localStorage.clear();
							message.error(graphQLErrors[0].message)
							window.location.href = "/login"
							break;
						case 400:
							props.history.push({
								pathname: '/errorMessages/400',
								state: graphQLErrors[0].message
							})
						break;
						case 403:
							if (typeof graphQLErrors[0].message === 'string') {
								Modal.error({
									title: graphQLErrors[0].message,
									onOk() {
										localStorage.clear();
										window.location.href = "/login"
									},
								});
							} else {
								Modal.error({
									title: graphQLErrors[0].message.message,
									content:
										graphQLErrors[0].message.requestId &&
										'Request Id : ' + graphQLErrors[0].message.requestId,
									onOk() {
										localStorage.clear();
										window.location.href = "/login"
									},
								});
							}
							break;
						case typeof graphQLErrors[0].message !== 'string':
							Modal.error({
								title: graphQLErrors[0].message.message,
								content:
									graphQLErrors[0].message.requestId &&
									'Request Id : ' + graphQLErrors[0].message.requestId,
							});
							break;
						case typeof graphQLErrors[0].message === 'string':
							message.error(graphQLErrors[0].message)
							break;
						default:
							message.error(graphQLErrors[0].message)
					}
				}
				//return null;
				//	}
			}

			if (networkError) {
				SentryError(networkError);
			//	window.location.href = "/errorMessages/502"
			}
		},
	});
	return (
		<div className="App">
			<ApolloProvider client={client}>
				<Router history={history}>
					<React.Suspense fallback={loading()}>
						<Switch>
							<Route
								path="/setUpProfile"
								render={() => {
									if (!localStorage.access_token) {
										// not logged in so redirect to login page with the return url
										return <Redirect to={{ pathname: '/login' }} />;
									}
									// If User Setup is Done, send to My Request Page
									if (localStorage.slackUserId) {
										return <Redirect to={{ pathname: '/marketplace/inHouse' }} />;
									}
									// authorised so return component
									return <SetUpProfilePage />;
								}}
							/>
							<Route
								path="/contracts"
								render={(props) => {
									if (!localStorage.access_token) {
										// not logged in so redirect to login page with the return url
										return <Redirect to={{ pathname: '/login' }} />;
									}
									// If User Setup is Done, send to My Request Page
									//	if (localStorage.slackUserId) {
									//		return <Redirect to={{ pathname: '/myRequest/1' }} />;
									//	}
									// authorised so return component
									return <Contracts {...props} />;
								}}
							/>
							<Route path="/login" render={(props) => <Login {...props} />} />
							<Route
								path="/resetpassword/:token"
								render={(props) => <ResetPassword {...props} />}
							/>
							<Route path="/page/:slug" name="" component={Information} />
							<Route
								exact
								path="/signup"
								name="Signup Page"
								render={(props) => <SignUpPage {...props} />}
							/>
							<Route
								exact
								path="/resetpassword/:token"
								name="Reset Password"
								render={(props) => <ResetPassword {...props} />}
							/>
							<Route
								exact
								path="/policies"
								name="Policies"
								render={(props) => <Policy {...props} />}
							/>
							<Route
								exact
								path="/terms"
								name="Policies"
								render={(props) => <Policy {...props} />}
							/>
							{/* <Route
								exact
								path="/contracts"
								name="Contract Invitation Page"
								render={(props) => <Contracts {...props} />}
							/> */}
							<Route
								exact
								path="/contract-upload"
								name="Contract Invitation Page"
								render={(props) => <ContractUpload {...props} />}
							/>
							<Route
								exact
								path="/verification"
								name="Verification Page"
								render={(props) => <Verification {...props} />}
							/>						
							<Route path="/" render={(props) => <Template {...props} />}/>
	 						<Route component={NotFound} />
							<Redirect exact from="/" to="/login" />
					</Switch>
					</React.Suspense>
				</Router>
			</ApolloProvider>
		</div>
	);
}
App = withRouter(App);
export default App;
