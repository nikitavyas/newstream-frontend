/* eslint-disable no-useless-escape */
import React, { createRef, useEffect, useState } from 'react';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import {
	Button,
	Checkbox,
	Col,
	Form,
	Input,
	message,
	Modal,
	Radio,
	Row
} from 'antd';
import { useApolloClient } from 'react-apollo';
import { useHistory } from 'react-router-dom';
import { SUBMIT_LIVE_STORY } from '../../../graphql/mutation';
import { PreviewLiveStreamModal } from '../../Modals';
import { ThumbnailUploader } from '../../Uploader';
import './Live.css';

const SubmitLiveStory = () => {
	const client = useApolloClient();
	const liveStorySubmitForm = createRef();
	const browserHistory = useHistory();
	const [thumbnail, setThumbnail] = useState(undefined);
	const [isUploading, setIsUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showVideoModal, setShowVideoModal] = useState(false);
	const [urlLink, setUrlLink] = useState(undefined);
	const [linkType, setLinkType] = useState('youtube');
	const [unSubmittedStoryId, setUnSubmittedStoryId] = useState(undefined);
	const bucketUrl = localStorage.getItem('cloudUrl');
	const RequestData = JSON.parse(localStorage.getItem('request'));

	useEffect(() => {
		liveStorySubmitForm.current.setFieldsValue({
			thumbnail: thumbnail,
		});
	}, [thumbnail]);

	useEffect(() => {
		getBlankStoryId();
	}, []);

	const getBlankStoryId = () => {
		if (RequestData.stories.length > 0) {
			RequestData.stories.forEach((singleStory) => {
				if (!singleStory.storyLiveStream) {
					setUnSubmittedStoryId(singleStory.storyId);
				}
			});
		}
	};

	const onSubmit = ({
		url,
		thumbnail,
		source,
		reporterNote,
	}) => {
		SentryLog({
			category: 'data-mutate',
			message: 'Started Submitting Live Story',
			level: Severity.Debug,
		});
		setIsSubmitting(true);
		let storyVariables = {};
		storyVariables.note = reporterNote;
		storyVariables.title = RequestData.title;
		storyVariables.isIndependant = false;
		storyVariables.isLive = true;
		storyVariables.price =RequestData.price.toString();
		storyVariables.lat = parseFloat(RequestData.lat);
		storyVariables.lng = parseFloat(RequestData.lng);
		storyVariables.requestId = RequestData.requestId;
		storyVariables.storyDateTime = new Date().getTime().toString();
		storyVariables.storyLiveStream = {
			url: url,
			thumbnail: thumbnail,
			type: source,
			scheduleDate: new Date(RequestData.scheduleDate).getTime().toString(),
		};
		storyVariables.location = RequestData.location;
		storyVariables.storyId = unSubmittedStoryId;
		SentryLog({
			category: 'data-mutate',
			message: `Started Submitting Live Story for variables ${JSON.stringify(
				storyVariables
			)}`,
			level: Severity.Debug,
		});
		client
			.mutate({
				mutation: SUBMIT_LIVE_STORY,
				variables: storyVariables,
			})
			.then(() => {
				SentryLog({
					category: 'data-mutate',
					message: 'Live Story submitted successfully',
					level: Severity.Debug,
				});
				setIsSubmitting(false);
				Modal.success({
					title: '',
					icon: (
						<div className="popDeleteicon">
							<img
								alt=""
								src={require('../../../Assets/images/thumb-icon.svg')}
							/>
						</div>
					),
					content: 'Story uploaded successfully.',
					className: 'notificationModal',
					width: 500,
				});
				browserHistory.push('/requests/assigned');
			})
			.catch((error) => {
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	const cancelSubmit = () => {
		Modal.confirm({
			// title: 'Cancel story ?',
			content: 'Are you sure want to cancel the submission?',
			width: 500,
			className: 'notificationModal',
			icon: (
				<div className="popimageBox">
					<img alt="" src={require('../../../Assets/images/logout-img.png')} />
				</div>
			),
			onOk() {
				SentryLog({
					category: 'data-mutate',
					message: 'Cancelled Submitting Live Story',
					level: Severity.Debug,
				});
				browserHistory.goBack();
			},
		});
	};

	const onPreviewClick = () => {
		SentryLog({
			category: 'preview',
			message: 'Show Preview Modal',
			level: Severity.Debug,
		});
		if (liveStorySubmitForm.current.getFieldError('url').length > 0) {
			message.error(`Please enter valid ${linkType} video URL`);
		} else {
			setShowVideoModal(true);
		}
	};

	const onFormValueChange = ({ url, source }) => {
		if (url) {
			setUrlLink(url);
		}
		if (source) {
			liveStorySubmitForm.current.resetFields(['url']);
			setLinkType(source);
		}
	};
	
 
   return (
		<div className="liveStorySubmitForm_blk">
			<Form
				ref={liveStorySubmitForm}
				onFinish={onSubmit}
				layout="vertical"
				className="newstoryForm"
				onValuesChange={onFormValueChange}>
				{/* <Row gutter={30}>
					<Col sm={8} xs={24}>
						<Form.Item
							name="scheduleDateTime"
							initialValue={moment(
								new Date(parseInt(RequestData.scheduleDate))
							)}>
							<DatePicker
								showTime
								format="MM-DD-YYYY HH:mm"
								disabled
								defaultValue={moment(
									new Date(parseInt(RequestData.scheduleDate))
								)}
								value={moment(new Date(parseInt(RequestData.scheduleDate)))}
							/>
						</Form.Item>
					</Col>
				</Row> */}
				<Form.Item
					name="source"
					rules={[{ required: true, message: 'Please select a source' }]}
					initialValue={linkType}>
					<Radio.Group>
						<Radio value="youtube">Youtube</Radio>
						<Radio value="facebook">Facebook</Radio>
					</Radio.Group>
				</Form.Item>
				<Row align="middle" gutter={20} className="d-flex align-items-center">
					<Col sm={16} md={20} xs={24}>
						<div className="ant-col ant-form-item-label d-flex flex-row">
							<label htmlFor="title" title="Enter Channel URL">
								Enter Channel URL
							</label>
						</div>
						<Form.Item
							name="url"
							labelCol={{ span: 24 }}
							rules={[
								{ required: true, message: 'Please enter the URL' },
								{
									pattern:
										linkType === 'youtube'
											? new RegExp(
													`^http(?:s?):\\/\\/(?:www\\.|m\\.)?youtu(?:be\\.com\\/watch\\?v=|\\.be\\/)([\\w\\-\\_]*)(&(amp;)?[\\w\\?=]*)?`
											  )
											: new RegExp(
													`^https?:\/\/www\.facebook\.com.*\/(video(s)?|watch|story)(\.php?|\/).+$`
											  ),
									message: 'Invalid URL',
								},
							]}>
							<Input placeholder="Enter Channel URL" />
						</Form.Item>
					</Col>
					<Col sm={8} md={4} xs={24} className="mt-xl-1 mt-lg-2 mb-3 mb-sm-0">
						{urlLink && (
							<PreviewLiveStreamModal
								url={urlLink}
								type={linkType}
								displayModal={setShowVideoModal}
								show={showVideoModal}
							/>
						)}
						<Button
							type="primary"
							size="large"
							onClick={onPreviewClick}
							disabled={!urlLink}>
							Preview
						</Button>
					</Col>
				</Row>

				<Row gutter={20}>
					<Col lg={24} xs={24}>
						<div className="ant-col ant-form-item-label">
							<label htmlFor="title" title="Thumbnail">
								Thumbnail
							</label>
						</div>
						{/* <div className="thumbnail mb-2 mr-3">
							<img
								src={thumbnail ? bucketUrl + thumbnail : thumbnailPlaceholder}
								alt="thumbnail"
								className=""
							/>
						</div> */}
						<Form.Item
							className="mb-2"
							name="thumbnail"
							rules={[
								{ required: true, message: 'Please upload a thumbnail' },
							]}>
							<ThumbnailUploader
								setUploadingFlag={setIsUploading}
								folderName="storyThumbnail"
								fileUpload={setThumbnail}

							/>
						</Form.Item>
					</Col>
				</Row>

				<Row className="pt-3">
					<Col span={24}>
						<div className="label_blk mb-1">Content Creator's Notes</div>
						<Form.Item name="reporterNote">
							<Input.TextArea autoSize={{ minRows: 3 }} />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item
					name="agreement"
					valuePropName="checked"
					rules={[
						{
							validator: (_, value) =>
								value
									? Promise.resolve()
									: Promise.reject('Please grant the permission'),
						},
					]}>
					<Checkbox>
						I grant permission to use my uploaded content in any media for
						Newstream.
					</Checkbox>
				</Form.Item>
				<div className="text-right pt-lg-5 pt-0">
					<Form.Item>
						<Button
							type="primary"
							size="large"
							htmlType="submit"
							loading={isUploading || isSubmitting}
							disabled={isUploading || isSubmitting}>
							{isSubmitting
								? 'Submitting'
								: isUploading
								? 'Uploading'
								: 'Submit'}
						</Button>
						<Button className="ml-2" onClick={cancelSubmit} size="large">
							Cancel
						</Button>
					</Form.Item>
				</div>
			</Form>
		</div>
	);
};

export { SubmitLiveStory };
