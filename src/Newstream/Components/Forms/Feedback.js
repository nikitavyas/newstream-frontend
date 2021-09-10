import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import { Button, Form, message, Modal, Select } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo';
import { FEEDBACK_MUTATION } from '../../graphql/APIs';
import { MediaUploader } from '../Uploader';
import './feedback.css';

const { Option } = Select;

const FeedbackForm = () => {
	const [formHook] = Form.useForm();
	const [fileUploadList, setFileUploadList] = useState([]);
	const [submitLoader, setSubmitLoader] = useState(false);
	const [uploadLoader, setUploadLoader] = useState(false);
	const client = useApolloClient();

	/**
	 * onFinish
	 * Function calls when user want to Share Feedback and submit the details.
	 * @param {*} values 
	 */
	const onFinish = (values) => {
		/* */
		setSubmitLoader(true);
		var variables = {};
		if (values.category === 'bug') {
			variables = {
				category: values.category,
				description: values.issueDetail,
				outcome: values.actualOutcome,
				attachments: fileUploadList,
			};
		}
		if (values.category === 'feedback') {
			variables = {
				category: values.category,
				description: values.description,
			};
		}
		SentryLog({
			category: 'data-mutate',
			message: `Submit ${values.category} for variables ${JSON.stringify(
				variables
			)}`,
			level: Severity.Debug,
		});
		client
			.mutate({
				variables: variables,
				mutation: FEEDBACK_MUTATION,
			})
			.then(() => {
				setSubmitLoader(false);
				SentryLog({
					category: 'data-mutate',
					message: `Feedback/Bug Submitted Successfully`,
					level: Severity.Debug,
				});
				Modal.success({
					title: '',
					icon: (
						<div className="popDeleteicon">
						<img alt="" src={require('../../Assets/images/thumb-icon.svg')} />
						</div>
					),
					content: 'Feedback sent successfully.',
					className: 'notificationModal',
					width: 500,
				});
				formHook.resetFields();
			})
			.catch((error) => {
				setSubmitLoader(false);
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					message.destroy();
				} else {
					SentryError(error);
					message.destroy();
					message.error('Something went wrong please try again later.');
				}
			});
	};

	return (
		<Form
			layout="vertical"
			form={formHook}
			onFinish={onFinish}
			className="feedbackForm"
			initialValues={{ category: 'feedback' }}>
			<Form.Item
				name="category"
				label="Select Category"
				rules={[{ required: true }]}>
				<Select placeholder="Select a option and change input text above">
					<Option value="feedback">Feedback</Option>
					<Option value="bug">Bug</Option>
				</Select>
			</Form.Item>
			<Form.Item
				noStyle
				shouldUpdate={(prevValues, currentValues) =>
					prevValues.category !== currentValues.category
				}>
				{({ getFieldValue }) => {
					const CategoryValue = getFieldValue('category');
					switch (CategoryValue) {
						case 'bug':
							return (
								<>
									<Form.Item
										name="issueDetail"
										placeholder="What issue are you facing?"
										label="My issue is"
										rules={[
											{ required: true, message: 'Please Enter Brief Details' },
										]}>
										<TextArea autoSize={{ minRows: 3, maxRows: 20 }} />
									</Form.Item>
									<Form.Item
										name="actualOutcome"
										placeholder="What should be the actual outcome?"
										label="It should be like"
										rules={[
											{
												required: true,
												message: 'Please Enter Actual Outcome',
											},
										]}>
										<TextArea autoSize={{ minRows: 3, maxRows: 20 }} />
									</Form.Item>
									<Form.Item
										name="bugImages"
										label="Upload Relevant Images"
										rules={[{ message: 'Please upload media' }]}>
										<MediaUploader
											uploaderText="Upload your screenshots here"
											uploadFolderName="feedback"
											isUploading={setUploadLoader}
											allowedMediaTypes={['image']}
											returnUploadedFiles={setFileUploadList}
											fileLimit={5}
										/>
									</Form.Item>
								</>
							);
						case 'feedback':
							return (
								<Form.Item
									name="description"
									placeholder="Enter Description here"
									label="Description"
									className="mb-4"
									rules={[
										{ required: true, message: 'Please Enter Brief Details' },
									]}>
									<TextArea autoSize={{ minRows: 3, maxRows: 20 }} />
								</Form.Item>
							);
						default:
							break;
					}
				}}
			</Form.Item>
			<Form.Item className="actionForm text-center pt-0 pt-lg-5">
				<Button
					loading={submitLoader || uploadLoader}
					disabled={uploadLoader}
					type="primary"
					size="large"
					htmlType="submit">
					{uploadLoader ? 'Uploading Files...' : 'Submit'}
				</Button>
			</Form.Item>
		</Form>
	);
};

export { FeedbackForm };
