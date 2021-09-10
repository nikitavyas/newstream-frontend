import { EnvironmentFilled, UnorderedListOutlined } from '@ant-design/icons';
import { Radio } from 'antd';
import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import './StoryTopMenu.css';

class StoryTopMenu extends Component {
	constructor(props) {
		super(props);
		this.state = { filters: [] };
	}
	render() {
		return (
			<React.Fragment>
				<div className="filter-block my-sm-2 mb-2">
					<div className="d-flex flex-row align-items-md-center align-items-end justify-content-between justify-content-md-end">
						<div className="d-flex flex-row  align-items-sm-center align-items-end justify-content-between justify-content-md-end">
							<Radio.Group
								value={this.props.isMapView}
								onChange={this.props.onListViewClick}
								buttonStyle="solid"
								className="viewSwitchround">
								<Radio.Button value={true}>
									<EnvironmentFilled className="mr-2" />
									Map View
								</Radio.Button>
								<Radio.Button value={false}>
									<UnorderedListOutlined className="mr-2" />
									List View
								</Radio.Button>
							</Radio.Group>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

StoryTopMenu = withApollo(StoryTopMenu);
export default StoryTopMenu;
