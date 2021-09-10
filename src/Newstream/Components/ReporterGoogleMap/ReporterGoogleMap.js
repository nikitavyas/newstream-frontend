import React, { Component } from 'react';
import ReactMapboxGl, {
	Layer,
	Feature,
	Marker,
	Popup,
	ScaleControl,
	ZoomControl,
	Cluster
} from 'react-mapbox-gl';
import { MAPBOXTOKEN } from '../general/constant';
import { CustIcon } from '../../Components/Svgs';

// import { Link } from 'react-router-dom';
import './ReporterGoogleMap.css';
import { Checkbox,Carousel } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined,RightCircleOutlined,LeftCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ProfileAvatar } from '../Avatar/Avatar';
import { Link } from 'react-router-dom';
import { Loader } from '../Loader/Loader';

const Map = ReactMapboxGl({
	accessToken: MAPBOXTOKEN,
});
class ReporterGoogleMap extends Component {
	
	state = {
		popup: false,
		selectedReporter: null,
		center: [+localStorage.getItem('userLng'), +localStorage.getItem('userLat')],
		zoom: [7],
		isLoaded:false,
		allReporters:[]
	};
	constructor(props) {
		super(props);
		this.next = this.next.bind(this);
		this.previous = this.previous.bind(this);
		this.carousel = React.createRef();
	}
	componentDidMount() { 
		console.log('reporters ->>>',this.props.reporters)
		const allReporters = this.props.reporters.filter(data => 
			{
				if(data.locations != null && data.locations.length > 0){
				return data
			}
		})
		// console.log(allReporters)
		this.setState({ isLoaded:true ,allReporters});
	}
	componentDidUpdate(prevProps) { 
		// console.log('reporters ->>>',this.props.reporters)
		if(prevProps.reporters !== this.props.reporters){
		const allReporters = this.props.reporters.filter(data => 
			{
				if(data.locations != null && data.locations.length > 0){
				return data
			}
		})
		// console.log(allReporters)
		this.setState({ isLoaded:true ,allReporters});
		}
	}
	navigateHandler = () => {
		this.setState({ selectedReporter: null, showPopup: false });
	};
	// markerClicked = (story) => {
	// 	story.locationFormatted = '';
	// 	// story.locations.find(data => {
	// 	//   data.locat
	// 	// });
	// 	if (story.locations.length > 0) {
	// 		story.locationFormatted = getAddress(story.locations[0]);
	// 	}
	// 	this.setState({
	// 		selectedReporter: story,
	// 		popup: true,
	// 		center: [story.locations[0].lng, story.locations[0].lat],
	// 		zoom: [14],
	// 	});
	// };
	onDragCall = () => {
		this.setState({ selectedReporter: null, popup: false });
	};
	next() {
		this.carousel.next();
	}
	previous() {
		this.carousel.prev();
	}
	markerClicked = (story) => {
		// console.log(story)

		this.setState({
			showPopup: true,
			popup: {
				coordinates: [+story.locations[0].lng, +story.locations[0].lat],
				total: 1,
				leaves: story,
			},
			selectedReporter:story
		});
	};
	onDragCall = () => {
		//  this.props.popup = false;
		this.props.onChildClickCallback(false);
		this.setState({ selectedReporter: null, showPopup: false });
	};
	onDragCall = () => {
		this.setState({ selectedReporter: null, popup: false });
	};
	clusterMarker = (coordinates, pointCount, getLeaves) => (
		<Marker
			key={coordinates.toString()}
			coordinates={coordinates}
			onClick={this.clusterClick.bind(
				this,
				coordinates,
				pointCount,
				getLeaves
			)}>
			<div className="pin-price">
				<span>{pointCount}</span>
				<img alt="" src={require('../../Assets/images/cluster-icon.png')} />
			</div>
		</Marker>
	);
	clusterClick = (coordinates, total, getLeaves) => {
		this.setState({
			showPopup: true,
			popup: {
				coordinates,
				total,
				leaves: getLeaves(),
			},
		});
	};

