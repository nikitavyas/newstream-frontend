import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import config from '../../appConfig';
import { message } from 'antd';

mapboxgl.accessToken = config.mapbox_key;

class RequestMapView extends Component {
	state = {
		lng: 0,
		lat: 0,
		zoom: 5,
	};

	componentDidMount() {
		const options = {
			maximumAge: 10000,
			timeout: 5000,
			enableHighAccuracy: true,
		};

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				({ coords: { latitude, longitude } }) => {
					this.setState({ lat: latitude, lng: longitude });
					this.loadMap();
				},
				(err) => {
					this.loadMap();
				},
				options
			);
		} else {
			message.error('Geolocation is not supported by this browser.');
		}
	}

	loadMap = () => {
		let map = new mapboxgl.Map({
			container: this.mapContainer,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [this.state.lng, this.state.lat],
			zoom: this.state.zoom,
		});

		map.on('load', () => {
			// console.log(this.props.mapData);
			// Add a new source from our GeoJSON data and
			// set the 'cluster' option to true. GL-JS will
			// add the point_count property to your source data.
			map.addSource('requests', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					crs: {
						type: 'name',
						properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
					},
					features: this.props.mapData ? [...this.props.mapData] : [],
				},
				cluster: true,
				clusterMaxZoom: 14, // Max zoom to cluster points on
				clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
			});

			map.addLayer({
				id: 'clusters',
				type: 'circle',
				source: 'requests',
				filter: ['has', 'point_count'],
				paint: {
					// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
					// with three steps to implement three types of circles:
					//   * Blue, 20px circles when point count is less than 100
					//   * Yellow, 30px circles when point count is between 100 and 750
					//   * Pink, 40px circles when point count is greater than or equal to 750
					'circle-color': [
						'step',
						['get', 'point_count'],
						'#51bbd6',
						100,
						'#f1f075',
						750,
						'#f28cb1',
					],
					'circle-radius': [
						'step',
						['get', 'point_count'],
						20,
						100,
						30,
						750,
						40,
					],
				},
			});

			map.addLayer({
				id: 'cluster-count',
				type: 'symbol',
				source: 'requests',
				filter: ['has', 'point_count'],
				layout: {
					'text-field': '{point_count_abbreviated}',
					'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
					'text-size': 12,
				},
			});

			map.addLayer({
				id: 'unclustered-point',
				type: 'circle',
				source: 'requests',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-color': '#7721D1',
					'circle-radius': 4,
					'circle-stroke-width': 1,
					'circle-stroke-color': '#fff',
				},
			});

			// inspect a cluster on click
			map.on('click', 'clusters', (e) => {
				var features = map.queryRenderedFeatures(e.point, {
					layers: ['clusters'],
				});
				var clusterId = features[0].properties.cluster_id;
				map
					.getSource('requests')
					.getClusterExpansionZoom(clusterId, (err, zoom) => {
						if (err) return;

						map.easeTo({
							center: features[0].geometry.coordinates,
							zoom: zoom,
						});
					});
			});

			// When a click event occurs on a feature in
			// the unclustered-point layer, open a popup at
			// the location of the feature, with
			// description HTML from its properties.
			map.on('click', 'unclustered-point', (e) => {
				debugger;
				var coordinates = e.features[0].geometry.coordinates.slice();
				var mag = e.features[0].properties.mag;
				var tsunami;

				if (e.features[0].properties.tsunami === 1) {
					tsunami = 'yes';
				} else {
					tsunami = 'no';
				}

				// Ensure that if the map is zoomed out such that
				// multiple copies of the feature are visible, the
				// popup appears over the copy being pointed to.
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				new mapboxgl.Popup()
					.setLngLat(coordinates)
					.setHTML('magnitude: ' + mag + '<br>Was there a tsunami?: ' + tsunami)
					.addTo(map);
			});

			map.on('mouseenter', 'clusters', () => {
				map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'clusters', () => {
				map.getCanvas().style.cursor = '';
			});
		});
	};

	render() {
		const style = {
			top: 0,
			bottom: 0,
			width: '100%',
			height: '500px',
		};

		return (
			<div
				style={style}
				ref={(el) => (this.mapContainer = el)}
				className="mt-3"
			/>
		);
	}
}

export { RequestMapView };
