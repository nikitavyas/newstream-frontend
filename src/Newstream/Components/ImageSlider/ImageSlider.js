import React from 'react';
import Slider from 'react-slick';
import {
	RightOutlined,
	LeftOutlined,
} from '@ant-design/icons';
// Import css files
import './imageSlider.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SlickArrowLeft,SlickArrowRight } from '../../Components/general/general';
export class ImageSlider extends React.Component {
	constructor(props) {
		super(props);
		this.myRef = React.createRef();
		this.domRefs = {};
	}
	getImages = (media, mediaUrl) => (
		<div className="popupSliderbox">
			<div className="popupImageBox">
			<img alt="" src={mediaUrl + media.mediaName} />
			</div>
		</div>
	);
	playVideo(index) {
		this.domRefs[index].play();
	}
	getVideos = (media, mediaUrl, index) => (
		<video
			ref={(ref) => {
				this.domRefs[index] = ref;
			}}
			key = {index}
			controlsList="nodownload"
			style={{ width: '100%', height: 'auto' }}
			poster={mediaUrl + media.thumbnail}
			controls>
			<source src={mediaUrl + media.mediaName} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	);

	getAudios = (media, mediaUrl) => (
		<audio controls>
			<source src={mediaUrl + media.mediaName} type="audio/mpeg" />
			Your browser does not support the audio element.
		</audio>
	);

	getMediaContents = () => {
		const { medias, mediaUrl } = this.props;
		return medias.map((media, index) => {
			switch (media.type) {
				case 'image':
					return this.getImages(media, mediaUrl);
				case 'video':
					return this.getVideos(media, mediaUrl, index);
				case 'audio':
					return this.getAudios(media, mediaUrl);
				default:
					return null;
			}
		});
	};

	render() {
		const { selectedIndex } = this.props;
		const settings = {
			nextArrow: <SlickArrowRight />,
			prevArrow: <SlickArrowLeft />,
			infinite: true,
			speed: 1000,
			slidesToShow: 1,
			slidesToScroll: 1,
			initialSlide: selectedIndex,
			adaptiveHeight: true,
			accessibility: true,
			beforeChange: (current, next) => {
				// this.domRefs[current].pause()
				// this.domRefs[next].play()
				// var video = $('#main-slider .slick-active').find('video').get(0).play();
				// console.log('change', this.domRefs[current]);
			},
		};

		return (
			<div className="imageSlider_blk">
				<Slider {...settings}>{this.getMediaContents()}</Slider>
			</div>
		);
	}
}
