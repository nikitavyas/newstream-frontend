import { message, Upload } from 'antd';
import axios from 'axios';
import md5 from 'md5';
import React, { Fragment, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { FILE_UPLOADS } from '../../../graphql/APIs';
import './ResumeUploader.css';

const ResumeUploader = ({ getUploadedFile, setUploadingFlag }) => {
	const [fileObj, setFileObj] = useState({ name: null, type: null });
	const [fileUrl, setFileUrl] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const client = useApolloClient();
	const bucketUrl = localStorage.getItem('cloudUrl');

	useEffect(() => {
		uploadFileHandler();
	}, [fileUrl]);

	useEffect(() => {
		setUploadingFlag(isUploading);
	}, [isUploading]);

	const uploadFileHandler = async () => {
		if (fileUrl) {
			const url = await s3UploadUrlHandler();
			const fileUploaded = await uploadFile(url);
			let uploadPath = '';
			if (bucketUrl) {
				uploadPath = fileUploaded.replace(bucketUrl, '');
			} else {
				uploadPath = 'reporterCV/' + fileUploaded.split('reporterCV/')[1];
			}
			const uploadFileData = {
				name: fileObj.name,
				url: uploadPath,
			};
			getUploadedFile(uploadFileData);
			setIsUploading(false);
		}
	};

	const s3UploadUrlHandler = async () => {
		const encodedFileName =
			md5(fileObj.name) +
			new Date().toLocaleDateString().replace('/', '').replace('/', '') +
			'.' +
			fileObj.name.split('.')[1];
		return new Promise((resolve, _reject) => {
			client
				.mutate({
					variables: {
						fileName: 'reporterCV/' + encodedFileName,
						fileType: fileObj.type,
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
		return new Promise((resolve, reject) => {
			axios
				.put(signedUrl, fileObj, {
					headers: {
						'Content-Type': fileObj.type,
					},
				})
				.then(() => {
					resolve(signedUrl.split('?')[0].replace('s3.amazonaws.com/', ''));
				})
				.catch((error) => {
					message.error('Error Uploading File!');
					reject(error);
				});
		});
	};

	const dummyRequest = ({ file,onSuccess }) => {
		console.log('file',file)
		setFileObj(file);
		setTimeout(() => {
			onSuccess('ok');
		}, 0);
	};

	const handleChange = (info) => {
		if (info.file.status === 'uploading') {
			setIsUploading(true);
			return;
		}
		if (info.file.status === 'done') {
			console.log(fileObj)
			// setFileObj(info.file.originFileObj);
			getBase64(fileObj, (fileUrl) => {
				setFileUrl(fileUrl);
			});
		}
	};

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

	return (
		<Upload
			accept="application/pdf"
			listType="picture-card"
			name="avatar"
			className="resumeUploader"
			showUploadList={false}
			customRequest={dummyRequest}
			onChange={handleChange}>
			<div>
				<Fragment>
					<div className="ant-upload-text">
						{isUploading ? 'Uploading' : 'Upload CV'}
					</div>
				</Fragment>
			</div>
		</Upload>
	);
};

export { ResumeUploader };
