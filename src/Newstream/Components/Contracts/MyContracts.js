import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader } from 'reactstrap';
import {
	Table,
	Button,
	message,
	Switch,
	Modal,
	Typography,
	Row,
	Col,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';

import moment from 'moment';
import _, { findIndex } from 'lodash';
import { withApollo } from '@apollo/react-hoc';
import { GET_USER_CONTRACTS } from '../../graphql/APIs';
import { ProfileSideMenu } from '../../Components/ProfileSideMenu';
import { COULDBASEURL } from '../../Components/general/constant';
import { captureException as SentryError } from '@sentry/react';

const { Column } = Table;
const { confirm } = Modal;
const { REACT_APP_Bucket } = process.env;
const { Title } = Typography;

const MyContracts = ({ client }) => {
	const [dataLoading, setTableLoader] = useState(false);
	const [contractData, setTableData] = useState([]);

	useEffect(() => {
		getAllContracts();
	}, []);
	const onDownloadContract = async (fileName) => {
		saveAs(
			COULDBASEURL + fileName,
			fileName.substring(fileName.indexOf('/') + 1)
		);
	};
	/**
	 * @name getAllContracts
	 * @description get all contracts belong to publisher
	 * */
	const getAllContracts = async () => {
		try {
			setTableLoader(true);
			const {
				data: { getUserContracts },
			} = await client.query({
				query: GET_USER_CONTRACTS,
				fetchPolicy: 'no-cache',
			});
			/*Update TableData of contracts */
			setTableData(getUserContracts);
			setTableLoader(false);
		} catch (error) {
			setTableLoader(false);
			if (error.graphQLErrors && error.graphQLErrors.length > 0) {
			} else {
				SentryError(error);
				message.destroy();
				message.error('Something went wrong please try again later');
			}
		}
	};

	return (
		<React.Fragment>
			<Card className="rightSideSetting ">
				<CardBody>
						<Table
							bordered={true}
							pagination={{
								defaultPageSize: 10,
								hideOnSinglePage: true,
							}}
							dataSource={contractData}
							loading={dataLoading}>
							<Column
								title="Document Title"
								key="title"
								render={(rowData, record) => (
									<React.Fragment>{record.contract.name}</React.Fragment>
								)}
							/>
							<Column
								title="Version"
								key="title"
								render={(rowData, record) => (
									<React.Fragment>{record.contract.version}</React.Fragment>
								)}
							/>
							<Column
								title="Signed"
								dataIndex="signed"
								key="signed"
								render={(signed, record) => (
									<React.Fragment>
										{record.signed
											? 'signed (' +
											  moment(new Date(parseFloat(record.signedDate))).format(
													'MM/DD/YYYY'
											  ) +
											  ')'
											: 'Not Signed'}
									</React.Fragment>
								)}
							/>
							<Column
								width={120}
								title="Assigned Date"
								key="createdDate"
								render={(createdBy, record) => (
									<React.Fragment>
										{moment(new Date(parseFloat(record.createdDate))).format(
											'MM/DD/YYYY'
										)}
									</React.Fragment>
								)}
							/>
							<Column
								width={120}
								title="Action"
								key="signed"
								render={(signed, record) => (
									<React.Fragment>
										{record.signed == true ? (
											record.contractPdf ? (
												<Button
													type="primary"
													shape="round"
													className="mr-sm-2 mr-1 mb-2 mb-sm-0"
													title="Download"
													onClick={(e) =>
														onDownloadContract(record.contractPdf)
													}
													icon={<DownloadOutlined />}></Button>
											) : (
												'Not Signed'
											)
										) : (
											<Link to="/contracts">View & Sign </Link>
										)}
									</React.Fragment>
								)}
							/>
						</Table>
				</CardBody>
			</Card>
		</React.Fragment>
	);
};

export default withApollo(MyContracts);
