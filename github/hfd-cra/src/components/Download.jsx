import React from 'react';
import { Header } from 'semantic-ui-react';

const Download = ({ url }) => (
	<Header as="h3" color="blue">
		<a href={url}>Download data</a>
	</Header>
);

export default Download;
