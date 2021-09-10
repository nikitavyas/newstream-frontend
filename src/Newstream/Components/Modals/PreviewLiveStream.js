import React from 'react';
import { Modal, Button } from 'antd';

const PreviewLiveStreamModal = ({ url, type, displayModal, show }) => {
	const getVideoEmbedUrl = () => {
		if (type === 'youtube') {
			var youtubeURLFormatter = url.includes('watch')
				? `${url.replace('watch?v=', 'embed/')}`
				: `https://www.youtube.com/embed/${url.split('be/')[1]}`;
			return youtubeURLFormatter;
		}
		if (type === 'facebook') {
			var facebookURLFormatter = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
				url
			)}&show_text=false&width=734&height=411&appId`;
			return facebookURLFormatter;
		}
	};

	const closeVideoModal = () => {
		displayModal(false);
	};

	return (
		<Modal
			title="Live Stream"
			visible={show}
			onCancel={closeVideoModal}
			width={700}
			cancelText="Close"
			footer={
				<Button
					type="primary"
					shape="round"
					htmlType="button"
					onClick={closeVideoModal}>
					Close
				</Button>
			}>
			{show && (
				// eslint-disable-next-line jsx-a11y/iframe-has-title
				<iframe
					width="100%"
					height="400"
					scrolling="no"
					frameBorder="0"
					allowTransparency="true"
					src={getVideoEmbedUrl()}
				/>
			)}
		</Modal>
	);
};

export { PreviewLiveStreamModal };
