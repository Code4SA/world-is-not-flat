function map(container, world, countryData, ctx) {
    this.width = ctx.width || 600;
    this.height = ctx.height || 500;
    this.sens = ctx.sens || 0.25;
    this.container = container.append("svg")
        .attr("width", this.width)
        .attr("height", this.height)

    this.allow_y = ctx.allow_y == undefined ? 1 : ctx.allow_y;
    this.allow_x = ctx.allow_x == undefined ? 1 : ctx.allow_x;
    this.show_graticule = ctx.show_graticule ? ctx.show_graticule : 0;

    default_projection = d3.geo.orthographic().translate([this.width / 2, this.height / 2 - 50]);
    this.projection = ctx.projection || default_projection;
    this.clip_angle = ctx.clip_angle || 90;


    var path = d3.geo.path().projection(this.projection);

    var countryById = {}
    countryData.forEach(function(d) {
        countryById[d.id] = d.name;
    });

    //Adding water
    this.container.append("path")
        .datum({type: "Sphere"})
        .attr("class", "water")
        .attr("d", path);

    var countries = topojson.feature(world, world.objects.countries).features;
    var me = this;

    //Drawing countries on the globe
    this.container.selectAll("path.water")
        .call(
            d3.behavior.drag()
                .origin(function() {
                    var r = me.projection.rotate();
                    return {
                        x: r[0] / me.sens * me.allow_x,
                        y: -r[1] / me.sens * me.allow_y
                    };
                })
                .on("drag", function() {
                    var rotate = me.projection.rotate();
                  me.projection.rotate([
                        d3.event.x * me.sens * me.allow_x,
                       -d3.event.y * me.sens * me.allow_y,
                        rotate[2]
                    ]);
                    me.container.selectAll("path.land").attr("d", path);
                    me.container.selectAll(".focused").classed("focused", focused = false);
                 })
        )


    var world = this.container.selectAll("path.land")
        .data(countries)
        .enter().append("path")
            .attr("class", "land")
            .attr("d", path)

            //Drag event
            .call(
                d3.behavior.drag()
                    .origin(function() {
                        var r = me.projection.rotate();
                        return {
                            x:  r[0] / me.sens * me.allow_x,
                            y: -r[1] / me.sens * me.allow_y
                        };
                    })
                .on("drag", function() {
                    var rotate = me.projection.rotate();
                    me.projection.rotate([
                       d3.event.x * me.sens * me.allow_x,
                       -d3.event.y * me.sens * me.allow_y,
                        rotate[2]
                    ]);
                    me.container.selectAll("path.land").attr("d", path);
                    me.container.selectAll(".focused").classed("focused", focused = false);
                })
            )
            //Mouse events
            .on("mouseover", function(d) {
                countryTooltip.text(countryById[d.id])
                .style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block")
                .style("opacity", 1);
            })

            .on("mouseout", function(d) {
                countryTooltip
                    .style("opacity", 0)
                    .style("display", "none");
            })

            .on("mousemove", function(d) {
                countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
            });

            function country(cnt, sel) { 
                for (var i = 0, l = cnt.length; i < l; i++) {
                    if (cnt[i].id == sel.value) {
                        return cnt[i];
                    }
                }
            };

    if (this.show_graticule) {
        var graticule = d3.geo.graticule();
        this.container.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path)
    }
            
}

function mercator(container, world, countryData, ctx) {
    ctx = ctx || {};
    scale = ctx.scale || 500;
    width = ctx.width || 600;
    height = ctx.height || 300;

    ctx["projection"] = d3.geo.mercator()
        .translate([width/2 - 10, 20])
        .center([0, 70])
        .scale(scale)

    ctx["allow_x"] = 1;
    return new map(container, world, countryData, ctx);
}

function mercator_upsidedown(container, world, countryData, ctx) {
    ctx = ctx || {};
    scale = ctx.scale || 500;
    width = ctx.width || 600;
    height = ctx.height || 500;

    ctx["projection"] = d3.geo.mercator()
        .rotate([0, 0, 180])
        .translate([width/2, height/2 - 50])
        .center([0, -70])
        .scale(scale)

    ctx["allow_x"] = -1;
    return new map(container, world, countryData, ctx);
}

function orthographic(container, world, countryData, ctx) {
    ctx = ctx || {};
    scale = ctx.scale || 200;
    width = ctx.width || 600;
    height = ctx.width || 500;

    //ctx["projection"] = d3.geo.conicConformal()
    //ctx["projection"] = d3.geo.conicEqualArea()
    //ctx["projection"] = d3.geo.albers()
    //ctx["projection"] = d3.geo.equirectangular()
    ctx["projection"] = d3.geo.azimuthalEqualArea()
    //ctx["projection"] = d3.geo.orthographic()
        .rotate([-17,0,0])
        .translate([width/2, height/2 - 50])
        .scale(scale)
        .clipAngle(90);

    return new map(container, world, countryData, ctx);
}


      //Country focus on option select
      /*
      d3.select("select").on("change", function() {
          var rotate = projection.rotate(),
          focusedCountry = country(countries, this),
          p = d3.geo.centroid(focusedCountry);

          svg.selectAll(".focused").classed("focused", focused=false);

          //Globe rotating
          (function transition() {
              d3.transition().duration(2500)
                .tween("rotate", function() {
                    var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                    return function(t) {
                        projection.rotate(r(t));
                        svg.selectAll("path").attr("d", path)
                        .classed("focused", function(d, i) {
                            return d.id == focusedCountry.id ? focused = d : false;
                        });
                    };
              })
          })();
      });
      */

