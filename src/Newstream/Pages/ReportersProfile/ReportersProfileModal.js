import React,{createRef} from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';

import { SAVE_REPORTER } from '../../graphql/APIs';
import { withApollo } from 'react-apollo';
import ContractSelect from '../../Components/ContractSelect';
class ReportersProfileModal extends React.Component {
	formRef = React.createRef();
	constructor(props) {
		super(props);
		const {
			contractData,
			contracts,
			selectedContracts,
		} = this.props;
		// console.log(selectedContracts);
		// console.log(contracts);
		this.inputRef = createRef();
		let contractIds = [];
		// contracts.map((data) => {
		// 	contractIds.push(data);
		// });
		var allContracts = selectedContracts.concat(contracts)
		contracts.map((data) => {
			contractIds.push(data.contractId);
		});
		selectedContracts.map((data) => {
			contractIds.push(data.contractId);
		});
		this.state = {
			contractData: contractData,
			contracts: contractIds,
			selectedContracts: allContracts,
		};
	}

	componentDidMount() {
		const {
			email,
			name,
			phoneNumber,
			contractData,
			contracts,
			gracePeriod,
			selectedContracts,
		} = this.props;
		this.formRef.current.setFieldsValue({
			email: email,
			name: name,
			phoneNumber: phoneNumber,
			gracePeriod: gracePeriod,
		});
	}
	onFinish = (e) => {
		this.saveReorter(e);
	};
	onFinishFailed = (e) => {};
	saveReorter = async (e) => {
		try {
			const { client, userId, name, onFinishSaveReporter } = this.props;
			const { contracts } = this.state;
			// console.log(contracts);
			await client.mutate({
				mutation: SAVE_REPORTER,
				variables: {
					userId,
					email: e.email,
					name,
					gracePeriod: e.gracePeriod,
					contracts,
				},
			});
			onFinishSaveReporter(e.email);
		} catch (error) {
			// console.log('saveReorter error', error);
		}
	};
	onrowSelection = (row) => {
		this.setState({ contracts: [] });
		let contractsData = [];
		row.map((data) => {
			if (data != undefined) {
				contractsData.push(data.contractId);
			}
		});
		this.setState({ contracts: contractsData });
	};

	handleKeypress = (e)=> {
		const characterCode = e.key
		if (characterCode === 'Backspace') return
	
		const characterNumber = Number(characterCode)
		if (characterNumber >= 0 && characterNumber <= 9) {
		  if (e.currentTarget.value && e.currentTarget.value.length) {
			return
		  } else if (characterNumber === 0) {
			e.preventDefault()
		  }
		} else {
		  e.preventDefault()
		}
	  }
	onWheel = () => {
		this.inputRef.current.blur();
	  };
	render() {
		const { contracts } = this.state;
		return (
			<React.Fragment>
				{' '}
				<Form
					ref={this.formRef}
					layout="vertical"
					id="myForm"
					name="myForm"
					onFinish={this.onFinish}
					onFinishFailed={this.onFinishFailed}>
					{/* <Row><Col span={12}>
                    <Form.Item
                        label="First Name"
                        className="px-2 mb-2"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input first name',
                            }]}>
                        <Input />
                    </Form.Item>
                </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Last Name"
                            className="px-2 mb-2"
                            name="phoneNumber"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input last name',
                                }]}>
                            <Input />
                        </Form.Item>
                    </Col></Row> */}
					<Row>
						<Col span={24}>
							<Form.Item
								label="Email"
								className="mb-3"
								name="email"
								rules={[
									{
										type: 'email',
										message: 'Kindly enter a valid email address',
									},
									{
										required: true,
										message: 'Please enter email address',
									},
								]}>
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Row>
						<Col span={24}>
							<Form.Item
								label="Grace Period (In Days)"
								className="mb-3"
								name="gracePeriod"
								rules={[
									{
										type: 'number',
										min: 1,
										message: "Please enter positive number only",
									},
								]}>
								<InputNumber placeholder="Enter Grace Period" 
								onKeyDown={this.handleKeypress}
								ref={this.inputRef}
								onWheel={this.onWheel}
								min="1"/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
				<ContractSelect
					contractData={this.props.contractData}
					selectedContracts={this.state.selectedContracts}
					onrowSelection={this.onrowSelection}
					userId={this.props.userId}
					getData={(e) => this.props.getData()}
				/>
			</React.Fragment>
		);
	}
}

const ReportersProfileModalWithApollo = withApollo(ReportersProfileModal);
export { ReportersProfileModalWithApollo as ReportersProfileModal };
