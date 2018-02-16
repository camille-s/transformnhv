import React from 'react';
import { Segment, Grid, Card } from 'semantic-ui-react';
import { ResponsiveOrdinalFrame, ResponsiveXYFrame } from 'semiotic';
import { LegendOrdinal } from '@vx/legend';
import { Bold } from 'cartocolor';

import * as d3 from 'd3';
import Chart from './Chart';
// import Legend from './Legend';

import '../styles/ChartHolder.css';

const color = d3.scaleOrdinal()
    .domain(['Connecticut', 'Greater Hartford', 'Hartford', 'North End'])
    .range(Bold[4]);

const colorType = d3.scaleOrdinal()
    .domain(['Public', 'Private'])
    .range(['#7F3C8D', '#5579AE']);

const colorRate = d3.scaleOrdinal()
    .domain(['Under 6', 'Under 18'])
    .range([Bold[10][7], Bold[10][4]]);

const ChartHolder = ({ charts }) => (
    <div className="ChartHolder">
        {/* <Segment> */}
        <Grid stackable >
            <Grid.Row>
                {/* <Card.Group> */}
                {/* { charts.map((d, i) => (
                    <Chart key={i} {...d} />
                )) } */}
                <Chart {...charts[0]}>
                    <ResponsiveXYFrame
                        size={[400, 300]}
                        responsiveWidth={true}
                        // responsiveHeight={true}
                        lines={charts[0].data}
                        lineDataAccessor={'values'}
                        xAccessor={'year'}
                        yAccessor={'value'}
                        axes={[
                            { orient: 'left', tickFormat: d3.format('.0%') },
                            { orient: 'bottom', ticks: 4 }
                        ]}
                        lineStyle={ (d) => {
                            return {
                                stroke: color(d.key),
                                strokeWidth: 2
                            };
                        } }
                        yExtent={[0, 0.75]}
                        margin={{ top: 10, right: 16, bottom: 30, left: 40 }}
                        showLinePoints={true}
                        pointStyle={ (d) => {
                            return {
                                fill: color(d.name),
                                stroke: color(d.name),
                                strokeWidth: 3
                            };
                        } }
                    />
                    <LegendOrdinal
                        scale={color}
                        itemDirection="row"
                        direction="row"
                    />
                </Chart>
                <Chart {...charts[1]}>
                    <ResponsiveOrdinalFrame
                        size={[400, 300]}
                        responsiveWidth={true}
                        data={charts[1].data}
                        oAccessor={'name'}
                        rAccessor={'value'}
                        type={'bar'}
                        style={ (d) => ({
                            fill: colorType(d.type)
                        })}
                        oLabel={true}
                        oPadding={8}
                        margin={{ top: 10, right: 16, bottom: 30, left: 40 }}
                        axis={{ orient: 'left', tickFormat: d3.format('.0%') }}

                    />
                    {/* <Legend color={colorType}  /> */}
                    <LegendOrdinal
                        scale={colorType}
                        itemDirection="row"
                        direction="row"
                    />
                </Chart>
            </Grid.Row>
            <Grid.Row>
                <Chart {...charts[2]}>
                    <ResponsiveOrdinalFrame
                        size={[600, 300]}
                        responsiveWidth={true}
                        data={charts[2].data}
                        oAccessor={'name'}
                        rAccessor={'value'}
                        type={'clusterbar'}
                        style={ (d) => ({
                            fill: colorRate(d.group)
                        })}
                        oLabel={true}
                        oPadding={24}
                        margin={{ top: 10, right: 16, bottom: 30, left: 40 }}
                        axis={{ orient: 'left', tickFormat: d3.format('.0%') }}
                        rExtent={[0, 0.6]}
                    />
                    {/* <Legend color={colorType}  /> */}
                    <LegendOrdinal
                        scale={colorRate}
                        itemDirection="row"
                        direction="row"
                    />
                </Chart>
                    {/* </Card.Group> */}
            </Grid.Row>
        </Grid>
        {/* </Segment> */}
    </div>
);

export default ChartHolder;
