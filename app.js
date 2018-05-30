const categroies = [];
// create the real time chart

var chartDiv = document.getElementById("viewDiv");

var width = chartDiv.clientWidth;
var height = chartDiv.clientHeight;

var chart = realTimeChartMulti()
    .title("Campaigns in live")
    .yTitle("Campaigns")
    .xTitle("Time")
    .yDomain(categroies) // initial y domain (note array)
    .border(true)
    .width(width)
    .height(height);

// invoke the chart
var chartDiv = d3.select("#viewDiv").append("div")
    .attr("id", "chartDiv")
    .call(chart);

// define color scale
var color = d3.scale.category20c();

var ws = new WebSocket("ws://localhost:8080");

ws.onopen = function() {
  console.log('connected');
};

ws.onmessage = function (evt) { 
  const event = JSON.parse(evt.data);
  categroies.push(event.campaign);
  const campaigns = _.uniq(categroies);

  console.log(campaigns.length);

  chart.yDomain(campaigns);
  chart.yDomain().forEach(function(cat, i) {
    var now = new Date(event.date);

    const obj = {
      time: now,
      color: color(Math.round(Math.random() * campaigns.length)),
      opacity: 1,
      category: event.campaign,
      type: "circle",
      size: event.mills * 500,
    }

    chart.datum(obj);      
  });

};

ws.onclose = function() { 
  console.log('closed');
};