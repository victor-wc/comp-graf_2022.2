/**
 *  @file
 *
 *  Summary.
 * 
 * Intersection between circles and convex polygons. 
 * When two or more polygons intersect, your colors will change.
 *
 *  @author Victor Wohlers Cardoso
 *  @since 08/10/2022
 *  @see 
 */

 "use strict";

 import * as util2d from "./2dutils.js";
 
 /**
  * Two dimensional vector.
  * @type {glvec2}
  */
 const vec2d = (function () {
   /**
    * @member {Object} glvec2 an extended vec2d from gl-matrix.
    */
   let glvec2 = Object.assign({}, vec2);
   let glmat3 = mat3;
 
   /**
    * Orientation between 3 points.
    * @param {Array<Number,Number>} a first point.
    * @param {Array<Number,Number>} b second point.
    * @param {Array<Number,Number>} c third point.
    * @returns {Number} orientation.
    * @see https://en.wikipedia.org/wiki/Cross_product
    * @see http://www.cs.tufts.edu/comp/163/OrientationTests.pdf
    * @see <img src="../orient.png" width="320">
    * @global
    * @function
    */
   glvec2.orient = function (a, b, c) {
     return Math.sign(
       glmat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]])
     );
   };
 
   /**
    * Returns true iff line segments a-b and c-d intersect.
    * @param {Array<Number,Number>} a starting vertex.
    * @param {Array<Number,Number>} b end vertex.
    * @param {Array<Number,Number>} c starting vertex.
    * @param {Array<Number,Number>} d end vertex.
    * @returns {Boolean} intersect or not.
    * @global
    * @function
    */
   glvec2.segmentsIntersect = function (a, b, c, d) {
     return (
       glvec2.orient(a, b, c) != glvec2.orient(a, b, d) &&
       glvec2.orient(c, d, a) != glvec2.orient(c, d, b)
     );
   };
 
   /**
    * <p>Line intersection.</p>
    *
    * Sets 'out' to the intersection point between
    * lines [x1,y1]-[x2,y2] and [x3,y3]-[x4,y4].
    * @param {Array<Number,Number>} out intersection point.
    * @param {Array<Number,Number>} param1 starting vertex.
    * @param {Array<Number,Number>} param2 end vertex.
    * @param {Array<Number,Number>} param3 starting vertex.
    * @param {Array<Number,Number>} param4 end vertex.
    * @returns {Array<Number,Number>} intersection point.
    * @see https://en.wikipedia.org/wiki/Lineâ€“line_intersection
    * @global
    * @function
    */
   glvec2.lineIntersection = function (
     out,
     [x1, y1],
     [x2, y2],
     [x3, y3],
     [x4, y4]
   ) {
     const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
     const a = x1 * y2 - y1 * x2,
       b = x3 * y4 - y3 * x4;
 
     out[0] = (a * (x3 - x4) - (x1 - x2) * b) / D;
     out[1] = (a * (y3 - y4) - (y1 - y2) * b) / D;
     return out;
   };
   return glvec2;
 })();
 
 // -------- Functions --------
 