	render() {
		const props = {
			dots: true,
			infinite: true,
			speed: 500,
			slidesToShow: 1,
			slidesToScroll: 1,
		};
		const { selectedReporter } = this.state;
		return (
			this.state.isLoaded ? <div className="googleMap_blk">
				<Map
					style="mapbox://styles/mapbox/streets-v9"
					containerStyle={{
						height: '80vh',
						width: '100%',
					}}
					onClick={this.navigateHandler}
					className="mt-3"
					onDrag={this.onDragCall}
					zoom={this.state.zoom}
					center={this.state.center}>
					{/* Controls */}
					<ScaleControl />
					<ZoomControl />
					<Layer
						type="symbol"
						id="marker"
						layout={{ 'icon-image': 'marker-15' }}>
						<Feature
							coordinates={[
								+localStorage.getItem('userLng'),
								+localStorage.getItem('userLat'),
							]}
						/>
					</Layer>
					<Cluster
					 ClusterMarkerFactory={this.clusterMarker}
					 >
					{this.state.allReporters.map(
						(reporter, key) =>
							 (
								<Marker
									key={key}
									coordinates={[
										+reporter.locations[0].lng,
										+reporter.locations[0].lat,
									]}
									anchor="bottom"
									data-feature={reporter}
									onClick={(e) => this.markerClicked(reporter)}>
									<div className="markar reporter-markar d-flex">
										<CustIcon type="marker" className=" d-flex " />
										<div className="markarTxt d-flex flex-row justify-content-center">
											{reporter.type === '6_hours' ? (
												<div className="timeuser1 colorCircul d-flex flex-column align-items-center justify-content-center">
													<ProfileAvatar
														size={36}
														name={reporter.name}
														imageUrl={reporter.profileImage}
													/>
												</div>
											) : reporter.type === '48_hours' ? (
												<div className="timeuser2 colorCircul d-flex flex-column align-items-center justify-content-center">
													<ProfileAvatar
														size={36}
														name={reporter.name}
														imageUrl={reporter.profileImage}
													/>
												</div>
											) : reporter.type === '1_week' ? (
												<div className="timeuser3 colorCircul d-flex flex-column align-items-center justify-content-center">
													<ProfileAvatar
														size={36}
														name={reporter.name}
														imageUrl={reporter.profileImage}
													/>
												</div>
											) : (
															<div className="timeuser4 colorCircul d-flex flex-column align-items-center justify-content-center">
																<ProfileAvatar
																	size={36}
																	name={reporter.name}
																	imageUrl={reporter.profileImage}
																/>
															</div>
														)}
										</div>
									</div>
								</Marker>
							) 
					)}
					</Cluster>
					{this.state.showPopup && (
						<Popup
						placement="top"
						className="googleMapPop tour-mapView-card"
						coordinates={this.state.popup.coordinates}>
							{this.state.popup.total > 1 ? (
								<div>
								<LeftCircleOutlined onClick={this.previous} />
								<Carousel ref={(node) => (this.carousel = node)} {...props}>
									{this.state.popup.leaves.map((leaf, index) => {
										let leafReporter = leaf.props['data-feature'];
										// console.log(leafReporter)
										return (	
										<div className="d-flex flex-column">
								<div className="d-flex flex-row align-items-center justify-content-between mb-2">
									<Link to={`/reportersProfile/${leafReporter.userId}`}>
										{' '}
										<div className="rbTitle ">
											<h3 className="mb-2">{leafReporter.name}</h3>
										</div>
									</Link>
									<div className="onReporterSelection">
										{this.props.showSelection === true && (
											<Checkbox
												checked={
													this.props.selectedReported.findIndex(
														(e) => e.value === leafReporter.userId
													) > -1
														? true
														: false
												}
												onChange={(e) =>
													this.props.onReporterSelection(
														e,
														leafReporter.userId,
														leafReporter.name
													)
												}>
												Assign request to reporter
											</Checkbox>
										)}
									</div>
								</div>
								{leafReporter.location !== '' && (
									<div className="mb-2 d-flex">
										<EnvironmentOutlined className="mr-2 mt-1 d-flex" />
										<span className="fulladdress">
											{leafReporter.location}{' '}
										</span>
									</div>)}
								<div className="d-flex  align-items-center">
									<ClockCircleOutlined className="mr-2" />
									<span>
										{moment(
											new Date(parseFloat(leafReporter.lastActiveTime))
										).fromNow()}
									</span>
								</div>
							</div>)
						})}
							</Carousel>
							<RightCircleOutlined onClick={this.next} />{' '}
							</div>) : 
							<div className="d-flex flex-column">
								<div className="d-flex flex-row align-items-center justify-content-between mb-2">
									<Link to={`/reportersProfile/${selectedReporter.userId}`}>
										{' '}
										<div className="rbTitle ">
											<h3 className="mb-2">{selectedReporter.name}</h3>
										</div>
									</Link>
									<div className="onReporterSelection">
										{this.props.showSelection === true && (
											<Checkbox
												checked={
													this.props.selectedReported.findIndex(
														(e) => e.value === selectedReporter.userId
													) > -1
														? true
														: false
												}
												onChange={(e) =>
													this.props.onReporterSelection(
														e,
														selectedReporter.userId,
														selectedReporter.name
													)
												}>
												Assign request to reporter
											</Checkbox>
										)}
									</div>
								</div>
								{selectedReporter.location !== '' && (
									<div className="mb-2 d-flex">
										<EnvironmentOutlined className="mr-2 mt-1 d-flex" />
										<span className="fulladdress">
											{selectedReporter.location}{' '}
										</span>
									</div>)}
								<div className="d-flex  align-items-center">
									<ClockCircleOutlined className="mr-2" />
									<span>
										{moment(
											new Date(parseFloat(selectedReporter.lastActiveTime))
										).fromNow()}
									</span>
								</div>
							</div>}
						</Popup>
					)}
				</Map>
			</div> : <Loader/>
		);
	}
}

export default ReporterGoogleMap;
