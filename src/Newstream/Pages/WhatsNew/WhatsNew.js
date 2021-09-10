import React, { useState, Fragment, useEffect } from 'react';
import { Loader } from '../../Components/Loader/Loader';
import { GET_VERSION_UPDATES } from '../../graphql/APIs';
import { Row, Col, Typography, Card, Empty } from 'antd';
import { useApolloClient } from 'react-apollo';
import { WhatsNewBox } from '../../Components/WhatsNewBox';
import './WhatsNew.css';

const { Title } = Typography;

const WhatsNewPage = () => {
	const [loaded, setLoaded] = useState(false);
	const [updates, setUpdates] = useState([]);

	const client = useApolloClient();

	useEffect(() => {
		getVersionUpdates();
	}, []);

	const getVersionUpdates = async () => {
		await client
			.query({
				query: GET_VERSION_UPDATES,
			})
			.then(({ data: { getAllReleaseNote } }) => {
				setUpdates(getAllReleaseNote);
				setLoaded(true);
			})
			.catch((error) => {});
	};

	return (
		<Fragment>
			{loaded ? (
				<div className="">
					<h3 className="font16 font-weight-bold mb-3">What's New</h3>
					{/* <div className="topMainFilter d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
						<Title level={4} strong="false" className="pageTitle md-0">
							What's New
						</Title>
					</div> */}
					<Row>
						<Col span={24}>
							{updates.length > 0 ? (
								updates.map((singleStory) => {
									return (
										<WhatsNewBox
											story={singleStory}
											description={[...singleStory.description]}
											id={singleStory.releaseNoteId}
										/>
									);
								})
							) : (
								<Card className="mb-3">
									<Empty description={<span>No data available</span>} />
								</Card>
							)}
						</Col>
					</Row>
				</div>
			) : (
				<Loader />
			)}
		</Fragment>
	);
};

export { WhatsNewPage };
