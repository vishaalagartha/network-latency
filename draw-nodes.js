const radius = 20

const computeWidth = function(x1, y1, x2, y2) {
  const strokeScale = d3.scaleLinear()
                        .domain([0, Math.sqrt(960*960+600*600)])
                        .range([10, 0])

  const d = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
  return strokeScale(d)
}

const drawNodes = function(svg) {
  const linksGroup = svg.append('g')
    .attr('class', 'links')
  const nodesGroup = svg.append('g')
    .attr('class', 'nodes')

  const legend = svg.append('g')
  
  let nodes = []
  let links = []

  nodesGroup.selectAll('circle')
            .data(nodes)

  linksGroup.selectAll('line')
            .data(links)

  drawLegend(svg)


  var update = function() {
    const newLinks = linksGroup.selectAll('line')
              .data(links)

    newLinks.exit().remove()

    newLinks.enter().append('line')
            .merge(newLinks)
              .attr('x1', function(d) { return d.x1 })
              .attr('y1', function(d) { return d.y1 })
              .attr('x2', function(d) { return d.x2 })
              .attr('y2', function(d) { return d.y2 })
              .attr('stroke-width', function(d) { return computeWidth(d.x1, d.y1, d.x2, d.y2) })

    const newNodes = nodesGroup.selectAll('circle')
              .data(nodes)

    newNodes.exit().remove()

    newNodes.enter().append('circle')
            .merge(newNodes)
              .attr('cx', function(d) { return d.x })
              .attr('cy', function(d) { return d.y });

  }

  function dragNode(id) {
    index = nodes.findIndex(n => n.id===id)
    nodes[index] = {id: id, x: d3.event.x, y: d3.event.y}

    links.forEach(function(link) {
      if(link.id[0]===id.toString()){
        link.x1 = d3.event.x
        link.y1 = d3.event.y
      }
      if(link.id[2]===id.toString()){
        link.x2 = d3.event.x
        link.y2 = d3.event.y
      }
    })

    update()
  }


  function dragNodeEnded(id) {
    const shouldTrashNode = d3.event.x > 75 && d3.event.x < 75+50 && d3.event.y > 100 && d3.event.y < 100+50

    if(shouldTrashNode) {
      index = nodes.findIndex(n => n.id===id)
      nodes.splice(index, 1)

      nodes.forEach(function(node) {
        if(node.id>id)
          node.id -= 1
      })

      links = links.filter(function(link) { 
        return (link.id[0]!==id.toString() && link.id[2]!==id.toString())
      })

      links.forEach(function(link) {
        let lower_id = parseInt(link.id[0])
        let upper_id = parseInt(link.id[2])
        if(lower_id>id)
          lower_id-=1
        if(upper_id>id)
          upper_id-=1
        link.id = lower_id + '-' + upper_id
      })

    }
    update()
  }

  function deleteNode(node) {
    index = nodes.findIndex(n => n.id===node.id)
    nodes.splice(index, 1)

    nodes.forEach(function(node) {
      if(node.id>id)
        node.id -= 1
    })

    links = links.filter(function(link) { 
      return (link.id[0]!==id.toString() && link.id[2]!==id.toString())
    })

    links.forEach(function(link) {
      let lower_id = parseInt(link.id[0])
      let upper_id = parseInt(link.id[2])
      if(lower_id>id)
        lower_id-=1
      if(upper_id>id)
        upper_id-=1
      link.id = lower_id + '-' + upper_id
    })
    update()
  }

  function offerDeleteNode(node) {
    const selector = '[id="' + node.id + '"]'
    const circle = nodesGroup.select(selector)

    nodesGroup.append('text')
      .attr('class', 'delete-icon')
      .attr('font-size', '10px')
      .attr('x', node.x+5)
      .attr('y', node.y-5)
      .html('\u2715') 

    function expandCircle() {
      circle.transition()
            .duration(2000)
            .attr('r', 30)
            .on('end', shrinkCircle)
    }
    function shrinkCircle() {
      circle.transition()
            .duration(2000)
            .attr('r', radius)
            .on('end', expandCircle)
    }
    expandCircle()
  }

  function resetNode(node) {
    d3.select('.delete-icon').remove()

    const selector = '[id="' + node.id + '"]'
    const circle = nodesGroup.select(selector)

    circle.transition()
          .duration(2000)
          .attr('r', radius)
  }

  function drawLegend() {
    function expandTrash() {
      d3.select(this)
        .attr('width', 60)
        .attr('height', 60)
    }
    function shrinkTrash() {
      d3.select(this)
        .attr('width', 50)
        .attr('height', 50)
    }

    legend.append('rect')
      .attr('class', 'legend-box')
      .attr('x', 50)
      .attr('y', 50)
      .attr('height', 100)
      .attr('width', 100)

    addLegendNode()
  }

  function addLegendNode() {
    legend.append('circle')
      .attr('class', 'legend-node')
      .attr('r', radius)
      .attr('cx', 100)
      .attr('cy', 100)

    legend.selectAll('.legend-node')
      .call(d3.drag()
        .on('drag', draggedLegendNode)
        .on('end', dragLegendNodeEnded))

    function draggedLegendNode(d) {
      d3.select(this)
        .attr('cx', d3.event.x)
        .attr('cy', d3.event.y)
    }


    function dragLegendNodeEnded(d) {
      d3.select(this).remove()
      const node_id = nodes.length
      nodes.push({id: node_id, x: d3.event.x, y: d3.event.y})
      nodesGroup.selectAll('circle')
                .data(nodes)
                .enter().append('circle')
                .attr('id', node_id)
                .attr('r', radius)
                .attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; })
                .call(d3.drag()
                  .on('drag', function() { dragNode(node_id) })
                  .on('end', function() { dragNodeEnded(node_id) }))
                .on('mouseover', function(d) { offerDeleteNode(d) })
                .on('mouseout', resetNode)

      nodes.forEach(function(node) {
        if(node.id!=node_id) {
          const link_id = node.id + '-' + node_id
          links.push({id: link_id, x1: node.x, y1: node.y, x2: d3.event.x, y2: d3.event.y})
        }
      })

      update()
      addLegendNode()
    }
  }
}



