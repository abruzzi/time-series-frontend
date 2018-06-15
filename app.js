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
    .border(false)
    .width(width)
    .height(height);

// invoke the chart
var chartDiv = d3.select("#viewDiv").append("div")
    .attr("id", "chartDiv")
    .call(chart);

var color = d3.scale.linear()
    .domain([1, 10])
    .range(["#4F8E42", "#CBEF31"]);

var ws = new WebSocket("ws://localhost:8080");

ws.onopen = function() {
  console.log('connected');
};

ws.onmessage = function (evt) { 
  const event = JSON.parse(evt.data);
  categroies.push(_.truncate(event.campaign, { 'length': 8 }));
  const campaigns = _.uniq(categroies);

  chart.yDomain(campaigns);
  chart.yDomain().forEach(function(cat, i) {
    var now = new Date(event.date);

    var mills = event.mills * 200;

    const obj = {
      time: now,
      color: color(mills),
      opacity: 1,
      category: _.truncate(event.campaign, { 'length': 8}),
      type: "circle",
      size: mills,
    }

    chart.datum(obj);
  });

};

ws.onclose = function() { 
  console.log('closed');
};

document.addEventListener("DOMContentLoaded", function(event) {
  var button = document.getElementById('stop');
  button.addEventListener('click', () => {
    chart.halt(true);
  });      
});