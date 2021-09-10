const { override, fixBabelImports, addLessLoader } = require('customize-cra');

module.exports = override(
	fixBabelImports('import', {
		libraryName: 'antd',
		libraryDirectory: 'es',
		style: true,
	}),
	addLessLoader({
		javascriptEnabled: true,
		modifyVars: {
			'@primary-color': '#7721D1',
			'@white': '#ffffff',
			'@black': '#000000',
			'@light-blue': '#A3CDFD',
			'@blue-color2': '#DFDFFA',
			'@text-color2': '#737389',
			'@font-family': '"Lato", sans-serif !important',
			'@font-size-base': '14px',
			'@font-size-sm': '0.928em',
			'@text-color': '#2B2B2B',
			'@border-radius-base': '4px',
			'@border-color-base': '#A2A2A2',
			'@layout-body-background': '#ffffff',
			'@layout-header-background': '#Ffffff',

			'@menu-dark-color': '@text-color-secondary-dark',
			'@menu-dark-bg': '@primary-color',
			'@menu-dark-highlight-color': '@black',
			'@menu-dark-selected-item-text-color': '#7721D1',
			'@menu-item-active-bg': '#FAF5FF',

			'@input-height-base': '40px',
			'@breadcrumb-base-color': '@text-color2',
			'@breadcrumb-last-item-color': '@text-color',
			'@breadcrumb-font-size': '0.858em',

			'@btn-primary-color': '@white',
			'@btn-primary-bg': '@primary-color',
			'@btn-default-color': '@text-color',
			'@btn-default-border': '@text-color',

			'@tabs-highlight-color': '@text-color',
			'@tabs-horizontal-padding': '10px 16px',
			'@tabs-title-font-size': '1.2857em',
		},
	})
);
