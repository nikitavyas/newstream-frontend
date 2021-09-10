
import React, { Component, createRef } from 'react';
import './AddRequest.css';
import {
	Row,
	Col,
	Form,
	Input,
	Select,
	DatePicker,
	Checkbox,
	Radio,
	Typography,
	Card,
	Button,
	Modal,
	Tooltip,
	InputNumber,
	Spin,
	message,
	Empty
} from 'antd';
import { TreeSelect } from 'antd';
import {
	EnvironmentFilled,
	ExclamationCircleOutlined,
} from '@ant-design/icons';
import { CustIcon } from '../../Components/Svgs/Svgs';
import { withApollo } from 'react-apollo';
import ReporterGoogleMap from '../../Components/ReporterGoogleMap/ReporterGoogleMap';
import {
	SAVE_REQUEST,
	GET_ALL_REPORTERS_WEB,
	GET_REQUEST_BY_ID,
	ARCHIVE_REQUEST,
	UPDATE_REQUEST,
} from '../../graphql/APIs';
import moment from 'moment';
import { MAPBOXTOKEN } from '../../Components/general/constant';
import { GET_SETTINGS } from '../../graphql/APIs';
import { Loader } from '../../Components/Loader/Loader';
import axios from 'axios';
import { analytics } from '../../utils/init-fcm';
import { OnboardingTour } from '../../Components/OnboardingTour/OnboardingTour';
import { Helmet } from 'react-helmet';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { getAddress } from '../../Components/general/general';
import { Redirect } from 'react-router';
import { NotFound } from '../NotFound';
const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;
const { SHOW_ALL } = TreeSelect;

const options = [
	{ label: 'Video', value: 'video' },
	{ label: 'Audio', value: 'audio' },
	{ label: 'Photo', value: 'photo' },
	{ label: 'Article', value: 'article' },
	{ label: 'Raw Data', value: 'raw' },
];
const isLiveOptions = [{ label: 'Live', value: 'isLiveChecked' }];
class AddRequests extends Component {
	constructor(props) {
		console.log('props', props)
		analytics.setCurrentScreen('/addNewRequest');
		super(props);
		this.inputRef = createRef();
		this.formRef = createRef();
		this.state = {
			value: '',
			showReporter: false,
			selectedReported: [],
			isReporterMenuOpen: false,
			showReporterModel: false,
			reporters: [],
			requestId: null,
			initialvalues: { request_type: true, reminder: '30_min', notes: '' },
			location: null,
			lat: null,
			lng: null,
			minPrice: 1,
			maxPrice: null,
			priceMessage: null,
			loaded: false,
			isSubmitted: false,
			mapViewReporters: [],
			countryData: [],
			countryValue: '',
			fetchingLocation: false,
			isLiveChecked: false,
			isAccepted: false,
			isPurchased: 0,
			isArchivedLoading: false,
			show404: false
		};
		this.selectAllReporter = this.selectAllReporter.bind(this);
		this.deSelectAllReporter = this.deSelectAllReporter.bind(this);
		this.onDropdownVisibleChange = this.onDropdownVisibleChange.bind(this);
		this._suggestionSelect = this._suggestionSelect.bind(this);
		this.moveToArchive = this.moveToArchive.bind(this);
		this.OnReporterFilterChange = this.OnReporterFilterChange.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}
	formRef = React.createRef();

