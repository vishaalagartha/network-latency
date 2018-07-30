const radius = 10

const drawNodes = function(svg) {
  const nodesGroup = svg.append('g')
    .attr('class', 'nodes')
  const linksGroup = svg.append('g')
    .attr('class', 'links')

  const legend = svg.append('g')
  
  let nodes = []
  let links = []

  nodesGroup.selectAll('circle')
            .data(nodes)

  linksGroup.selectAll('line')
            .data(links)

  drawLegend(svg)
  function dragged(d) {

    const isTrashingNode = d3.event.x > 75 && d3.event.x < 75+50 && d3.event.y > 100 && d3.event.y < 100+50

    const newNode = d3.select(this)
      .attr('cx', d3.event.x)
      .attr('cy', d3.event.y)

    d3.selectAll('line')
      .each(function(d) {
        const line = d3.select(this)
        line.attr('x1', function(d) {return d3.event.x}).attr('y1', function(d) {return d3.event.y})
      })

  }

  function dragended(d) {
    d3.select(this).remove()

    const shouldTrashNode = d3.event.x > 75 && d3.event.x < 75+50 && d3.event.y > 100 && d3.event.y < 100+50

    if(!shouldTrashNode) {

      d3.selectAll('circle')
        .each(function(d) {
          const x1 = d3.select(this).attr('cx')
          const y1 = d3.select(this).attr('cy')

          const distance = Math.sqrt(Math.pow(x1-d3.event.x, 2) + Math.pow(y1-d3.event.y, 2))

          const isLegendNode = x1==='100' && y1==='75'
          if(!isLegendNode)
            linksGroup.append('line')
              .merge(linksGroup)
                .attr('x1', function(d) { return x1 })
                .attr('y1', function(d) { return y1 })
                .attr('x2', function(d) { return d3.event.x })
                .attr('y2', function(d) { return d3.event.y })
                .attr('stroke-width', function(d) { return distance/100 })
        })

      nodesGroup.append('circle')
      .merge(nodesGroup)
        .attr('r', radius)
        .attr('cx', d3.event.x)
        .attr('cy', d3.event.y)
        .call(d3.drag()
          .on('drag', dragged)
          .on('end', dragended))
      

      addLegendNode()
    }

  }


  function drawLegend() {
    legend.append('svg:image')
      .attr('x', 75)
      .attr('y', 100)
      .attr('xlink:href', './trash-icon.png')
      .attr('height', 50)
      .attr('width', 50)
      .attr('class', 'trash-icon')

    legend.append('rect')
      .attr('class', 'legend-box')
      .attr('x', 50)
      .attr('y', 50)
      .attr('height', 110)
      .attr('width', 100)

    addLegendNode()
  }

  function addLegendNode() {
    legend.append('circle')
      .attr('class', 'legend-node')
      .attr('r', radius)
      .attr('cx', 100)
      .attr('cy', 75)

    legend.selectAll('.legend-node')
      .call(d3.drag()
        .on('drag', dragged)
        .on('end', dragended))
  }
}



