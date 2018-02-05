var d3map = function() {
    var aspect = 1.0;
    var width, height;
    var proj, path;
    var svg, parent;
    var b;
    var color;
    var mapData = {};

    var values = function(d) { return +d.value; };

    function chart(selection) {

        selection.each(function(topo) {
            parent = d3.select(this);
            init(this, topo);

        });
    }

    var init = function(selection, topo) {
        width = width || parseInt(parent.style('width'));
        height = width * aspect;

        proj = d3.geoMercator()
            .scale(1)
            .translate([0, 0]);

        path = d3.geoPath().projection(proj);

        b = path.bounds(topo);
        var s = 0.95 / ((b[1][0] - b[0][0]) / width);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        proj
            .scale(s)
            .translate(t);

        svg = d3.select(selection)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        var polygons = svg.append('g')
            .selectAll('path')
            // .data(topojson.feature(topo, topo.objects.shape).features)
            .data(topo.features)
            .enter().append('path')
                .attr('d', path)
                .attr('class', 'polygon');
        chart.draw();
    };

    function mouseOverPoly(poly, format, hasName) {
        var name = poly.datum().properties.name;
        var value = mapData[name];
        var valText = typeof value === 'undefined' ? 'N/A' : format(value);

        var nametag = hasName ? '<span class="tip-label">' + name + ': </span>' : '';
        return nametag + valText;
    }

    /////////// PUBLIC FUNCTIONS /////////////

    chart.draw = function() {
        var w = parseInt(parent.style('width'));
        var h = w * aspect;
        this.width(w).height(h);

        var s = 0.95 / ((b[1][0] - b[0][0]) / width);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        proj
            .scale(s)
            .translate(t);
        path = d3.geoPath().projection(proj);
        svg
            .attr('width', w)
            .attr('height', h)
            .selectAll('.polygon')
            .attr('d', path);

        return chart;
    };

    chart.color = function(csv, scheme, hasLegend) {
        // if only csv given, sets scheme to purples & n to 5
        if (!arguments.length) { return chart; }

        scheme = scheme || d3.schemePurples[5];
        n = scheme.length;

        csv.forEach(function(d) { d.value = +d.value; });

        var nested = d3.nest()
            .key(function(d) { return d.name; })
            .entries(csv);
        var vals = nested.map(function(d) { return d.values[0].value; });
        var breaks = ss.ckmeans(vals, n).map(function(val) { return val[0]; }).slice(1);
        color = d3.scaleThreshold()
            .domain(breaks)
            .range(scheme);

        nested.forEach(function(d) {
            mapData[d.key] = d.values[0].value;
        });

        var polygons = parent.selectAll('.polygon')
            .attr('fill', function(d) {
                var value = mapData[d.properties.name];
                if (typeof value === 'undefined') {
                    return '#bbb';
                } else {
                    return color(value);
                }
            });


        return chart;
    };

    chart.tip = function(tipClass, format, hasName) {
        tipClass = tipClass || 'd3-tip';
        format = format || d3.format('');
        var tip = d3.tip()
            .attr('class', tipClass);

        parent.selectAll('.polygon')
            .call(tip)
            .on('mouseover', function() {
                tip.html(mouseOverPoly(d3.select(this), format, hasName));
                tip.show();
            })
            .on('mouseout', tip.hide);

        return chart;
    };

    chart.legend = function(format, left, bottom, legendClass) {
        legendClass = legendClass || 'legendQuant';
        format = format || d3.format('');

        left = left || 20;
        bottom = bottom || 20;

        var legendSvg = parent.append('div')
            .style('position', 'absolute')
            .style('left', left + 'px')
            .style('bottom', bottom + 'px')
            .style('pointer-events', 'none')
            .append('svg');

        var g = legendSvg.append('g')
            .attr('class', legendClass);

        var legend = d3.legendColor()
            .labelFormat(format)
            .labels(thresholdLabels)
            .useClass(false)
            .scale(color);
        g.call(legend);

        // shrink legendSvg to size of g
        var bbox = g.node().getBBox();
        legendSvg.attr('width', bbox.width).attr('height', bbox.height);

        return chart;
    };

    function thresholdLabels(l) {
        if (l.i === 0) {
            return l.generatedLabels[l.i].replace('NaN% to', 'Less than').replace('$NaN to', 'Less than').replace('NaN to', 'Less than');
        } else if (l.i === l.genLength - 1) {
            var str = 'More than ' + l.generatedLabels[l.genLength - 1];
            return str.replace(' to NaN%', '').replace(' to $NaN', '').replace(' to NaN', '');
        }
        return l.generatedLabels[l.i];
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    return chart;
};
;// hover effects
function dotOver(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .attr('r', 7);
}

function dotOut(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .attr('r', 4);
}

function barOver(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .style('stroke-width', 4);
}

function barOut(d) {
    d3.select(d)
        .transition()
        .duration(200)
        .style('stroke-width', 1);
}

function redrawDots() {
    d3.selectAll('.dimple-marker')
        .attr('r', 4)
        .attr('fill', function(d) { return d3.select(this).attr('stroke'); })
        .style('stroke-width', 4);
}

// convenience functions
function p(x) { return d3.format('.2p')(x); }

function yr(x) { return d3.timeFormat('%Y')(x); }

function span(x) { return '<span>' + x + '</span>'; }

// html generators to send to d3-tip.html()

function horizTip(d) {
    return span( d.y + ': ' + p(d.xValue) );
}

function horizTip2(d) {
    return span( d.y + ': ' + d.xValue );
}

function vertTip(d) {
    return span( d.x + ': ' + p(d.yValue) );
}

function horizGroupTip(d) {
    return span( d.cy + ', ' + d.aggField[0] + ': ' + p(d.xValue) );
}

function vertGroupTip(d) {
    return span( d.cx + ', ' + d.aggField[0] + ': ' + p(d.yValue) );
}

function trendTip(d) {
    return span( yr(d.x) + ': ' + p(d.yValue) );
}

function trendGroupTip(d) {
    var name = d.aggField[0] === 'All' ? 'Goal' : d.aggField[0];
    return span( name + ', ' + yr(d.x) + ': ' + p(d.yValue) );
}

function trendTipThous(d) {
    return span( yr(d.x) + ': ' + d3.format(',')(d.yValue) );
}

function pieTip(d) {
    return span( d.aggField[0] + ': ' + d3.format(',')(d.pValue) );
}


// dimple color objects
var pink = new dimple.color('#992156');
var ltblue = new dimple.color('#739DD0');
var dkblue = new dimple.color('#2f588b');
var green = new dimple.color('#359957');

var scale5 = [
    new dimple.color('#b92868'),
    new dimple.color('#b04f86'),
    new dimple.color('#a16ba4'),
    new dimple.color('#8984c5'),
    new dimple.color('#5d9be6'),
    new dimple.color('#555')
];

var scale3 = [
    new dimple.color('#b92868'),
    new dimple.color('#a16ba4'),
    new dimple.color('#5d9be6'),
    new dimple.color('#555')
];

var demoscale = [
    new dimple.color('#992156'),
    new dimple.color('#9d526c'),
    new dimple.color('#9e7682'),
    new dimple.color('#2f588b'),
    new dimple.color('#50678f'),
    new dimple.color('#6a7792'),
    new dimple.color('#818896'),
    new dimple.color('#359957'),
    new dimple.color('#5e9a6d'),
    new dimple.color('#7d9a83')
];

var choroscale = ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'];
;d3.queue()
    .defer(d3.csv, '../assets/data/childhood/acs_prek_enrollment_trend.csv')
    .defer(d3.csv, '../assets/data/childhood/acs_prek_enrollment_by_type.csv')
    .defer(d3.csv, '../assets/data/childhood/childcare.csv')
    .defer(d3.csv, '../assets/data/childhood/chronic_absenteeism.csv')
    .defer(d3.csv, '../assets/data/childhood/low_income_kids_by_race.csv')
    .await(initChildhood);

///////////// INIT
function initChildhood(error, prekTrend, prekType, childcare, absence, lowIncome) {
    if (error) throw error;

    prekTrend.forEach(function(d) {
        d.value = +d.value;
    });

    prekType.forEach(function(d) {
        d.value = +d.value;
    });

    childcare.forEach(function(d) {
        d.value = +d.value;
    });

    absence.forEach(function(d) {
        d.value = +d.value;
    });

    lowIncome.forEach(function(d) {
        d.value = +d.value;
    });

    // var enrollmentRings = makeRings(childcare);
    makeEnrollTrend(prekTrend);
    var barplots = [makeChildcareRings(childcare), makeAbsBars(absence), makeIncomeBars(lowIncome), makeTypeBars(prekType)];
    redrawDots();

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        makeEnrollTrend(prekTrend);
        redrawDots();
    });
}

