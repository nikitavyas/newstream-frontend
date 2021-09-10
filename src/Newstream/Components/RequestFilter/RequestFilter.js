import { Checkbox, Radio, Input, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import './RequestFilter.css';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { withApollo } from 'react-apollo';
import { GET_REQUEST_FILTER } from '../../graphql/APIs';
import { message } from 'antd';
import { captureException as SentryError } from '@sentry/react';
import { CloseOutlined } from '@ant-design/icons';

const { Search } = Input;

const ActivityOptions = [
	{ label: 'Assigned', value: 'Assigned', key: '1' },
	{ label: 'Open', value: 'Open', key: '2' },
];

let RequestFilter = (props) => {
	let pathname = props.location.pathname;
	let requestType = '';
	if (pathname.search('/myRequest/') != -1) {
		requestType = pathname.replace('/myRequest/', '');
	}

	let params = queryString.parse(props.location.search);
	let type = [];
	if (params.isAssigned) {
		type.push('Assigned');
	}
	if (params.isOpen) {
		type.push('Open');
	}
	const [searchFilter, setSearchFilter] = useState(
		params.search ? params.search : ''
	);
	const [typeFilter, setTypeFilter] = useState(type ? type : [-1]);
	const [timeFilter, setTimeFilter] = useState(params.time ? params.time : -1);
	const [allTimeFilter, setAllTimeFilter] = useState([]);
	const [allFilters, setAllFilters] = useState([]);
	const [isLoaded, setisLoaded] = useState(false);

	useEffect(() => {
		requestTimeFilter();
	}, []);

	const onLoadFilter = (timeFilters) => {
		let filters = [];
		let params = queryString.parse(props.location.search);
		if (params.time) {
			
			let selectedFitler = timeFilters.filter((data) => {
				return data.slug === params.time;
			});
			filters.push({
				title: selectedFitler[0].title,
				value: selectedFitler[0].slug,
				type: 'time',
			});
		}
		if (params.isAssigned) {
			filters.push({
				title: 'Is Assigned',
				value: 'Assigned',
				type: 'type',
			});
		}
		if (params.isOpen) {
			filters.push({
				title: 'Is Open',
				value: 'Open',
				type: 'type',
			});
		}
		// console.log(filters);
		setAllFilters(filters);
		setisLoaded(true);
	};
	const clearFilterByValue = (index, type) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (index === null) {
			search_params.delete('isOpen');
			search_params.delete('isAssigned');
			search_params.delete('time');
			search_params.delete('search');
			setAllFilters([]);
		} else {
			let data = allFilters[index];
			allFilters.splice(index, 1);

			if (data.type == 'time') {
				search_params.delete('time');
				setTimeFilter(null);
			} else if (data.type == 'type') {
				let typeFilters = typeFilter;
				var index = typeFilters.indexOf(data.value);
				if (index !== -1) {
					typeFilters.splice(index, 1);
				}
				setTypeFilter(typeFilters);
				if (data.value === 'Assigned') {
					allFilters.splice(index, 0);

					search_params.delete('isAssigned');
					typeFilter.splice();
				} else if (data.value === 'Open') {
					search_params.delete('isOpen');
				}
			}
		}
		url.search = search_params.toString();
		var new_url = url.toString();
		props.history.push('/myRequest/' + requestType + url.search);
	};
	const onTimeFilter = (event) => {
		let filters = [];
		setTimeFilter(event.target.value);
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if(event.target.value == -1){
			search_params.delete('time')
		}else{
			search_params.set('time',event.target.value);
		}
		let params = queryString.parse(props.location.search);
		const filterData = allTimeFilter.filter((data) => {
			return data.slug === event.target.value;
		});

		// filters.push({
		// 	title: filterData[0].title,
		// 	value: filterData[0].slug,
		// 	type: 'time',
		// });

		// if (params.isAssigned) {
		// 	filters.push({
		// 		title: 'is Assigned',
		// 		value: 'Assigned',
		// 		type: 'type',
		// 	});
		// }
		// if (params.isOpen) {
		// 	filters.push({
		// 		title: 'is Open',
		// 		value: 'Open',
		// 		type: 'type',
		// 	});
		// }
		// setAllFilters(filters);
		url.search = search_params.toString();
		var new_url = url.toString();
		props.history.push('/myRequest/' + requestType + url.search);
	};
	// 	const onStatusFilter = (event) => {

	// 		console.log(window.location.href)
	// 		console.log(props)
	// 		setStatusFilter(event.target.value)
	// 		var url = new URL(window.location.href);
	// 		var search_params = url.searchParams;
	// 		if(event.target.value === '2'){

	// 		search_params.set('isPurchased', true);
	// 		}else{
	// 		search_params.delete('isPurchased', true);
	// 		}

	// 		url.search = search_params.toString();
	// 		var new_url = url.toString();
	// 		var tabId = new_url.substr( new_url.indexOf('?')-1, 1);
	// 		props.history.push('/myRequest/'+tabId+ url.search);
	// }
	const onTypeFilter = (event) => {
		let filters = [];
		setTypeFilter(event);
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (event.length > 0) {
			search_params.delete('isAssigned');
			search_params.delete('isOpen');
			event.map((data) => {
				if (data === 'Assigned') {
					search_params.set('isAssigned', true);
					filters.push({
						title: 'is Assigned',
						value: 'Assigned',
						type: 'type',
					});
				} else if (data === 'Open') {
					search_params.set('isOpen', true);
					filters.push({
						title: 'is Open',
						value: 'Open',
						type: 'type',
					});
				}
			});
		} else {
			search_params.delete('isAssigned');
			search_params.delete('isOpen');
		}
		let params = queryString.parse(props.location.search);
		if (params.time) {
			const filterData = allTimeFilter.filter((data) => {
				return data.slug === params.time;
			});

			filters.push({
				title: filterData[0].title,
				value: filterData[0].slug,
				type: 'time',
			});
		}
		setAllFilters(filters);
		url.search = search_params.toString();
		var new_url = url.toString();
		var tabId = new_url.substr(new_url.indexOf('?') - 1, 1);
		props.history.push('/myRequest/' + requestType + url.search);
	};
	const onSearchFilter = (event) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.set('search', searchFilter);

		url.search = search_params.toString();
		var new_url = url.toString();
		var tabId = new_url.substr(new_url.indexOf('?') - 1, 1);
		props.history.push('/myRequest/' + requestType + url.search);
	};
	const onChangeFilter = (event) => {
		// console.log(event.target.value);
		setSearchFilter(event.target.value);
		if (event.target.value === '') {
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			search_params.delete('search');
			url.search = search_params.toString();
			var new_url = url.toString();
			window.history.replaceState(null, null, new_url);
		}
	};
	const clearAll = () => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		setSearchFilter(null);
		setTypeFilter(null);
		setTimeFilter(null);
		setAllFilters([]);

		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		search_params.delete('time');
		search_params.delete('search');
		search_params.delete('page');
		search_params.delete('isAssigned');
		search_params.delete('isOpen');

		url.search = search_params.toString();
		var new_url = url.toString();
		props.history.push('/myRequest/' + requestType  + url.search);
	};
	const requestTimeFilter = () => {
		try {
			const { client } = props;
			client
				.query({
					query: GET_REQUEST_FILTER,
					//fetchPolicy: "cache-and-network",
					//variables: variables	
				})
				.then(({ data, loading }) => {
					loading = loading;

					if (data !== undefined) {
						let filterData = data.getRequestFilter.filter((data) => {
							return data.slug === 'time';
						});
						setAllTimeFilter(filterData[0].filters);
						onLoadFilter(filterData[0].filters);
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	};

	return (
		isLoaded && (
			<div className="filterSection show">
				<div className="filter-card">
					<div className="d-flex flex-row justify-content-between">
						<h6 className="">Filters</h6>
						<div onClick={clearAll} type="link" className="clear-button">
							CLEAR ALL
						</div>
					</div>
					<div id="selectedFilter" className="selectedFilter ">
						<div className="selectedFiltertags" id="test">
							{/* {allFilters.map((data, index) => {
								return (
									<Tag key={index}>
										{' '}
										<CloseOutlined
											onClick={(e) => clearFilterByValue(index, data.type)}
										/>{' '}
										<span>{data.title}</span>{' '}
									</Tag>
								);
							})} */}
						</div>
					</div>
					<div className="topSearch">
						<Search
							placeholder="Search"
							allowClear
							enterButton
							onSearch={(e) => onSearchFilter(e)}
							onChange={(e) => onChangeFilter(e)}
							value={searchFilter}
						/>
					</div>
					<div className="filterByCatagory">
						<div className="filterbox border-0 pt-1">
							<h6>By Time</h6>
							<div className="d-flex flex-column">
								<Radio.Group
									className="d-flex flex-column"
									onChange={(e) => onTimeFilter(e)}
									value={timeFilter}
									>
									<Radio  value={-1}>
										All
									</Radio>
									{allTimeFilter.map((filter, index) => (
										<Radio  key={index} name="type" value={filter.slug}>
											{filter.title}
										</Radio>
									))}
								</Radio.Group>
							</div>
						</div>

						{/* <div className="filterbox border-0 pt-1">
							<h6>By Type</h6>
							<div className="d-flex flex-column categories_blk">
								<div className="categories_list">
									<Checkbox.Group
										onChange={(e) => onTypeFilter(e)}
										value={typeFilter}
										options={ActivityOptions}></Checkbox.Group>
								</div>
							</div>
						</div> */}
						{/* <div className="filterbox">
						<h6>By Status</h6>
						<div className="d-flex flex-column">
							<Radio.Group
								className="d-flex flex-column"
								onChange={(e) => onStatusFilter(e)}
								value={statusFilter}>
								<Radio key="1" name="type" value="1">
									All
								</Radio>
								<Radio key="2" name="type" value="2">
									Purchased
								</Radio>
							</Radio.Group>
						</div>
					</div> */}
					</div>
				</div>
			</div>
		)
	);
};
RequestFilter = withRouter(RequestFilter);
RequestFilter = withApollo(RequestFilter);
export { RequestFilter };
