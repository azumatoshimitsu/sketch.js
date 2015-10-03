//***************************************
//Sketch.js
//MIT license. 
//Copyright (c) 2014 Azuma Toshimitsu
//vosegus.org

var Sketch = function(canvasid, option) {
	var option  = option || {};
	this.isTouch = ('createTouch' in document);
	this.element  = document.getElementById(canvasid);
	this.stage    = this.element.getContext('2d');
	this.width    = this.element.width;
	this.height   = this.element.height;
	this.center   = {x: this.width / 2, y: this.height / 2};
	this.noStroke = false;
	this.noFill   = false;
	this.lastTime = 0;
	this.move = (this.isTouch)? 'touchmove'  : 'mousemove';
	this.down = (this.isTouch)? 'touchstart' : 'mousedown';
	this.up   = (this.isTouch)? 'touchend'   : 'mouseup';
	this.out  = (this.isTouch)? 'touchend'   : 'mouseout';
	this.isRetina = option.isRetina;
	if(this.isRetina) {
		this.element.style.width = (this.width / 2) + 'px';
		this.element.style.height = (this.height / 2) + 'px';
	}
};
	Sketch.prototype = {
		stage : this.stage,
		width : this.width,
		height : this.height,
		noStroke : this.noStroke,
		noFill : this.noFill,
		isTouch : this.isTouch,
		move : this.move,
		down : this.down,
		up   : this.up,
		out  : this.out,
		clear: function() {
			this.stage.clearRect(0, 0, this.width, this.height);
		},
		fps: function() {
			var now = (+new Date());
			var fps = 1000 / (now - this.lastTime);
			this.lastTime = now;
			return fps;
		},
		save: function() {
			this.stage.save();
		},
		restore: function() {
			this.stage.restore();
		},
		setFillColor: function(color) {
			this.stage.fillStyle = color;
		},
		setStrokeColor: function(color) {
			this.stage.strokeStyle = color;
		},
		setGradient: function(arg) {
			var type = arg.type;
			var size = arg.size;
			var styles = arg.styles;
			var grad  = this.stage.createLinearGradient(size.startX, size.startY, size.endX, size.endY);
			styles.forEach(function(v, i) {
				grad.addColorStop(v.offset, v.color);
			});
			this.stage.fillStyle = grad;
		},
		//線描画
		drawLine: function(arg) {
			this.stage.beginPath();
			this.stage.moveTo(arg.startX, arg.startY);
			this.stage.lineTo(arg.endX, arg.endY);
			this.stage.stroke();
		},
		//矩形描画
		drawRect: function(arg) {
			var x = arg.x;
			var y = arg.y;
			var w = arg.w;
			var h = arg.h;
			var angle = arg.angle;
			if(angle) {
				this.stage.save();
				var rotateW = Math.abs(x + (w / 2));
				var rotateH = Math.abs(y + (h / 2));
				this.stage.translate(rotateW, rotateH);
				this.stage.beginPath();
				this.stage.rotate(this.radian(angle));
				this.stage.rect(-(w / 2), -(h / 2), w, h);
				this.stage.restore();
			} else {
				this.stage.beginPath();
				this.stage.rect(x, y, w, h);
			}
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
			return {
				isHit: function(e) {
					var target = e.target.getBoundingClientRect();
					var m = 1;
					if(this.isRetina) {
						m = 2;
					}
					var mouseX = (e.pageX - (window.scrollX + target.left)) * m;//canvasを1/2で表示しているので倍にする
					var mouseY = (e.pageY - (window.scrollY + target.top)) * m;
					if(mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h)
						return true;
					else
						return false;
				}
			};
		},
		//円描画
		drawCircle: function(arg) {
			var centerX = arg.centerX;
			var centerY = arg.centerY;
			var rad = arg.rad;
			this.stage.beginPath();
			this.stage.arc(centerX, centerY, rad, 0, Math.PI * 2, false);
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		drawPie: function(arg) {
			var centerX = arg.centerX;
			var centerY = arg.centerY;
			var startAngle = arg.startAngle;
			var endAngle   = arg.endAngle;
			var rad = arg.rad;
			this.stage.beginPath();
			this.stage.moveTo(centerX, centerY);
			this.stage.arc(centerX, centerY, rad, startAngle, this.radian(endAngle), false);
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		isHitCircle: function(target, current, distance) {
			if(this.dist(target.x, target.y, current.x, current.y) <= distance)
				return true;
			else
				return false;
		},
			//円同士が重なっているかを中心座標から計算
		dist: function(x1, y1, x2, y2) {
		  var a = x1 - x2;
		  var b = y1 - y2;
		  var d = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
		  return d;
		},

		//多角形描画
		drawPolygon: function(arg) {
			var centerX = arg.centerX;
			var centerY = arg.centerY;
			var p = arg.p;
			var rad = arg.rad;
			var rotate = arg.rotate;
			var point = [];
			var angle = 360 / p;
			this.stage.save();
		 	this.stage.beginPath();
			if(rotate) {
				for(var i = 0; i < p; i += 1) {
					point.push( this.getPoint(0, 0, (angle * i), rad) );
				}
				this.stage.translate(0, 0);//描画する位置まで動かす
				this.stage.translate(centerX, centerY);//描画するエリアの幅と高さ分移動
				this.stage.rotate(this.radian(rotate));//回転
				this.stage.moveTo(point[0].x, point[0].y);
				for(var i = 1; i < p; i += 1){
					this.stage.lineTo(point[i].x, point[i].y);
				}
				this.stage.lineTo(point[0].x, point[0].y);
			} else {
				for(var i = 0; i < p; i += 1) {
					point.push(this.getPoint(centerX, centerY, (angle * i), rad));
				}
				this.stage.moveTo(point[0].x, point[0].y);
				for(var i = 1; i < p; i += 1) {
					this.stage.lineTo(point[i].x, point[i].y);
				}
				this.stage.lineTo(point[0].x, point[0].y);
			}
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
			this.stage.restore();
		},
		getPoint: function(x, y, angle, r) {
			var p = {x: x + r * Math.cos(this.radian(angle)), y: y + r * Math.sin(this.radian(angle)) };
			return p;
		},
		//二次ベジェ曲線
		drawQuadraticCurve: function(arg) {
			var startX = arg.startX;
			var startY = arg.startY;
			var points = arg.points;
			var len = points.length;
			var prev = { x: startX, y: startY };
			this.stage.beginPath();
			this.stage.moveTo(prev.x, prev.y);
			for(var i = 0; i < len; i += 1) {
				this.stage.quadraticCurveTo(points[i].cpx, points[i].cpy, points[i].endx, points[i].endy);
				prev = { x: points[i].x, y: points[i].y }
			}
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		//三次ベジェ曲線
		drawBezierCurve: function(arg) {
			var startX = arg.startX;
			var startY = arg.startY;
			var points = arg.points;
			var len = points.length;
			var prev = { x: startX, y: startY };
			this.stage.moveTo(prev.x, prev.y);
			for(var i = 0; i < len; i += 1) {
				this.stage.bezierCurveTo(
					points[i].cpx,  points[i].cpy,
					points[i].cp2x, points[i].cp2y,
					points[i].endx, points[i].endy
				);
				prev = { x: points[i].x, y: points[i].y }
			}
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		drawImage: function(arg) {
			var image = arg.image;
			var sx = arg.sx || 0;
			var sy = arg.sy || 0;
			var sw = arg.sw || arg.image.width;
			var sh = arg.sh || arg.image.height;
			var dx = arg.dx || 0;
			var dy = arg.dy || 0;
			var dw = arg.dw || arg.sw;
			var dh = arg.dh || arg.sh;
			this.stage.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
		},
		//ベジェで揺らめく円 http://jsdo.it/asou_jp/qWr9
		drawBezierCircle: function(arg) {
			var centerX = arg.centerX;
			var centerY = arg.centerY;
			var rad = arg.rad;
			var p = arg.p;
	    	var points = [];
		    for (var i = 0; i < p; i++) {
		        var point, angle, rot;　//角度
		        rot = i / p;　//ラジアン角
		        angle = (Math.PI * 2) * rot;
		        point = {}; 
		        point.x = rad * Math.cos(angle) + centerX;
		        point.y = rad * Math.sin(angle) + centerY;
		        point.bx = point.x;
		        point.by = point.y;
		        point.angleX = point.angleY = 0;
		        point.mx = Math.random() * 50 - 20;
		        point.my = Math.random() * 50 - 20;
		        point.sx = Math.random() * 3 + 1;
		        point.sy = Math.random() * 3 + 1;
		        points.push(point);
		    }

		    draw.call(this, points, this.stage);
			function draw(pointList, ctx) {
				var anchorPointList, controlPoint1List, controlPoint2List;
				var num = pointList.length;
			 
			    anchorPointList = [];
			    controlPoint1List = [];
			    controlPoint2List = [];
			    
			    for (var i = 0; i < num; i++) {
			        var point = pointList[i]; // Current Point
			    	var nextPoint = pointList[i === num - 1 ? 0 : i + 1]; // 次のポイント
			    	var anchorPoint; // アンカーポイント
			    	var controlPoint1; // コントロールポイント 1
			    	var controlPoint2; // コントロールポイント 2
			    	    
			        point.x = point.bx + Math.cos(this.radian(point.angleX)) * point.mx;
			        point.y = point.by + Math.sin(this.radian(point.angleY)) * point.my;
			        
			        point.angleX += point.sx;
			        point.angleY += point.sy;
			    	anchorPoint = interpolate(point, nextPoint, 0.5);
			    	anchorPointList.push(anchorPoint);
			    	controlPoint1 = interpolate(anchorPoint, nextPoint, 0.6);
			    	controlPoint1List.push(controlPoint1);
			        controlPoint2 = interpolate(anchorPoint, point, 0.6);
			    	controlPoint2List.push(controlPoint2);
			    }
			    var tmp = controlPoint2List.shift();
			    controlPoint2List.push(tmp);
			    ctx.beginPath();
			    ctx.moveTo(anchorPointList[0].x, anchorPointList[0].y);
			    for (var j = 0, l = anchorPointList.length; j < l; j++) {
			        var to = anchorPointList[j === l - 1 ? 0 : j + 1],
			            c1 = controlPoint1List[j],
			            c2 = controlPoint2List[j];
			        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, to.x, to.y);
			    }
			    if(!this.noFill)
			    	ctx.fill();
				if(!this.noStroke)
			    	ctx.stroke();
				function interpolate(pt1, pt2, f) {
				    var diffX = pt2.x - pt1.x,//相対値 x
				        diffY = pt2.y - pt1.y;//相対値 y
				    return {
				        x: pt1.x + diffX * f,
				    	y: pt1.y + diffY * f
				    };
				};
			};
	    },
		//楕円描画
		drawEllipse: function(arg) {
			var centerX = arg.centerX;
			var centerY = arg.centerY;
			var w = arg.w;
			var h = arg.h;
			var radW = w / 2;
			var radH = h / 2;
			this.stage.beginPath();
			this.stage.bezierCurveTo(centerX, centerY - radH, centerX + radW, centerY - radH, centerX + radW, centerY);
			this.stage.bezierCurveTo(centerX + radW, centerY, centerX + radW, centerY + radH, centerX, centerY + radH);
			this.stage.bezierCurveTo(centerX, centerY + radH, centerX - radW, centerY + radH, centerX - radW, centerY);
			this.stage.bezierCurveTo(centerX - radW, centerY, centerX - radW, centerY - radH, centerX, centerY - radH);
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		//マウスの位置
		getMousePosition: function(e) {
			var rect = this.element.getBoundingClientRect();
			var px = e.clientX;
			var py = e.clientY;
			var m = 1;
			if(this.isRetina) {
				m = 2;
			}
			if(this.isTouch) {
				var touchList = e.changedTouches;
				px = touchList[0].clientX;
				py = touchList[0].clientY;
			}
		    var x = (px - rect.left) * m;
		    var y = (py - rect.top) * m;
		    return {x: x, y: y};
		},
		//値を規制
		map: function(value, low1, high1, low2, high2) {
			var moto = high1 - low1;
			var ato  = high2 - low2;
			return (ato / moto) * value;
		},
		//度をラジアンに変化
		radian: function(d) {
			return d * Math.PI / 180;
		}
	};
	
