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

    var that = this
    console.log(that.data);

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
      .attr("id", "map")
      .attr("height", this.height)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        
    //instantiate world map
    this.map = new Datamap({element: document.getElementById('map'),
        scope: 'world',
        //geographyConfig: {
        //    popupOnHover: false,
        //    highlightOnHover: false
        //}
        fills: {
            defaultFill: '#ffee66'
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {

            //trigger selection event
            $(that.eventHandler).trigger("selectionChanged", geography.id);

            });
        }
    }); 

    //instantiate world totals line plot
    this.addLinePlot(this.svg)

    //add slider
    this.addSlider(this.svg)

    // filter, aggregate, modify data, calls updateVis
    this.wrangleData_gdp();

}


/**
 * Method to wrangle the data for gdp. 
  */
WorldVis.prototype.wrangleData_gdp= function(){

    this.toggle = 0

    var that = this

    this.displayData = [];

    var current_year = this.year - 1959 //to get the indexing correct

    //scale the bubbles
    var x = d3.scale.linear()
        x.domain([0, 7200000])
        x.range([3, 80])


    //wrangle data for bubbles
    this.data.forEach(function(d){
        if (d.longitude != -1 && d.latitude != -1){
            if (d.years[current_year] > 0) {
                d.radius = x(d.years[current_year])
            } else {
                d.radius = 0
            }
            
            that.displayData.push({"latitude": d.latitude, "longitude": d.longitude, "radius": d.radius, 
                "code": d.country_id, "borderWidth": 0, "fillOpacity": 0.5})

        }
    })

    //wrangle data for fill colors and country codes
    fills_array = {}
    country_array = {}

    var gdp_scale = d3.scale.linear()
        .domain([0, 16163200000000/4])
        .rangeRound([204, 17]) //#66 to #cc

    var red_scale = d3.scale.linear()
        .domain([0, 16163200000000])
        .rangeRound([255, 204])

    that.data.forEach(function(d) {
        var gdp = d.gdp[current_year]
        var string;
        if (gdp > -1 && d.longitude != -1 && d.latitude != -1) {
            if (gdp > 16163200000000/4) {
                string = "#ff0566" 
            } else {
                string = "#ff" + gdp_scale(gdp).toString(16) + "66"
            }
            
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = string
            country_array[d.country_id] = obj

        }
        
    })

    this.displayData.fills_array = fills_array
    this.displayData.country_array = country_array

    console.log(this.displayData.fills_array)

    this.updateVis();

}


/**
 * Method to wrangle data for population. 
  */
WorldVis.prototype.wrangleData_pop= function(){

    var that = this

    this.toggle = 1

    this.displayData = [];

    var current_year = this.year - 1959 //to get the indexing correct

    //scale the bubbles
    var x = d3.scale.linear()
        x.domain([0, 7200000])
        x.range([3, 80])


    //wrangle data for bubbles
    this.data.forEach(function(d){
        if (d.longitude != -1 && d.latitude != -1){
            if (d.years[current_year] > 0) {
                d.radius = x(d.years[current_year])
            } else {
                d.radius = 0
            }
            
            that.displayData.push({"latitude": d.latitude, "longitude": d.longitude, "radius": d.radius, 
                "code": d.country_id, "borderWidth": 0, "fillOpacity": 0.5})

        }
    })

    //wrangle data for fill colors and country codes
    fills_array = {}
    country_array = {}

    var pop_scale = d3.scale.linear()
        .domain([1000000, 135069500/2])
        .rangeRound([220, 180]) //#66 to #cc

    var pop_scale_large = d3.scale.linear()
        .domain([135069500/2, 1350695000])
        .rangeRound([180, 17])

    that.data.forEach(function(d) {
        var pop = d.pop[current_year]
        console.log(pop_scale(pop));
        var string;
        if (pop > -1 && d.longitude != -1 && d.latitude != -1) {
            if (pop > 135069500/2) {
                string = "#" + pop_scale_large(pop).toString(16) + "99" + "cc"//"#0599cc" 
            } else {
                string = "#" + pop_scale(pop).toString(16) + "99" + "cc"
            }
            
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = string
            country_array[d.country_id] = obj

        }
        
    })

    this.displayData.fills_array = fills_array
    this.displayData.country_array = country_array

    console.log(this.displayData.fills_array)

    this.updateVis();

}

/**
 * Drawing Method
 */
WorldVis.prototype.updateVis = function(){
    
    // update circles
    this.map.bubbles(this.displayData); //, {highlightOnHover: false});
    //geographyConfig: {
        //    popupOnHover: false,
        //    highlightOnHover: false
        //});

    this.map.updateChoropleth(
        this.displayData.fills_array);

    d3.selectAll("circle")
       .style("fill", "#990033");

    

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

    //console.log(that.data);
    //Scale slider position values to year values
    var sliderScale = d3.scale.linear()

    sliderScale.domain([0, 400])
    sliderScale.rangeRound([1960,2012])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(400,d3.event.x));

        //update current year value
        that.year = sliderScale(value)

        d3.select(this)
            .attr("x", function () {
                return value;
                
            })

        if (that.toggle == 0) {
            that.wrangleData_gdp();
        } else {
            that.wrangleData_pop();
        }
        
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
        x: 0,
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

    //console.log(ymax)

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

