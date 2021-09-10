import React, { Component } from 'react';
import './ContractUpload.css';
import { Button, Card, Layout, Row, Col, Upload } from 'antd';
import { withApollo } from 'react-apollo';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import SignaturePad from 'react-signature-canvas';
import Text from 'antd/lib/typography/Text';
import { CustIcon } from '../../Components/Svgs';
//import DefaultHeader from '../../../Container/DefaultHeader';

const { Content } = Layout;

class ContractUpload extends Component {
	state = { trimmedDataURL: null };
	sigPad = {};

	
	/*Clear function call for clear signpad data */
	clear = () => {
		this.sigPad.clear();
	};
	
	/*Function call for save the sigpad data*/
	trim = () => {
		/*updating state for sigpad*/
		this.setState({
			trimmedDataURL: this.sigPad.getTrimmedCanvas().toDataURL('image/png'),
		});
	};

	render() {
		const props = {
			onChange({ file }) {
				//   if (file.status !== 'uploading') {
				//     console.log(file, fileList);
				//   }
			},
		};
		return (
			<React.Fragment>
				{/* <DefaultHeader></DefaultHeader> */}
				<Content className="wrapper">
					<Layout className="contractUpload_blk">
						<Row justify="center">
							<Col span={6} col-offset={6}>
								<div className="invitationLogo">
									{/* <img alt="" src={require('../../../assets/images/transparent_logo.png')} /> */}
									<CustIcon type="logo" className="logoSvg" />
								</div>
							</Col>
							<Col span={20}>
								<Card className="invitationCard">
									<Row justify="center" gutter={[8, 24]}>
										<Col span={6} col-offset={6} className="invitation_title">
											<div className="label_blk">
												Invitation to Join Newstream
											</div>
										</Col>
										<Col span={24}>
											<div className="font-bold ">
												Kindly download, read the contract and upload your
												e-signature for the contract.
											</div>
										</Col>
									</Row>
									<Row justify="start" gutter={[8, 24]}>
										<Col span={4}>
											<Text strong>Download Contract</Text>
										</Col>
										<Col span={18}>
											<Button
												icon={<DownloadOutlined />}
												shape="round"
												size="large">
												Contract_Newstream.pdf
											</Button>
										</Col>
									</Row>
									<Row justify="start" gutter={[8, 24]}>
										<Col span={4}>
											<Text strong>Upload e-Signature</Text>
										</Col>
										<Col span={18} className="uploadFile">
											<Upload {...props} multiple={false}>
												<Button shape="round">
													<UploadOutlined /> <Text strong>Upload</Text>
												</Button>
											</Upload>
											<Text>OR</Text>
										</Col>
									</Row>
									<Row justify="Start" gutter={[8, 24]}>
										<Col span={14} offset={4}>
											<Text strong>Draw your e-Signature</Text>
											<div className="sigContainer">
												<SignaturePad
													className="sigPad"
													ref={(ref) => {
														this.sigPad = ref;
													}}
												/>
											</div>
										</Col>
										<Col span={18} offset={6}>
											<Button onClick={this.clear} className="button">
												<Text strong>Clear</Text>
											</Button>
											<Button onClick={this.trim} className="button">
												<Text strong>Save Signature</Text>
											</Button>
										</Col>
										<Col span={18} offset={6}>
											<Button
												type="primary"
												size="large"
												className="primary"
												shape="round"
												htmlType="submit">
												Submit
											</Button>
										</Col>
									</Row>
								</Card>
							</Col>
						</Row>
					</Layout>
				</Content>
			</React.Fragment>
		);
	}
}

ContractUpload = withApollo(ContractUpload);
export { ContractUpload };
