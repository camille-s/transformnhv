import React from 'react';
import { Message } from 'semantic-ui-react';

const Vision = ({ vision }) => (
	<div className="Vision">
		<Message color="blue" size="large">
			<p>{ vision }</p>
		</Message>
	</div>
);

export default Vision;
