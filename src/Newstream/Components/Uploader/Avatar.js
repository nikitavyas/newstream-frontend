import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo';
import { FILE_UPLOADS } from '../../graphql/APIs';
import { message, Upload } from 'antd';
import axios from 'axios';
import { ProfileAvatar } from '../Avatar';
import ImgCrop from 'antd-img-crop';
import md5 from 'md5';

const AvatarUploader = ({
	setUploadingFlag,
	fileUpload,
	folderName,
	preUploadedImage,
}) => {
	const [imageObj, setImageObj] = useState({ name: null, type: null });
	const [imageUrl, setImageUrl] = useState(null);
	const [uploadedImage, setUploadedImage] = useState(preUploadedImage);
	const client = useApolloClient();
	const bucketUrl = localStorage.getItem('cloudUrl');

	useEffect(() => {
		uploadFileHandler();
		
	}, [imageUrl]);

	const uploadFileHandler = async () => {
		if (imageUrl) {
			const url = await gateUploadUrlHandler();
			const fileUploaded = await uploadFile(url);
			
			setUploadedImage(fileUploaded);
			fileUpload(fileUploaded);
			setUploadingFlag(false);
		}
	};

	const gateUploadUrlHandler = async () => {
		return new Promise((resolve, _reject) => {
			const fileName =
				md5(imageObj.name) +
				new Date().toLocaleDateString().replace('/', '').replace('/', '') +
				'.' +
				imageObj.name.split('.')[1];
			client
				.mutate({
					variables: {
						fileName: folderName + '/' + fileName,
						fileType: imageObj.type,
					},
					mutation: FILE_UPLOADS,
				})
				.then((result) => {
					resolve(result.data.generateUrl);
				})
				.catch((error) => {});
		});
	};

	const uploadFile = async (signedUrl) => {
		return new Promise((resolve, _reject) => {
			axios
				.put(signedUrl, imageObj, {
					headers: {
						'Content-Type': imageObj.type,
					},
				})
				.then(() => {
					resolve(signedUrl.split('?')[0].replace('s3.amazonaws.com/', ''));
				})
				.catch((_e) => resolve(null));
		});
	};

	const dummyRequest = ({file, onSuccess }) => {
		console.log('file',file)
		setImageObj(file);
		// this.setState({orjObj:file})
		setTimeout(() => {
			onSuccess('ok');
		}, 0);
	};

	const handleChange = (info) => {
		if (info.file.status === 'uploading') {
			setUploadingFlag(true);
			return;
		}
		if (info.file.status === 'done') {
			// setImageObj(info.file.originFileObj);
			console.log(info.file.originFileObj)
			getBase64(imageObj, (imageUrl) => {
				setImageUrl(imageUrl);
			});
		}
	};

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		console.log(img)
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

	const beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('You can only upload JPG/PNG file!');
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		return isJpgOrPng && isLt2M;
	};

	return (
		<ImgCrop rotate aspect="1" shape="round" grid>
			<Upload
				name="avatar"
				listType="picture-card"
				className="avatar-uploader"
				showUploadList={false}
				customRequest={dummyRequest}
				beforeUpload={beforeUpload}
				onChange={handleChange}>
				{uploadedImage ? (
					<ProfileAvatar imageUrl={uploadedImage} size={90} />
				) : (
					<div>
						<div className="ant-upload-text">
							Upload
							<br />
							Profile
							<br />
							Picture
						</div>
					</div>
				)}
			</Upload>
		</ImgCrop>
	);
};

export { AvatarUploader };
