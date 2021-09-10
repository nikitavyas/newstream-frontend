import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { graphql } from '@apollo/react-hoc';
import { Card, Col, message, Row, Table, Typography, Upload , Pagination} from 'antd';
import axios from 'axios';
import md5 from 'md5';
import moment from 'moment';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import { compose } from 'recompose';
import { Loader } from '../../Components/Loader';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import {
	DOCUMENT_UPLOADS,
	FILE_UPLOADS,
	GETAPPCONFIG,
	GET_INVOICE,
} from '../../graphql/APIs';
import './MyInvoice.css';
import { CustIcon } from '../Svgs';
import {
	addBreadcrumb as SentryLog,
	captureException as SentryError,
	Severity,
} from '@sentry/react';
import queryString from 'query-string';
const { Title } = Typography;

function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
}

class MyInvoice extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editProfile: true,
			imageLoading: false,
			fileObj: {},
			imageUrl: null,
			bucketDetails: {},
			invoices: [],
			mediaSize: undefined,
			saveReporterInvoice: {},
			// defaultpage:1,
			totalInvoice:0,
			LIMIT:5,
			invoicePage:1,
			loading:true,
			// variables:{}
			fileUrl:undefined
			
		};
		
	}

	async componentDidMount() {
		try {
			const { client } = this.props;
			const { data } = await client.query({ query: GETAPPCONFIG });
			this.setState({ bucketDetails: data.getAppConfig.bucketDetails });
			
			const variables = { page: +this.state.invoicePage , limit:this.state.LIMIT};
			this.getInvoices(variables)

		} catch (error) {
			// console.log('componentDidMount error', error);
		}
	}



	getInvoices = async (variables) => {
		const {
			data: { getAllReporterInvoice:{totalInvoice,invoices} },
		} = await this.props.client.query({
			query: GET_INVOICE,
			variables :variables,
			fetchPolicy: 'network-only',
		});
		this.setState({ isLoaded:true , invoices, documentLoader: false ,totalInvoice,loading:false })
		
	};

	handleCancel = () => this.setState({ previewVisible: false });

	handleChange = (info) => {
		
		 if (info.file.status === 'uploading') {
			//setIsUploading(true);
			this.setState({ imageLoading: true });
			return;
		}
		if (info.fileList[0].status === 'done') {
			//setFileObj(info.file.originFileObj);
		// this.setState({ fileObj: info.file.originFileObj });

		this.getBase64(this.state.fileObj, (fileUrl) => {
			this.setState({fileUrl:fileUrl})
			this.fileUploadHandler(fileUrl);
			this.setState({ imageLoading: true });
		});
		}
	};
	getBase64 = (img, callback) => {
		try {
			// console.log('img');
			const reader = new FileReader();
			reader.addEventListener('load', () => callback(reader.result));
			reader.readAsDataURL(img);
		} catch (e) {
			// console.log(e);
		}
	};

	removeMediaHandler = (file) => {
		try {
			this.deleteInvoice();
			const storyMedia = [...this.state.storyMedia];
			const result = storyMedia.filter((data) => {
				const name = data.mediaName.split('/')[1];
				return name !== file.originFileObj.name;
			});
			this.setState({ storyMedia: result });
		} catch (error) {}
	};

	deleteInvoice = async () => {
		try {
			const { invoiceId } = this.state.saveReporterInvoice;
			// Remove invoice from cache
			this.removeInvoiceFromCache(invoiceId);
		} catch (err) {
			throw err;
		}
	};

	removeInvoiceFromCache = (invoiceId) => {
		try {
			const data = this.props.client.readQuery({
				query: GET_INVOICE,
			});

			const filteredInvoices = data.getAllReporterInvoice.invoices.filter(
				(invoice) => invoice.invoiceId !== invoiceId
			);

			this.props.client.writeQuery({
				query: GET_INVOICE,
				data: { getAllReporterInvoice: [...filteredInvoices] },
			});
		} catch (error) {
			// console.log('removeInvoiceFromCache error', error);
		}
	};

	_suggestionSelect = (result, lat, lng) => {
		this.setState({ location: result, lat: lat, lng: lng });
		this.formRef.current.setFieldsValue({ location: result });
	};

	beforeUploadHandler = (file) => {
		const fileRegex = /(.pdf)$/;
		if (!fileRegex.test(file.name)) {
			message.warning('Please select pdf files only');
			return Promise.reject(false);
		}
	};

	// dummyRequest = async ({ file, onSuccess }) => {
	// 	this.setState({ mediaSize: this.state.mediaSize + file.size });
	// 	try {
	// 		//const medias = [...this.state.storyMedia];
	// 		//medias.push(data);
	// 		//this.setState({ storyMedia: medias });
	// 		onSuccess('ok');
	// 		//this.getInvoices();
	// 	} catch (err) {
	// 		// onSuccess("ok");
	// 		message.error(`Failed to upload ${file.name}`);
	// 	}
	// };
	 dummyRequest = ({file, onSuccess }) => {
		console.log('file',file)
		this.setState({ fileObj: file });
		this.setState({orjObj:file})
		setTimeout(() => {
		onSuccess('ok');
		}, 0);
		};

	fileUploadHandler = async (file) => {
		try {
			
			const url = await this.s3UploadUrlHandler(file);
			const filepath = await this.uploadFile(url);
			const {
				data: { saveReporterInvoice },
			} = await this.uploadInvoice(filepath);
			this.setState({ saveReporterInvoice, imageLoading: false });
			const variables = { page: +this.state.invoicePage , limit:this.state.LIMIT};
			this.getInvoices(variables)
			message.success('Invoice uploaded successfully');
		} catch (err) {
			throw err;
		}
	};
	s3UploadUrlHandler = async () => {
		const encodedFileName =
			md5(this.state.fileObj.name) +
			new Date().toLocaleDateString().replace('/', '').replace('/', '') +
			'.' +
			this.state.fileObj.name.split('.')[1];
		const { client } = this.props;
		return new Promise((resolve, _reject) => {
			client
				.mutate({
					variables: {
						fileName: 'reporterCV/' + this.state.fileObj.name,
						fileType: this.state.fileObj.type,
					},
					mutation: FILE_UPLOADS,
				})
				.then((result) => {
					resolve(result.data.generateUrl);
				})
				.catch((error) => {});
		});
	};
	getPresignUrl = async (file) => {
		try {
			const { client } = this.props;
			const {
				data: { generateUrl },
			} = await client.mutate({
				variables: {
					fileName: 'reporterCV/' + file.name,
					fileType: file.type,
				},
				mutation: FILE_UPLOADS,
			});
			return generateUrl;
		} catch (err) {
			throw err;
		}
	};

	uploadFile = async (signedUrl) => {
		const file = this.state.fileObj;
		try {
			await axios.put(signedUrl, file, {
				headers: {
					'Content-Type': file.type,
				},
			});
			return 'reporterCV/' + file.name;
		} catch (err) {
			throw err;
		}
	};

	uploadInvoice = (url) => {
		const { client } = this.props;

		return client.mutate({
			variables: {
				fileName: url,
				// fileType: file.type
			},
			mutation: DOCUMENT_UPLOADS,
		});
	};

	_writeQuery = (newInvoice) => {
		try {
			const data = this.props.client.readQuery({
				query: GET_INVOICE,
			});

			this.props.client.writeQuery({
				query: GET_INVOICE,
				data: {
					getAllReporterInvoice: [...data.getAllReporterInvoice, newInvoice],
				},
			});
			return true;
		} catch (error) {
			// console.log('_writeQuery error', error);
		}
	};
	onPagination = (page) =>{
		try {
			
			this.setState({
				invoicePage : page
			})
			const variables = { page:page  , limit:this.state.LIMIT};
			this.getInvoices(variables)
		} catch (error) {
			SentryError(error);
		}
	}

	render() {
		// console.log('render', this.props);
		const uploadButton = (
			<div>
				{this.state.imageLoading ? (
					<LoadingOutlined />
					
				) : (
					<CustIcon type="uploadicon" />
				)}
				{this.state.imageLoading  ? <div className="ant-upload-text">Uploading</div> : <div className="ant-upload-text">Upload</div> }
			</div>
		);

		return (
			<React.Fragment>
				<div className="myInvoice_blk">
					{/* <Upload
								customRequest={this.dummyRequest}
								beforeUpload={this.beforeUploadHandler}
								listType="picture-card"
								// accept={['application/*', 'video/*', 'image/*']}
								multiple={true}
								onRemove={this.removeMediaHandler}
								onChange={this.handleChange}
							>
								{uploadButton}
							</Upload> */}
					<Upload
						accept="application/pdf"
						listType="picture-card"
						name="avatar"
						className="resumeUploader mb-3"
						showUploadList={false}
						customRequest={this.dummyRequest}
						onChange={this.handleChange}
						onRemove={this.removeMediaHandler}>
						{uploadButton}
					</Upload>
					{this._renderDocuments()}
				</div>
			</React.Fragment>
		);
	}

	_renderDocuments = () => {
		const {
			bucketDetails: { CLOUDFRONT_URL },
		} = this.state;
		const { loading,invoices } = this.state;
		const _invoices =
		invoices && invoices.map((ri) => {
				const newInvoice = {};
				const { invoice, createdDate } = ri;
				newInvoice.invoice = invoice.split('/')[1];
				newInvoice.createdDate = moment(
					createdDate ? new Date(parseFloat(createdDate)) : new Date()
				).format('MM-DD-YYYY');
				newInvoice.download = `${CLOUDFRONT_URL}${invoice}`;
				return newInvoice;
			});
		const columns = [
			{
				title: 'File Name',
				dataIndex: 'invoice',
				key:"invoice",
				ellipsis: 'true',
				sorter: {
					compare: ((a, b) => (a.invoice.toLowerCase() > b.invoice.toLowerCase()) *2 - 1),
					multiple: 3,
				},	
			},
			{
				title: 'Created Date',
				dataIndex: 'createdDate',
				sorter: {
					compare: (a, b) => new Date(a.createdDate) - new Date(b.createdDate) ,
					multiple: 3,
				},
			},
			{
				title: 'Download',
				dataIndex: 'download',
				className: 'text-center',
				render: (url) => {
					return (
						<a className="downloadbtn" href={url} target="blank" download>
							<CustIcon type="downloadicon1" />
						</a>
					);
				},
			},
		];

		return loading ? (
			<Loader />
		) : (
			<div className="">
				<Table
					columns={columns}
					dataSource={_invoices}
					className="commontable myInvoiceTable"
					pagination = {false}
				/>
				
				 <Pagination  
					 showTotal={(total) =>
					`Total ${total} ${total > 1 ? 'items' : 'item'}`
					 }
					 total={this.state.totalInvoice} 
					 pageSize={this.state.LIMIT} 
					 current={this.state.invoicePage}
					 onChange={this.onPagination} 
				 />
			</div>
		);
	};
}

const enhancedMyInvoice = compose(withApollo)(MyInvoice);
export { enhancedMyInvoice as MyInvoice };
