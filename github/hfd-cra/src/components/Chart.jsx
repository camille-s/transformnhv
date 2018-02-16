import React from 'react';
import { Card, Grid, Segment, Header } from 'semantic-ui-react';

import '../styles/Chart.css';

const Chart = (props) => (
		<Grid.Column width={props.width}>
			<Header as="h3" attached="top">{ props.title }</Header>
			<Segment attached="bottom">
				{/* <Card.Content> */}

				{/* <Card.Description>{ props.children }</Card.Description> */}
				{ props.children }

				{/* </Card.Content> */}
				{/* <Card.Content extra>{ props.source }</Card.Content> */}
				<p className="source">Source: { props.source }</p>
			</Segment>
		</Grid.Column>
);

export default Chart;
