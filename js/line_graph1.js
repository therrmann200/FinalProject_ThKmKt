"use strict";

function triggerLineHighlight(fireID) {
  //document.getElementById(fireID).classList.remove('line');
  //document.getElementById(fireID).classList.add('lineHover');
  console.log('fire  id: ' + fireID);
}

function triggerLineReset(fireID) {
  //document.getElementById(fireID + 'Line').classList.remove('lineHover');
  //document.getElementById(fireID + 'Line').classList.add('line');
}

// set the dimensions and margins of the graph
var margin = {
    top: 30,
    right: 30,
    bottom: 50,
    left: 60
  },
  width = d3.select("#graph").node().getBoundingClientRect().width - margin.left - margin.right,
  height = d3.select("#graph").node().getBoundingClientRect().height - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#graph")
  .append("svg:svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Read the data
d3.csv("../data/ndvi_reformat1.csv", function(data) {

  // group the data: I want to draw one line per group
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) {
      return d.FID_1;
    })
    .entries(data);

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) {
      return d.year;
    }))
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

  // Add the text label for the x axis
  svg.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")")
    .style("text-anchor", "middle")
    .text("Year");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {
      return +d.ndvi;
    })])
    .range([height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add the text label for the Y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("NDVI");

//add graph title
svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 10 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Average NDVI Over Wildfire Areas");

  // color palette
  var res = sumstat.map(function(d) {
    return d.key
  }) // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    //.range(['#bedcb8', '#b5cfb0', '#acc1a8', '#a3b4a0', '#9aa798', '#c7e9c0', '#919a90', '#888d88', '#a1d99b'])
    .range(['#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0', '#a3b4a0'])
  // Draw the line
  svg.selectAll(".line")
    .data(sumstat, function(d) { return d.key; })
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", function(d) {
      return color(d.key)
    })
    .attr("stroke-width", 1.5)
    .attr("FID_1", function(sumstat) {return sumstat.FID_1;})
    .attr("d", function(d) {
      return d3.line()
        .x(function(d) {
          return x(d.year);
        })
        .y(function(d) {
          return y(+d.ndvi);
        })
        (d.values)
    })
    .on("mouseover", function (d) {
       console.log("Mouse is on " + d.key);
       triggerMapHighlight(d.key);
       d3.select(this).style("stroke","green").attr("stroke-width", 2.5);
     })
     .on("mouseout", function (d) {
       console.log("Mouse moved out of " + d.key);
       d3.select(this).style("stroke", function(d) {
         return color(d.key)
       })
       .attr("stroke-width", 1.5)
       triggerMapReset(d.key);
     })

})
