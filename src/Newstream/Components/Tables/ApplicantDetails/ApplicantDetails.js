import { captureException as SentryError } from '@sentry/react';
import {
	Col,
	Empty,
	Form,
	Input,
	message,
	Modal,
	Row,
	Table,
	Tooltip,
	Button,
} from 'antd';
import { EyeFilled } from '@ant-design/icons';
import moment from 'moment';
import React, { Fragment, useState } from 'react';
import { useApolloClient } from 'react-apollo';
import {
	ADD_APPLICANT_NOTES,
	SEND_CONTRACTS_TO_APPLICANT,
} from '../../../graphql/APIs';
import { ProfileAvatar } from '../../Avatar/Avatar';
import ContractSelect from '../../ContractSelect';
import { CustIcon } from '../../Svgs';

const { Column } = Table;
const { TextArea } = Input;

const ApplicantDetailsTable = ({
	data,
	loader,
	viewReporter,
	updateStatus,
	contractList,
	refreshTable,
	onChange,
	order,
	orderby,
}) => {
	const [sendContractModalVisiblity, setSendContractModalVisiblity] = useState(
		false
	);
	const [selectedContracts, setSelectedContracts] = useState([]);
	const [isSendingContract, setIsSendingContract] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [viewNotesModal, setViewNotesModal] = useState(false);
	const [newNoteValue, setNewNoteValue] = useState('');
	const [isSavingNote, setIsSavingNote] = useState(false);

	const client = useApolloClient();

	const handleAddNotes = () => {
		if (newNoteValue !== '') {
			setIsSavingNote(true);
			client
				.mutate({
					mutation: ADD_APPLICANT_NOTES,
					variables: {
						reporterId: selectedUser,
						description: newNoteValue,
					},
				})
				.then(() => {
					setIsSavingNote(false);
					setViewNotesModal(false);
					setSelectedUser(false);
					setNewNoteValue('');
					message.success('Note saved successfully!');
				})
				.catch((error) => {
					if (error.graphQLErrors && error.graphQLErrors.length > 0) {
					} else {
						SentryError(error);
						message.destroy();
						message.error('Something went wrong please try again later');
					}
					setIsSavingNote(false);
					setViewNotesModal(false);
					setSelectedUser(false);
					setNewNoteValue('');
				});
		}
	};

	const handleSendContractModal = ({ userId }) => {
		setSelectedUser(userId);
		setSendContractModalVisiblity(true);
	};

	const handleCancelContractModal = () => {
		setSendContractModalVisiblity(false);
		setSelectedUser(null);
		setSelectedContracts([]);
	};

	const handleContractSelection = (selectedRows) => {
		setSelectedContracts([]);
		selectedRows.map(({ contractId }) => {
			setSelectedContracts((existingContracts) => [
				...existingContracts,
				contractId,
			]);
			return null;
		});
	};

	const handleContractSend = () => {
		setIsSendingContract(true);
		client
			.mutate({
				variables: {
					userId: selectedUser,
					contracts: selectedContracts,
				},
				mutation: SEND_CONTRACTS_TO_APPLICANT,
			})
			.then(() => {
				refreshTable();
				setSelectedUser(null);
				setSelectedContracts([]);
				setSendContractModalVisiblity(false);
				message.success('Contracts Sent Successfully');
				setIsSendingContract(false);
			})
			.catch((error) => {
				setIsSendingContract(false);
				if (error.graphQLErrors && error.graphQLErrors.length > 0) {
				} else {
					SentryError(error);
					setSelectedUser(null);
					setSelectedContracts([]);
					setSendContractModalVisiblity(false);
					message.destroy();
					message.error('Trouble Sending Contracts. Please try again later');
				}
			});
	};

	return (
		<Fragment>
			<Modal
				title="Send Contracts to Applicant"
				destroyOnClose={true}
				visible={sendContractModalVisiblity}
				onCancel={handleCancelContractModal}
				width={1024}
				wrapClassName="inviteReporterModel"
				onOk={handleContractSend}
				okText="Send Contracts"
				okButtonProps={{
					disabled: isSendingContract,
					loading: isSendingContract,
				}}>
				<ContractSelect
					getCompulsoryContracts={setSelectedContracts}
					contractData={contractList}
					onrowSelection={handleContractSelection}
				/>
			</Modal>
			<Modal
				title="Notes"
				destroyOnClose={true}
				visible={viewNotesModal}
				onCancel={() => setViewNotesModal(false)}
				wrapClassName="inviteReporterModel"
				onOk={handleAddNotes}
				okText="Add Note"
				cancelText="Close"
				okButtonProps={{ disabled: isSavingNote, loading: isSavingNote }}>
				<Form
					layout="vertical"
					onChange={({ target: { value } }) => {
						setNewNoteValue(value);
					}}>
					<div className="ant-col ant-form-item-label d-flex flex-row">
						<label htmlFor="note" title="Notes">
							Add your note
						</label>
					</div>
					<Form.Item colon={false} required name="note">
						<TextArea id="note" autoSize={{ minRows: 2, maxRows: 30 }} />
					</Form.Item>
				</Form>
			</Modal>
			<Table
				className="commontable applicantList mb-3"
				//scroll={{ y: 500 }}
				locale={{
					emptyText: <Empty description={<span>No data available</span>} />,
				}}
				dataSource={data}
				loading={loader}
				pagination={false}
				onChange={onChange}>
				<Column
					align="left"
					//	width="300px"
					title="Name"
					key="name"
					ellipsis="true"
					render={({ name, profileImage }) => (
						<Fragment>
							<ProfileAvatar name={name} imageUrl={profileImage} size={40} />
							<span className="px-2 username text-capitalize">{name}</span>
						</Fragment>
					)}
					sorter={data.length > 0 ? true : false}
					sortOrder={order && orderby === 'name' ? order : null}
				/>
				{/* getsorter = (dataSource) => dataSource.length > 0  */}
				<Column
					title="Email"
					data-title="Email"
					key="email"
					ellipsis="true"
					sorter={data.length > 0 ? true : false}
					sortOrder={order && orderby === 'email' ? order : null}
					render={(rowData) => (
						<React.Fragment>
							<div className="text-truncate">{rowData.email}</div>
						</React.Fragment>
					)}
				/>
				{/* <Column
					align="center"
					//	width="200px"
					title="Contract Status"
					render={(rowData) => (
						<Fragment>
							{rowData.applicantStatus === 'Contractsent' ? 'Sent' : 'Pending'}
						</Fragment>
					)}
					dataIndex="applicantStatus"
					key="applicantStatus"
					sorter={true}
					sortOrder={order && orderby === 'applicantStatus' ? order : null}
				/> */}
				<Column
					align="center"
					//	width="200px"
					title="Created Date"
					render={(rowData) => (
						<Fragment>
							{moment(new Date(parseFloat(rowData.createdDate)))
								.local()
								.format('MM/DD/YYYY')}
						</Fragment>
					)}
					key="createdDate"
					sorter={data.length > 0 ? true : false}
					sortOrder={order && orderby === 'createdDate' ? order : null}
				/>
				<Column
					align="center"
					width="150px"
					title="Status"
					render={(rowData) => (
						<Fragment>
							{rowData.applicantStatus === 'Accepted' && (
								<div className="badge reportactive">
									<CustIcon type="tick" />
									<span className="ml-2">Approved</span>
								</div>
							)}
							{rowData.applicantStatus === 'Rejected' && (
								<div className="badge reportblock">
									<CustIcon type="cross" />
									<span className="ml-2">Rejected</span>
								</div>
							)}
							{rowData.applicantStatus === 'Pending' && (
								<Row justify="space-around">
									<Col
										style={{ color: '#3BB12F' }}
										onClick={() => {
											updateStatus({
												userId: rowData.userId,
												action: 'accept',
											});
										}}>
										<CustIcon width="1.5em" height="1.5em" type="tick" />
									</Col>
									<Col
										style={{ color: '#F94444' }}
										onClick={() => {
											updateStatus({
												userId: rowData.userId,
												action: 'reject',
											});
										}}>
										<CustIcon width="1.5em" height="1.5em" type="cross" />
									</Col>
								</Row>
							)}
						</Fragment>
					)}
					key="status"
				/>
				<Column
					align="center"
					className="actionLast"
					title="Action"
					render={(rowData) => {
						return (
							<div className="action-btns">
								<Tooltip placement="top" title="View Applicant">
									<Button
										shape="circle"
										icon={<EyeFilled />}
										className="cursorpointer tour-reporter-block"
										onClick={(event) => {
											viewReporter(event, rowData);
										}}
									/>
								</Tooltip>
								<Tooltip placement="top" title="Add Notes">
									<Button
										shape="circle"
										icon={<CustIcon type="noteicon" />}
										className="cursorpointer tour-reporter-block"
										onClick={() => {
											setSelectedUser(rowData.userId);
											setViewNotesModal(true);
										}}
									/>
								</Tooltip>
								{rowData.applicantStatus === 'Accepted' &&  localStorage.getItem("isManager") == 'true' ? (
									<Tooltip placement="top" title="Send contract">
										<Button
											shape="circle"
											icon={<CustIcon type="sendicon" />}
											className="cursorpointer tour-reporter-block"
											onClick={() => handleSendContractModal(rowData)}
										/>
									</Tooltip>
								)  : (rowData.applicantStatus === 'Pending' || rowData.applicantStatus === 'Rejected ') && localStorage.getItem("isManager") == 'true' ?  (
									<Button
										shape="circle"
										icon={<CustIcon type="sendicon" />}
										className="cursordisabled tour-reporter-block"
									/>
								) : undefined}
							</div>	
						);
					}}
				/>
			</Table>
		</Fragment>
	);
};

export { ApplicantDetailsTable };
