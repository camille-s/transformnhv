import React, { Component } from 'react';
import { Grid, Menu, Dropdown, Container, Divider, Header, Icon } from 'semantic-ui-react';
import * as d3 from 'd3';

import NavBar from './components/NavBar';
import Vision from './components/Vision';
import GoalList from './components/GoalList';
import ChartHolder from './components/ChartHolder';
import Download from './components/Download';

import './App.css';

import trendData from './data/prek_enrollment_trend_2000_2016.json';
import typeData from './data/prek_enrollment_by_type_2016.json';
import povData from './data/poverty rate by age.json';
const lipsum = require('lorem-ipsum');

// do this in json
const vision = `Vision or intro text: ${lipsum({ count: 3 })}`;
const goals = [
	{ goal: 'Increase preschool enrollment', text: lipsum({ count: 10, units: 'words' }) },
	{ goal: 'Decrease chronic absenteeism in kindergarten', text: lipsum({ count: 15, units: 'words' }) },
	{ goal: 'Improve staff credentialing', text: lipsum({ count: 12, units: 'words' }) }
];
const charts = [
	{
		title: 'Preschool enrollment by location, 2000-2016',
		width: 8,
		source: 'US Census Bureau American Community Survey',
		data: d3.nest().key((d) => d.name).entries(trendData)
	},
	{
		title: 'Preschool enrollment by school type, 2016',
		width: 8,
		source: 'US Census Bureau American Community Survey',
		data: typeData
	},
	{
		title: 'Child poverty rate by age, 2016',
		width: 16,
		source: 'US Census Bureau American Community Survey',
		data: povData
	}
];

class App extends Component {
	render() {
		console.log(charts[1].data);
		return (
			<div className="App">
				<NavBar />

				<Divider section hidden />

				<Grid container stackable>
					<Grid.Row>
						<Grid.Column>
							<Header size="huge" ><Icon name="child" color="blue" /> <Header.Content>Early childhood</Header.Content></Header>
							<Vision vision={vision} />
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
						<Grid.Column width={4}>
							<GoalList goals={goals} />
						</Grid.Column>
						<Grid.Column width={12}>
							<ChartHolder charts={charts} />
						</Grid.Column>
					</Grid.Row>
					<Grid.Row>
						<Download url="#" />
					</Grid.Row>
				</Grid>
			</div>
		);
	}
}

export default App;