/**
 * Fills the canvas with a solid color and border.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} w width.
 * @param {Number} h height.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
  function fillCanvas(ctx, w, h) {
    ctx.fillStyle = "antiquewhite";
    ctx.strokeStyle = "brown";
    ctx.lineWidth = 10;
    // clear canvas.
    ctx.fillRect(0, 0, w, h);
    // draw canvas border.
    ctx.strokeRect(0, 0, w, h);
    ctx.lineWidth = 1;
}

 
 function midPoints(center, width, height) {
   return [
     vec2d.add([], center, [width, 0]),
     vec2d.add([], center, [0, height]),
     vec2d.add([], center, [-width, 0]),
     vec2d.add([], center, [0, -height]),
   ];
 }
 
  function convexPolysIntersect(p, p2) {
   let vectors = [];
   let vectors2 = [];
 
   for (let i = 0; i < p.length; i++){
     vectors.push(new SAT.Vector(p[i][0], p[i][1]));
   }
 
   for (let i = 0; i < p2.length; i++){
     vectors2.push(new SAT.Vector(p2[i][0], p2[i][1]));
   }
 
   return SAT.testPolygonPolygon(new SAT.Polygon(new SAT.Vector(), vectors), new SAT.Polygon(new SAT.Vector(), vectors2));
 }

 function convexPolyCircleIntersect(center, radius, poly) {
   if (util2d.pointInConvexPoly(center, poly)){
    
    return true;

   } 
 
   for (let i = 0; i < poly.length; i++){
     if (util2d.distToSegment(center, poly[i], poly[(i + 1) % poly.length]) <= radius){ 
      return true;
     }
   }
   
   return false;
 }

 function circleCircleIntersect(center1, radius1, center2, radius2) {
    if (vec2d.dist(center1, center2) > radius1 + radius2){

      return false;

    } else {

      return true;

    }
 }
 
 function makePts(isos, rects, circs) {
   for (let triangle of isos) {
     triangle.poly = isosceles(triangle);
     triangle.anchors = [triangle.basePoint, triangle.oppositeVertex];
   }
 
   for (let rect of rects) {
     rect.midPoints = midPoints(rect.center, rect.width, rect.height);
     rect.poly = rectangle(rect);
     rect.anchors = [rect.center].concat(rect.midPoints);
   }
 
   for (let circle of circs) {
     circle.control = [circle.center[0], circle.center[1] - circle.radius];
     circle.anchors = [circle.center, circle.control];
   }
 }
 
 function updateInfo(isos, rects, circs) {
   for (let triangle of isos){
     triangle.poly = isosceles(triangle);
   }
 
   for (let rect of rects){
     rect.poly = rectangle(rect);
   }
 
   for (let circle of circs){
     circle.radius = vec2d.len(vec2d.sub([], circle.control, circle.center));
   }
 }
 

 (function polyDemo() {
   const demo = document.querySelector("#theCanvas");
   const ctx = demo.getContext("2d");
   const [width, height] = [demo.clientWidth, demo.clientHeight];
   let prevMouse = null;
 
   const isos = [
     { basePoint: [100, 250], oppositeVertex: [100, 200], color: "black" },
     { basePoint: [250, 250], oppositeVertex: [250, 200], color: "black" },
     { basePoint: [400, 250], oppositeVertex: [400, 200], color: "black" },
   ];
 
   const rects = [
     { center: [100, 380], width: 50, height: 80, color: "black" },
     { center: [250, 380], width: 50, height: 80, color: "black" },
     { center: [400, 380], width: 50, height: 80, color: "black" },
   ];
 
   const circs = [
     { center: [100, 100], radius: 50, color: "black" },
     { center: [250, 100], radius: 50, color: "black" },
     { center: [400, 100], radius: 50, color: "black" },
   ];
 
   makePts(isos, rects, circs);
 
   const update = () => {
     fillCanvas(ctx, width, height);
     updateInfo(isos, rects, circs);
 
     for (let triangle of isos) {
       triangle.color = "black"; 

        for (let triangle2 of isos){         
         if (triangle != triangle2 && convexPolysIntersect(triangle.poly, triangle2.poly)) 
           triangle.color = triangle2.color = "red";
        }
 
        for (let circle of circs){
          if (convexPolyCircleIntersect(circle.center, circle.radius, triangle.poly)) 
            circle.color = triangle.color = "red";
        }

        for (let rect of rects){
          if (convexPolysIntersect(rect.poly, triangle.poly)) 
            rect.color = triangle.color = "red";
        }

       ctx.fillStyle = ctx.strokeStyle = triangle.color;
 
       for (let p of triangle.anchors) {
         ctx.beginPath();
         ctx.arc(...p, 5, 0, Math.PI * 2);
         ctx.fill();
       }
     
       ctx.beginPath();
       for (let p of triangle.poly) {
         ctx.lineTo(...p);
       }
       ctx.closePath();
       ctx.stroke();
     }
 
     for (let rect of rects) {
       rect.color = "black"; 

       for (let rectangle2 of rects)
        if (rect != rectangle2 && convexPolysIntersect(rect.poly, rectangle2.poly)) 
          rect.color = rectangle2.color = "red";
   
       for (let circle of circs) 
        if (convexPolyCircleIntersect(circle.center, circle.radius, rect.poly))
          circle.color = rect.color = "red";
   
       for (let triangle of isos) 
        if (convexPolysIntersect(rect.poly, triangle.poly)) 
          triangle.color = rect.color = "red";
       
       ctx.fillStyle = ctx.strokeStyle = rect.color;
 
       ctx.beginPath();
       ctx.arc(...rect.center, 5, 0, Math.PI * 2);
       ctx.fill();
     
       for (let p of rect.midPoints) {
         ctx.beginPath();
         ctx.arc(...p, 5, 0, Math.PI * 2);
         ctx.fill();
       }
     
       ctx.beginPath();
       for (let p of rect.poly) {
         ctx.lineTo(...p);
       }
       ctx.closePath();
       ctx.stroke();
     }
 
     for (let circle of circs) {
       circle.color = "black"; 

       for (let circle2 of circs) 
        if (circle != circle2 && circleCircleIntersect(circle.center, circle.radius, circle2.center, circle2.radius)) 
         circle.color = circle2.color = "red";
   
       for (let rect of rects) 
        if (convexPolyCircleIntersect(circle.center, circle.radius, rect.poly)) 
          circle.color = rect.color = "red";
   
       for (let triangle of isos)
        if (convexPolyCircleIntersect(circle.center, circle.radius, triangle.poly)) 
          circle.color = triangle.color = "red";

       ctx.fillStyle = ctx.strokeStyle = circle.color;
 
       ctx.beginPath();
       ctx.arc(...circle.center, circle.radius, 0, Math.PI * 2);
       ctx.stroke();
     
       ctx.beginPath();
       ctx.arc(...circle.center, 5, 0, Math.PI * 2);
       ctx.fill();
     
       ctx.beginPath();
       ctx.arc(...circle.control, 5, 0, Math.PI * 2);
       ctx.fill();
     }
   };
   update();
 
   demo.onmousedown = (e) => {
     const mouse = [e.offsetX, e.offsetY];
     prevMouse = mouse;
     demo.onmousemove = null;
 
     for (let triangle of isos) {
       for (let i of [0, 1]) {
         if (vec2d.distance(mouse, triangle.anchors[i]) <= 5) {
           demo.onmousemove = (e) => {
             const mouse = [e.offsetX, e.offsetY];
             const delta = vec2d.sub([], mouse, prevMouse);
             prevMouse = mouse;
             if (i == 0){ 
               const v = vec2d.sub([], triangle.anchors[1], triangle.anchors[0]);
               vec2d.add(triangle.anchors[0], triangle.anchors[0], delta);
               vec2d.add(triangle.anchors[1], triangle.anchors[0], v);
             }
             else {
               vec2d.add(triangle.anchors[1], triangle.anchors[1], delta);
             }
             update();
           };
         }
       }
     }
 
     for (let rect of rects) {
       for (let i of [0, 1, 2, 3, 4]) {
         if (vec2d.distance(mouse, rect.anchors[i]) <= 5) {
           demo.onmousemove = (e) => {
             const mouse = [e.offsetX, e.offsetY];
             const delta = vec2d.sub([], mouse, prevMouse);
             prevMouse = mouse;
             if (i == 0){ 
              vec2d.add(rect.anchors[0], rect.anchors[0], delta);
              for (let i = 1; i < 5; i++)
                vec2d.add(rect.anchors[i], rect.anchors[i], delta);
             }
             else {
              const vertex = rect.anchors[i];
              const size = Math.abs(vec2d.dist(rect.anchors[(i % 4) + 1], rect.anchors[0]));
            
              vec2d.add(vertex, vertex, delta);
              vec2d.sub(rect.anchors[((i + 1) % 4) + 1], rect.anchors[((i + 1) % 4) + 1], delta);
              vec2d.rotate(rect.anchors[(i % 4) + 1], vertex, rect.anchors[0], -Math.PI / 2);
              vec2d.sub(rect.anchors[(i % 4) + 1], rect.anchors[(i % 4) + 1], rect.anchors[0]);
              vec2d.normalize(rect.anchors[(i % 4) + 1], rect.anchors[(i % 4) + 1]);
              vec2d.scale(rect.anchors[(i % 4) + 1], rect.anchors[(i % 4) + 1], size);
              vec2d.add(rect.anchors[(i % 4) + 1], rect.anchors[(i % 4) + 1], rect.anchors[0]);
              vec2d.rotate(rect.anchors[((i - 2 + 4) % 4) + 1], rect.anchors[(i % 4) + 1], rect.anchors[0], Math.PI);
             }
             update();
           };
         }
       }
     }
 
     for (let circle of circs) {
       for (let i of [0, 1]) {
         if (vec2d.distance(mouse, circle.anchors[i]) <= 5) {
           demo.onmousemove = (e) => {
             const mouse = [e.offsetX, e.offsetY];
             const delta = vec2d.sub([], mouse, prevMouse);
             prevMouse = mouse;
             if (i == 0){
              vec2d.add(circle.anchors[0], circle.anchors[0], delta);
              vec2d.add(circle.anchors[1], circle.anchors[1], delta);
             }
             else{
              vec2d.add(circle.anchors[1], circle.anchors[1], delta);
             }
             update();
           };
         }
       }
     }
   };
 
   demo.onmouseup = () => {
     demo.onmousemove = null;
   };
   
   update();
 })();

 function isosceles({ basePoint, oppositeVertex }) {
  const u = vec2d.sub([], basePoint, oppositeVertex);
  const v = [-u[1], u[0]];
  const w = [u[1], -u[0]];
  return [
    oppositeVertex,
    vec2d.add([], basePoint, v),
    vec2d.add([], basePoint, w),
  ];
}

function rectangle(rect) {
  const delta = vec2d.sub([], rect.midPoints[1], rect.center);

  return [
    vec2d.add([], rect.midPoints[0], delta),
    vec2d.sub([], rect.midPoints[0], delta),
    vec2d.sub([], rect.midPoints[2], delta),
    vec2d.add([], rect.midPoints[2], delta),
  ];
}