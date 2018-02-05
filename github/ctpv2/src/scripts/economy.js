d3.queue()
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
