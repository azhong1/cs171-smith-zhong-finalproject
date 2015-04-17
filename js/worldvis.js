/**
	WorldVis object
**/


WorldVis = function(_parentElement, _data, _eventHandler){
	this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 1100 
    this.height = 600
    this.year = 1960

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
WorldVis.prototype.initVis = function(){

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
      .attr("id", "map")
      .attr("height", this.height)
        //.style("background-color", "lightblue")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        

    var map = new Datamap({element: document.getElementById('map')}); 


    //instantiate world totals line plot
    // this.lineplot = this.svg.append("g")
    // 	.attr("class", "lineplot")
    // 	.attr("transform", "translate(25, 400)")

    this.addLinePlot(this.svg)

    //add slider
    this.addSlider(this.svg)

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. 
  */
WorldVis.prototype.wrangleData= function(){

    this.displayData = this.data;

}


/**
 * Drawing Method
 */
WorldVis.prototype.updateVis = function(){
    var that = this

    console.log(that.data)
    //adding the bubbles
    var co2 = new Datamap({
        element: document.getElementById('map'),
        scope: 'world',
        geographyConfig: {
            popupOnHover: false,
            highlightOnHover: false
        },
    });

         var bombs = [{
            name: 'Joe 4',
            radius: 25,
            yield: 400,
            country: 'USSR',
            fillKey: 'RUS',
            significance: 'First fusion weapon test by the USSR (not "staged")',
            date: '1953-08-12',
            latitude: 50.07,
            longitude: 78.43
          },{
            name: 'RDS-37',
            radius: 40,
            yield: 1600,
            country: 'USSR',
            fillKey: 'RUS',
            significance: 'First "staged" thermonuclear weapon test by the USSR (deployable)',
            date: '1955-11-22',
            latitude: 50.07,
            longitude: 78.43

          },{
            name: 'Tsar Bomba',
            radius: 75,
            yield: 50000,
            country: 'USSR',
            fillKey: 'RUS',
            significance: 'Largest thermonuclear weapon ever tested—scaled down from its initial 100 Mt design by 50%',
            date: '1961-10-31',
            latitude: 73.482,
            longitude: 54.5854
          }
        ];
    //draw bubbles for bombs
    co2.bubbles(bombs, {
        popupTemplate: function (geo, data) { 
                return ['<div class="hoverinfo">' +  data.name,
                '<br/>Payload: ' +  data.yield + ' kilotons',
                '<br/>Country: ' +  data.country + '',
                '<br/>Date: ' +  data.date + '',
                '</div>'].join('');
        }
    });

}


/**
 * Gets called by event handler and should create new aggregated data
 */
WorldVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){


}

/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */

 /**
 * creates the bottom slider
 */
WorldVis.prototype.addSlider = function(svg){
    var that = this;

    //Scale slider position values to year values
    var sliderScale = d3.scale.linear()

    sliderScale.domain([0, 400])
    sliderScale.rangeRound([1960,2014])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(400,d3.event.x));

        //update current year value
        this.year = sliderScale(value)

        d3.select(this)
            .attr("x", function () {
                return value;
            })

        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+400+","+550+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:400,
        height: 10
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        x: 400,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)

}

/**
 * creates the world c02 totals line plot
 */
WorldVis.prototype.addLinePlot = function(svg){
    var that = this;
    
    var lineGroup = svg.append("g").attr({
        class:"lineGroup",
        "transform":"translate("+400+","+450+")"
    })

    var linedata = []

    var years = [] 
    that.data.forEach(function(d){ if(d.name == "World") {years = d.years}})

    years.forEach(function(d,i){if (d>0){ linedata[i] = d}})

    var x = d3.scale.linear()
    var y = d3.scale.linear()

    var ymax = Math.max.apply(null, linedata)
    var ymin = d3.min(linedata, function(d){if (d > 0){ return d}})

    console.log(ymax)

    y.domain([0, ymax])
    y.range([100, 0])

    x.range([0,400])
    x.domain([0, 53])


    var line = d3.svg.line()
    .x(function(d, i) {return x(i); })
    .y(function(d) { return y(d); });

    lineGroup.append("path")
    	.datum(linedata)
    	.attr("class", "line")
    	.attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", "1.5px")
}