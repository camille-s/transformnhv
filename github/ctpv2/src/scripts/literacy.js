d3.queue()
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
