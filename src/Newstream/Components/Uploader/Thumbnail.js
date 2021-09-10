import React, { useState, useEffect, Fragment } from 'react';
import { useApolloClient } from 'react-apollo';
import { FILE_UPLOADS } from '../../graphql/APIs';
import { message, Upload, Button } from 'antd';
import axios from 'axios';
const { Dragger } = Upload;

const ThumbnailUploader = ({ setUploadingFlag, fileUpload, folderName }) => {
	const [imageObj, setImageObj] = useState({ name: null, type: null });
	const [imageUrl, setImageUrl] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadList, setUploadList] = useState([]);
	const [thumbnail, setThumbnail] = useState(null);
	const client = useApolloClient();
	const bucketUrl = localStorage.getItem('cloudUrl');

	useEffect(() => {
		uploadFileHandler();
	}, [imageUrl]);

	useEffect(() => {
		setUploadingFlag(isUploading);
	}, [isUploading]);

	const uploadFileHandler = async () => {
		if (imageUrl) {
			const url = await gateUploadUrlHandler();
			const thumbnail = await uploadFile(url);
			// console.log("Thumbnail --->",thumbnail)
			fileUpload(thumbnail)
			setIsUploading(false);
		}
	};

	const gateUploadUrlHandler = async () => {
		return new Promise((resolve, _reject) => {
			client
				.mutate({
					variables: {
						fileName: folderName + '/' + imageObj.name,
						fileType: imageObj.type,
					},
					mutation: FILE_UPLOADS,
				})
				.then((result) => {
					// console.log("Rsult --->",result)
					resolve(result.data.generateUrl);
				})
				.catch((error) => { });
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
					let fileUploaded = signedUrl.split('?')[0].replace('s3.amazonaws.com/', '');
					const thumbnail = fileUploaded.replace(bucketUrl, '');
					setThumbnail(thumbnail)
					resolve(thumbnail);
				})
				.catch((_e) => resolve(null));
		});
	};
	// const handleFileRemove = (deletedFile) => {
	// 	const { cancelToken } = axiosTokenList.find((singleUpload) => {
	// 		return singleUpload.uid === deletedFile.uid;
	// 	});
	// 	cancelToken.cancel('Removed by user');
	// 	setUploadList((currentList) =>
	// 		currentList.filter((singleFile) => {
	// 			return singleFile.uid !== deletedFile.uid;
	// 		})
	// 	);
	// 	setTotalMediaCount((currentMediaCount) => currentMediaCount - 1);
	// 	message.success('File Deleted Successfully');
	// };
	// const dummyRequest = ({ onSuccess }) => {
	// 	setTimeout(() => {
	// 		onSuccess('ok');
	// 	}, 0);
	// };

	const dummyRequest = ({file, onSuccess }) => {
		console.log('file',file)
		setImageObj(file)
		// this.setState({orjObj:file})
		setTimeout(() => {
		onSuccess('ok');
		}, 0);
		};

	const handleChange = (info) => {
		// console.log(info)
		setUploadList([...info.fileList]);
		if (info.file.status === 'uploading') {
			setIsUploading(true);
			return;
		}
		if (info.file.status === 'done') {
			// setImageObj(info.file.originFileObj);
			getBase64(imageObj, (imageUrl) => {
				setImageUrl(imageUrl);
			});
			setUploadList((currentList) =>
				currentList.filter((singleFile) => {
					return singleFile.uid !== info.file.uid;
				})
			);
		}
	};

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

	const beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('You can only upload JPG/PNG file!');
		}
		const isLt2M = file.size / 1024 / 1024 < 1;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		return isJpgOrPng && isLt2M;
	};
	const removeAfterUpload = (index) => {
		setThumbnail(null)
		message.success('File Deleted Successfully');
	}
	return (
		// <Upload
		// 	name="avatar"
		// 	listType="picture-card"
		// 	className="avatar-uploader"
		// 	showUploadList={false}
		// 	customRequest={dummyRequest}
		// 	beforeUpload={beforeUpload}
		// 	onChange={handleChange}>
		// 	<div>
		// 		{isUploading ? (
		// 			<Fragment>
		// 				<LoadingOutlined />
		// 				<div className="ant-upload-text">Uploading Thumbnail</div>
		// 			</Fragment>
		// 		) : (
		// 			<Fragment>
		// 				<CustIcon type="upload" className="primary-text-color" />
		// 				<div className="ant-upload-text">
		// 					{!imageUrl ? 'Upload' : 'Change'} Thumbnail
		// 				</div>
		// 			</Fragment>
		// 		)}
		// 	</div>
		// </Upload>
		<><Dragger
			className="w-100 upLoadSection"
			listType="picture"
			showUploadList={'showRemoveIcon'}
			customRequest={dummyRequest}
			beforeUpload={beforeUpload}
			onChange={handleChange}
			accept={['image/*']}
			//	onRemove={handleFileRemove}
			fileList={uploadList}
			//disabled={fileLimit && totalMediaCount >= fileLimit}
			className="uploadbox">
			<p className="ant-upload-drag-icon">
				<img src={require('../../Assets/images/ic_upload_files.png')} />
			</p>
			<p className="ant-upload-text">Drag & Drop your files here</p>
			<p className="ant-upload-or-text">OR</p>
			<p className="ant-upload-hint">
				<Button type="primary" size="large">
					Browse Files
			</Button>
		</p>
	</Dragger>
	{thumbnail != null && <div className="allUploadedMedia"><div key={1} className="allMedia ">	
	<div className="allMediaBox">
		<img
			width=""
			alt=""
			className="brdrd"
			src={bucketUrl + thumbnail}
		/>
	</div>
	<img index={1}
		removeMedia={removeAfterUpload} src={require('../../Assets/images/ic_upload_files.png')} />
	{/* <CustIcon
		type="close"
		
	/> */}
</div></div>}</>
	);
};

export { ThumbnailUploader };
