/* The signature: one continuous pen line through hand-placed points (a cursive "Amri" with a lead-in sweep and a
   rising flourish), smoothed into cubic curves with a Catmull-Rom spline. Edit the points to change the hand. */
(function () {
  var P = [[30,700],[170,628],[330,548],[452,430],[540,290],[588,170],[610,128],[628,190],[640,300],[652,420],[640,448],
    [600,402],[540,366],[520,344],[580,328],[700,310],[790,300],[812,350],[820,420],[838,360],[872,300],[905,292],[925,350],
    [940,420],[958,356],[990,298],[1030,290],[1052,350],[1070,422],[1092,360],[1130,310],[1172,300],[1196,330],[1214,404],
    [1240,350],[1268,318],[1284,360],[1296,410],[1336,436],[1400,404],[1470,318],[1540,226],[1600,150],[1660,58]]
  var d = "M" + P[0][0] + " " + P[0][1]
  for (var i = 0; i < P.length - 1; i++) {
    var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], t = 1 / 6
    d += " C" + (p1[0] + (p2[0] - p0[0]) * t).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) * t).toFixed(1) + " " +
      (p2[0] - (p3[0] - p1[0]) * t).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) * t).toFixed(1) + " " + p2[0] + " " + p2[1]
  }
  window.SIG_D = d
})()
