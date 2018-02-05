(function() {
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
