/**
	CountryVis object
**/


CountryVis = function(_parentElement, _data){
	this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 250
    this.height = 300

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountryVis.prototype.initVis = function(){

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
        .attr("height", this.height)
        .style("background-color", "lightcoral")
      .append("g")
        .attr("transform", "translate(0," + this.margin.top + ")")

    this.svg.append("g").append("text")
    .attr("class", "instr")
    .text("Select a Country to view its detailed Energy Profile")

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. 
  */
CountryVis.prototype.wrangleData= function(_filter){


    this.displayData = this.filterAndAggregate(_filter);

}


/**
 * Drawing Method
 */
CountryVis.prototype.updateVis = function(){
    var that = this ;
    console.log(that.displayData)


}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryVis.prototype.onSelectionChange= function (country){

    //define filter
    var filter = function (d) {if(d.name == country) {return true}
                    else {return false}
                }

    d3.selectAll(".instr").style("display", "none")

     // call wrangle function and update view
    this.wrangleData(filter);

    this.updateVis();


}


CountryVis.prototype.filterAndAggregate = function(_filter){

        var filter = function(){return false;}
    if (_filter != null){
        filter = _filter;
    }

    this.data.forEach(function(d){
        if (filter(d)){

            console.log("hi")
        this.displayData = d

        }
    })


}