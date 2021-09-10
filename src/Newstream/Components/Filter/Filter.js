import {
	Checkbox,
	Collapse,
	Radio,
	Input,
	Tag,
	Rate
} from 'antd';
import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import {
	CloseOutlined
} from '@ant-design/icons';
import './Filter.css';
import { TreeSelect } from 'antd';
import { CustIcon } from '../Svgs';
import { withRouter } from 'react-router-dom';
import { GET_ALL_STORY_FILTERS } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import { message } from 'antd';
import { captureException as SentryError } from '@sentry/react';
import { GET_STORIES } from '../../graphql/APIs';
import { Loader } from '../Loader';
import { Marketplace } from '../../Pages/Marketplace/Marketplace';

const { Search } = Input;
const mediaOptions = [
	{ label: 'Image', value: 'image' },
	{ label: 'Video', value: 'video' },
	{ label: 'Audio', value: 'audio' },
	{ label: 'Live', value: 'live' },
	{ label: 'Article', value: 'article' },
	{ label: 'Raw', value: 'raw' }
];
let Filter = (props) => {
	let pathname = props.location.pathname;
	let type = '';
	if (pathname.search('/marketplace/') != -1) {
		type = pathname.replace('/marketplace/', '');
	}
	let params = queryString.parse(props.location.search);
	let categoriesFilter = params.categories ? params.categories.split(',') : [-1];
	const [itemsToShow, setItemsToShow] = useState(2);
	const [expanded, setExpanded] = useState(false);
	const [searchText, setSearchText] = useState(
		params.search ? params.search : ''
	);
	const [marketplaceFilter, setMarketPlaceFilter] = useState(type);
	const [purchasedFilter, setPurchasedFilter] = useState(
		params.isPurchased && params.isPurchased === 'true' ? '2' : '1'
	);
	const [allpurchasedFilter, setAllPurchasedFilter] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedmedias, setSelectedMedias] = useState(
		params.type ? params.type.split(',') : []
	);
	const [selectedCategories, setSelectedCategories] = useState(categoriesFilter);
	const [timeFilters, setTimeFilter] = useState(params.time ? params.time : -1);
	const [allTimeFilter, setAllTimeFilter] = useState([]);
	const [milestoneFilter, setMileStoneFilter] = useState(
		params.distance ? params.distance : -1
	);
	const [allMileStoneFilter, setAllMileStoneFilter] = useState([]);
	const [selectedRatings, setSelectedRatings] = useState(params.rating ? params.rating : -1);
	const [allFilters, setAllFilters] = useState([]);
	const [categorySearchText, setCategorySearchText] = useState(
		params.search ? params.search : ''
	);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [allCategories, setAllCategories] = useState([]);
	const [id , setid] = useState([]);

	const filterByTypeOptions = [
		{ label: 'Assigned', value: 'isAssigned' },
		{ label: 'Open', value: 'isOpen' },
	];
	let filters = [];

	useEffect(() => {
		requestStoriesFilter();
	}, []);

	/**
	 * onCategoryFilterChange
	 * Function call when Select category from checkbox
	 * @param {*} e
	 * return 
	 */
	 const onCategoryFilterChange = (e) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		let filters = allFilters;

		/* checking filters length*/ 
		if (filters.length > 0) {
			filters = filters.filter((data) => {
				return data.type !== 'category'
			})
		}
		if (e.length > 0) {
			var result = categories.filter(function (o1) {
				return e.some(function (o2) {
					return o1.value === o2; // return the ones with equal id
				});
			});
            
			let newUrl = '/marketplace/';
			if (marketplaceFilter != null) {
				newUrl += marketplaceFilter;
			}
			/*set new url with categories and concat new url*/
			search_params.set('categories', e.join(','));
			result.concat(categories);

            
			result.map((data, index) => {
				/*add title,value and type to update Filters*/
				filters.push({
					title: data.label,
					value: data.value,
					type: 'category',
				});
			});
		} else {
			/*delete categories from Url*/
			search_params.delete('categories');
		}
		/*Set updated category to selected category */
		setSelectedCategories(e);

		/*Set Selected Filters to AllFilters */
		setAllFilters(filters);
		url.search = search_params.toString();
		/*push updatd url to set url */
		props.history.push('/marketplace/' + type + url.search);
	};

