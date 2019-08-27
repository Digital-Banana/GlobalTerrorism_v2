var example = d3.select("body").append("div")
    .style("display", "hidden")
    .style("width", "2048px");

var width = d3.getSize(example.style('width')),
    height = 1024,
    color = d3.scaleOrdinal(d3.schemeCategory10),
    world;

var projection = d3.geoEquirectangular().scale(height / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);

var data = [];

var paper;

d3.json("https://giottojs.org/geo/world-110m.json")
    .then(function(world110) {
        
        world = world110;
        draw('canvas');


    }).catch(function(error) {
        throw error;
});

d3.csv("/data/globalterrorismdb_0718dist_testset.csv")
    .then(function(dataset) {
        console.log("data loaded");
        data = dataset;

        databind(data);                   
        drawCircles();
        //getTexture();
        globe.getTexture();            
        
        
    }).catch(function(error) {
        throw error;
});

function draw(type, r) {
    example.select('.paper').remove();
    paper = example
            .append(type)
            .classed('paper', true)
            .attr('id', 'texture-canvas')
            .attr('width', width).attr('height', height).canvasResolution(r).canvas(true);        

    var path = d3.geoPath().projection(projection),
        graticule = d3.geoGraticule();

    paper.append("path")
        .datum({type: "Sphere"})
        .style("fill", "#fff")
        .style('stroke', '#000')
        .style('stroke-width', '2px')
        .attr("d", path);

    paper.append("path")
        .datum(graticule)
        .style("fill", "none")
        .style("stroke", '#777')
        .style("stroke-width", '.5px')
        .style("stroke-opacity", 0.5)
        .attr("d", path);

    var countries = topojson.feature(world, world.objects.countries).features,
        neighbors = topojson.neighbors(world.objects.countries.geometries);

    paper.selectAll(".country")
        .data(countries)
        .enter()
        .insert("path", ".graticule")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", function (d, i) {
            // return color(d.color = d3.max(neighbors[i], function (n) {
            //         return countries[n].color;
            //     }) + 1 | 0);
            return "#aaa";
        });

    paper.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
            return a !== b;
        }))
        .style("fill", "none")
        .style("stroke", '#fff')
        .style("stroke-width", '.5px')
        .attr("d", path);

    

}

var customBase = document.createElement("custom");

var custom = d3.select(customBase);

function databind(data) {
    var join = custom.selectAll("custom.circle").data(data);
    var enterSelection = join.enter().append("custom")
        .attr("class", "circle")
        .attr("lat", function(d) {
            return d.latitude;
        })
        .attr("long", function(d){
            return d.longitude;
        })
        .attr("r", 5);

    join.merge(enterSelection)
        .attr("fillStyle", "blue");

    var exitSelection = join.exit()
        .transition()
        .attr("r", 0)
        .remove();
}

function drawCircles() {
    var elements = custom.selectAll('custom.circle');
    elements.each(function(d,i) {
        var node = d3.select(this);
        var coords = projection([node.attr("long"), node.attr("lat")]);
        paper.insert("circle", ".geoCircle")
            .attr("class", "attackCircle")
            .attr("cx", coords[0])
            .attr("cy", coords[1])
            .attr("r", node.attr("r"))
            .style("fill", node.attr("fillStyle"));
            
    });

    

    result = paper;
}