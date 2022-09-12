/**
 * @file
 *
 * Summary.
 *
 * Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function.
 *
 * @author Victor Cardoso
 * @since 10/09/2022
 * @see https://orion.lcg.ufrj.br/cs336/examples/example123/content/GL_example3a.html
 */


"use strict";
 var vertices = new Float32Array([
     -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
 ]);

 var numPoints = vertices.length / 2;
 var w;
 var h;
 function mapToViewport(x, y, n = 5) {
     return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
 }

 function getVertex(i) {
     let j = (i % numPoints) * 2;
     return [vertices[j], vertices[j + 1]];
 }
 function draw(ctx,angle,vertice) {
     let vertexIndex = vertice
     ctx.fillStyle = "rgba(0, 204, 204, 1)";
     ctx.rect(0, 0, w, h);
     ctx.fill();
     let [x, y] = mapToViewport(...getVertex(vertexIndex));
     ctx.translate(x,y)
     //AJUSTAR PARA GRAU
     ctx.rotate(-angle*Math.PI/180);
     ctx.translate(-x,-y)
     ctx.beginPath();
     for (let i = 0; i < numPoints; i++) {
      if (i == 3 || i == 4) continue;
      let [x, y] = mapToViewport(...getVertex(i).map((v) => v ));
      if (i == 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
  }
    ctx.closePath();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 10;
    ctx.stroke();
    if(vertice === 3 || vertice == 4){
        var grd = ctx.createLinearGradient(100, 200, 200, 100);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "blue");
    } else{
        if(vertice == 1 || vertice == 5){
            var grd = ctx.createLinearGradient(200, 100, 100, 200);
            grd.addColorStop(0, "white");
            grd.addColorStop(1, "green");
        }
    }
    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fill();
 }

 function mainEntrance() {
     var canvasElement = document.querySelector("#theCanvas");
     var ctx = canvasElement.getContext("2d");
     let vertice = 3
     w = canvasElement.width;
     h = canvasElement.height;
     document.addEventListener("keydown", (event) => {
        console.log(event.key);
        //AJUSTAR AS TECLAS DO TECLADO
        switch (event.key) {
          case "b":
            vertice = 4;
            break;
          case "r":
            vertice = 3;
            break;
          case "g":
            vertice = 1;
            break;
          case "w":
            vertice = 5;
            break;
        }
      });
     var runanimation = (() => {
        // teta-angulow
         var angle = 2.0;
         return () => {
             draw(ctx,angle,vertice);
             requestAnimationFrame(runanimation);
         };
     })();
     runanimation();
 }