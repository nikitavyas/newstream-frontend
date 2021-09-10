import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export const MediaSizeCount = ({ bytes }) => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Byte';
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return <Text>{(bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]}</Text>;
};
