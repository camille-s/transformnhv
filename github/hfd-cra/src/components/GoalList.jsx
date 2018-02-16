import React from 'react';
import { List, Segment, Header } from 'semantic-ui-react';

const GoalList = ({ goals }) => (
	<div className="GoalList">
		<Header as="h2" attached="top">Goals</Header>
		<Segment attached>
			<List relaxed divided>
				{ goals.map((d, i) => (
					<List.Item key={i}>
						<List.Content>
							<List.Header>{ d.goal }</List.Header>
							<List.Description>{ d.text }</List.Description>
						</List.Content>
					</List.Item>
				)) }
			</List>
		</Segment>
	</div>
);

export default GoalList;
