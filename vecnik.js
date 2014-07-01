/*! vecnik 2014-07-01 03:ii:48 */
!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b){var c=b.exports={};c.load=function(a,b){var c=new XMLHttpRequest;return c.onreadystatechange=function(){4===c.readyState&&200===c.status&&b(JSON.parse(c.responseText))},c.open("GET",a,!0),c.send(null),c}},{}],2:[function(a,b){var c=b.exports=function(){this._listeners={}},d=c.prototype;d.on=function(a,b,c){var d=this._listeners[a]||(this._listeners[a]=[]);return d.push(function(a){b.call(c,a)}),this},d.emit=function(a,b){if(this._listeners[a])for(var c=this._listeners[a],d=0,e=c.length;e>d;d++)c[d](b)}},{}],3:[function(a,b){var c=b.exports={};c.POINT="Point",c.LINE="LineString",c.POLYGON="Polygon"},{}],4:[function(a,b){if(L&&L.TileLayer){var c=a("./tile");b.exports=L.TileLayer.extend({options:{maxZoom:20},initialize:function(a){if(!a.provider)throw new Error("VECNIK.Tile requires a data provider");if(this._provider=a.provider,!a.renderer)throw new Error("VECNIK.Tile requires a renderer");this._renderer=a.renderer,L.TileLayer.prototype.initialize.call(this,"",a)},createTile:function(a){var b=new c({coords:a,provider:this._provider,renderer:this._renderer});return b.getDomElement()}})}},{"./tile":13}],5:[function(a,b){(function(c){!function(a){a.requestAnimationFrame=a.requestAnimationFrame||a.mozRequestAnimationFrame||a.webkitRequestAnimationFrame||a.msRequestAnimationFrame||function(b){return a.setTimeout(b,16)},a.Int32Array=a.Int32Array||a.Array,a.Uint8Array=a.Uint8Array||a.Array,a.console||(a.console={})}(self||window||c);var d=a("./core/core");d.CartoDB={API:a("./provider/cartodb")},d.CartoShader=a("./shader"),d.Renderer=a("./renderer"),d.Layer=a("./layer"),d.GeoJSON=a("./reader/geojson"),b.exports=d}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./core/core":1,"./layer":4,"./provider/cartodb":7,"./reader/geojson":9,"./renderer":10,"./shader":11}],6:[function(a,b){function c(a,b,c){return null!==b&&(a=Math.max(a,b)),null!==c&&(a=Math.min(a,c)),a}function d(a){return a*(Math.PI/180)}function e(a){return a/(Math.PI/180)}var f=a("./tile"),g=f.SIZE||256,h=function(a,b){this.x=a||0,this.y=b||0},i=b.exports=function(){this._pixelOrigin=new h(g/2,g/2),this._pixelsPerLonDegree=g/360,this._pixelsPerLonRadian=g/(2*Math.PI)};i.prototype._fromLatLonToPoint=function(a,b){var e=new h(0,0),f=this._pixelOrigin;e.x=f.x+b*this._pixelsPerLonDegree;var g=c(Math.sin(d(a)),-.9999,.9999);return e.y=f.y+.5*Math.log((1+g)/(1-g))*-this._pixelsPerLonRadian,e},i.prototype._fromPointToLatLon=function(a){var b=this,c=b._pixelOrigin,d=(a.x-c.x)/b._pixelsPerLonDegree,f=(a.y-c.y)/-b._pixelsPerLonRadian,g=e(2*Math.atan(Math.exp(f))-Math.PI/2);return{lat:g,lon:d}},i.prototype._tilePixelPos=function(a,b){return{x:a*g,y:b*g}},i.prototype.tileBBox=function(a,b,c,d){var e=1<<c;d=d||0;var f=(g+2*d)/e,i=(a*g-d)/e,j=(b*g-d)/e;return[this._fromPointToLatLon(new h(i,j+f)),this._fromPointToLatLon(new h(i+f,j))]},i.prototype.latLonToTilePoint=function(a,b,c,d,e){var f=1<<e,g=this._fromLatLonToPoint(a,b),i=new h(g.x*f,g.y*f),j=this._tilePixelPos(c,d);return new h(Math.round(i.x-j.x),Math.round(i.y-j.y))}},{"./tile":13}],7:[function(a,b){var c=a("./cartodb.sql"),d=a("../mercator"),e=a("../reader/geojson"),f=b.exports=function(a){this._options=a,this._projection=new d,this._baseUrl="http://"+a.user+".cartodb.com/api/v2/sql",void 0===this._options.ENABLE_SIMPLIFY&&(this._options.ENABLE_SIMPLIFY=!0),void 0===this._options.ENABLE_SNAPPING&&(this._options.ENABLE_SNAPPING=!0),void 0===this._options.ENABLE_CLIPPING&&(this._options.ENABLE_CLIPPING=!0),void 0===this._options.ENABLE_FIXING&&(this._options.ENABLE_FIXING=!0)},g=f.prototype;g._debug=function(a){this._options.debug&&console.log(a)},g._getUrl=function(a,b,d){var e=c.SQL(this._projection,this._options.table,a,b,d,this._options);return this._debug(e),this._baseUrl+"?q="+encodeURIComponent(e)+"&format=geojson&dp=6"},g.load=function(a,b){e.load(this._getUrl(a.x,a.y,a.z),a,this._projection,b)}},{"../mercator":6,"../reader/geojson":9,"./cartodb.sql":8}],8:[function(a,b){var c=b.exports={};c.SQL=function(a,b,c,d,e,f){f=f||{ENABLE_SIMPLIFY:!0,ENABLE_CLIPPING:!0,ENABLE_SNAPPING:!0,ENABLE_FIXING:!0};var g=a.tileBBox(c,d,e,f.bufferSize),h='"the_geom"',i='"the_geom"',j="cartodb_id",k=256,l=k,m=k,n=g[1].lon-g[0].lon,o=g[1].lat-g[0].lat,p=n/l,q=o/m,r=Math.max(p,q),s=r/2;f.ENABLE_SIMPLIFY&&(h="ST_Simplify("+h+", "+s+")",h="ST_CollectionExtract("+h+", ST_Dimension("+i+") + 1)"),f.ENABLE_SNAPPING&&(h="ST_SnapToGrid("+h+", "+r+")",h="ST_CollectionExtract("+h+", ST_Dimension("+i+") + 1)");var t="ST_MakeEnvelope("+g[0].lon+","+g[0].lat+","+g[1].lon+","+g[1].lat+", 4326)";if(f.ENABLE_CLIPPING){var u="ST_Expand("+t+", "+120*r+")";u="ST_SnapToGrid("+u+","+r+")",h="ST_Snap("+h+", "+u+", "+r+")",f.ENABLE_FIXING&&(h="CASE WHEN ST_Dimension("+h+") = 0 OR GeometryType("+h+") = 'GEOMETRYCOLLECTION' THEN "+h+" ELSE ST_CollectionExtract(ST_MakeValid("+h+"), ST_Dimension("+i+") + 1) END"),h="ST_Intersection("+h+", "+u+")"}var v=j+","+h+" as the_geom";return f.columns&&(v+=","+f.columns.join(",")+" "),f.COUNT_ONLY&&(v=c+" AS x, "+d+" AS y, SUM(st_npoints("+h+")) AS the_geom"),"SELECT "+v+" FROM "+b+" WHERE the_geom && "+t}},{}],9:[function(a,b){function c(a,b,c,d,e){e.push({type:j.POINT,coordinates:g([a],b,d),properties:c})}function d(a,b,c,d,e){e.push({type:j.LINE,coordinates:g(a,b,d),properties:c})}function e(a,b,c,d,e){for(var f=[],h=0,i=a.length;i>h;h++)f.push(g(a[h],b,d));e.push({type:j.POLYGON,coordinates:f,properties:c})}function f(a,b,f){for(var g,i,k,l,m,n,o=[],p=0,q=a.features.length;q>p;p++)if(k=a.features[p],k.geometry)switch(l=k.geometry.type,m=k.geometry.coordinates,n=k.properties,l){case j.POINT:c(m,b,n,f,o);break;case"Multi"+j.POINT:for(g=0,i=m.length;i>g;g++)c(m[g],b,h(n),f,o);break;case j.LINE:d(m,b,n,f,o);break;case"Multi"+j.LINE:for(g=0,i=m.length;i>g;g++)d(m[g],b,h(n),f,o);break;case j.POLYGON:e(m,b,n,f,o);break;case"Multi"+j.POLYGON:for(g=0,i=m.length;i>g;g++)e(m[g],b,h(n),f,o)}return o}function g(a,b,c){for(var d,e=a.length,f=new Int16Array(2*e),g=0;e>g;g++)d=b.latLonToTilePoint(a[g][1],a[g][0],c.x,c.y,c.z),f[2*g]=d.x,f[2*g+1]=d.y;return f}function h(a){for(var b=Object.keys(a),c={},d=0,e=b.length;e>d;d++)c[b[d]]=a[b[d]];return c}var i=a("../core/core"),j=a("../geometry"),k=a("../mercator"),l=b.exports={};l.load=function(a,b,c,d){if(void 0===typeof Worker)i.load(a,function(a){d(f(a,c,b))});else{var e=new Worker("../src/reader/geojson.worker.js");e.onmessage=function(a){d(a.data)},e.postMessage({url:a,tileCoords:b})}},l.convertForWorker=function(a,b){var c=new k;return f(a,c,b)}},{"../core/core":1,"../geometry":3,"../mercator":6}],10:[function(a,b){var c=a("./geometry"),d={};d[c.POLYGON]="fill",d[c.LINE]="stroke";var e=b.exports=function(a){if(a=a||{},!a.shader)throw new Error("VECNIK.Renderer requires a shader");this._shader=a.shader};e.POINT_RADIUS=2;var f=e.prototype;f._drawLineString=function(a,b){a.moveTo(b[0],b[1]);for(var c=2,d=b.length-2;d>c;c+=2)a.lineTo(b[c],b[c+1])},f._drawMarker=function(a,b,c){a.arc(b[0],b[1],c,0,2*Math.PI)},f.render=function(a,b,e){var f,g,h,i,j,k,l,m,n,o,p=this._shader.getLayers();for(a.clearRect(0,0,a.canvas.width,a.canvas.height),l=0,m=p.length;m>l;l++)for(f=p[l],h=0,i=b.length;i>h;h++)if(n=b[h],g=f.evalStyle(n.properties,e),o=n.coordinates,f.needsRender(n.type,g)){switch(a.beginPath(),n.type){case c.POINT:this._drawMarker(a,o,g["marker-width"]);break;case c.LINE:this._drawLineString(a,o);break;case c.POLYGON:for(j=0,k=o.length;k>j;j++)this._drawLineString(a,o[j]);a.closePath()}f.apply(a,g);var q=f.renderOrder();n.type===c.POLYGON||n.type===c.LINE?(a[d[q[0]]](),q.length>=1&&a[d[q[1]]]()):n.type===c.POINT&&(a.fill(),a.stroke())}}},{"./geometry":3}],11:[function(a,b){var c=a("./geometry"),d=a("./shader.layer"),e=b.exports=function(a){this.update(a)},f=e.prototype;f.update=function(a){this._layers=[];var b,e,f,g,h,i=(new carto.RendererJS).render(a),j={line:c.LINE,polygon:c.POLYGON,markers:c.POINT};if(i&&i.layers)for(var k=0,l=i.layers.length;l>k;k++){b=i.layers[k],e=b.getSymbolizers().map(function(a){return j[a]}),f=b.getShader(),g={};for(h in f)f[h].style&&(g[h]=f[h].style);this._layers[k]=new d(g,e)}},f.getLayers=function(){return this._layers}},{"./geometry":3,"./shader.layer":12}],12:[function(a,b){var c=a("./geometry"),d=a("./core/events"),e={point:["marker-width","line-color"],linestring:["line-color"],polygon:["polygon-fill","line-color"]};e.multipolygon=e.polygon;var f={},g={"marker-width":"marker-width","marker-fill":"fillStyle","marker-line-color":"strokeStyle","marker-line-width":"lineWidth","marker-color":"fillStyle","point-color":"fillStyle","line-color":"strokeStyle","line-width":"lineWidth","line-opacity":"globalAlpha","polygon-fill":"fillStyle","polygon-opacity":"globalAlpha"},h=b.exports=function(a,b){d.prototype.constructor.call(this),this._compiled={},this._renderOrder=b||[c.POINT,c.POLYGON,c.LINE],this.compile(a)},i=h.prototype=new d;i.compile=function(a){this._shaderSrc=a,"string"==typeof a&&(a=function(){return a});var b;for(var c in a)(b=g[c])&&(this._compiled[b]=a[c]);this.emit("change")},i.evalStyle=function(a,b){b=b||{};for(var c,d,e={},f=this._compiled,g=Object.keys(f),h=0,i=g.length;i>h;++h)c=g[h],d=f[c],"function"==typeof d&&(d=d(a,b)),e[c]=d;return e},i.apply=function(a,b){for(var c,d,e,g=!1,h=Object.keys(b),i=0,j=h.length;j>i;++i){d=h[i],e=b[d];var k=a._shId;k||(k=a._shId=Object.keys(f).length+1,f[k]={}),c=f[k],c[d]!==e&&(a[d]=c[d]=e,g=!0)}return g},i.renderOrder=function(){return this._renderOrder},i.needsRender=function(a,b){var c,d=e[a.toLowerCase()];if(!d)return!1;for(var f=0;f<d.length;++f)if(c=d[f],this._shaderSrc[c]&&b[g[c]])return!0;return!1}},{"./core/events":2,"./geometry":3}],13:[function(a,b){var c=b.exports=function(a){a=a||{};var b=this._canvas=document.createElement("CANVAS"),d=this._context=b.getContext("2d");b.width=c.SIZE,b.height=c.SIZE,b.style.width=b.width+"px",b.style.height=b.height+"px",d.mozImageSmoothingEnabled=!1,d.webkitImageSmoothingEnabled=!1,this._renderer=a.renderer,this._data=[],this._coords=a.coords;var e=this;a.provider.load(a.coords,function(a){e._data=a,e.render()})};c.SIZE=256;var d=c.prototype;d.getDomElement=function(){return this._canvas},d.render=function(){this._renderer.render(this._context,this._data,{zoom:this._coords.z})}},{}]},{},[5]);