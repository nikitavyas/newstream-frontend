/* eslint-disable array-callback-return */
// import React, { Component } from "react";

// class getStoryMediaCount extends Component {

// }
export const getStoryMediaCount = (storyMedia) => {
	let video = 0;
	let audio = 0;
	let image = 0;
	storyMedia.length > 0 &&
		storyMedia.map((data) => {
			let text = data.type;
			text = text.toLowerCase();
			text === 'image' ? image++ : text === 'video' ? video++ : audio++;
		});
	return {
		video: video,
		audio: audio,
		image: image,
	};
};
