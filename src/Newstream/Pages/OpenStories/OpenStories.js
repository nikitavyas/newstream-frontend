import React, { Component } from 'react';
import './OpenStories.css';
import { StoryTopMenu } from '../../Components/StoryTopMenu';
import { StoryBox } from '../../Components/StoryBox';
import { Row, Col, Card, Pagination, Empty } from 'antd';
import { GoogleMap } from '../../Components/GoogleMap';
import { withApollo } from 'react-apollo';
import { GET_STORIES } from '../../graphql/APIs';
// import {getStoryMediaCount} from '../../Components/general/getStoryMediaCount';
import { Loader } from '../../Components/Loader/Loader';
import { analytics } from '../../utils/init-fcm';

const LIMIT = 5;

class OpenStories extends Component {
	constructor(props) {
		super(props);
		this.state = {
			stories: [],
			showMap: false,
			timeFilters: [],
			filterId: '',
			isPurchased: false,
			isOpen: false,
			isAssigned: false,
			loaded: false,
			showPopup: false,
			currentPage: 1,
		};
		this.onListViewClick = this.onListViewClick.bind(this);
		this.onFilterChange = this.onFilterChange.bind(this);
		this.onFilterTypeChange = this.onFilterTypeChange.bind(this);
		this.onPaginationChange = this.onPaginationChange.bind(this);
	}
	getData(variables) {
		const { client } = this.props;
		client
			.query({
				query: GET_STORIES,
				variables: variables,
				fetchPolicy: 'network-only',
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					data.getAllstoryWeb.stories.forEach((result) => {
						result.show = false;
						if (result.isIndependant) {
							result.type = 'Breaking';
						} else {
							if (result.request.isOpen) {
								result.type = 'Open';
							} else {
								result.type = 'Assigned';
							}
						}
						result.storyMediaCount = {
							video: result.storyMediaWeb.videos.length,
							audio: result.storyMediaWeb.audios.length,
							image: result.storyMediaWeb.images.length,
						};
					});
					this.setState({
						loaded: true,
						stories: data.getAllstoryWeb.stories,
						timeFilters: data.getAllstoryWeb.storyFilters[0].filters,
						storyCount: data.getAllstoryWeb.storyCount,
					});
				}
			});
	}
	onListViewClick() {
		analytics.logEvent('viewMode', {
			action: this.state.showMap ? 'list' : 'map',
		});
		this.setState({
			showPopup: false,
			currentPage: 1,
		});
		this.setState({ showPopup: false, showMap: !this.state.showMap }, () => {
			let variables = {};
			if (this.state.isPurchased === true) {
				variables['isPurchased'] = true;
			}
			if (this.state.isAssigned === true && this.state.isOpen === false) {
				variables['isAssigned'] = true;
			}
			if (this.state.isOpen === true && this.state.isAssigned === false) {
				variables['isOpen'] = true;
			}
			variables['isRequested'] = true;
			variables['time'] = this.state.filterId;
			if (!this.state.showMap) {
				variables['page'] = 1;
				variables['limit'] = LIMIT;
			}
			this.getData(variables);
		});
	}
	onPaginationChange = (key) => {
		analytics.logEvent('pager', {
			action: 'clickPageNumber',
			label: 'page',
			value: key,
		});
		this.setState({ currentPage: key });
		let variables = {};
		if (this.state.isPurchased === true) {
			variables['isPurchased'] = true;
		}
		if (this.state.isAssigned === true && this.state.isOpen === false) {
			variables['isAssigned'] = true;
		}

		if (this.state.isOpen === true && this.state.isAssigned === false) {
			variables['isOpen'] = true;
		}
		variables['isRequested'] = true;
		variables['time'] = this.state.filterId;
		if (!this.state.showMap) {
			variables['page'] = key;
			variables['limit'] = LIMIT;
		}
		this.getData(variables);
	};
	onFilterChange = (event) => {
		this.setState({
			showPopup: false,
			currentPage: 1,
		});
		this.setState({
			filterId: event.target.value,
		});
		let variables = {};
		variables['time'] = event.target.value;
		variables['isRequested'] = true;
		if (!this.state.showMap) {
			variables['page'] = 1;
			variables['limit'] = LIMIT;
		}
		this.getData(variables);
	};
	onFilterTypeChange = (event) => {
		const name = event.target.name;
		analytics.logEvent('filters', {
			action: 'set',
			label: 'filterByStatus',
			value: name,
		});
		this.setState({
			showPopup: false,
			currentPage: 1,
		});
		let state = {};
		state[name] = event.target.checked;
		this.setState(state, () => {
			let variables = {};
			if (this.state.isPurchased === true) {
				variables['isPurchased'] = true;
			}
			if (this.state.isAssigned === true && this.state.isOpen === false) {
				variables['isAssigned'] = true;
			}

			if (this.state.isOpen === true && this.state.isAssigned === false) {
				variables['isOpen'] = true;
			}
			variables['isRequested'] = true;
			if (!this.state.showMap) {
				variables['page'] = 1;
				variables['limit'] = LIMIT;
			}
			variables['time'] = this.state.filterId;
			// const variables = { name : event.target.value,isIndependant:false,
			//   "time" : this.state.filterId}
			this.getData(variables);
		});
	};
	// onChildClick callback can take two arguments: key and childProps
	onChildClickCallback = async (key) => {
		// this.setState((state) => {
		//   const index = state.stories.findIndex(e => e.id === key);
		//   state.stories[index].show = !state.stories[index].show; // eslint-disable-line no-param-reassign
		//   return { stories: state.stories };
		// });
		this.setState(
			{
				showPopup: key,
			},
			() => {
				return true;
			}
		);
	};
	componentDidMount() {
		const variables = { isRequested: true, page: 1, limit: LIMIT };
		this.getData(variables);
	}
	render() {
		return (
			<React.Fragment>
				{this.state.loaded ? (
					<div className="container pt-3">
						{this.state.timeFilters.length > 0 && (
							<StoryTopMenu
								type="requested"
								title="Requested Stories"
								timeFilters={this.state.timeFilters}
								isMapView={this.state.showMap}
								onListViewClick={this.onListViewClick}
								onFilterChange={this.onFilterChange}
								onFilterTypeChange={this.onFilterTypeChange}
								filterId={this.state.filterId}
							/>
						)}
						{this.state.showMap ? (
							<Row>
								<Col span={24}>
									<div className="googleMap_blk">
										<GoogleMap
											client={this.props.client}
											type="story"
											popup={this.state.showPopup}
											stories={this.state.stories}
											onChildClickCallback={(e) => this.onChildClickCallback(e)}
										/>
									</div>
								</Col>
							</Row>
						) : (
							<div>
								<Row>
									<Col span={24}>
										{this.state.stories.length > 0 ? (
											this.state.stories.map((story) => (
												<StoryBox stories={story} key={story.storyId} />
											))
										) : (
											<Card className="mt-3">
												<Empty description={<span>No data available</span>} />
											</Card>
										)}
									</Col>
								</Row>
								<Row>
									<Col
										span={24}
										className="d-flex flex-row justify-content-end pt-3">
										<Pagination
											onChange={this.onPaginationChange}
											pageSize={LIMIT}
											current={this.state.currentPage}
											total={this.state.storyCount}
										/>
									</Col>
								</Row>
							</div>
						)}
					</div>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}
OpenStories = withApollo(OpenStories);
export { OpenStories };