function makeAbsBars(dataAll) {
    // this dataset has values for all grades & multiple school years. filtering for K-3, SY 2015-16
    var grades = ['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'];
    var year = '2015-2016';
    var data = dimple.filterData(dimple.filterData(dataAll, 'year', year), 'name', grades);
    console.log(data);
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#absence-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;
    y.addOrderRule(['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    chart.addSeries('type', dimple.plot.bar);
    chart.addLegend('8%', '95%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizGroupTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeIncomeBars(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 80 };
    var svg = d3.select('#low-inc-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;
    y.addOrderRule(['All races', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 5;
    x.title = null;

    chart.addSeries('type', dimple.plot.bar);
    chart.addLegend('8%', '95%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizGroupTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeEnrollTrend(data) {
    var margin = { top: 12, right: 18, bottom: 45, left: 30 };
    var svg = d3.select('#prek-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ green, ltblue, pink ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;
    x.ticks = 2;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var trend = chart.addSeries(['name'], dimple.plot.line);
    trend.lineMarkers = true;

    chart.addLegend('8%', '95%', '100%', '10%', 'left', trend);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    return chart;
}


function makeChildcareRings(data) {
    var margin = { top: 12, right: 10, bottom: 50, left: 80 };
    var svg = d3.select('#childcare-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, dkblue, ltblue ];

    var p = chart.addMeasureAxis('p', 'value');
    var x = chart.addCategoryAxis('x', 'dummy');
    var y = chart.addCategoryAxis('y', 'name');
    var rings = chart.addSeries('type', dimple.plot.pie);
    rings.innerRadius = 35;
    rings.outerRadius = 60;

    x.hidden = true;
    y.title = null;

    p.addOrderRule(['Center-based', 'Family care', 'Shortage']);
    y.addOrderRule(['Pre-K', 'Infants and toddlers']);

    chart.addLegend('8%', '90%', 200, 20, 'left');

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(pieTip);

    svg.selectAll('path.dimple-pie')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeTypeBars(data) {
    var margin = { top: 12, right: 18, bottom: 45, left: 30 };
    var svg = d3.select('#prek-type')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ dkblue, ltblue ];

    var x = chart.addCategoryAxis('x', 'name');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    bars.addOrderRule(['Private', 'Public']);

    chart.addLegend('8%', '95%', '100%', '10%', 'left', bars);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertGroupTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}
;d3.queue()
    .defer(d3.csv, '../assets/data/community/wellbeing_survey_trend.csv')
    .defer(d3.csv, '../assets/data/community/crime_rate_by_tract.csv')
    .defer(d3.json, '../assets/json/nhv_tracts.json')
    .await(initCommunity);

function initCommunity(error, safety, crime, json) {
    if (error) throw error;

    safety.forEach(function(d) {
        d.value = +d.value;
    });

    crime.forEach(function(d) {
        d.value = +d.value;
    });

    var safetyTrend = makeSafetyTrend(safety);

    var violentMap = d3map();
    d3.select('#violent-crime-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(violentMap);
    violentMap.color(crime.filter(function(d) { return d.type === 'violent'; }), choroscale)
        .tip('d3-tip', d3.format('.2r'), false)
        .legend(d3.format('.0f'), 20, 20);

    var propertyMap = d3map();
    d3.select('#property-crime-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(propertyMap);
    propertyMap.color(crime.filter(function(d) { return d.type === 'property'; }), choroscale)
        .tip('d3-tip', d3.format('.2r'), false)
        .legend(d3.format('.0f'), 20, 20);

    d3.select(window).on('resize', function() {
        safetyTrend = makeSafetyTrend(safety);

        violentMap.draw();
        propertyMap.draw();

        redrawDots();
    });

    redrawDots();
}

function makeSafetyTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#safety-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;

    chart.defaultColors = [ pink, dkblue ];
    var line = chart.addSeries('name', dimple.plot.line);
    line.lineMarkers = true;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', line);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    return chart;
}
;d3.queue()
    .defer(d3.csv, '../assets/data/cross/financial_wellbeing.csv')
    .defer(d3.csv, '../assets/data/cross/personal_wellbeing_index.csv')
    .defer(d3.csv, '../assets/data/cross/total_population.csv')
    .defer(d3.csv, '../assets/data/cross/poverty_by_age_race.csv')
    .await(initCross);

//////////////////// INIT
function initCross(error, financial, personal, pop, poverty) {
    if (error) throw error;

    financial.forEach(function(d) {
        d.value = +d.value;
    });

    personal.forEach(function(d) {
        d.value = +d.value;
    });

    pop.forEach(function(d) {
        d.value = +d.value;
    });

    poverty.forEach(function(d) {
        d.value = +d.value;
    });

    var finNested = nestData(financial);
    var rows = finNested.length;
    var plots = [];
    finNested.forEach(function(indic, i) {
        var chart = makeFinancialBars(indic, i, rows);
        plots.push(chart);
    });

    plots.push(makePersonalBars(personal));
    plots.push(makeAgeRace(poverty));

    makePopTrend(pop);

    d3.select(window).on('resize', function() {
        plots.forEach(function(plot) { plot.draw(0, true); });

        makePopTrend(pop);

        redrawDots();
    });

    redrawDots();
}

function nestData(data) {
    var nested = d3.nest()
        .key(function(d) { return d.indicator; })
        .entries(data);
    // var rows = nested.length;
    // nested.forEach(function(indic, i) {
    //     makeBars(indic, i, rows);
    // });
    return nested;
}

function makeFinancialBars(data, i, rows) {
    // if this is the last row, have big bottom margin
    var margin = { top: 12, right: 18, left: 40 };
    margin.bottom = i === rows - 1 ? 100 : 20;
    var height = 100 + margin.bottom;
    // var margin = { top: 12, right: 18, bottom: 20, left: 40 };
    var div = d3.select('#fin-wellbeing')
        .append('div')
        .attr('class', 'multiple')
        .text(data.key)
        .append('div');
    var svg = div.append('svg')
        .attr('width', '100%')
        .attr('height', height);

    var values = data.values;

    var colorscale = d3.scaleOrdinal()
        .domain(dimple.getUniqueValues(values, 'type'))
        .range([pink.fill, dkblue.fill, green.fill]);

    var chart = new dimple.chart(svg, values);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addCategoryAxis('x', 'name');
    // x.title = null;
    x.hidden = i === rows - 1 ? false : true;
    // x.addOrderRule(['1 - location', '2 - age', '3 - income']);
    x.addOrderRule(['Connecticut', 'Greater New Haven', 'New Haven',
        'Ages 18-34', 'Ages 35-49', 'Ages 50-64', 'Ages 65+',
        'Income below $30K', '$30K-$75K', '$75K+']);

    var y = chart.addMeasureAxis('y', 'value');
    y.title = null;
    y.ticks = 4;
    y.tickFormat = '.0%';
    y.overrideMax = 1.0;

    var bars = chart.addSeries('type', dimple.plot.bar);
    chart.draw();

    svg.selectAll('rect.dimple-bar')
        .style('fill', function(d) { return colorscale(d.aggField[0]); })
        .style('stroke', function(d) {
            var fill = d3.color(colorscale(d.aggField[0]))
            return fill.darker();
        });

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}




function makeMultiples(dataAll) {
    var nestRows = d3.nest()
        .key(function(d) { return d.indicator; })
        .entries(dataAll);

    d3.select('#fin-wellbeing2')
        .selectAll('div.multiple')
        .data(nestRows)
        .enter().append('div')
            .attr('class', 'multiple')
            .call(makeRow);
}

function makePersonalBars(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 100 };
    // var width = fullwidth - margin.left - margin.right;
    // var height = fullheight - margin.top - margin.bottom;
    var svg = d3.select('#per-wellbeing')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');
    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.ticks = 5;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip2);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makePopTrend(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 40 };

    var svg = d3.select('#total-pop-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;
    x.timePeriod = d3.timeYear;
    x.timeInterval = 5;

    var y = chart.addMeasureAxis('y', 'value');
    y.title = null;
    y.ticks = 6;

    var line = chart.addSeries(null, dimple.plot.line);
    line.lineMarkers = true;

    chart.defaultColors = [ pink ];

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendTipThous);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    return chart;
}

function makeAgeRace(data) {
    var margin = { top: 12, right: 18, bottom: 60, left: 60 };
    var svg = d3.select('#poverty-age-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = scale3;

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;
    y.addOrderRule(['All races', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var dots = chart.addSeries('type', dimple.plot.bubble);
    dots.addOrderRule(['Under 18', 'Ages 18-64', 'Ages 65+', 'All ages']);
    chart.addLegend('8%', '95%', '100%', '40%', 'left', dots);

    chart.draw();

    svg.selectAll('circle.dimple-bubble')
        .attr('r', 9);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(horizGroupTip);

    svg.selectAll('circle.dimple-bubble')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}


// function makeFinancialDots(data) {
//     var margin = { top: 12, right: 18, bottom: 60, left: 150 };
//     var svg = d3.select('#fin-wellbeing')
//         .append('svg')
//         .attr('width', '100%')
//         .attr('height', '100%');
//
//     var chart = new dimple.chart(svg, data);
//     chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
//     chart.defaultColors = demoscale;
//
//     var y = chart.addCategoryAxis('y', 'indicator');
//     y.title = null;
//
//     var x = chart.addMeasureAxis('x', 'value');
//     x.tickFormat = '.0%';
//     x.ticks = 6;
//     x.title = null;
//
//     var dots = chart.addSeries('group', dimple.plot.bubble);
//
//     chart.draw();
//
//     svg.selectAll('circle.dimple-bubble')
//         .attr('r', 9);
// }
;d3.queue()
    .defer(d3.csv, '../assets/data/economy/total_employment_by_year.csv')
    // .defer(d3.json, '')
    .await(initEconomy);

function initEconomy(error, employment) {
    if (error) throw error;

    employment.forEach(function(d) {
        d.value = +d.value;
    });

    var empTrend = makeEmpTrend(employment);

    d3.select(window).on('resize', function() {
        empTrend = makeEmpTrend(employment);

        redrawDots();
    });

    redrawDots();
}

function makeEmpTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#jobs-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    // y.tickFormat = '.0%';
    y.ticks = 6;

    chart.defaultColors = [ pink ];

    var line = chart.addSeries('name', dimple.plot.line);
    line.lineMarkers = true;

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendTipThous);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    return chart;
}
;d3.queue()
    .defer(d3.csv, '../assets/data/education/graduation_rate_trends.csv')
    .defer(d3.csv, '../assets/data/education/graduation_rate_by_school.csv')
    .await(initEducation);

function initEducation(error, trends, gradSchool) {
    if (error) throw error;

    trends.forEach(function(d) {
        d.value = +d.value;
    });

    gradSchool.forEach(function(d) {
        d.value = +d.value;
    });

    var byLoc = trends.filter(function(d) {
        return d.indicator === 'total graduation by location';
    });
    var byRace = trends.filter(function(d) {
        return d.indicator === 'nhps graduation by race';
    });

    var barplots = [makeGradBars(gradSchool)];
    var locTrend = makeLocTrend(byLoc);
    var raceTrend = makeRaceTrend(byRace);

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        locTrend = makeLocTrend(byLoc);
        raceTrend = makeRaceTrend(byRace);

        redrawDots();
    });

    redrawDots();
}

function makeLocTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#grad-trend-loc')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ dkblue, pink ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var line = chart.addSeries('name', dimple.plot.line);
    line.lineMarkers = true;

    chart.addLegend('80%', '60%', '10%', '20%', 'right', line);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    return chart;
}

function makeRaceTrend(data) {
    // black grad rate almost same as overall grad rate--filter out All for now
    data = data.filter(function(d) { return d.type !== 'All'; });
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#grad-trend-race')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, dkblue, green ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var line = chart.addSeries('type', dimple.plot.line);
    line.lineMarkers = true;

    chart.addLegend('80%', '50%', '10%', '40%', 'right', line);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    return chart;
}

function makeGradBars(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 80 };
    var svg = d3.select('#grad-by-school')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}
;d3.queue()
    .defer(d3.csv, '../assets/data/health/health_bars.csv')
    .defer(d3.csv, '../assets/data/health/health_trends.csv')
    // .defer(d3.csv, '../data/health/asthma_tract.csv')
    // .defer(d3.csv, '../data/health/dental_tract.csv')
    .defer(d3.csv, '../assets/data/health/500_cities_tract_current_asthma_dental_visit.csv')
    .defer(d3.json, '../assets/json/nhv_tracts.json')
    .await(initHealth);

///////////// INIT
function initHealth(error, locs, trend, asthmaDental, json) {
    if (error) throw error;

    console.log(json);

    var asthmaMap = d3map();
    d3.select('#asthma-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(asthmaMap);
    asthmaMap.color(asthmaDental.filter(function(d) { return d.indicator === 'current asthma'; }), ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'])
        .tip('d3-tip', d3.format('.1%'), false)
        .legend(d3.format('.0%'), 20, 20);

    var dentalMap = d3map();
    d3.select('#dental-map')
        .datum(topojson.feature(json, json.objects.nhv_tracts))
        .call(dentalMap);
    dentalMap.color(asthmaDental.filter(function(d) { return d.indicator === 'dental visit'; }), ['#e8e5ed','#d8b6c5','#c6879e','#b15879','#992156'])
        .tip('d3-tip', d3.format('.0%'), false)
        .legend(d3.format('.0%'), 20, 20);

    locs.forEach(function(d) {
        d.value = +d.value;
    });
    trend.forEach(function(d) {
        d.value = +d.value;
    });


    var barplots = [makeObesityBars(locs), makeSmokingBars(locs)];
    makeObesityTrend(trend);
    makeSmokingTrend(trend);
    makeFoodTrend(trend);
    makeInsuranceTrend(trend);

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        makeObesityTrend(trend);
        makeSmokingTrend(trend);
        makeFoodTrend(trend);
        makeInsuranceTrend(trend);

        asthmaMap.draw();
        dentalMap.draw();

        redrawDots();
    });

    redrawDots();
}



function makeObesityBars(locs) {
    var data = locs.filter(function(d) { return d.indicator === 'obesity'; });
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var svg = d3.select('#obesity-loc')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}


function makeSmokingBars(locs) {
    var data = locs.filter(function(d) { return d.indicator === 'smoking'; });
    var margin = { top: 12, right: 18, bottom: 40, left: 90 };
    var svg = d3.select('#smoking-loc')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');

    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeObesityTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'obesity'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');

    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#obesity-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ ltblue, pink, dkblue ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeSmokingTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'smoking'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#smoking-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ ltblue, pink, dkblue ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeFoodTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'food_insecurity'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#food-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ ltblue, pink, dkblue ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;
}

function makeInsuranceTrend(trend) {
    var data = trend.filter(function(d) { return d.indicator === 'insurance'; });

    var base = dimple.filterData(data, 'series', 'base');
    var second = dimple.filterData(data, 'series', 'second');
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };
    var svg = d3.select('#insurance-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ ltblue, pink, dkblue, green ];

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var baseline = chart.addSeries(null, dimple.plot.line);
    var colorline = chart.addSeries(['name'], dimple.plot.line);
    baseline.lineMarkers = true;
    colorline.lineMarkers = true;
    baseline.data = second;
    colorline.data = base;

    colorline.addOrderRule(['New Haven', 'GNH', 'CT']);

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    svg.select('#dimple-all')
        .style('stroke-dasharray', ('5, 5'));

    return chart;

}
;d3.queue()
    .defer(d3.json, '../assets/json/nhv_neighborhoods.json')
    .defer(d3.csv, '../assets/data/housing/acs_cost_burden_by_neighborhood.csv')
    .defer(d3.csv, '../assets/data/housing/acs_cost_burden_by_tenure.csv')
    .defer(d3.csv, '../assets/data/housing/acs_tenure_by_age.csv')
    // .defer(d3.csv, '../data/housing/homeownership_1970-2010.csv')
    .defer(d3.csv, '../assets/data/housing/homeownership_by_race_age.csv')
    .await(initHousing);

//////////////////////////// INITIALIZE
function initHousing(error, json, burdenHood, burdenTenure, tenureAge, tenureAgeRace) {
    if (error) throw error;

    burdenTenure.forEach(function(d) {
        d.value = +d.value;
    });

    tenureAge.forEach(function(d) {
        d.value = +d.value;
    });

    tenureAgeRace.forEach(function(d) {
        d.value = +d.value;
    });

    // map from d3map
    var city = topojson.feature(json, json.objects.shapes);
    var nhv = d3map();
    d3.select('#burden-map')
        .datum(city)
        .call(nhv);
    nhv.color(burdenHood, choroscale)
        .tip('d3-tip', d3.format('.2p'), true)
        .legend(d3.format('.0%'), 15, 0);

    // var homeTrend = makeTenureTrend(trend);
    var barplots = [makeBurdenBars(burdenTenure), makeAge(tenureAge), makeAgeRace(tenureAgeRace)];

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) { plot.draw(0, true); });
        // burdenBars.draw(0, true);
        // ageBars.draw(0, true);
        nhv.draw();
    });

}

function makeBurdenBars(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 30 };
    console.log(data);

    var svg = d3.select('#burden-tenure')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink, ltblue ];

    var x = chart.addCategoryAxis('x', ['name', 'type']);
    x.addOrderRule(['CT', 'GNH', 'New Haven']);
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 5;
    y.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);

    chart.addLegend('25%', '8%', '10%', '20%', 'right');
    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(vertGroupTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeAge(dataAll) {
    var data = dimple.filterData(dataAll, 'name', ['New Haven', 'CT']);
    var margin = { top: 12, right: 18, bottom: 45, left: 60 };
    var svg = d3.select('#age-bars')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    chart.defaultColors = [ pink, ltblue, dkblue ];

    var y = chart.addCategoryAxis('y', ['name', 'type']);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries('type', dimple.plot.bar);
    chart.addLegend('8%', '95%', '100%', 20, 'left');
    bars.addOrderRule(['Ages 15-34', 'Ages 35-64', 'Ages 65+']);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizGroupTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeAgeRace(data) {
    var data = data.filter(function(d) { return d.name !== 'All races' & d.name !== 'Other'; });
    var margin = { top: 12, right: 18, bottom: 60, left: 60 };
    var svg = d3.select('#tenure-age-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = scale5;

    var y = chart.addCategoryAxis('y', 'name');
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 6;
    x.title = null;

    var dots = chart.addSeries('type', dimple.plot.bubble);
    dots.addOrderRule(['Under 35', 'Ages 35-44', 'Ages 45-54', 'Ages 55-64', 'Ages 65+', 'All ages']);
    chart.addLegend('8%', '85%', '100%', '20%', 'left', dots);

    chart.draw();

    svg.selectAll('circle.dimple-bubble')
        .attr('r', 9);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizGroupTip);

    svg.selectAll('circle.dimple-bubble')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        });

    return chart;
}

