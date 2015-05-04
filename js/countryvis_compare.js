/**
	CountryPVis object
**/


CountryPVis = function(_parentElement, _engdata, _co2data){
	this.parentElement = _parentElement;
    this.data = _engdata
    this.engdata = _engdata
    this.co2data = _co2data
    this.worldeng = this.initData(_engdata)
    this.worldco2 = this.initData(_co2data)
    this.displayData = null

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 420 - this.margin.right - this.margin.left
    this.height = 220 -this.margin.bottom - this.margin.top

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountryPVis.prototype.initVis = function(){
    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
        .attr("id", "compare")
        .style("background-color", "#F5F5F5")
      .append("g")
        .attr("transform", "translate(0," + this.margin.top + ")")

    // filter, aggregate, modify data
    this.wrangleData();

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.color = d3.scale.category20();

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format("d"));

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

      yearscale = d3.scale.ordinal()

        yearscale.range(d3.range(1960, 2014))
        yearscale.domain(d3.range(0, 53))

    //creates line generator
    this.line = d3.svg.line()
    .interpolate("basis")
    .x(function(d,i) {return that.x(yearscale(i)); })
    .y(function(d) { return that.y(d); })
        .defined(function(d) { return d; });

  
    //adds visual elements
        // Add axes visual elements
     this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + (this.height + 10)+")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")

}


/**
 * Method to wrangle the data. 
  */
CountryPVis.prototype.wrangleData= function(_filter){

    this.filterAndAggregate(_filter);

}


/**
 * Drawing Method
 */
CountryPVis.prototype.updateVis = function(){

    var that = this ;

    if (this.displayData == null){

        this.svg.selectAll(".x.axis").style("display", "none")
        this.svg.selectAll(".y.axis").style("display", "none")
        this.svg.selectAll(".area").style("display", "none")

        // this.svg.selectAll(".instr").style("display", "").text("No Data For Selection, Please Choose Again")

    }

    else{

    this.svg.selectAll(".area").style("display", "")
    this.svg.selectAll(".x.axis").style("display", "")
    this.svg.selectAll(".y.axis").style("display", "")
    // this.svg.selectAll(".instr").style("display", "").text("Energy Use for "+ this.metaData +"")

  
    var ymax = 0

    this.displayData.forEach(function (d) {
      var max = Math.max.apply(null, d.values)
      if (max > ymax) {ymax = max};
    })
   
    this.x.domain([1960, 2013]);
    this.y.domain([0, ymax]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

    var color = ["#663300", "#009933", "#ccff66"]

    this.svg.selectAll(".lineContainer").remove()

    var container = this.svg.append("g")
      .attr("class", "lineContainer")
      .attr("transform", "translate("+this.margin.left+","+ 10+")")


    // updates graph
    var path = container.selectAll(".line")
      .data(this.displayData)
      .attr("class", "line")

    path.enter()
      .append("path")
      .attr("d", function(d){return that.line(d.values)})
      .attr("fill", "none")
      .style("stroke", function(d,i){return color[i];});

    path.exit()
      .remove();

  }

}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryPVis.prototype.onSelectionChange= function (country){

    //define filter
    var filter = function (d) {if(d.country_id == country) {return true}
                    else {return false}
                }

    // d3.selectAll(".instr").style("display", "none")

     // call wrangle function and update view
    this.wrangleData(filter);

    this.updateVis();


}


CountryPVis.prototype.filterAndAggregate = function(_filter){

    this.displayData = null

    var that = this;

    var filter = function(){return false;}
    if (_filter != null){
        filter = _filter;
    }

    var gdp = []
    var pop = []
    var co2 = []

    this.co2data.forEach(function(d){
        if (filter(d)){

        that.metaData = d.name

        gdp = d.gdp.map(function(d,i){if (d> 0) {return d/that.worldco2.gdp[i] * 100} else {return null;}})
        pop = d.pop.map(function(d,i){if (d> 0 && that.worldco2.pop[i] > 0) { return d/that.worldco2.pop[i] * 100 } else {return null;}})
        co2 = d.years.map(function(d,i){if (d> 0) {return d/that.worldco2.years[i] * 100} else {return null;}})

        that.displayData = [{"values": gdp }, {"values": pop}, {"values": co2}]


        }
    })

    console.log(that.displayData)

}

CountryPVis.prototype.initData = function(data){

  var world 

  data.forEach(function(d){ if (d.name == "World") { world = d;}})
  
  return world
}

