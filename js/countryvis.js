/**
	CountryVis object
**/


CountryVis = function(_parentElement, _data, _eventHandler){
	this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;

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
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. 
  */
CountryVis.prototype.wrangleData= function(){

    this.displayData = this.data;

}


/**
 * Drawing Method
 */
CountryVis.prototype.updateVis = function(){


}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){


}