function makeTenureTrend(data) {

}
;(function() {
    var key = '1icln5UH_PknOUcvVenErNrjAR7MDoixmX733iq4NSHE';

    Tabletop.init({
        key: key,
        callback: showInfo,
        simpleSheet: false,
        wanted: ['data', 'sources']
    });
})();


function showInfo(data, tabletop) {
    var cardData = tabletop.sheets('data').all();
    var sourceData = tabletop.sheets('sources').all().sort(function(a, b) {
        return a.name < b.name ? -1 : 1;
    });
    makeCards(cardData);
    makeSources(sourceData);
}

function makeCards(data) {
    var cards = d3.select('.grid')
        .selectAll('.grid-item')
        .data(data)
        .enter();

    cards.append('div')
        .attr('class', function(d) { return 'grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3 ' + d.class; })
        .html(renderCard);

    $('div.spinner').empty();

    setupIsotope();
}

function makeSources(data) {
    // probably not worth it to use Handlebars template since these are so small
    d3.select('#source-list')
        .selectAll('li')
        .data(data)
        .enter()
        .append('li')
        .append('a')
        .attr('href', function(d) { return d.url; })
        .text(function(d) { return d.name; });
}

function setupIsotope() {
    var $grid = $('.grid');
    $grid.isotope({
        itemSelector: '.grid-item',
        percentPosition: true,
        masonry: {
            columnWidth: '.grid-sizer'
        }
    });

    $('.grid-item').on('click', function() {
        window.location = $(this).find('a').attr('href');
    });

    var $filters = $('#filters');
    $filters.on('click', '.btn', function(e) {
        e.preventDefault();

        $('.grid-item').removeClass('big');

        var filterVal = $(this).data('filter');
        $grid.isotope({ filter: filterVal });
        $filters.find('.active').removeClass('active');
        $(this).addClass('active');
    });
}

