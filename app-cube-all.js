var context = cubism.context()
    .serverDelay(15 * 1000) // allow 15 seconds of collection lag
    .step(15 * 1000) // fifteen seconds per value
    .size(1440); // fetch 1440 values (720p)

var graphite = context.graphite("http://localhost");

var api_metrics = [
  graphite.metric("stats.jc.airport.campaigns.*").alias("Campaigns"),
  graphite.metric("stats.timers.jc.airport.campaigns.*").alias("Response Time"),
];

var data_metrics = [
  graphite.metric("stats.jc.airport.status.*").alias("Status")
];

var horizon = context
	.horizon()
	.colors(["#78FF00", "#CFFFA4", "#B3FF70", "#5BC200", "#469500"])
	.height(40);

var horizon2 = context
	.horizon()
	.colors(["#08519c", "#6baed6", "#fee6ce", "#fdae6b", "#e6550d"])
	.height(60);

d3.select("body").selectAll(".axis")
    .data(["top", "bottom"])
  .enter().append("div").attr("class", "fluid-row")
    .attr("class", function(d) { return d + " axis"; })
    .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

d3.select("body").append("div")
    .attr("class", "rule")
    .call(context.rule());

d3.select("body").selectAll(".horizon")
    .data(api_metrics)
  .enter().insert("div", ".bottom")
    .attr("class", "horizon").call(horizon.extent([0, 1]));

d3.select("body").selectAll(".horizon2")
    .data(data_metrics)
  .enter().insert("div", ".bottom")
    .attr("class", "horizon").call(horizon2.extent([0, 2]));

context.on("focus", function(i) {
  d3.selectAll(".value")
  	.style("right", i == null ? null : context.size() - 1 - i + "px")
  	.text((d) => isNaN(d) ? 0 : d.toFixed(2)) ;
});
