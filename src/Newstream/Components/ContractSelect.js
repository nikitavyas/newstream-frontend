import React, { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { RESEND_CONTRACT } from '../graphql/APIs';
import { useMutation } from '@apollo/react-hooks';

const { Column } = Table;

const ContractSelect = (props) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [resendContracts] = useMutation(RESEND_CONTRACT);
	const contractData = props.contractData;
	const onrowSelection = props.onrowSelection;
	const selectedContracts = props.selectedContracts;
	const userId = props.userId;
	useEffect(() => {
		let selectedData = [];
		selectedContracts &&
			selectedContracts.map((signedData, key) => {
				selectedData.push(signedData.contractId);
			});
		contractData.map((data, key) => {
			data.key = data.contractId;
			data.assignedDate = null;
			data.signedDate = null;
			const found =
				selectedContracts &&
				selectedContracts.filter((element) => {
					if (element.contractId == data.contractId) {
						return true;
					} else {
						return false;
					}
				});
			if (data.isRequired == true) {
				selectedData.push(data.contractId);
			}
			if (found != '' && found != undefined) {
				data.assignedDate = found[0].createdDate;
				data.signed = found[0].signed;
				if (found[0].signed == true) {
					data.signedDate = found[0].signedDate;
				}
			} else {
				data.signed = false;
			}
		});
		setSelectedRowKeys(selectedData);
		if (props.getCompulsoryContracts) {
			props.getCompulsoryContracts(selectedData);
		}
	}, []);
	const onSelectChange = (selectedRowKeys, selectedRows) => {
		setSelectedRowKeys(selectedRowKeys);
		onrowSelection(selectedRows);
	};
	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
		getCheckboxProps: (record) => ({
			disabled: record.signed === true,
			// // Column configuration not to be checked
			name: record.signed,
		}),
	};
	const jsUcfirst = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};
	const onResendContract = (contractId) => {
		let variables = {
			variables: {
				contractId,
				userId,
			},
		};
		resendContracts(variables).then((result) => {
			if (result.data.resendContracts.status) {
				message.success(result.data.resendContracts.message);
				getData();
			} else {
				message.error(result.data.resendContracts.message);
			}
		});
	};
	const getData = () => {
		props.getData();
	};
	return (
		<div>
			<h3 className="font14 font-weight-bold mb-2">Assign Contract</h3>
				<Table
					className="commontable"
					bordered={true}
					rowSelection={rowSelection}
					pagination={{ defaultPageSize: 5 }}
					dataSource={contractData}
					//loading={dataLoading}
					>
					<Column title="Document Title" dataIndex="name" key="name" />
					<Column title="Version" dataIndex="version" key="version" />
					<Column

						title="Document Type"
						dataIndex="contractType"
						key="contractType"
						render={(contractType, record) => (
							<React.Fragment>{jsUcfirst(contractType)}</React.Fragment>
						)}
					/>
					{selectedContracts && selectedContracts?.length > 0 && (
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
					)}
					{selectedContracts && selectedContracts.length > 0 && (
						<Column
							width={120}
							title="Assigned Date"
							key="createdDate"
							render={(createdBy, record) => (
								<React.Fragment>
									{record.assignedDate != null
										? moment(new Date(parseFloat(record.assignedDate))).format(
												'MM/DD/YYYY'
										  )
										: 'Not Signed'}
								</React.Fragment>
							)}
						/>
					)}

					<Column
						width={120}
						title="Published Date"
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
						title="Resend Contract"
						key="createdDate"
						render={(createdBy, record) => (
							<React.Fragment>
								{record.signed ? (
									<Link onClick={(e) => onResendContract(record.contractId)}>
										Resend
									</Link>
								) : (
									'Not Signed'
								)}
							</React.Fragment>
						)}
					/>
				</Table>
		
		</div>
	);
};

export default ContractSelect;
