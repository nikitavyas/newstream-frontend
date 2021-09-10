import React from 'react';
import { Tag } from 'antd';
import './LiveTag.css';

const LiveTag = ({ scheduled }) => {
	return (
		<div>
			<Tag className="liveTag">
				{scheduled ? (
					<div className="d-flex align-items-center">
						<span className="status scheduled"></span>
						<span className="ml-2 scheduledTxt">Scheduled Live</span>
					</div>
				) : (
					<div className="d-flex align-items-center">
						<span className="status live"></span>
						<span className="ml-2 liveTxt">Live</span>
					</div>
				)}
			</Tag>
		</div>
	);
};

export { LiveTag };
