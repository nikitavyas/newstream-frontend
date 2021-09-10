import { message, Upload } from 'antd';
import axios from 'axios';
import md5 from 'md5';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { FILE_UPLOADS } from '../../graphql/APIs';
// import { MediaSizeCount } from '../MediaSize/MediaSize';
import { CustIcon } from '../Svgs';

const FileUploader = ({
	uploaderText,
	allowedMediaTypes,
	uploadFolderName,
	isUploading,
	returnUploadedFiles,
	fileLimit,
	allowMultiple,
}) => {
	const [acceptedMedia, setAcceptedMedia] = useState([]);
	const [totalSize, setTotalSize] = useState(0);
	const [isMediaUploading, setIsMediaUploading] = useState(false);
	const [mediaList, setMediaList] = useState([]);
	const [totalMediaCount, setTotalMediaCount] = useState(0);
	const [successMediaCount, setSuccessMediaCount] = useState(0);
	const [axiosTokenList, setAxiosTokenList] = useState([]);
	const [uploadList, setUploadList] = useState([]);
	const client = useApolloClient();
	const bucketUrl = localStorage.getItem('cloudUrl');

	useEffect(() => {
		formatMediaAccepted();
	}, []);

	useEffect(() => {
		isUploading(isMediaUploading);
	}, [isMediaUploading]);

	useEffect(() => {
		if (totalMediaCount === successMediaCount) {
			setIsMediaUploading(false);
		}
	}, [successMediaCount, totalMediaCount]);

	useEffect(() => {
		// Convert Return File according to the folder requirement\
		let returnList = [];
		switch (uploadFolderName) {
			case 'feedback':
				mediaList.forEach((singleMedia) => {
					returnList.push(singleMedia.name);
				});
				returnUploadedFiles(returnList);
				break;

			case 'story':
				mediaList.forEach((singleMedia) => {
					returnList.push({
						mediaName: singleMedia.name,
						type: singleMedia.type,
					});
				});
				returnUploadedFiles(returnList);
				break;
			default:
				break;
		}
	}, [mediaList]);

	const formatMediaAccepted = () => {
		if (allowedMediaTypes.includes('image')) {
			setAcceptedMedia((acceptedMedia) => [...acceptedMedia, 'image/*']);
		}
		if (allowedMediaTypes.includes('video')) {
			setAcceptedMedia((acceptedMedia) => [...acceptedMedia, 'video/*']);
		}
		if (allowedMediaTypes.includes('audio')) {
			setAcceptedMedia((acceptedMedia) => [...acceptedMedia, 'audio/*']);
		}
	};

	const handlePreUploadCheck = (file) => {
		if (!navigator.onLine) {
			message.error(
				'You are not connected to the internet. Please check your connection'
			);
			return Promise.reject(false);
		}
		if (fileLimit && totalMediaCount >= fileLimit) {
			message.error(`You cannot upload more than ${fileLimit} files`);
			return Promise.reject(false);
		}
		if (!acceptedMedia.includes(file.type.split('/')[0] + '/*')) {
			message.warning(`Please select Audio, video or image files only`);
			return Promise.reject(false);
		}
		const fileRegex = /(.avi|.mov|.MOV|.mp4|.mp3|gif|jpe?g|tiff|png|webp|bmp|jpg)$/;
		if (!fileRegex.test(file.name.toLowerCase())) {
			message.warning('Unsupported File Type');
			return Promise.reject(false);
		}
	};

	const onFileUpload = async ({ file, onSuccess, onError, onProgress }) => {
		setIsMediaUploading(true);
		setTotalMediaCount((currentMediaCount) => currentMediaCount + 1);
		const { signedUrl, fileName } = await generateUploadedUrl(file);
		const CancellationToken = axios.CancelToken.source();
		setAxiosTokenList((existingUploads) => [
			...existingUploads,
			{ ...file, cancelToken: CancellationToken },
		]);
		axios
			.put(signedUrl, file, {
				onUploadProgress: ({ total, loaded }) => {
					onProgress({
						percent: Math.round((loaded / total) * 100).toFixed(2),
						file,
					});
				},
				cancelToken: CancellationToken.token,
				headers: {
					'Content-Type': file.type,
				},
			})
			.then(({ data: response }) => {
				setTotalSize((currentSize) => currentSize + file.size);
				setMediaList((currentMediaList) => [
					...currentMediaList,
					{
						name: fileName,
						type: file.type.split('/')[0],
						size: file.size,
						uid: file.uid,
					},
				]);
				setSuccessMediaCount((currentCount) => currentCount + 1);
				onSuccess(response, file);
			})
			.catch((error) => {
				if (error.message === 'Network Error') {
					message.error(
						'File upload failed due to unstable internet connection.'
					);
					onError(error);
					setIsMediaUploading(false);
				}
			});
	};

	const generateUploadedUrl = async ({ name, type }) => {
		try {
			var folderName =
				uploadFolderName +
				(type.charAt(0).toUpperCase() + type.slice(1)).split('/')[0];

			var fileName =
				folderName +
				'/' +
				md5(name) +
				new Date().toLocaleDateString().replace('/', '').replace('/', '') +
				'.' +
				name.split('.')[1];

			const {
				data: { generateUrl },
			} = await client.mutate({
				variables: {
					fileName,
					fileType: type,
				},
				mutation: FILE_UPLOADS,
			});
			return { signedUrl: generateUrl, fileName: fileName };
		} catch (error) {
			throw error;
		}
	};

	const handleFileStatusChange = ({ file, fileList }) => {
		setUploadList([...fileList]);
		if (file.status === 'done') {
			setUploadList((currentList) =>
				currentList.filter((singleFile) => {
					return singleFile.uid !== file.uid;
				})
			);
		}
	};

	const handleFileRemove = (deletedFile) => {
		const { cancelToken } = axiosTokenList.find((singleUpload) => {
			return singleUpload.uid === deletedFile.uid;
		});
		cancelToken.cancel('Removed by user');
		setUploadList((currentList) =>
			currentList.filter((singleFile) => {
				return singleFile.uid !== deletedFile.uid;
			})
		);
		setTotalMediaCount((currentMediaCount) => currentMediaCount - 1);
		message.success('File Deleted Successfully');
	};

	const removeAfterUpload = (index) => {
		const removedFile = mediaList[index];
		setSuccessMediaCount((currentCount) => currentCount - 1);
		setTotalMediaCount((currentCount) => currentCount - 1);
		setTotalSize((currentSize) => currentSize - removedFile.size);
		setMediaList((currentMedia) =>
			currentMedia.filter((singleFile) => {
				return singleFile.uid !== removedFile.uid;
			})
		);
		message.success('File Deleted Successfully');
	};

	return (
		<>
			{/* {totalMediaCount > 0 && (
				<div className="d-flex flex-md-row flex-column align-items-md-center justify-content-md-between">
					<div className="mb-2 small">
						<strong>
							{`${successMediaCount} files of ${totalMediaCount} uploaded`}
						</strong>
					</div>
					<div className="mb-2 small">
						<strong>Total File Size : </strong>
						<MediaSizeCount bytes={totalSize} />
					</div>
				</div>
			)} */}
			<Upload
				className="w-100 upLoadSection"
				listType="picture"
				showUploadList={'showRemoveIcon'}
				multiple={allowMultiple}
				beforeUpload={handlePreUploadCheck}
				accept={acceptedMedia}
				onRemove={handleFileRemove}
				customRequest={onFileUpload}
				onChange={handleFileStatusChange}
				fileList={uploadList}
				disabled={fileLimit && totalMediaCount >= fileLimit}>
				{fileLimit && totalMediaCount >= fileLimit ? (
					<div className="ant-upload-text">Maximum Files Uploaded</div>
				) : (
					<>
						<CustIcon type="upload" className="primary-text-color" />
						<div className="ant-upload-text">{uploaderText}</div>
					</>
				)}
			</Upload>
			{successMediaCount > 0 && (
				<div className="allUploadedMedia">
					{mediaList.map((singleMedia, index) => {
						switch (singleMedia.type) {
							case 'image':
								return (
									<div key={index + 1} className="allMedia ">
										<CustIcon
											type="close"
											index={index}
											removeMedia={removeAfterUpload}
										/>
										<div className="allMediaImage">
											<img
												width=""
												alt=""
												className="brdrd"
												src={bucketUrl + singleMedia.name}
											/>
										</div>
									</div>
								);
							case 'audio':
								return (
									<div key={index + 1} className="allMedia ">
										<CustIcon
											type="close"
											index={index}
											removeMedia={removeAfterUpload}
										/>
										<div className="allMediaAudio">
											<img
												width=""
												alt=""
												className="brdrd"
												src={require('../../Assets/images/ic_audio_purple@2x.png')}
											/>
										</div>
									</div>
								);
							case 'video':
								return (
									<div key={index + 1} className="allMedia ">
										<CustIcon
											type="close"
											index={index}
											removeMedia={removeAfterUpload}
										/>
										<div className="allMediaVideo">
											<img
												width=""
												alt=""
												className="brdrd"
												src={require('../../Assets/images/ic_video_purple@2x.png')}
											/>
										</div>
									</div>
								);

							default:
								return null;
						}
					})}
				</div>
			)}
		</>
	);
};

export { FileUploader };
