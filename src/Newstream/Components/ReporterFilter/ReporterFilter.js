import {  Input } from 'antd';
import React, { useState } from 'react';
import './ReporterFilter.css';
import {  withRouter } from 'react-router-dom';
import queryString from 'query-string';

const { Search } = Input;

let ReporterFilter = (props) => {
	let pathname = props.location.pathname;
	let params = queryString.parse(props.location.search);
	const [searchText, setSearchText] = useState(
		params.search ? params.search : ''
	);
	let type = '';
	if (pathname.search('/reporters/') !== -1) {
		type = pathname.replace('/reporters/', '');
	}	
	const onSearchFilter = (event) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.set('search', searchText);
		url.search = search_params.toString();
		props.history.push('/reporters/' + type + url.search);
	};
	const onChangeFilter = (event) => {
		setSearchText(event.target.value);
		if (event.target.value === '') {
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.delete('search');
			url.search = search_params.toString();
			props.history.push('/reporters/' + type + url.search);
		}
	};
	return (
		<div className="filterSection show">
			<div className="filter-card">
				<div className="topSearch">
					<Search
						placeholder="Search by keyword..."
						allowClear
						onChange={(e) => onChangeFilter(e)}
						onSearch={(e) => onSearchFilter(e)}
						value={searchText}
						enterButton
					/>
				</div>
			</div>
		</div>
	);
};
ReporterFilter = withRouter(ReporterFilter);
export { ReporterFilter };
