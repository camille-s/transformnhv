d3.queue()
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
