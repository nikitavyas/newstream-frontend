import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import history from './history';
import { Router } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import { init as SentryInit } from '@sentry/react';
import HttpsRedirect from 'react-https-redirect';

SentryInit({
	dsn:
		'https://94467a8b453e4908b7dd249e3e04bb57@o434114.ingest.sentry.io/5390575',
	environment: process.env.NODE_ENV,
	beforeBreadcrumb(breadcrumb) {
		switch (breadcrumb.category) {
			case 'ui.click':
			case 'ui.input':
			case 'console':
			case 'navigation':
			case 'xhr':
			case 'fetch':
				return null;
			default:
				return breadcrumb;
		}
	},
});

ReactDOM.render(
	<HttpsRedirect>
		<Router history={history}>
			<App />
		</Router>
	</HttpsRedirect>
	,
	document.getElementById('root')
);
// }
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.registerServiceWorker();

serviceWorker.unregister();