	componentDidUpdate(prevProps, prevState, countryData) {
		if (prevProps == undefined) {
			return false;
		}
		// console.log(this.state.requestId)
		// console.log(this.props.match.params.id)
		if (
			this.state.requestId != this.props.match.params.id &&
			this.props.match.params.id == undefined
		) {
			SentryLog({
				category: 'page',
				message:
					'Edit Request Page Loaded with id - ' + this.props.match.params.id,
				level: Severity.Info,
			});

			this.formRef.current.resetFields();
			this.setState({
				value: '',
				showReporter: false,
				selectedReported: [],
				isReporterMenuOpen: true,
				showReporterModel: false,
				requestId: null,
				initialvalues: { request_type: true, reminder: '30_min', notes: '' },
				countryData: [],
				countryValue: '',
				isAccepted: false,
			});

		}
	}
	componentDidMount() {
		SentryLog({
			category: 'Add New Request',
			message: 'Add New Request Page Loaded',
			level: Severity.Info,
		});
		this.setState({ loaded: false });

		if (this.props.match.params.id != null) {
			SentryLog({
				category: 'page',
				message:
					'Edit Request Page Loaded with id - ' + this.props.match.params.id,
				level: Severity.Info,
			});
			this.getData();
		}
		if(!this.props.match.params.storyId){
			this.getAllReporterData(null, null );
		}else{

		}
		const { client } = this.props;
		client
			.watchQuery({
				query: GET_SETTINGS,
				fetchPolicy: 'network-only',
			})
			.subscribe(({ data, loading, error }) => {
				this.loading = loading;
				if (data !== undefined) {
					SentryLog({
						category: 'Add New Request',
						message: 'Get setting api called and retrieved successfully',
						level: Severity.Info,
					});
					const msg =
						'Price must be between ' +
						data.getUserSettings.requestMinPrice +
						' to ' +
						data.getUserSettings.requestMaxPrice;
					this.setState({
						minPrice: data.getUserSettings.requestMinPrice,
						maxPrice: data.getUserSettings.requestMaxPrice,
						priceMessage: msg,
						loaded:true
					});
				}
				if (
					this.props.match.params.id == null ||
					this.props.match.params.id == undefined
				) {
					// this.formRef.current.setFieldsValue({
					// 	reminder: '30_min',
					// });
				}
				if (error) {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				}
			});
	}
	getData() {
		this.setState({ loaded: false });
		const { client } = this.props;
		client
			.query({
				query: GET_REQUEST_BY_ID,
				fetchPolicy: 'network-only',
				variables: {
					requestId: this.props.match.params.id,
				},
			})
			.then(({ data, loading }) => {
				this.loading = loading;
				if (data !== undefined) {
					SentryLog({
						category: 'Add New Request',
						message:
							`Retrieved request data by id - ` + this.props.match.params.id,
						level: Severity.Info,
					});
					if (data.getRequest != null) {
						this.setState(
							{ loaded: true, isLiveChecked: data.getRequest.isLive },
							() => {
								const expiryDate = moment(
									new Date(parseFloat(data.getRequest.expiryDateTime))
								);
								const scheduleDate =
									data.getRequest.scheduleDate != null
										? moment(new Date(parseFloat(data.getRequest.scheduleDate)))
										: null;
								let media = [];
								let isLive = [];
								if (data.getRequest.isAudio) {
									media.push('audio');
								}
								if (data.getRequest.isVideo) {
									media.push('video');
								}
								if (data.getRequest.isImage) {
									media.push('photo');
								}
								if (data.getRequest?.isArticle) {
									media.push('article');
								}
								if (data.getRequest?.isRaw) {
									media.push('raw');
								}
								if (data.getRequest.isLive) {
									isLive.push('isLiveChecked');
								}
								// console.log(this.formRef)
								// console.log(data.getRequest.price,"JJJJJJJJJJJJJJJJ");
								this.formRef.current.setFieldsValue({
									request_type: data.getRequest.isOpen,
									title: data.getRequest.title,
									notes: data.getRequest.note,
									location: data.getRequest.location,
									isOpen: data.getRequest.isOpen,
									price: data.getRequest.price,
									media: media,
									isLive: isLive,
									expiryDateTime: expiryDate,
									scheduleDate: scheduleDate,
									reminder: data.getRequest.reminder,
								});
								let reportData = [];
								data.getRequest.newsrequest_users.length > 0 &&
									data.getRequest.newsrequest_users.map((tree) => {
										if (tree.user != null) {
											reportData.push({
												value: tree.user.userId,
												label: tree.user.name,
												isDetault: true,
												checked: true,
												isAccepted: tree.isAccepted ? tree.isAccepted : false,
											});
										}
									});
								this.setState({ selectedReported: reportData });
								this.setState({
									isAccepted: data.getRequest.isAccepted,
									isPurchased: data.getRequest.stories.length,
									request_type: data.getRequest.isOpen,
//showReporter: !data.getRequest.isOpen,
									lat: +data.getRequest.lat,
									lng: +data.getRequest.lng,
								});
							}
						);
						this.setState({
							requestId: this.props.match.params.id,
							location: data.getRequest.location,
						});
					} else {
						this.setState(
							{ loaded: true, show404: true })
					}
				}
			});
	}
	getAllReporterData(search, time) {
		try {
			const { client } = this.props;
			this.setState({ reporterLoaded: false })
			client
				.query({
					query: GET_ALL_REPORTERS_WEB,
					fetchPolicy: 'network-only',
					variables: {
						search: search !== 'null' ? search : null,
						time: time,
						isActive: true,
					},
				})
				.then(({ data, loading }) => {
					this.loading = loading;
					if (data !== undefined) {
						// console.log(data)
						SentryLog({
							category: 'Add New Request',
							message:
								'Get All reporter data api called and retrieved successfully',
							level: Severity.Info,
						});
						var now = moment(new Date()); //todays date
						let found = [];
						data.getAllReportersWeb.reporters.forEach((result) => {
							var end = moment(new Date(parseFloat(result.lastActiveTime))); // another date
							var duration = moment.duration(now.diff(end));
							var days = duration.asHours();
							if (days < 6) {
								result.type = '6_hours';
							} else if (days < 48) {
								result.type = '48_hours';
							} else if (days < 168) {
								result.type = '1_week';
							} else {
								result.type = 'all';
							}
							result.show = false;
							if (result.locations && result.locations.length > 0) {
								result.location = getAddress(result.locations);
							}
							result.label = (
								<div className="getReporterUser">
									{days < 6 && <span className="reporterActive"></span>}
									<div className="gruuserName">
										{result.name}
										{result.isApplicant && (
											<span className="list-applicant">(Applicant)</span>
										)}
									</div>
									{result.location && (
										<div className="gruserlocation">
											<EnvironmentFilled className="mr-2" />
											{result.location}
										</div>
									)}
								</div>
							);
							result.value = result.userId;
							found = this.state.selectedReported.find((data) => {
								if (data.value === result.userId) {
									result.disabled = data.isAccepted;
								}
							});
						});
						let reporters = data.getAllReportersWeb.reporters;
						if (time !== null) {
							this.setState({
								loaded: true,
								mapViewReporters: data.getAllReportersWeb.reporters,
								showReporter : true
							});
						} else if (search !== null) {
							this.setState({ loaded: true,showReporter : true,mapViewReporters: data.getAllReportersWeb.reporters, reporters });
						} else {
							this.setState(
								{
									loaded: true,
									reporters: data.getAllReportersWeb.reporters,
									mapViewReporters: data.getAllReportersWeb.reporters,
									showReporter : true
								},
								() => {
									if (this.formRef.current != null) {
										this.formRef.current.setFieldsValue({
											request_type: !this.state.showReporter,
										});
									}
								}
							);
						}
						this.setState({ reporterLoaded: true })
					}
				})
				.catch((error, result) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
						message.destroy();
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
				});
		} catch (error) {
			SentryError(error);
		}
	}

	ChangeInput = (value) => {
		this.setState({ value });
	};
	radioChange = (event) => {
		if (event.target.value === true) {
			SentryLog({
				category: 'Add New Request',
				message: 'Open request option selected',
				level: Severity.Info,
			});
			this.setState({ showReporter: false });
		} else {
			SentryLog({
				category: 'Add New Request',
				message: 'Assigned request option selected',
				level: Severity.Info,
			});
			this.setState({ showReporter: true });
		}
	};
	selectAllReporter() {
		try {
			const reportData = [];
			this.state.reporters.map((tree) =>
				reportData.push({ value: tree.value, label: tree.name })
			);
			this.setState({ selectedReported: reportData });
		} catch (error) {
			SentryError(error);
		}
	}
	deSelectAllReporter() {
		this.setState({ selectedReported: [] });
	}
	onReporterChange = (value) => {
		let filtered = [];
		value.map((data) => {
			let label = this.state.selectedReported.filter(
				(data1) => data1.value === data.value
			);
			if (label.length > 0) {
				data.disabled = label[0].disabled;
				data.isAccepted = label[0].isAccepted;
			}
			filtered.push(data);
		});
		this.setState({ selectedReported: filtered });
		this.getAllReporterData('null', null);
	};
	onReporterSearch = (value) => {
		this.setState({ loaded: true });
		this.getAllReporterData(value, null);
		const origArr = this.state.selectedReported;
		const updatingArr = this.state.reporters;
		var values = new Set(origArr.map((d) => d.value));
		var merged = [
			...origArr,
			...updatingArr.filter((d) => !values.has(d.value)),
		];
		this.setState({ reporters: merged });
	};
	onDropdownVisibleChange() {
		this.setState({ isReporterMenuOpen: true });
	}
	showModal = () => {
		this.setState({
			showReporterModel: true,
		});
	};

	handleCancel = () => {
		this.setState({
			showReporterModel: false,
		});
	};

	// onChildClick callback can take two arguments: key and childProps
	onChildClickCallback = (key) => {
		try {
			this.setState((state) => {
				const index = state.reporters.findIndex((e) => e.userId === key);
				state.reporters[index].show = !state.reporters[index].show; // eslint-disable-line no-param-reassign
				return { reporters: state.reporters };
			});
		} catch (error) {
			SentryError(error);
		}
	};
	_suggestionSelect(result, lat, lng) {
		this.setState({ location: result, lat: +lat, lng: +lng });
		this.formRef.current.setFieldsValue({ location: result });
	}
	onReporterSelection(e, userId, name) {
		try {
			let reporters = this.state.selectedReported;
			if (e.target.checked) {
				reporters.push({ value: userId, label: name });
				this.setState({ selectedReported: reporters });
			} else {
				const index = reporters.findIndex((e) => e.value === userId);
				if (index !== -1) {
					reporters.splice(index, 1);
				}
			}
			this.setState({ selectedReported: reporters });
		} catch (error) {
			SentryError(error);
		}
	}
	moveToArchive() {
		try {
			this.setState({ isArchivedLoading: true });
			let thisData = this;
			SentryLog({
				category: 'Add New Request',
				message:
					'Move request to archive function initialized with request id - ' +
					this.props.match.params.id,
				level: Severity.Info,
			});
			analytics.logEvent('storyArchive', {
				action: 'Click',
				label: 'Archived',
				value: 'Request Archived',
			});
			const { client } = this.props;
			let props = this.props;
			Modal.confirm({
				// title: 'Are you sure you want to move it to archive',
				width: 500,
				className: 'notificationModal',
				icon: (
					<div className="popimageBox">
						<img
							alt=""
							src={require('../../Assets/images/move-story.png')}
						/>
					</div>
				),
				content: 'Are you sure you want to move it to archive?',
				onOk() {
					client
						.mutate({
							variables: { requestId: props.match.params.id },
							mutation: ARCHIVE_REQUEST,
						})
						.then((result) => {
							SentryLog({
								category: 'Add New Request',
								message:
									'Move request to archive  called and retrieved successfully',
								level: Severity.Info,
							});
							if (result.data.moveToArchiveRequest.status) {
								Modal.success({
									className: 'notificationModal',
									width: 500,
									icon: (
										<div className="popDeleteicon">
											<img
												alt=""
												src={require('../../Assets/images/thumb-icon.svg')}
											/>
										</div>
									),
									content: result.data.moveToArchiveRequest.message,
									onOk() {
										thisData.setState({ isArchivedLoading: false });
										props.history.push('/myRequest/archived');
									},
								});
							}
						})
						.catch((error, result) => {
							if (error.graphQLErrors && error.graphQLErrors.length > 0) {
								message.destroy();
							} else {
								SentryError(error);
								message.destroy();
								message.error('Something went wrong please try again later');
							}
						});
				},
			});
		} catch (error) {
			SentryError(error);
		}
	}
	OnReporterFilterChange(value) {
		this.setState({ mapViewReporters: [] });
		this.setState({ loaded: true });
		this.getAllReporterData(null, value);
		return this.state.mapViewReporters;
	}
	handleSearch = (value) => {
		try {
			SentryLog({
				category: 'Add New Request',
				message: 'Reset Password Page Country list retrieving using mapbox API',
				level: Severity.Info,
			});
			let thisData = this;
			this.formRef.current.setFieldsValue({
				countryData: [],
				location: null
			});
			this.setState({ fetchingLocation: true, countryData: [], countryValue: '' }, () => {
				if (value) {
					// fetch(value, data => this.setState({ data }));
					const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
					axios
						.get(
							url +
							value +
							'.json?limit=10&language=en-EN&access_token=' +
							MAPBOXTOKEN
						)
						.then(async function (response) {
							// handle success
							SentryLog({
								category: 'Add New Request',
								message: 'Country data retrieved from mapbox API',
								level: Severity.Info,
							});
							let countryData = [];
							await response.data.features.map((feat) => {
								countryData.push({ text: feat.place_name, center: feat.center });
							});
							thisData.setState({
								countryData: countryData,
								fetchingLocation: true,
								countryValue: null
							});
						})
						.catch((error, result) => {
							if (error.graphQLErrors && error.graphQLErrors.length > 0) {
								message.destroy();
							} else {
								SentryError(error);
								message.destroy();
								message.error('Not able to find results for ' + value);
							}
						})
						.finally(function () {
							// always executed
						});
				} else {
					this.setState({ data: [] });
				}
			});

		} catch (error) {
			SentryError(error);
		}
	};

	handleChange = (value) => {
		this.setState({
			countryValue: value,
			location: this.state.countryData[value].text,
			lat: this.state.countryData[value].center[1],
			lng: this.state.countryData[value].center[0],
			fetchingLocation: true
		});
	};

	handleIsLiveCheck = (value) => {
		try {
			if (value.includes('isLiveChecked')) {
				this.setState({ isLiveChecked: true });
				this.formRef.current.resetFields(['media']);
			} else {
				this.setState({ isLiveChecked: false });
				this.formRef.current.resetFields(['isLive']);
			}
		} catch (error) {
			SentryError(error);
		}
	};

	render() {
		const { requestId } = this.state;
		const tProps = {
			value: this.state.selectedReported,
			onChange: this.onReporterChange,
			onSearch: this.onReporterSearch,
			onDropdownVisibleChange: this.onDropdownVisibleChange,
			showcheckedstregy: SHOW_ALL,
			treeCheckable: true,
			showSearch: true,
			filterOption: false,
			showArrow: false,
			dropdownStyle: { maxHeight: 400, overflow: 'auto' },
			style: {
				width: '100%',
			},
		};
		const onFinish = (values) => {
			try {
				this.setState({ isSubmitted: true });
				const { client } = this.props;
				let props = this.props;
				SentryLog({
					category: 'Add New Request',
					message: 'Add Request Form Submitted',
					level: Severity.Info,
				});
				let isAudio = false;
				let isVideo = false;
				let isPhoto = false;
				let isArticle = false;
				let isLive = false;
				let isRaw = false;
				if (values.media && values.media.length > 0) {
					if (values.media.indexOf('audio') !== -1) {
						isAudio = true;
					}
					if (values.media.indexOf('video') !== -1) {
						isVideo = true;
					}
					if (values.media.indexOf('photo') !== -1) {
						isPhoto = true;
					}
					if (values.media.indexOf('article') !== -1) {
						isArticle = true;
					}
					if (values.media.indexOf('raw') !== -1) {
						isRaw = true;
					}
				}
				if (
					values.isLive &&
					values.isLive.length > 0 &&
					values.isLive.includes('isLiveChecked')
				) {
					isLive = true;
				}
				//let isOpen = true;
				if (values.request_type === false) {
					// isOpen = false;
					if (this.state.selectedReported.length < 1) {
						Modal.error({
							content: 'Please select alteast one reporter',
						});
						this.setState({ isSubmitted: false });
						return;
					}
					// users = [];
				}
				if (this.state.lat === null) {
					Modal.error({
						content: 'Please select location from google location suggestion',
					});
					this.setState({ isSubmitted: false });
					return;
				}
				let expiryDate = moment.utc(values.expiryDateTime);
				let scheduleDate = values.scheduleDate;
				if (scheduleDate == undefined) {
					scheduleDate = null;
				} else {
					scheduleDate = moment.utc(scheduleDate);
				}
				const selectedReporters = this.state.selectedReported.map((rep) => {
					return rep.value;
				});
				let variables = {isOpen:true};
				if (this.state.requestId != null) {
					variables = {
						requestId: this.state.requestId,
						title: values.title,
						note: values.notes == undefined ? '' : values.notes,
						isOpen: values.request_type ? values.request_type : true,
						users: selectedReporters,
						lat: this.state.lat,
						lng: this.state.lng,
						location: this.state.location,
						price: values.price,
						expiryDateTime: expiryDate,
						isVideo: isVideo,
						isAudio: isAudio,
						isImage: isPhoto,
						isArticle:isArticle,
						isLive: isLive,
						isRaw: isRaw,
						reminder: values.reminder == undefined ? '30_min' : values.reminder,
						scheduleDate: scheduleDate,
					};
				} else {
					variables = {
						title: values.title,
						note: values.notes == undefined ? '' : values.notes,
						isOpen: values.request_type ? values.request_type : true,
						users: selectedReporters,
						lat: this.state.lat,
						lng: this.state.lng,
						location: this.state.location,
						price: values.price,
						expiryDateTime: expiryDate,
						isVideo: isVideo,
						isAudio: isAudio,
						isImage: isPhoto,
						isArticle:isArticle,
						isLive: isLive,
						isRaw: isRaw,
						reminder: values.reminder == undefined ? '30_min' : values.reminder,
						scheduleDate: scheduleDate,
					};
				}
				console.log(this.props.match.params.storyId)
				if (this.props.match.params.storyId) {
					variables.proposalId = this.props.match.params.storyId;
					variables.title = this.props.location.state.title;
					variables.isOpen = true;
				}
				const isPurchased = this.state.isPurchased;
				client
					.mutate({
						variables: variables,
						mutation:
							this.state.requestId != null ? UPDATE_REQUEST : SAVE_REQUEST,
					})
					.then(() => {
						Modal.success({
							className: 'notificationModal',
							width: 500,
							title: '',
							icon: (
								<div className="popDeleteicon">
									<img
										alt=""
										src={require('../../Assets/images/thumb-icon.svg')}
									/>
								</div>
							),
							content:
								this.state.requestId != null
									? 'Request has been updated successfully!!'
									: 'Request has been posted successfully!!',
							onOk() {
								if (props.match.params.storyId) {
									props.history.push('/myRequest/withProposal');
								} else {
									props.history.push('/myRequest/withoutProposal');
								}
							},
						});
					})
					.catch((error, result) => {
						if (error.graphQLErrors && error.graphQLErrors.length > 0) {
							message.destroy();
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
		const onFinishFailed = (errorInfo) => {
			SentryLog({
				category: 'Add New Request',
				message: 'Add new reuqest form submit failed',
				level: Severity.Error,
			});
			SentryError(errorInfo);
			errorInfo.errorFields.map((data) => {
				analytics.logEvent(data.name[0], {
					action: 'inError',
					label: 'message',
					value: data.errors[0],
				});
			});
		};
		const disabledDate = (current) => {
			return current < moment().endOf('hour');
		};

		const handleKeypress = (e) => {
			const characterCode = e.key;
			if (characterCode === 'Backspace') return;

			const characterNumber = Number(characterCode);
			if (characterNumber >= 0 && characterNumber <= 9) {
				if (e.currentTarget.value && e.currentTarget.value.length) {
					return;
				} else if (characterNumber === 0) {
					e.preventDefault();
				}
			} else {
				e.preventDefault();
			}
		};
		const onWheel = () => {
			this.inputRef.current.blur();
		};
		return (
			<React.Fragment>
				<Helmet>
					<title>Content Buyer | Add New Request </title>
				</Helmet>
				{this.state.loaded ? this.state.show404 ? <NotFound /> : (
					<div className="">
						<div className="pageTitle">
							<h3 className="mb-3">
								{requestId
									? 'Add required details to create Edit request'
									: 'Add required details to create new request'}
							</h3>
						</div>
						{/* <Title level={4} strong="false" className="pageTitle">
							{requestId
								? 'Edit Request'
								: 'Add required details to create new request'}
						</Title> */}
						<Card className="boxshadow p-0 p-lg-2">
							<Form
								className="tour-addRequest-form"
								layout="vertical"
								ref={this.formRef}
								onFinish={onFinish}
								onFinishFailed={onFinishFailed}>
								<Row gutter={30}>
									{/* <Col xs={24}>
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Request Type
											</label>
											<Tooltip
												placement="top"
												title="Select the type of request">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item name="request_type">
											<Radio.Group
												initialvalues={true}
												disabled={this.state.isAccepted == true && true}
												value={true}
												onChange={(e) => {
													e.stopPropagation();
													this.setState({ showReporter: !e.target.value });
												}}
												className="tour-addRequest-type d-block">
												<Row>
													<Col xs={12} md={8} lg={4}>
														<Radio value={true} selected>
															<span>Open</span>
														</Radio>
													</Col>
													<Col xs={12} md={8} lg={4}>
														<Radio value={false}>
															<span>Assigned</span>
														</Radio>
													</Col>
												</Row>
											</Radio.Group>
										</Form.Item>
									</Col> */}
									{this.props.match.params.storyId ?
										<Col xs={24}>
											<div className="font14 mb-3">
												Send request for <strong>"{this.props.location.state.title}"</strong> to
												<strong className="primary-text-color">{' ' + this.props.location.state.name}</strong>
											</div>
										</Col>
										: <Col xs={24}>
											<OnboardingTour tourName={['addRequest']} />
											<div className="ant-col ant-form-item-label d-flex flex-row">
												<label htmlFor="title" title="Title">
													Title
												</label>
												<Tooltip
													placement="top"
													title="Add a title for your request">
													<ExclamationCircleOutlined className="infoIcon" />
												</Tooltip>
											</div>
											<Form.Item
												label=""
												name="title"
												rules={[
													{ required: true, message: 'Please enter title' },
													{
														min: 10,
														max: 100,
														message: 'Title must be between 10 to 100 characters',
													},
													{
														pattern: /^[A-Za-z0-9].*$/i,
														message: 'Title should start with alphabet/number',
													},
												]}>
												<Input
													placeholder="Example: New York City Bands Music"
												//disabled={requestId && true}
												/>
											</Form.Item>
										</Col>}
									<Col xs={24}>
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Special Notes">
												Special Notes
											</label>
											<Tooltip
												placement="top"
												title="Add special instructions for the content creators">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											name="notes"
											rules={[
												{
													//min: 10,
													max: 255,
													message:
														'Special instructions can not be more then 255 characters',
												},
											]}>
											<TextArea
												//disabled={requestId && true}
												placeholder="Have any special instructions, put it here for the content creators."
												autoSize={{ minRows: 2, maxRows: 6 }}
											/>
										</Form.Item>
									</Col>
									<Col xs={24} lg={12}>
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Title">
												Location
											</label>
											<Tooltip
												placement="top"
												title="Add the location of the request for the content creators to navigate easily">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											className="inputIcon"
											name="location"
											rules={[
												{
													required: true,
													message: 'Please enter location',
												},
											]}>
											<Select
												// suffixIcon={
												// 	this.state.fetchingLocation ? (
												// 		<Spin size="small" />
												// 	) : (
												// 		<EnvironmentFilled />
												// 	)
												// }
												showSearch
												value={this.state.countryValue}
												loading={this.state.fetchingLocation}
												showArrow={false}
												filterOption={false}
												onSearch={this.handleSearch}
												onChange={e => this.handleChange(e)}
												notFoundContent={
													this.state.fetchingLocation ? <Spin size="small" /> : null
												}>
												{this.state.countryData.map((d, index) => (
													<Option key={index} value={index}>
														{d.text}
													</Option>
												))}
											</Select>
										</Form.Item>
									</Col>
									<Col xs={24} lg={12}>
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Accepted Media">
												Accepted Media
											</label>
											<Tooltip
												placement="top"
												title="Select the media that you need for this request">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<div className="d-flex">
											<Form.Item
												name="media"
												rules={[
													({ getFieldsValue }) => ({
														validator(_rule, value) {
															const fieldValues = getFieldsValue();
															if (
																(!fieldValues.isLive ||
																	fieldValues.isLive.indexOf(
																		'isLiveChecked'
																	) === -1) &&
																(!value || !value.length > 0)
															) {
																return Promise.reject(
																	'Please Select atleast one Media Type'
																);
															}
															return Promise.resolve();
														},
													}),
												]}>
												<Checkbox.Group
													disabled={this.state.isAccepted ? true : false}
													options={options}
													onChange={this.handleIsLiveCheck}
												// disabled={
												// 	(requestId && true) || this.state.isLiveChecked
												// }
												/>
											</Form.Item>
											<Form.Item
												className="d-flex flex-row-reverse liveStream"
												name="isLive">
												<Checkbox.Group
													disabled={this.state.isAccepted ? true : false}
													onChange={this.handleIsLiveCheck}
													options={isLiveOptions}

												//disabled={requestId && true}
												/>
											</Form.Item>
										</div>
									</Col>
									<Col xs={24} md={12}>
										<Row gutter={30}>
											<Col xs={24} lg={12}>
												<div className="ant-col ant-form-item-label d-flex flex-row">
													<label htmlFor="title" title="Expiry Date">
														Expiry Datetime
													</label>
													<Tooltip
														placement="top"
														title="Add the date and time on which the request will get expired">
														<ExclamationCircleOutlined className="infoIcon" />
													</Tooltip>
												</div>
												<Form.Item
													className="inputIcon"
													//disabled={requestId && true}
													name="expiryDateTime"
													rules={[
														{
															required: true,
															message: 'Please enter expiry date and time',
														},
														() => ({
															validator(_rule, value) {
																if (
																	value &&
																	new Date(value) <
																	new Date().setMinutes(
																		new Date().getMinutes() - 5
																	)
																) {
																	return Promise.reject(
																		'Please select expiry date greater than current date and time'
																	);
																}
																return Promise.resolve();
															},
														}),
													]}>
													<DatePicker
														suffixIcon={<CustIcon type="calendaricon" />}
														disabledDate={disabledDate}
														//disabled={requestId && true}
														format={'MM/DD/YYYY HH:mm'}
														className="w-100"
														showTime={{
															defaultValue: moment('00:00:00', 'HH:mm'),
														}}
													/>
												</Form.Item>
											</Col>
											<Col
												className="tour-addRequest-request-reminder"
												xs={24}
												lg={12}>
												<div className="ant-col ant-form-item-label d-flex flex-row">
													<label htmlFor="reminder" title="Deadline Reminder">
														Deadline Reminder
													</label>
													<Tooltip
														placement="top"
														title="Remind content creators if a request is unattended before it get expired.">
														<ExclamationCircleOutlined className="infoIcon" />
													</Tooltip>
												</div>
												<Form.Item name="reminder">
													<Select
														initialvalues="Select Reminder"
														placeholder="Select Reminder"
													//disabled={requestId && true}
													>
														<Select.Option value="30_min">
															30 Minutes
														</Select.Option>
														<Select.Option value="4_hours">
															4 Hours
														</Select.Option>
														<Select.Option value="12_hours">
															12 Hours
														</Select.Option>
														<Select.Option value="48_hours">
															48 Hours
														</Select.Option>
													</Select>
												</Form.Item>
											</Col>
										</Row>
									</Col>
									<Col xs={24} md={12} className="tour-addRequest-price">
										<div className="ant-col ant-form-item-label d-flex flex-row">
											<label htmlFor="title" title="Set Price">
												Set Price(In USD)
											</label>
											<Tooltip
												placement="top"
												title="Set the price of the request">
												<ExclamationCircleOutlined className="infoIcon" />
											</Tooltip>
										</div>
										<Form.Item
											className=""
											name="price"
											rules={[
												{
													required: true,
													message: 'Please enter price',
												},
												{
													type: 'number',
													min: this.state.minPrice,
													max: this.state.maxPrice,
													message: this.state.priceMessage,
												},
											]}>
											{/* <div className="dollarIcon">$</div> */}
											{/* {console.log(value)} */}
											<InputNumber
												// onfocus="this.type='number';"
												placeholder="Enter Request Price"
												onKeyDown={handleKeypress}
												ref={this.inputRef}
												onWheel={onWheel}
												// min={this.state.minPrice}
												// max={this.state.maxPrice}
												step='1'
												disabled={this.state.isAccepted == true && true}
												style={{ width: '100%' }}
												formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
												parser={value => value.replace(/\$\s?|(,*)/g, '')}
											/>
										</Form.Item>
									</Col>
									{this.state.isLiveChecked && (
										<Col md={12} xs={24} className=" tour-addRequest-price">
											<div className="ant-col ant-form-item-label d-flex flex-row">
												<label htmlFor="title" title="Schedule Date">
													Schedule Datetime
												</label>
												<Tooltip
													placement="top"
													title="Add the date and time at which the live stream will start">
													<ExclamationCircleOutlined className="infoIcon" />
												</Tooltip>
											</div>
											<Form.Item
												className="inputIcon"
												//	disabled={requestId && true}
												name="scheduleDate"
												rules={[
													{
														required: true,
														message: 'Please enter scheduled date and time',
													},
													() => ({
														validator(_rule, value) {
															if (
																value &&
																new Date(value) <
																new Date().setMinutes(
																	new Date().getMinutes() - 5
																)
															) {
																return Promise.reject(
																	'Please select schedule date greater than current date and time'
																);
															}
															return Promise.resolve();
														},
													}),
												]}>
												<DatePicker
													suffixIcon={<CustIcon type="calendaricon" />}
													//disabledDate={disabledDate}
													//disabled={requestId && true}
													format={'MM/DD/YYYY HH:mm'}
													className="w-100"
													showTime={{
														defaultValue: moment('00:00:00', 'HH:mm'),
													}}
												/>
											</Form.Item>
										</Col>
									)}

									{this.state.showReporter ? (
										<Col xs={24}>
											<Form.Item>
												<div className="ant-col ant-form-item-label d-flex justify-content-between align-items-end">
													<div className="d-flex align-items-center">
														<label htmlFor="Location" title="Location">
															Select Content Creators
														</label>
														<Tooltip
															placement="top"
															title="Select the reporters to assign them the request">
															<ExclamationCircleOutlined className="infoIcon" />
														</Tooltip>
													</div>
													{this.state.showReporter && (
														<div className="text-right mt-sm-0 mt-2">
															<Button
																type="primary"
																className="mapBtn"
																//disabled={requestId && true}
																onClick={this.showModal}
																icon={<EnvironmentFilled />}>
																<span className="d-sm-inline d-none">
																	Content Creator Map View
																</span>
															</Button>
														</div>
													)}
												</div>
												<TreeSelect
													///	disabled={requestId && true}
													labelInValue={true}
													treeData={this.state.reporters}
													{...tProps}
													dropdownStyle={{
														maxHeight: 400,
														overflow: 'auto',
													}}
													open={this.state.isReporterMenuOpen}
													dropdownRender={(menu) => (
														<div className="selectRepBlk">
															<div className="d-block d-sm-flex align-items-center justify-content-between text-center selectBtmRow">
																<div className="d-flex justify-content-center align-items-center selectRepTXT">
																	{' '}
																	<span
																		className="mr-2 font-weight-bold"
																		onClick={this.selectAllReporter}>
																		Select All
																	</span>{' '}
																	|{' '}
																	<span
																		className="ml-2 font-weight-bold"
																		onClick={this.deSelectAllReporter}>
																		Clear All
																	</span>
																</div>
																<span className="mr-2 font-weight-bold lightGray-text-color">
																	{this.state.selectedReported.length} selected{' '}
																</span>
																<Button
																	onClick={() =>
																		this.setState({
																			isReporterMenuOpen: false,
																		})
																	}
																	type="primary"
																	size="large">
																	Close
																</Button>
																{/* <div className="d-flex flex-row align-items-center">
																
																</div> */}
															</div>
															{menu}
														</div>
													)}></TreeSelect>
											</Form.Item>
										</Col>
									) : (
										''
									)}
								</Row>
								<div className="text-right mt-lg-5 mt-0 pt-lg-5 pt-0">
									<Button
										type="primary"
										size="large"
										loading={this.state.isSubmitted ? true : false}
										htmlType="submit">
										{requestId ? 'Update Request' : 'Send Request'}
									</Button>
									{requestId && (
										<Button
											type="secondary"
											className="ml-2"
											size="large"
											loading={this.state.isArchivedLoading ? true : false}
											onClick={this.moveToArchive}>
											Archive Request
										</Button>
									)}
								</div>
							</Form>
						</Card>
						<Modal
							title=""
							visible={this.state.showReporterModel}
							footer={null}
							onCancel={this.handleCancel}
							width={1170}
							wrapClassName="addReqMapPopup">
							<div className="d-flex flex-md-row flex-column align-items-md-center justify-content-md-between">
								<Title level={4} strong="false" className="pageTitle mt-0">
									Content Creator Map View
								</Title>
								<div className="d-flex flex-row align-items-center">
									<span className="mr-2">Filter By </span>
									<Select
										className="filterbySelect"
										placeholder="Last Activity"
										onChange={this.OnReporterFilterChange}>
										<Select.Option value="">
											<span className="timeCir col3" />
											All
										</Select.Option>
										<Select.Option value="6 HOUR">
											<span className="timeCir col1" />
											Before 6 Hours
										</Select.Option>
										<Select.Option value="48 HOUR">
											<span className="timeCir col2" />
											Before 48 Hours
										</Select.Option>
										<Select.Option value="1 WEEK">
											<span className="timeCir col3" />
											Before 1 Week
										</Select.Option>
									</Select>
								</div>
							</div>
							<ReporterGoogleMap
								reporters={this.state.mapViewReporters}
								selectedReported={this.state.selectedReported}
								showSelection={true}
								onChildClickCallback={this.onChildClickCallback}
								onReporterSelection={(e, userId, name) =>
									this.onReporterSelection(e, userId, name)
								}
							/>
						</Modal>
					</div>
				) : (
					<Empty description={<h1>404</h1>} /> ? <Loader /> : <Loader />
				)}
			</React.Fragment>
		);
	}
}
let AddRequest = withApollo(AddRequests);
export { AddRequest };
