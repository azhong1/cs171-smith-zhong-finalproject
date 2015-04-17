/**
	CountryVis object
**/


CountryVis = function(_parentElement, _data){
	this.parentElement = _parentElement;
    this.data = _data;
    this.totalData = null;
    this.altData = null;
    this.combData = null;

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 400 - this.margin.right - this.margin.left
    this.height = 300 -this.margin.bottom - this.margin.top

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountryVis.prototype.initVis = function(){
    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
        .style("background-color", "none")
      .append("g")
        .attr("transform", "translate(0," + this.margin.top + ")")

    this.svg.append("g").append("text")
    .attr("class", "instr")
    .text("Select a Country to view its detailed Energy Profile")

    // filter, aggregate, modify data
    this.wrangleData();

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom");

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left");

      yearscale = d3.scale.ordinal()

        yearscale.range(d3.range(1960, 2014))
        yearscale.domain(d3.range(0, 53))

    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) { return that.x(yearscale(i))})
      .y0(this.height)
          .y1(function(d) { return that.y(d)});

    this.nucarea = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) { return that.x(yearscale(i))})
      .y0(this.height)
          .y1(function(d, i) { return that.y(d * that.totalData[i])});


    //adds visual elements
        // Add axes visual elements
     this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + this.height +")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" +this.margin.left+ ", "+0+")")


    this.container = this.svg.append("g")
      .attr("class", "area")
      .attr("transform", "translate("+this.margin.left+","+ 0+")")

}


/**
 * Method to wrangle the data. 
  */
CountryVis.prototype.wrangleData= function(_filter){

    this.filterAndAggregate(_filter);

}


/**
 * Drawing Method
 */
CountryVis.prototype.updateVis = function(){
    var that = this ;

    console.log(this.totalData == null)

    if (this.totalData == null){

        this.svg.selectAll(".x.axis").style("display", "none")
        this.svg.selectAll(".y.axis").style("display", "none")
        this.svg.selectAll(".area").style("display", "none")

        d3.selectAll(".instr").style("display", "").text("No Data For Selection, Please Choose Again")

    }

    else{


    this.svg.selectAll(".x.axis").style("display", "")
    this.svg.selectAll(".y.axis").style("display", "")
    this.svg.selectAll(".area").style("display", "")
    
    var ymax = Math.max.apply(null, that.totalData)

   
    this.x.domain([1960, 2014]);
    this.y.domain([0, ymax]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)


    // updates graph
    var path = this.container.selectAll(".area")
      .data([this.totalData])

    path.enter()
      .append("path")
      .attr("class", "area")
      .attr("fill", "pink")

    path
      .transition()
      .attr("d", this.area)
      // .attr("d", function(d, i){if (i=0) {return this.area} else {return this.nucarea}});

    path.exit()
      .remove();

  }


}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryVis.prototype.onSelectionChange= function (country){

    //define filter
    var filter = function (d) {if(d.country_id == country) {return true}
                    else {return false}
                }

    d3.selectAll(".instr").style("display", "none")

     // call wrangle function and update view
    this.wrangleData(filter);

    this.updateVis();


}


CountryVis.prototype.filterAndAggregate = function(_filter){

    this.totalData = null;
    this.altData = null;
    this.combData = null;

    var that = this;

    var filter = function(){return false;}
    if (_filter != null){
        filter = _filter;
    }

    this.data.forEach(function(d){
        if (filter(d)){
        that.totalData = d.total_energy_use
        that.altData = d.alt_energy_use
        that.combData = d.comb_energy_use
        }
    })



}