function makeFormat(format, number) {
    var percent = d3.format('.0%');
    var thousand = d3.format(',.0f');
    var dollar = d3.format('$,.0f');

    switch (format) {
        case 'percent': return percent(+number);
        case 'thousand': return thousand(+number);
        case 'dollar': return dollar(+number);
        case 'text': return number;
        default: return '';
    }
}

function renderCard(d, i) {

    var card = d;
    card.current_val = makeFormat(d.format, d.current_val);
    card.prev_val = d.prev_val.length ? makeFormat(d.format, d.prev_val) : '';
    // card.hasLink = card.class === 'cross' ? false : true;
    card.hasLink = true;
    // card.area = '<a class="area" href="pages/' + d.class + '.html"><span class="hidden learn-more">Learn more about </span>' + d.area + '</a>';
    // card.arrow = '<span class="glyphicon glyphicon-arrow-' + d.arrow + '"></span>';
    return Handlebars.templates.cardTemplate(card);
}


////////////////////// cardTemplate

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['cardTemplate'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <a class=\"area\" href=\"pages/"
    + alias4(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"class","hash":{},"data":data}) : helper)))
    + ".html\">\n        View <span class=\"hidden learn-more\"></span><span>"
    + alias4(((helper = (helper = helpers.area || (depth0 != null ? depth0.area : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"area","hash":{},"data":data}) : helper)))
    + "</span>\n    </a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <span class=\"area\">"
    + container.escapeExpression(((helper = (helper = helpers.area || (depth0 != null ? depth0.area : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"area","hash":{},"data":data}) : helper)))
    + "</span>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"row\">\n    <!-- <h5 class=\"name col-xs-12\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</h5> -->\n    <h5 class=\"name\"><span>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span></h5>\n</div>\n\n<div class=\"row\">\n    <div class=\"col-xs-9\">\n        <div class=\"row row-no-gutter\">\n            <h1 class=\"current-val\">"
    + alias4(((helper = (helper = helpers.current_val || (depth0 != null ? depth0.current_val : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"current_val","hash":{},"data":data}) : helper)))
    + " <small class=\"current-year\">"
    + alias4(((helper = (helper = helpers.current_year || (depth0 != null ? depth0.current_year : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"current_year","hash":{},"data":data}) : helper)))
    + "</small></h1>\n        </div>\n        <div class=\"row row-no-gutter\">\n            <h3 class=\"prev-val\">"
    + alias4(((helper = (helper = helpers.prev_val || (depth0 != null ? depth0.prev_val : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prev_val","hash":{},"data":data}) : helper)))
    + " <small class=\"prev-year\">"
    + alias4(((helper = (helper = helpers.prev_year || (depth0 != null ? depth0.prev_year : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"prev_year","hash":{},"data":data}) : helper)))
    + "</small></h3>\n        </div>\n    </div>\n    <div class=\"col-xs-3\">\n        <h1 class=\"trend\">\n            <!-- <span class=\"glyphicon glyphicon-"
    + alias4(((helper = (helper = helpers.arrow || (depth0 != null ? depth0.arrow : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"arrow","hash":{},"data":data}) : helper)))
    + " "
    + alias4(((helper = (helper = helpers.outcome || (depth0 != null ? depth0.outcome : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"outcome","hash":{},"data":data}) : helper)))
    + "\"></span> -->\n            <svg class=\"icon "
    + alias4(((helper = (helper = helpers.outcome || (depth0 != null ? depth0.outcome : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"outcome","hash":{},"data":data}) : helper)))
    + "\" aria-hidden=\"true\">\n                <use xlink:href=\"./assets/img/icons.svg#"
    + alias4(((helper = (helper = helpers.arrow || (depth0 != null ? depth0.arrow : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"arrow","hash":{},"data":data}) : helper)))
    + "\"></use>\n            </svg>\n        </h1>\n    </div>\n\n</div>\n\n<div class=\"row\">\n    <div class=\"descript\"><p class=\"descript-text\">"
    + alias4(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + ". <em>("
    + alias4(((helper = (helper = helpers.source || (depth0 != null ? depth0.source : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"source","hash":{},"data":data}) : helper)))
    + ")</em></p></div>\n</div>\n<div class=\"row\">\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.hasLink : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
})();
;d3.queue()
    .defer(d3.json, '../assets/json/nhv_neighborhoods.json')
    .defer(d3.csv, '../assets/data/literacy/acs_no_high_school_diploma_by_location.csv')
    .defer(d3.csv, '../assets/data/literacy/acs_no_high_school_diploma_by_neighborhood.csv')
    .defer(d3.csv, '../assets/data/literacy/acs_no_high_school_diploma_by_race.csv')
    .defer(d3.csv, '../assets/data/literacy/acs_no_high_school_diploma_trend.csv')
    .await(initLiteracy);

function initLiteracy(error, json, byLoc, byHood, byRace, trend) {
    if (error) throw error;

    var diplomaMap = d3map();
    d3.select('#diploma-map')
        .datum(topojson.feature(json, json.objects.shapes))
        .call(diplomaMap);
    diplomaMap.color(byHood, choroscale)
        .tip('d3-tip', d3.format('.2p'), true)
        .legend(d3.format('.0%'), 15, 0);

    var barplots = [ makeDiplomaLoc(byLoc), makeDiplomaRace(byRace) ];
    var diplomaTrend = makeDiplomaTrend(trend);

    d3.select(window).on('resize', function() {
        barplots.forEach(function(plot) {
            plot.draw(0, true);
        });

        diplomaTrend = makeDiplomaTrend(trend);

        diplomaMap.draw();

        redrawDots();
    });

    redrawDots();
}

function makeDiplomaLoc(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 60 };
    var svg = d3.select('#diploma-loc')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');
    y.addOrderRule(['CT', 'GNH', 'New Haven'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        })
        .on('touchend', function(d) {
            tip.show(d);
            barOver(this);
        });

    return chart;
}

function makeDiplomaRace(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 60 };
    var svg = d3.select('#diploma-race')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'type');
    y.title = null;
    y.addOrderRule(['All races', 'White', 'Black', 'Hispanic'], true);

    var x = chart.addMeasureAxis('x', 'value');
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;

    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        })
        .on('touchend', function(d) {
            tip.show(d);
            barOver(this);
        });

    return chart;
}

function makeDiplomaTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#diploma-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;

    chart.defaultColors = [ pink, dkblue, ltblue ];

    var line = chart.addSeries('name', dimple.plot.line);
    line.lineMarkers = true;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', line);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    return chart;
}
;d3.queue()
    .defer(d3.json, '../assets/json/nhv_neighborhoods.json')
    .defer(d3.json, '../assets/json/nhv_tracts.json')
    .defer(d3.csv, '../assets/data/workforce/underemployment_by_location.csv')
    .defer(d3.csv, '../assets/data/workforce/underemployment_by_year.csv')
    .defer(d3.csv, '../assets/data/workforce/unemployment_rate_by_year.csv')
    .defer(d3.csv, '../assets/data/workforce/acs_public_transit_by_neighborhood.csv')
    .defer(d3.csv, '../assets/data/workforce/acs_median_income_by_tract.csv')
    .await(initWorkforce);

///////////// INIT
function initWorkforce(error, hoods, tracts, underempLoc, underempTrend, unempTrend, transit, income) {
    if (error) throw error;

    underempLoc.forEach(function(d) {
        d.value = +d.value;
    });

    underempTrend.forEach(function(d) {
        d.value = +d.value;
    });

    unempTrend.forEach(function(d) {
        d.value = +d.value;
    });

    transit.forEach(function(d) {
        d.value = +d.value;
    });

    income.forEach(function(d) {
        d.value = +d.value;
    });

    var commuteMap = d3map();
    d3.select('#commute-map')
        .datum(topojson.feature(hoods, hoods.objects.shapes))
        .call(commuteMap);
    commuteMap.color(transit, choroscale)
        .tip('d3-tip', d3.format('.2p'), true)
        .legend(d3.format('.0%'), 15, 0);

    var incomeMap = d3map();
    d3.select('#income-map')
        .datum(topojson.feature(tracts, tracts.objects.nhv_tracts))
        .call(incomeMap);
    incomeMap.color(income, choroscale)
        .tip('d3-tip', d3.format('$,'), false)
        .legend(d3.format('$,'), 15, 0);

    var locationChart = makeUnderLocation(underempLoc);
    var underTrend = makeUnderTrend(underempTrend);
    var unTrend = makeUnTrend(unempTrend);

    d3.select(window).on('resize', function() {
        locationChart.draw(0, true);

        underTrend = makeUnderTrend(underempTrend);
        unTrend = makeUnTrend(unempTrend);

        commuteMap.draw();
        incomeMap.draw();

        redrawDots();
    });

    redrawDots();

}

