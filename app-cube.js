var context = cubism.context()
    .serverDelay(15 * 1000) // allow 15 seconds of collection lag
    .step(15000) // fifteen seconds per value
    .size(1440); // fetch 1440 values (720p)

var graphite = context.graphite("http://localhost");

var api_metrics = [
  graphite.metric("stats.airport.campaigns.11b88e00a66e0326507815e0e6364e23").alias("11b88e00a66e0326507815e0e6364e23"),
  graphite.metric("stats.airport.campaigns.09a19b4dfc96ab53b9f6d7aade63b8a1").alias("09a19b4dfc96ab53b9f6d7aade63b8a1"),
  graphite.metric("stats.airport.campaigns.004ff0d7c4935487a17257f8aed960a5").alias("004ff0d7c4935487a17257f8aed960a5"),
];

// var campaigns = graphite.metric("sumSeries('stats.airport.campaigns.*')");

var horizon = context.horizon().colors(["#08519c", "#*82bd", "#6baed6", "#fee6ce", "#fdae6b", "#e6550d" ]);

var horizon2 = context.horizon().colors(["#ddic77", "#c994c7", "#e7eief","#efedf5", "#bcbddc", "#756bb1" ]);

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

context.on("focus", function(i) {
  d3.selectAll(".value").style("right", i == null ? null : context.size() - 1 - i + "px");
});
