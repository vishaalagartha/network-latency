const buildMap = function() {
  const width = 960,
        height = 600;

  const projection = d3.geoMercator()
                       .scale(130)
                       .translate( [width / 2, height / 1.5] );

  const path = d3.geoPath()
        .projection(projection);

  const svg = d3.select('body').append('svg')
                .attr('width', width)
                .attr('height', height);
  d3.json('world-50m.json', function(error, world) {
    if (error) throw error;

    svg.insert('path', '.graticule')
      .datum(topojson.feature(world, world.objects.land))
      .attr('class', 'land')
      .attr('d', path);

    svg.insert('path', '.graticule')
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr('class', 'boundary')
      .attr('d', path);
    drawNodes(svg);
  });
}
buildMap();
