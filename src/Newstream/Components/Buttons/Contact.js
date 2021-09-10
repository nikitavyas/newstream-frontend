import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { useApolloClient } from 'react-apollo';
import { GET_SLACK_TEAM_ID } from '../../graphql/APIs';
import './ContactButton.css';

const ContactButton = ({ name, phoneNumber, slackUserId, justButtons,whatsAppOnly }) => {
	const [teamId, setTeamId] = useState(undefined);
	const client = useApolloClient();

	/**
	 * getSlackTeamId
	 * This function call to get slackid from API call
	 */

	const getSlackTeamId = () => {
		client
			.query({
				query: GET_SLACK_TEAM_ID,
				fetchPolicy: 'no-cache',
			})
			.then(
				({
					data: {
						getUserSettings: { slackTeamId },
					},
				}) => {
					setTeamId(slackTeamId);
				}
			)
			.catch((error) => {});
	};

	useEffect(() => {
		getSlackTeamId();
	}, []);

	/**
	 * sendToWhatsapp
	 * function call when Open whatsapp pop-up
	 */
	const sendToWhatsapp = () => {
		const whatsappNumber = phoneNumber.replace(/\+|\ |\(|\)|\-/gi, '');
		window.open(`https://wa.me/${whatsappNumber}`);
	};

	/**
	 * sendToSlack
	 * Function call when Open slack pop-up
	 */
	const sendToSlack = () => {
		window.open(`slack://user?team=${teamId}&id=${slackUserId}`);
	};

	if (justButtons) {
		return (
			<div className="d-flex">
				{/* <Button
					type="default"
					shape="round"
					// icon={
					// 	<span role="img" className="anticon">
					// 		<img
					// 			alt=""
					// 			className="mr-2"
					// 			src={require('../../Assets/images/slack.png')}
					// 		/>
					// 	</span>
					// }
					className="mr-1 mr-lg-2 slackIcon"
					onClick={sendToSlack}>
					<img
						alt=""
						className="mr-2"
						src={require('../../Assets/images/slack.png')}
					/>
					Slack
				</Button> */}
				<Button
					type="default"
					shape="round"
					// icon={
					// 	<span role="img" className="anticon">
					// 		<img
					// 			alt=""
					// 			 className="mr-2"
					// 			src={require('../../Assets/images/whatsapp.png')}
					// 		/>
					// 	</span>
					// }
					className="mr-1 mr-lg-2 whatsappIcon"
					style={{display: whatsAppOnly ? 'none' : 'block' }}

					onClick={sendToWhatsapp}>
					<img
						alt=""
						 className="mr-2"
						src={require('../../Assets/images/whatsapp.png')}
					/>
					WhatsApp
				</Button>
			</div>
		);
	}

	return (
		<div className="d-flex flex-column">
			{/* <div className="label_blk mb-2">Connect with {name} on</div> */}
			<div className="d-flex justify-content-lg-end justify-content-start">
				<Button
					type="default"
					shape="round"
					className="mr-1 mr-lg-2 whatsappIcon"
					
					onClick={sendToWhatsapp}>
					<img
						alt=""
						className="mr-2"
						src={require('../../Assets/images/whatsapp.png')}
					/>
					WhatsApp
				</Button>
				{/* <Button
					type="default"
					shape="round"
					className="mr-1 mr-lg-2 slackIcon"
					style={{display: whatsAppOnly ? 'none' : 'block' }}
					onClick={sendToSlack}>
					<img
						alt=""
						className="mr-2"
						src={require('../../Assets/images/slack.png')}
					/>
					Slack
				</Button> */}
			</div>
		</div>
	);
};

export { ContactButton };
