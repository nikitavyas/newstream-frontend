import React, { Component } from 'react';
import { GET_PROFILE } from '../../graphql/query';
import { lineString, length } from '@turf/turf';
import { withApollo } from 'react-apollo';
import { Typography } from 'antd';
import './MapMarker.css';
import { CustIcon } from '../Svgs';
import { MAPBOXTOKEN } from '../general/constant';
import ReactMapboxGl, { Marker, Popup } from 'react-mapbox-gl';

const { Text } = Typography;
// mapboxgl.accessToken = config.mapbox_key;

const Map = ReactMapboxGl({
	accessToken: MAPBOXTOKEN,
});

class MapMarker extends Component {
	constructor(props) {
		super(props);
		this.state = {
			lat: localStorage.getItem('userLat'),
			lng: localStorage.getItem('userLng'),
			totalDistance: null,
		};
	}

	async componentDidMount() {
		await this.getUserLocation();
		//await this.getBrowserLocation();
		// this.loadMap();
	}

	getUserLocation = async () => {
		try {
			const { client } = this.props;
			const {
				data: {
					getReporterProfile: {
						address: { lat, lng },
					},
				},
			} = await client.query({
				query: GET_PROFILE,
			});
			this.setState({ lat: parseFloat(lat), lng: parseFloat(lng) });
		} catch (err) {}
	};

	getBrowserLocation = async () => {
		const options = {
			maximumAge: 10000,
			timeout: 5000,
			enableHighAccuracy: true,
		};

		navigator.geolocation.getCurrentPosition(
			({ coords: { latitude, longitude } }) => {
				this.setState({
					lat: parseFloat(latitude),
					lng: parseFloat(longitude),
				});
				//this.calculateDistance();
				this._calculateDistance();
				return Promise.resolve(true);
			},
			() => {
				this._calculateDistance();
				return Promise.resolve(true);
			},
			options
		);
	};

	// loadMap = () => {
	//     const { lat, lng } = this.props;
	//
	//     let map = new mapboxgl.Map({
	//         container: this.mapContainer,
	//         style: 'mapbox://styles/mapbox/streets-v11',
	//         center: [lng ? parseFloat(lng) : 0, lat ? parseFloat(lat) : 0],
	//         zoom: 15
	//     });
	//     new mapboxgl.Marker({
	//         container: this.mapContainer,
	//     })
	//         .setLngLat([lng ? parseFloat(lng) : 0, lat ? parseFloat(lat) : 0])
	//         .addTo(map);
	// };

	navigateHandler = () => {
		const { lat, lng } = this.props;
		const url = `https://www.google.com/maps/dir/?api=1&origin=${
			this.state.lat
		},${this.state.lng}&destination=${parseFloat(lat)},${parseFloat(lng)}`;
		window.open(url, '_blanck');
	};

	calculateDistance = () => {
		const { lat, lng } = this.props;
		const line = lineString([
			[this.state.lat, this.state.lng],
			[lat ? parseFloat(lat) : 0, lng ? parseFloat(lng) : 0],
		]);
		const distance = length(line, { units: 'miles' });
		this.setState({ totalDistance: distance.toFixed(1) });
	};

	_calculateDistance = () => {
		const userLat = localStorage.getItem('userLat');
		const userLng = localStorage.getItem('userLng');
		const { lat, lng } = this.props;
		const line = lineString([
			[userLat, userLng],
			[lat ? parseFloat(lat) : 0, lng ? parseFloat(lng) : 0],
		]);
		const distance = length(line, { units: 'miles' });
		this.setState({ totalDistance: distance.toFixed(1) });
	};

	render() {
		//const { totalDistance } = this.state;
		const { lat, lng, metadata, location } = this.props;

		return (
			<div className="location-card user-story">
				<div className="googleMapReact">
					<Map
						onClick={this.navigateHandler}
						// eslint-disable-next-line react/style-prop-object
						style="mapbox://styles/mapbox/streets-v11"
						zoom={[15]}
						center={[lng ? parseFloat(lng) : 0, lat ? parseFloat(lat) : 0]}>
						<Marker
							coordinates={[
								lng ? parseFloat(lng) : 0,
								lat ? parseFloat(lat) : 0,
							]}>
							{metadata.isOpen ? (
								<div className="pin-price">
									<span>${metadata.price}</span>
									<img
										alt=""
										src={require('../../Assets/images/open_map_pin.png')}
									/>
								</div>
							) : (
								<div className="pin-price">
									<span>${metadata.price}</span>
									<img
										alt=""
										src={require('../../Assets/images/assigned_map_pin.png')}
									/>
								</div>
							)}
						</Marker>
						<Popup
							className="mapPopPin_blk"
							coordinates={[
								lng ? parseFloat(lng) : 0,
								lat ? parseFloat(lat) : 0,
							]}>
							<b>{location}</b>
						</Popup>
					</Map>
					{/*<div onClick={this.navigateHandler} style={style}*/}
					{/*ref={el => this.mapContainer = el} />*/}
				</div>
				<div className="d-flex justify-content-end mt-2">
					<Text>
						{metadata.distance?.toFixed(2)} m away{' '}
						<CustIcon type="gps" className="primary-text-color" />
					</Text>
				</div>
			</div>
		);
	}
}

export default withApollo(MapMarker);
