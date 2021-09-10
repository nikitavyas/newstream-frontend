import React, { useState } from 'react';
import './WhatsNewBox.css';
import { Card } from 'antd';

const WhatsNewBox = ({ story, description }) => {
	const { version, title, releaseDate } = story;
	const versionDate = new Date(parseInt(releaseDate)).toLocaleDateString(
		undefined,
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}
	);
	const [displayAll, setDisplayAll] = useState(false);

	const displayDescription = ({ featureName }, index) => {
		if (displayAll) {
			return <li>{featureName}</li>;
		} else {
			if (index < 3) {
				return <li>{featureName}</li>;
			}
		}
	};

	return (
		<Card className="mb-3 whatsnewBox allCardBox_blk boxshadow">
			<div className="row">
				<div className="col-6 d-flex flex-column align-items-start justify-content-center">
					<div className="rbTitle">
						<h3 className="mb-0">{versionDate}</h3>
					</div>
				</div>
				<div className="col-6 d-flex flex-row align-items-start justify-content-end pt-2 pt-lg-0">
					<div className="d-flex flex-column align-items-center">
						<div className="version_btn">Version : {version}</div>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-lg-12 col-md-6 d-flex flex-column align-items-start">
					<div className=" d-flex align-items-start justify-content-center wnbTitle">
						{title}
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-lg-12 col-md-6 d-flex flex-column pt-2 align-items-start">
					<ul className="whtsNew_list">
						{description.map(displayDescription)}
					</ul>
				</div>
			</div>
			<div className="d-flex flex-row justify-content-end">
				{description.length > 3 ? (
					displayAll === false ? (
						<div
							className="viewmore_btn"
							onClick={() => {
								setDisplayAll(true);
							}}>
							View More Details
						</div>
					) : (
						<div
							className="viewmore_btn"
							onClick={() => {
								setDisplayAll(false);
							}}>
							View Less{' '}
						</div>
					)
				) : null}
			</div>
		</Card>
	);
};

export default WhatsNewBox;