/**
 * onMilesFilter
 * Function call applying miles Filter
 * this Function will apply miles Filter on stories and set updated Url.
 * @param {*} event 
 * return
 */
	const onMilesFilter = (event) => {
		let filters = allFilters;
		/*update selected Filter */
		setMileStoneFilter(event.target.value);
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		/*set distance paramter in url for applying distance Filter */
		if(event.target.value == -1){
			search_params.delete('distance')
		}else{
			search_params.set('distance', event.target.value);
		}
		const filterData = allMileStoneFilter.filter((data) => {
			return data.title === event.target.value;
		});
		/*Checking length of selected Filters and compare with distnace Filter type*/
		if (filters.length > 0) {
			filters = filters.filter((data) => {
				return data.type !== 'distance'
			})
		}
		/*Set Updated data in Filters*/
		// filters.push({
		// 	title: filterData[0].title,
		// 	value: filterData[0].slug,
		// 	type: 'distance',
		// });
		/*Set Updated data in allFilters */
		// setAllFilters(filters);

		url.search = search_params.toString();
		/*Set new url and push updated url*/
		props.history.push('/marketplace/' + type + url.search);
	};
	// const onFilterByTypeChangeClick = (e) => {
	// 	var url = new URL(window.location.href);
	// 	var search_params = url.searchParams;
	// 	if (e.target.value === '2') {
	// 		search_params.set('isPurchased', true);
	// 	} else {
	// 		search_params.delete('isPurchased', true);
	// 	}

	// 	url.search = search_params.toString();
	// 	var new_url = url.toString();
	// 	window.history.replaceState(null, null, new_url);
	// };

/**
 * onSearchFilter
 * This Function call when Search Category
 * @param {*} event 
 * return
 */
	const onSearchFilter = (event) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		/*set searched text to the url*/
		search_params.set('search', searchText);
		url.search = search_params.toString();
		/*set new url and push updated url */
		props.history.push('/marketplace/' + type + url.search);
	};
	
	/**
	 * onChangeFilter
	 * This Function call when searched for category 
	 * @param {*} event
	 * return 
	 */
	const onChangeFilter = (event) => {
		/*set searched text for updating search text */
		setSearchText(event.target.value);

		/*Checking the condition for occur event is null or not */
		if (event.target.value === '') {
			var url = new URL(window.location.href);
			var search_params = url.searchParams;

			/*Delete Search text from url */
			search_params.delete('search');
			url.search = search_params.toString();

            /*set new Url and push updated url*/
			props.history.push('/marketplace/' + type + url.search);
		}
	};
	/**
	 * onPurchasedFilter
	 * This Function call when applying purchsed Filter 
	 * Function applying purchased Filter and set updated url to 
	 * @param {*} event 
	 */
	const onPurchasedFilter = (event) => {
		filters = allFilters;
		if (filters.length > 0) {
			filters = filters.filter((data) => {
				return data.type !== 'isPurchased'
			})
		}
		/*update selcted purchased Filter*/
		setPurchasedFilter(event.target.value);
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (event.target.value === '2') {
			/*set filters property */
			filters.push({
				title: 'Is Purchased',
				type: 'isPurchased',
			});
			/*Set Purchased Filter to url*/
			search_params.set('isPurchased', true);
		} else {
			/*Delete purchased Filter from url */
			search_params.delete('isPurchased', true);
		}
		/* update AllFilters */
		setAllFilters(filters);
		url.search = search_params.toString();
		/*set new url and push updated url */
		props.history.push('/marketplace/' + type + url.search);
	};

