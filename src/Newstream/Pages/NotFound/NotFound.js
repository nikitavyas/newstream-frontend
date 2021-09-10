import React, {  Fragment } from 'react';
import './NotFound.css';
import { Empty, Button } from 'antd';


const NotFound = () => {
	
	return (
		<Fragment>
			
			<Empty description={<h1>404</h1>} >
   Page Not Found
  </Empty>
		</Fragment>
	);
};

export { NotFound };
