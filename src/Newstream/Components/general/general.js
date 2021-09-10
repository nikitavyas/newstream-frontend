import { message } from 'antd';
import React from 'react';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
export const fullName = (fullname) => {
	return fullname != null ? fullname.match(/\b\w/g).join('') : null;
};

export const getAddress = (data) => {
	let formattedAddress = '';
	if(Array.isArray(data) && data.length ){
		let filteredLocation =  data.filter(d1 => {
			return d1.location_type === 0
		})
		if(filteredLocation.length){
		filteredLocation = filteredLocation[0]
		formattedAddress = filteredLocation.address1 && filteredLocation.address1 + ', ';
		formattedAddress += filteredLocation.address2 && filteredLocation.address2 + ', ';
		formattedAddress += filteredLocation.city && filteredLocation.city + ' , ';
		formattedAddress += filteredLocation.state && filteredLocation.state + ' , ';
		formattedAddress += filteredLocation.country && filteredLocation.country + ' , ';
		formattedAddress += filteredLocation.pincode && filteredLocation.pincode;
		formattedAddress = formattedAddress.replace(/,(?=\s*$)/, '');		;
		}
		return formattedAddress;
	}else
	{
		
		formattedAddress = data.address1 && data.address1 + ', ';
		formattedAddress += data.address2 && data.address2 + ', ';
		formattedAddress += data.city && data.city + ' , ';
		formattedAddress += data.state && data.state + ' , ';
		formattedAddress += data.country && data.country + ' , ';
		formattedAddress += data.pincode && data.pincode;
		formattedAddress = formattedAddress.trim(',');
		return formattedAddress;
	}
	
};
export const onReporterClick = (history, userId, deleted) => {

	if (deleted) {
		message.warning('This Content Creator is no longer available in system');
	} else {
		history.push('/CompanyProfile/' + userId);
	}
};

export const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => {
	if(currentSlide !== 0){
	return (
	<button
		{...props}
		className={
			'slick-prev slick-arrow' + (currentSlide === slideCount  ? ' slick-disabled' : '')
		}
		aria-hidden="true"
		aria-disabled={currentSlide === 0 ? true : false}
		type="button">
		<LeftOutlined />
	</button>
	)
	}else{
		return null
	}
};
export const SlickArrowRight = ({ currentSlide, slideCount, ...props }) => {
	if (currentSlide !== slideCount - 1) {
		return (
			<button
				{...props}
				className={
					'slick-next slick-arrow' +
					(currentSlide === slideCount - 1 ? ' slick-disabled' : '')
				}
				aria-hidden="true"
				aria-disabled={currentSlide === slideCount - 1 ? true : false}
				type="button">
				<RightOutlined />
			</button>
		);
	} else {
		return null;
	}
};
export const SlickGlobalArrowRight = ({
	currentSlide,
	slideCount,
	...props
}) => {
	if (currentSlide + 3 !== slideCount - 1) {
		return (
			<button
				{...props}
				className={
					'slick-next slick-arrow' +
					(currentSlide === slideCount - 1 ? ' slick-disabled' : '')
				}
				aria-hidden="true"
				aria-disabled={currentSlide === slideCount - 1 ? true : false}
				type="button">
				<RightOutlined />
			</button>
		);
	} else {
		return null;
	}
};


