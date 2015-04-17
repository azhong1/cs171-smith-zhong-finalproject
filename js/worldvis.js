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
    //console.log(that.data);
	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
      .attr("id", "map")
      .attr("height", this.height)
        //.style("background-color", "lightblue")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        
    
    //instantiate world map
    this.map = new Datamap({element: document.getElementById('map'),
        scope: 'world',
        //geographyConfig: {
        //    popupOnHover: false,
        //    highlightOnHover: false
        //}
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
    this.wrangleData(1962);

}


/**
 * Method to wrangle the data. 
  */
WorldVis.prototype.wrangleData= function(year){

    var that = this

    this.displayData = [];

    var current_year = year - 1962 //to get the indexing correct

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

    this.updateVis(year);

}


/**
 * Drawing Method
 */
WorldVis.prototype.updateVis = function(year){
    
    // update circles
    this.map.bubbles(this.displayData); //, {highlightOnHover: false});
    //geographyConfig: {
        //    popupOnHover: false,
        //    highlightOnHover: false
        //});

    d3.selectAll("circle")
       .style("fill", "#aaac84");

    

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
        this.year = sliderScale(value)

        d3.select(this)
            .attr("x", function () {
                return value;
                
            })

        that.wrangleData(this.year);
        
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