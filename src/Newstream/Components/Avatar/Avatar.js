import React, { useState } from 'react';
import { Avatar } from 'antd';
import { fullName } from '../general/general';

const ProfileAvatar = ({ imageUrl, size, name, shape = null }) => {
	const bucketUrl = localStorage.getItem('cloudUrl');
	const [avatarStyle, setAvatarStyle] = useState();
	const handleError = () => {
		setAvatarStyle({
			backgroundColor: 'white',
			verticalAlign: 'middle',
			border: '1px solid #8216D9',
			color: '#FF0000',
		});
	};


	if (imageUrl  && imageUrl !== 'null') {
		if (!imageUrl.includes('http') && bucketUrl) {
			return (
				<Avatar
					size={size}
					shape={shape ? shape : 'round'}
					src={bucketUrl + imageUrl}
					onError={handleError}
					style={avatarStyle}
				/>
			);
		} else {
			return (
				<Avatar
					size={size}
					shape={shape ? shape : 'round'}
					src={imageUrl}
					onError={handleError}
					style={avatarStyle}
				/>
			);
		}
	}
	return (
		<Avatar
			className="initialsTxt"
			size={size}
			shape={shape ? shape : 'round'}
			style={avatarStyle}>
			{name && fullName(name)}
		</Avatar>
	);
};
export { ProfileAvatar };
