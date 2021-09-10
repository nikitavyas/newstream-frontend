import React from 'react';
const { MyRequest } = React.lazy(() => import('./../../Pages/MyRequest'));
const { Transactions } = React.lazy(() => import('./../../Pages/Transactions'));

const routes = [
	{
		name: 'Marketplace',
		icon: 'marketplace',
		path: '/marketplace/proposal',
		class: 'reporter-dropdown',
		key: 'marketplace',
		isVisible: true,
		children: [
			{
				name: 'Proposals',
				path: '/marketplace/proposal',
				// icon: 'fa fa-angle-right',
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
	},{
		//: '/myRequest/1',
		name: 'My Requests',
		path: '/myRequest/withProposal',
		component: MyRequest,
		icon: 'myRequest',
		isVisible: true,
		key: 'myRequest',
		classList: 'tour-navbar-requests',
		children: [
			{
				name: 'With Proposal',
				path: '/myRequest/withProposal',
				icon: 'fa fa-angle-right',
				class: 'tour-sideMenu-reporter-invitation',
				key: '/myRequest/withProposal',
			},
			{
				name: 'Without Proposal',
				path: '/myRequest/withoutProposal',
				icon: 'fa fa-angle-right',
				class: 'tour-sideMenu-reporter-applicant',
				key: '/myRequest/withoutProposal',
			},
			// {
			// 	name: 'Archived',
			// 	path: '/myRequest/archived',
			// 	icon: 'fa fa-angle-right',
			// 	class: 'tour-sideMenu-reporter-active',
			// 	key: '/myRequest/archived',
			// },
		],
	},
	// {
	// 	name: 'Reporters',
	// 	icon: 'reporters',
	// 	class: 'reporter-dropdown',
	// 	key: 'reporters',
	// 	isVisible: true,
	// 	path: '/reporters/active',
	// 	children: [
	// 		{
	// 			name: 'Active Reporters',
	// 			path: '/reporters/active',
	// 			icon: 'fa fa-angle-right',
	// 			class: 'tour-sideMenu-reporter-active',
	// 			key: '/reporters/active',
	// 		},
	// 		{
	// 			name: 'Applicants',
	// 			path: '/reporters/applicants',
	// 			icon: 'fa fa-angle-right',
	// 			class: 'tour-sideMenu-reporter-applicant',
	// 			key: '/reporters/applicants',
	// 		},
	// 		{
	// 			name: 'Invited',
	// 			path: '/reporters/invited',
	// 			icon: 'fa fa-angle-right',
	// 			class: 'tour-sideMenu-reporter-invitation',
	// 			key: '/reporters/invited',
	// 		},
	// 	],
	// },
	{
		name: 'Transactions',
		path: '/transactions',
		component: Transactions,
		icon: 'transactionicon',
		isVisible: true,
		key: 'transactions',
		classList: 'tour-navbar-requests',
	// 	children: [
	// 		{
	// 			name: 'Global',
	// 			path: '/transactions/global',
	// 			icon: 'fa fa-angle-right',
	// 			class: 'tour-sideMenu-reporter-invitation',	
	// 			key: '/transactions/global',
	// 		},
	// 		{
	// 			name: 'Inhouse',
	// 			path: '/transactions/inHouse',
	// 			icon: 'fa fa-angle-right',
	// 			class: 'tour-sideMenu-reporter-applicant',
	// 			key: '/transactions/inHouse',
	// 		},
	// 	],
	},	
];

export default routes;