/**
 * onTimeChange
 * This Function applying for time Filter
 * Function set selected Filter and Set new Url
 * @param {*} event 
 * return
 */

	const onTimeChange = (event) => {
		filters = allFilters;
		/*Checking the selected Filters length for applied Filter type */
		if (filters.length > 0) {
			filters = filters.filter((data) => {
				return data.type !== 'time'
			})
		}
		/* set as time Selected Filter*/
		setTimeFilter(event.target.value);
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		/*Set url for selected time Filter */
		if(event.target.value == -1){
			search_params.delete('time')
		}else{
			search_params.set('time', event.target.value);
		}
		let params = queryString.parse(props.location.search);
		const filterData = allTimeFilter.filter((data) => {
			return data.slug === event.target.value;
		});
		/*Set updated title,value and push updated property to the Filters */
		// filters.push({
		// 	title: filterData[0].title,
		// 	value: filterData[0].slug,
		// 	type: 'time',
		// });
		/*Set Updated filters to AllFilters */
		// setAllFilters(filters);
		url.search = search_params.toString();
        /*Set new url and update new url*/
		props.history.push('/marketplace/' + type + url.search);
	};

	/**
	 * requestStoriesFilter
	 * This Function call For get Filters from API call
	 * and Set Data from api.
	 */
	const requestStoriesFilter = () => {
		try {
			const { client } = props;
			let params = queryString.parse(props.location.search);
			let categoriesFilter = params.categories ? params.categories.split(',') : [];
			let typeFilter = params.type ? params.type.split(',') : [];
			let filters = [];
			client
				.query({
					query: GET_ALL_STORY_FILTERS,
					//fetchPolicy: "cache-and-network",
				})
				.then(({ data, loading }) => {
					loading = loading;
					if (data !== undefined) {
						if (data.getStoryFilters.categories) {
							let treeData = [];
							data.getStoryFilters.categories.forEach((singleCategory, index) => {
								treeData.push({
									label: singleCategory.title,
									value: singleCategory.slug,
									key: index,
								});
							});
							/*update categories from Api call data*/
							// console.log(treeData,"JJJJJJJJJJJJ");
							setid(treeData.key)
							setCategories(treeData);
							setAllCategories(treeData);

							if (categoriesFilter) {
								var result = treeData.filter(function (o1) {
									return categoriesFilter.some(function (o2) {
										return o1.value === o2; // return the ones with equal id
									});
								});
								result.map((data, index) => {
									/*Set title,value and type to the filters */
									filters.push({
										title: data.label,
										value: data.value,
										type: 'category',
									});
								});
							}
						}
						let filterData = data.getStoryFilters.storyFilters.map((data1,index) => {
							if (data1.slug === 'time') {
								/*set Time Filters to AlltimeFilters */
								setAllTimeFilter(data1.filters);
								if (params.time) {
									const filterData = data1.filters.filter((data) => {
										return data.slug === params.time;
									});
									if (filterData) {
										/*Set title,slug and type to the Filters */
										filters.push({
											title: filterData[0].title,
											value: filterData[0].slug,
											type: 'time',
										});
									}
								}
							} else if (data1.slug === 'distance') {
								/*Set selcted Miles Filter to the AllmilesFilter */
								setAllMileStoneFilter(data1.filters);
								if (params.distance) {
									const filterData = data1.filters.filter((data) => {
										return data.title === params.distance;
									});
									if (filterData) {
										/*Update filters by pushing title,value and type*/
										filters.push({
											title: filterData[0].title,
											value: filterData[0].slug,
											type: 'distance',
										});
									}
								}
							}
							return null
						});
						if (params.isPurchased) {
							/*set selected purchased filter in filters */
							filters.push({
								title: 'Is Purchased',
								type: 'isPurchased',
							});
						}
						if (typeFilter) {
							typeFilter.map((data,index) => {
								if (data === 'image') {
									/*set selected image Filter in the Filters */
									filters.push({
										title: 'Image',
										value: 'image',
										type: 'type',
									});
								} else if (data === 'video') {
									/*set selected video Filter in the Filters */
									filters.push({
										title: 'Video',
										value: 'video',
										type: 'type',
									});
								} else if (data === 'audio') {
									/*set selected Video filter in the Filters */
									filters.push({
										title: 'Audio',
										value: 'audio',
										type: 'type',
									});
								} else if (data === 'live') {
									/*Set Selected live filter in the Filters */
									filters.push({
										title: 'Live',
										value: 'live',
										type: 'type',
									});
								}else if (data === 'article') {
									/*Set Selected live filter in the Filters */
									filters.push({
										title: 'Article',
										value: 'article',
										type: 'type',
									});
								}
								else if (data === 'raw') {
									/*Set Selected live filter in the Filters */
									filters.push({
										title: 'Raw',
										value: 'raw',
										type: 'type',
									});
								}
							});
						}
						if (params.rating) {
							/*Set Selected rating Filter in Filters */
							filters.push({
								title: 'rating : ' + params.rating,
								type: 'rating',
							});
						}
						/*Set Selected Filters to AllFilters*/
						setAllFilters(filters)
					}
					setDataLoaded(true)
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
	/**
	 * onMediaFilter
	 * This Functionm call When select any media Filter
	 * Function set new Url with selected media Filter and show Selected Filter
	 * @param {*} event 
	 */
	const onMediaFilter = (event) => {
		let filters = allFilters;
		/*Checking Selected Filter length*/
		if (filters.length > 0) {
			filters = filters.filter((data) => {
				return data.type !== 'type'
			})
		}
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (event.length > 0) {
			let typeMedia = event.toString();
			/*Set selcted Filters type to the url */
			search_params.set('type', typeMedia);
			event.map((data,index) => {
				if (data === 'image') {
					filters.push({
						title: 'Image',
						value: 'image',
						type: 'type',
					});
				} else if (data === 'video') {
					filters.push({
						title: 'Video',
						value: 'video',
						type: 'type',
					});
				} else if (data === 'audio') {
					filters.push({
						title: 'Audio',
						value: 'audio',
						type: 'type',
					});
				} else if (data === 'live') {
					filters.push({
						title: 'Live',
						value: 'live',
						type: 'type',
					});
				} else if (data === 'artiical') {
					filters.push({
						title: 'Artical',
						value: 'artical',
						type: 'type',
					});
				}
			});
		} else {
			/*Delete Selected Filter from Url*/
			search_params.delete('type');
		}
		/*update Selected Filters to the AllFilters */
		setAllFilters(filters);
		/*Update Selected Media Filter to the selctedMedia*/
		setSelectedMedias(event);
		url.search = search_params.toString();
		/*Set New Url with updated Url*/
		props.history.push('/marketplace/' + type + url.search);
	};
	/**
	 * clearAll
	 * This Function call when Clear All Selected Filter and Set new url
	 */
	const clearAll = () => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		/*Clear All Selected Filters with set null value*/
		setSearchText(null);
		setMileStoneFilter(null);
		setSelectedCategories(null);
		setTimeFilter(null);
		setPurchasedFilter(null);
		setSelectedMedias(null);
		setSelectedRatings(null);
		setCategorySearchText(null);
		setAllPurchasedFilter(null);
		setAllFilters([]);
		setExpanded(false)
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
        /*Delete Selected Filters from Url*/
		search_params.delete('time');
		search_params.delete('search');
		search_params.delete('distance');
		search_params.delete('isPurchased');
		search_params.delete('type');
		search_params.delete('rating');
		search_params.delete('categories');

		url.search = search_params.toString();
		/*Set updated url and push new Url*/
		props.history.push('/marketplace/' + type + url.search);
	};

	const onCategorySearch = (e) => {
		let search = e.target.value;
		search = search.replace(/^\s+/g, '');
		setCategorySearchText(search);
		if (search != '') {
			const filteredData = allCategories.filter((item) => {
				let found = false;
				if (item.label.toLowerCase().indexOf(search.toLowerCase()) > -1) {
					found = true;
				}
				return found;
			});
			setCategories(filteredData);
		} else {
			setCategories(allCategories);
		}
	};

	/**
	 * onRatingFilter
	 * This function calls on rating filter change, 
	 * this function is used for applying rating filter
	 * @param {*} event 
	 * Return 
	 */
	const onRatingFilter = (event) => {
		try {
			let typeMedia = event.target.value.toString();
			var url = new URL(window.location.href);
			var search_params = url.searchParams;
			let filters = allFilters;

			/*Removing old rating filters from allFilters*/
			if (filters.length > 0) {
				filters = filters.filter((data) => {
					return data.type !== 'rating'
				})
			}

			/*Pushing event data to allfilters*/
			filters.push({
				title: 'rating : ' + event.target.value,
				type: 'rating',
			});
			/*Setting new seardch params for rating and calling updated url*/
			if(event.target.value == -1){
				search_params.delete('rating')
			}else{
				search_params.set('rating', typeMedia);
				/*Updating allfilters,selectedrating states*/
				setAllFilters(filters);
			}
			setSelectedRatings(event.target.value);
			url.search = search_params.toString();
			props.history.push('/marketplace/' + type + url.search);
		} catch (e) {

		}

	};

	const clearFilterByValue = (index, filterType) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (index === null) {
			/*Delete Selected Filter and Clear AllFilters*/
			search_params.delete('distance');
			search_params.delete('isPurchased');
			search_params.delete('time');
			search_params.delete('search');
			search_params.delete('type');
			search_params.delete('rating');
			search_params.delete('categories');
			setAllFilters([]);
		} else {
			let data = allFilters[index];
			allFilters.splice(index, 1);

			if (data.type == 'time') {
				search_params.delete('time');
				setTimeFilter(null);
			}
			if (data.type == 'distance') {
				search_params.delete('distance');
				setMileStoneFilter(null);
			}
			if (data.type == 'isPurchased') {
				search_params.delete('isPurchased');
				setPurchasedFilter(null);
			}
			if (data.type == 'rating') {
				search_params.delete('rating');
				setSelectedRatings(null);
			}
			if (data.type == 'category') {
				let params = queryString.parse(props.location.search);
				let selectcategory = params.categories.split(',');
				let filtercategory = selectcategory.filter((scat) => {
					return scat != data.value;
				});

				if (data.value) {
					let cdata = filtercategory.filter((data2) => {
						return data2 != data.value;
					});
					if (filtercategory.length > 0) {
						search_params.set('categories', filtercategory);
					} else {
						search_params.delete('categories');
					}
					setSelectedCategories(cdata);
				}
			}
			if (data.type == 'type') {
				let params = queryString.parse(props.location.search);
				let selectedurl = params.type.split(',');
				let filterdata = selectedurl.filter((fdata) => {
					return fdata != data.value;
				});
				if (data.value == 'image') {
					let img = selectedmedias.filter((data) => {
						return data != 'image';
					});
					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(img);
				}
				if (data.value == 'video') {
					let vd = selectedmedias.filter((data) => {
						return data != 'video';
					});

					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(vd);
				}
				if (data.value == 'audio') {
					let ad = selectedmedias.filter((data) => {
						return data != 'audio';
					});

					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(ad);
				}
				if (data.value == 'live') {
					let lv = selectedmedias.filter((data) => {
						return data != 'live';
					});

					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(lv);
				}
				if (data.value == 'article') {
					let ad = selectedmedias.filter((data) => {
						return data != 'article';
					});

					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(ad);
				}
				if (data.value == 'raw') {
					let ad = selectedmedias.filter((data) => {
						return data != 'raw';
					});

					if (filterdata.length > 0) {
						search_params.set('type', filterdata);
					} else {
						search_params.delete('type');
					}
					setSelectedMedias(ad);
				}

			}
		}

		url.search = search_params.toString();
		/*Set New Url with updated url*/
		props.history.push('/marketplace/' + type + url.search);
		return 'text';
	};

	const showMore = () => {
		if (itemsToShow === 2) {
			/*Set items for  to show show more option*/
			setItemsToShow(allFilters.length);
			setExpanded(true);
		} else {
			/*by default show 2 items */
			setItemsToShow(2);
			setExpanded(false);
		}
	};
	return (
		dataLoaded ? (
			
			<div className="filterSection show">
				<div className="filter-card">
					<div className="d-flex flex-row justify-content-between">
						<h6 className="">Filters</h6>
						<div onClick={clearAll} type="link" className="clear-button">
							{' '}
							CLEAR ALL{' '}
						</div>
					</div>
					<div id="selectedFilter" className="selectedFilter ">
						<div className="selectedFiltertags" id="test">
							{/* {allFilters.slice(0, itemsToShow).map((data, index) => {
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
						{/* {allFilters.length > 2 && (
							<a className="showmore my-2" onClick={showMore}>
								{expanded ? (
									<>Show less</>
								) : (
									<>Show more</>
								) }
							</a>
						)} */}
					</div>
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
					<div className="filterByCatagory">
						<div className="filterbox border-0">
							<h6>By Category</h6>
							<div className="d-flex flex-column categories_blk">
								{/* <div className="topSearch mb-3">
								<Search
									className="topSearch"
									placeholder="Search"
									value={categorySearchText}
									allowClear
									enterButton
									onChange={(value) => onCategorySearch(value)}
								/>
							</div> */}
								<div className="categories_list">
									<Checkbox.Group 
									    key ={id}
										options={categories}
										value={selectedCategories}
										onChange={(e) => onCategoryFilterChange(e)}
									/>
								</div>
							</div>
						</div>
						<div className="filterbox">
							<h6>By Miles</h6>
							<div className="d-flex flex-column">
								<Radio.Group 
									
									className="d-flex flex-column"
									onChange={(e) => onMilesFilter(e)}
										value={milestoneFilter}
									>
									<Radio key={-1} value={-1}>
										All
									</Radio>
									{allMileStoneFilter.map((filter, index) => (
										<Radio key={index} name="miles" value={filter.title}>
											{filter.title}
										</Radio>
									))}
									;
								</Radio.Group>
							</div>
						</div>
						<div className="filterbox">
							<h6>By Activity</h6>
							<div className="d-flex flex-column">
								<Radio.Group
									className="d-flex flex-column"
									onChange={(e) => onTimeChange(e)}
									value={timeFilters}>
								    <Radio value={-1}>
										All
									</Radio>
									{allTimeFilter.map((filter, index) => (
										<Radio key={index} name="Time" value={filter.slug}>
											{filter.title}
										</Radio>
									))}
									
									;
								</Radio.Group>
							</div>
						</div>
						<div className="filterbox">
							<h6>By Status</h6>
							<div className="d-flex flex-column">
								<Radio.Group
									className="d-flex flex-column"
									onChange={(e) => onPurchasedFilter(e)}
									value={purchasedFilter}>
									<Radio key="1" name="marketplace" value="1">
										All
									</Radio>
									<Radio key="2" name="marketplace" value="2">
										Purchased
									</Radio>
								</Radio.Group>
							</div>
						</div>
						<div className="filterbox">
							<h6>By Media</h6>
							<div className="d-flex flex-column categories_blk">
								<div className="categories_list">
									<Checkbox.Group
										// key ={index}
										options={mediaOptions}
										className="d-flex flex-column"
										value={selectedmedias}
										onChange={(e) => onMediaFilter(e)}
									/>
								</div>
							</div>
						</div>
						<div className="filterbox">
							<h6>By Ratings</h6>
							<div className="d-flex flex-column categories_blk">
								<div className="categories_list">
									<Radio.Group
										onChange={(e) => onRatingFilter(e)}
										value={selectedRatings}
										//defaultValue={-1}
										>
										<Radio value={-1}>
											All
										</Radio>
										<Radio value={1}>
											<Rate
												disabled
												defaultValue={1}
												character={<CustIcon type="staricon" />}
											/>{' '}
											{'   ' + '&' + ' ' + 'Up'}
										</Radio>
										<Radio value={2}>
											<Rate
												disabled
												defaultValue={2}
												character={<CustIcon type="staricon" />}
											/>
											{'   ' + '&' + ' ' + 'Up'}
										</Radio>
										<Radio value={3}>
											<Rate
												disabled
												defaultValue={3}
												character={<CustIcon type="staricon" />}
											/>
											{'   ' + '&' + ' ' + 'Up'}
										</Radio>
										<Radio value={4}>
											<Rate
												disabled
												defaultValue={4}
												character={<CustIcon type="staricon" />}
											/>
											{'   ' + '&' + ' ' + 'Up'}
										</Radio>
									</Radio.Group>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		) : <Loader />
	);
};
Filter = withApollo(Filter);
Filter = withRouter(Filter);
export { Filter };