function makeUnderLocation(data) {
    var margin = { top: 12, right: 18, bottom: 40, left: 100 };
    var svg = d3.select('#underemployment-chart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');
        // .attr('viewBox', '0 0 ' + fullwidth + ' ' + fullheight);
    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);
    chart.defaultColors = [ pink ];

    var y = chart.addCategoryAxis('y', 'name');
    y.addOrderRule(['CT', 'GNH', 'New Haven', 'NHV low-income', 'Other NHV'], true);
    y.title = null;

    var x = chart.addMeasureAxis('x', 'value');
    // x.title = '';
    x.tickFormat = '.0%';
    x.ticks = 4;
    x.title = null;


    var bars = chart.addSeries(null, dimple.plot.bar);

    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(horizTip);

    svg.selectAll('rect.dimple-bar')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            barOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            barOut(this);
        })
        .on('touchend', function(d) {
            tip.show(d);
            barOver(this);
        });

    return chart;
}


function makeUnderTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#underemployment-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 4;

    chart.defaultColors = [ ltblue, pink ];

    // var colorline = chart.addSeries('Type', dimple.plot.line);
    // colorline.lineMarkers = true;
    var past = dimple.filterData(data, 'type', 'past');
    var goal = dimple.filterData(data, 'type', 'goal');


    var goalline = chart.addSeries('type', dimple.plot.line);
    var pastline = chart.addSeries(null, dimple.plot.line);
    pastline.lineMarkers = true;
    goalline.lineMarkers = true;
    pastline.data = past;
    goalline.data = goal;

    // chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);
    chart.draw();

    d3.select('#dimple-goal')
        .style('stroke-dasharray', ('5, 5'));

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        })
        .on('touchstart', function(d) {
            d3.event.preventDefault();
            tip.show(d);
            dotOver(this);
        });

    // svg.selectAll('.dimple-marker.dimple-goal:first-child')
    //     .attr('display', 'none');

    return chart;
}

function makeUnTrend(data) {
    var margin = { top: 24, right: 32, bottom: 48, left: 32 };

    var svg = d3.select('#unemployment-trend')
        .select('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .html('');

    var chart = new dimple.chart(svg, data);
    chart.setMargins(margin.left, margin.top, margin.right, margin.bottom);

    var x = chart.addTimeAxis('x', 'year', '%Y', '%Y');
    x.title = null;

    var y = chart.addMeasureAxis('y', 'value');
    y.tickFormat = '.0%';
    y.ticks = 6;

    chart.defaultColors = [ pink, ltblue ];

    var colorline = chart.addSeries('name', dimple.plot.line);
    colorline.lineMarkers = true;

    chart.addLegend('80%', '8%', '10%', '20%', 'right', colorline);
    chart.draw();

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(trendGroupTip);

    svg.selectAll('circle.dimple-marker')
        .call(tip)
        .on('mouseover', function(d) {
            tip.show(d);
            dotOver(this);
        })
        .on('mouseout', function(d) {
            tip.hide(d);
            dotOut(this);
        });

    return chart;
}
