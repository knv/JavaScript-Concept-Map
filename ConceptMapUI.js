window.ConceptMapUI = function(targetID, conceptMap, layout) {
  var _this = this;
  var invalidPaint = true;
  var $container = $("#" + targetID);
  if ($container.length == 0)
    throw "container not found";

  $container.html("<canvas id='canvas' width='1024' height='600'></canvas>");
  this.canvas = document.getElementById("canvas");
  if (!this.canvas)
    throw "Canvas not created";

  conceptMap.listeners.push(this);

  this.conceptAdded = function (concept) {
    if (concept.pos.x == 0 && concept.pos.y == 0) {
      concept.pos.x = Math.random() * 1024;
      concept.pos.y = Math.random() * 600;
    }

    $concept = concept.$html;
    $container.prepend($concept);
    $concept.css("left", concept.pos.x + "px").css("top", concept.pos.y + "px");
    
    $concept.draggable({
      drag: function(event, ui) {
        var concept = $(this).data("concept");
        concept.pos.x = ui.offset.left;
        concept.pos.y = ui.offset.top;
        _this.repaint();
      }
    }).disableSelection();
    _this.repaint();
  };

  this.conceptRemoved = function (concept) {
    concept.$html.remove();
    _this.repaint();
  };

  this.relationAdded = function (relation) {
    $container.append(relation.$html);
    _this.repaint();
  };

  this.relationRemoved = function (relation) {
    relation.$html.remove();
    _this.repaint();
  };  

  function drawRelations(canvas, conceptMap) {
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.fillStyle="rgb(100, 100, 100)"
    ctx.strokeStyle="rgb(100, 100, 100)";
    for (var i=0; i < conceptMap.relations.length; i++) {
      var relation = conceptMap.relations[i];
      ctx.beginPath();

      var edgePoints = relation.getEdgePoints();

      ctx.moveTo(edgePoints.p1.x, edgePoints.p1.y);
      ctx.lineTo(edgePoints.p2.x, edgePoints.p2.y);
      ctx.stroke();

      ctx.beginPath();

      var x = edgePoints.p2.x + ConceptMap.ARROW_SIZE * Math.cos(edgePoints.theta + Math.PI - ConceptMap.ARROW_ANGLE);
      var y = edgePoints.p2.y + ConceptMap.ARROW_SIZE * Math.sin(edgePoints.theta + Math.PI - ConceptMap.ARROW_ANGLE);
      ctx.moveTo(x, y);
      ctx.lineTo(edgePoints.p2.x, edgePoints.p2.y);

      x = edgePoints.p2.x + ConceptMap.ARROW_SIZE * Math.cos(edgePoints.theta+Math.PI + ConceptMap.ARROW_ANGLE);
      y = edgePoints.p2.y + ConceptMap.ARROW_SIZE * Math.sin(edgePoints.theta+Math.PI + ConceptMap.ARROW_ANGLE);
      ctx.lineTo(x, y);

      ctx.fill();

      var labelLeft = (edgePoints.p1.x + edgePoints.p2.x - relation.$html.width()) / 2;
      var labelTop = (edgePoints.p1.y + edgePoints.p2.y - relation.$html.height()) / 2;

      relation.$html.attr("style", "left: " + labelLeft + "px; top: " + labelTop + "px");
    }
  }

  this.paint = function() {
    var maxX = 1024;
    var maxY = 600;
    if (invalidPaint) {
      var needsPainting = layout.layoutMap(conceptMap, this);
      
      for (var i = 0; i < conceptMap.concepts.length; i++) {
        var concept = conceptMap.concepts[i];
        concept.$html.attr("style", "left: " + concept.pos.x + "px; top:" + concept.pos.y + "px");
        maxX = Math.max(maxX, concept.pos.x);
        maxY = Math.max(maxY, concept.pos.y);
      }

      drawRelations(this.canvas, conceptMap);

      invalidPaint = needsPainting;
    }
    
  }

  this.repaint = function() {
    invalidPaint = true;
  }
}


