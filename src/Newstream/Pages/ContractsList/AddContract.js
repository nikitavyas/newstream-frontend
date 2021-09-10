import React, { useState, useEffect } from 'react';
import { Row, Col, FormGroup, Label } from 'reactstrap';
import { useMutation } from '@apollo/react-hooks';
// import { Add_JOURNALIST, FILE_UPLOADS } from "../../graphql/APIs";
import axios from 'axios';
import { findIndex } from 'lodash';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Form, Input, Button, Upload, message, Select, Switch } from 'antd';
import {
	LoadingOutlined,
	PlusOutlined,
	CloseOutlined,
	CheckOutlined,
} from '@ant-design/icons';

import { Modal } from 'antd';
// import { GET_JOURNALIST_USERS } from "../../graphql/queries";

const { Option } = Select;

const { REACT_APP_Bucket } = process.env;

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

function beforeUpload(file) {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
	if (!isJpgOrPng) {
		message.error('You can only upload JPG/PNG file!');
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('Image must smaller than 2MB!');
	}
	return isJpgOrPng && isLt2M;
}

const AddJournalist = ({
	modalState,
	updateModalState,
	formData,
	removeProfileImage,
}) => {
	const [modal, setModal] = useState(modalState);
	const [loading, setLoading] = useState(false);
	const [imageLoading, setImageLogin] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const [imageObject, setImageObj] = useState({});

	const [phoneNumber, setPhoneNumber] = useState(null);

	useEffect(() => {
		if (formData && formData.length) {
			const profileImage = formData.find(
				(data) => data.name === 'profileImage'
			);
			if (profileImage && profileImage.value)
				setImageUrl(REACT_APP_Bucket + '/' + profileImage.value);
		}
	}, []);

	const handleChange = (info) => {
		if (info.file.status === 'uploading') {
			setImageLogin(true);
			return;
		}
		if (info.file.status === 'done') {
			setImageObj(info.file.originFileObj);
			getBase64(info.file.originFileObj, (imageUrl) => {
				setImageUrl(imageUrl);
				setImageLogin(false);
			});
		}
	};

	const uploadButton = (
		<div>
			{imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
			<div className="ant-upload-text">Upload</div>
		</div>
	);

	const handleCancel = () => {
		setModal(!modal);
		updateModalState(!modal);
	};

	const handleOk = () => {
		setModal(!modal);
		updateModalState(!modal);
	};

	const journalistSaveHandler = async (journalist) => {
		try {
			setLoading(true);
			let url = '';
			let uploadedFile = '';
			if (Object.keys(imageObject).length) {
				url = await gateUploadUrlHandler();
				uploadedFile = url ? await uploadFile(url) : '';
			}
			const userId = formData.find((data) => data.name === 'userId');
			let image = uploadedFile;
			if (userId) {
				const profileImage = formData.find(
					(data) => data.name === 'profileImage'
				);
				image = uploadedFile || (profileImage ? profileImage.value : '');
			}
			if (phoneNumber != null) {
				journalist.phoneNumber = phoneNumber;
			}
			const payload = {
				variables: {
					...journalist,
					userId: userId ? userId.value : '',
					profileImage: image,
					password: 'user@123',
				},
			};
			!userId && delete payload.variables.userId;
			setLoading(false);
			message.success(
				formData.length
					? 'Journalist detail updated successfully'
					: 'journalist created successfully'
			);
			updateModalState(!modal, true);
		} catch (error) {
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			} else {
				// SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later');
			}
			setLoading(false);
		}
	};

	const gateUploadUrlHandler = async () => {
		return new Promise((resolve, reject) => {
			const payload = {
				variables: {
					fileName: 'publisher/' + imageObject.name,
					fileType: imageObject.type,
				},
			};
		});
	};

	const uploadFile = async (signedUrl) => {
		return new Promise((resolve, reject) => {
			axios
				.put(signedUrl, imageObject, {
					headers: {
						'Content-Type': imageObject.type,
					},
				})
				.then(() => {
					resolve('publisher/' + imageObject.name);
				})
				.catch((e) => resolve(null));
		});
	};

	const dummyRequest = ({ file, onSuccess }) => {
		setTimeout(() => {
			onSuccess('ok');
		}, 0);
	};

	const removeImageHandler = () => {
		if (formData && formData.length) {
			removeProfileImage();
		}
		setImageUrl('');
		setImageObj({});
	};

	return (
		<div>
			<Modal
				title={formData.length ? 'Edit Contract' : 'New Contract'}
				visible={modal}
				onOk={handleOk}
				onCancel={handleCancel}
				width={800}
				footer={[
					<Button key="back" onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						form="my-form"
						key="submit"
						type="primary"
						htmlType="submit"
						loading={loading}>
						{formData.length ? 'Save changes' : 'Save'}
					</Button>,
				]}>
				<Form
					name="journalistForm"
					className="login-form"
					fields={formData}
					onFinish={journalistSaveHandler}
					id="my-form">
					<Row>
						<Col lg={12}>
							<FormGroup row>
								<Col md="2">
									<Label htmlFor="name">
										Type<span className="text-danger">*</span>
									</Label>
								</Col>
								<Col xs="12" md="10">
									<Form.Item
										name="type"
										rules={[
											{
												required: true,
												message: 'Please select type',
											},
										]}>
										<Select
											mode="multiple"
											size="default"
											placeholder="Please select"
											style={{ width: '100%' }}>
											<Option key="JOURNALIST">Journalist</Option>
											<Option key="REPORTER">Content Creator</Option>
										</Select>
									</Form.Item>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Col md="2">
									<Label htmlFor="name">
										Document Title<span className="text-danger">*</span>
									</Label>
								</Col>
								<Col xs="12" md="10">
									<Form.Item
										name="title"
										rules={[
											{
												required: true,
												message: 'Please enter document title',
											},
										]}>
										<Input placeholder="Enter Document Title" />
									</Form.Item>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Col md="2">
									<Label htmlFor="name">Upload Document</Label>
								</Col>
								<Col xs="12" md="10">
									<div className="upload_blk">
										<Upload
											name="avatar"
											listType="picture-card"
											className="avatar-uploader"
											showUploadList={false}
											customRequest={dummyRequest}
											// action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
											beforeUpload={beforeUpload}
											onChange={handleChange}>
											{imageUrl ? (
												<img
													src={imageUrl}
													alt="avatar"
													style={{ width: '100%' }}
												/>
											) : (
												uploadButton
											)}
										</Upload>
										{imageUrl && (
											<div className="removePhoto" onClick={removeImageHandler}>
												<i className="fa fa-times"></i>
											</div>
										)}
									</div>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Col md="2">
									<Label htmlFor="name">
										Status<span className="text-danger">*</span>
									</Label>
								</Col>
								<Col xs="12" md="10">
									<Form.Item name="status">
										<Switch
											checkedChildren={<CheckOutlined />}
											unCheckedChildren={<CloseOutlined />}
											defaultChecked
										/>
									</Form.Item>
								</Col>
							</FormGroup>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};

export default AddJournalist;
