$(function() {
      function json_ws( on_msg ) {
        if (!("WebSocket" in window)) {
            alert("Use a browser supporting websockets");
        }

        var sock = new WebSocket("ws://localhost:8080");
        sock.onmessage = function(msg) {
            var data;
            try {
                data = JSON.parse(msg.data);
            }
            catch (SyntaxError) {
                return;
            }
            if (data){
                on_msg(data);
            }
        }
        window.onbeforeunload = function() {
            sock.onclose = function() {};
            sock.close();
        }
    }

    var analog_keys = ['mills'];
    (function() {
        function make_realtime(key) {
            var buf = [], callbacks = [];
            return {
                data: function(ts, val) {
                    buf.push({ts: ts, val: val});
                    callbacks = callbacks.reduce(function(result, cb) {
                        if (!cb(buf))
                            result.push(cb);
                        return result
                    }, []);
                },
                add_callback: function(cb) {
                    callbacks.push(cb);
                }
            }
        };

        var realtime = {
            mills: make_realtime('mills')
        };

        /* This websocket sends homogenous messages in the form
         * {"solarFlare":false,"temperature":-50.68440764896562,"radiation":586,"stamp":"2016-04-06T09:44:19Z"}
         * where timestamp is a ISO 8601 datetime format
         */
        json_ws( function(data) {
            analog_keys.map(function (key) {
                    //console.log(data[key]);
                realtime[key].data(data.date, parseFloat(data[key])*1000);
            });
        });

        var context = cubism.context().step(1000).size(960);
        var metric = function (key, title) {
            var rt = realtime[key];
            return context.metric(function (start, stop, step, callback) {
                start = start.getTime();
                stop = stop.getTime();
                rt.add_callback(function(buf) {
                    if (!(buf.length > 1 && 
                          buf[buf.length - 1].ts > stop + step)) {
                        // Not ready, wait for more data
                        return false;
                    }
                    var r = d3.range(start, stop, step);
                    /* Don't like using a linear search here, but I don't
                     * know enough about cubism to really optimize. I had
                     * assumed that once a timestamp was requested, it would
                     * never be needed again so I could drop it. That doesn't
                     * seem to be true!
                     */
                    var i = 0;
                    var point = buf[i];
                    callback(null, r.map(function (ts) {
                        if (ts < point.ts) {
                            // We have to drop points if no data is available
                            return null;
                        }
                        for (; buf[i].ts < ts; i++);
                        return buf[i].val;
                    }));
                    // opaque, but this tells the callback handler to
                    // remove this function from its queue
                    return true;
                });
            }, title);
        };
        ['top', 'bottom'].map(function (d) {
            d3.select('#charts').append('div')
                .attr('class', d + ' axis')
                .call(context.axis().ticks(12).orient(d));
        });
        d3.select('#charts').append('div').attr('class', 'rule')
            .call(context.rule());
        charts = {
            mills: {
                title: 'mills',
                unit: 's',
                extent: [0, 20]
            },
            // radiation: {
            //     title: 'radiation',
            //     unit: 'Curie',
            //     extent: [0, 1000]
            // }
        };

        Object.keys(charts).map(function (key) {
            var cht = charts[key];
            var num_fmt = d3.format('.3r');
            d3.select('#charts')
                .insert('div', '.bottom')
                .datum(metric(key, cht.title))
                .attr('class', 'horizon')
                .call(context.horizon()
                    .extent(cht.extent).height(200)
                    .title(cht.title)
                    .format(function (n) { 
                        return num_fmt(n) + ' ' + cht.unit; 
                    })
                );
        });

        context.on('focus', function (i) {
            if (i !== null) {
                d3.selectAll('.value').style('right',
                                             context.size() - i + 'px');
            }
            else {
                d3.selectAll('.value').style('right', null)
            }
        });
    })();
});