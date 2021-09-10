import React from 'react';
const { MyRequest } = React.lazy(() => import('../../Pages/MyRequest'));
const { Transactions } = React.lazy(() => import('../../Pages/Transactions'));
const {ReporterRequest} = React.lazy(() =>import('../../Pages/ReporterRequest'));
const requestMenu = [	
	{
		name: 'Assigned',
		path: '/requests/assigned',
		icon: 'fa fa-angle-right',
		class: 'tour-sideMenu-reporter-applicant',
		key: '/requests/assigned',
	},
]
// console.log(localStorage.getItem('isApplicant'))
// console.log(requestMenu)
const AppplicantRouts = [
	{
		//: '/myRequest/1',
		name: 'Requests',
		path: '/requests/assigned',
		component: ReporterRequest,
		icon: 'myRequest',
		isVisible: true,
		key: 'requests',
		classList: 'tour-navbar-requests',
		children: requestMenu
	},
	{
		name: 'Marketplace',
		icon: 'marketplace',
		path: '/marketplace/full',
		class: 'reporter-dropdown',
		key: 'marketplace',
		isVisible: true,
		children: [
			{
				name: 'Proposal',
				path: '/marketplace/proposal',
				icon: 'fa fa-angle-right',
				class: 'tour-sideMenu-reporter-invitation',
				key: '/marketplace/proposal',
			},
			{
				name: 'Full',
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

export default AppplicantRouts;
