import React from 'react';
const { MyRequest } = React.lazy(() => import('../../Pages/MyRequest'));
const { Transactions } = React.lazy(() => import('../../Pages/Transactions'));
const {ReporterRequest} = React.lazy(() =>import('../../Pages/ReporterRequest'));
const requestMenu =  [
	{
		name: 'With Proposal',
		path: '/requests/proposal',
		icon: 'fa fa-angle-right',
		class: 'tour-sideMenu-reporter-applicant',
		key: '/requests/proposal',
	},
	{
		name: 'Without Proposal',
		path: '/requests/open',
		icon: 'fa fa-angle-right',
		class: 'tour-sideMenu-reporter-invitation',
		key: '/requests/open',
	}
	
]
const ReporterRouts = [
	{
		//: '/myRequest/1',
		name: 'Requests',
		path: '/requests/proposal',
		component: ReporterRequest,
		icon: 'myRequest',
		isVisible: true,
		key: 'requests',
		classList: 'tour-navbar-requests',
		children: requestMenu
	},
	{
		name: 'My Stories',
		icon: 'marketplace',
		path: '/marketplace/proposal',
		class: 'reporter-dropdown',
		key: 'marketplace',
		isVisible: true,
		children: [
			{
				name: 'Proposals',
				path: '/marketplace/proposal',
				icon: 'fa fa-angle-right',
				class: 'tour-sideMenu-reporter-invitation',
				key: '/marketplace/proposal',
			},
			{
				name: 'Full Stories',
				path: '/marketplace/full',
				icon: 'fa fa-angle-right',
				class: 'tour-sideMenu-reporter-applicant',
				key: '/marketplace/full',
			},
		],
	},
	{	
		path: '/transactions',
		name: 'Transactions',
		component: Transactions,
		icon: 'transactionicon',
		isVisible: true,
		key: '/transactions',
		classList: 'tour-navbar-transaction'
	}
];

export default ReporterRouts;
