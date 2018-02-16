import React from 'react';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';

export default class Legend extends React.Component {
    componentDidMount() {
        this.drawLegend();
    }

    componentDidUpdate() {
        // this.drawLegend();
    }

    drawLegend() {
        let legend = legendColor()
            .shapeWidth(40)
            .labelWrap(35)
            .orient('horizontal')
            .labelAlign('start')
            .shapePadding(12)
            .scale(this.props.color);

        d3.select(this.refs.svg)
            .attr('transform', 'translate(30, 0)')
            .select('g')
            .attr('transform', 'translate(20, 0)')
            .call(legend);
    }

    render() {
        return (
            <div className="Legend">
                <svg ref="svg">
                    <g className="legend" />
                </svg>
            </div>
        );
    }
}
