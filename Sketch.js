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
	this.noStroke = false;
	this.noFill   = false;
	this.lastTime = 0;
	this.move = (this.isTouch)? 'touchmove' : 'mousemove';
	this.down = (this.isTouch)? 'touchstart' : 'mousedown';
	this.up   = (this.isTouch)? 'touchend' : 'mouseup';
	this.out  = (this.isTouch)? 'touchend' : 'mouseout';
	if(option.isRetina) {
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
		setGradient: function(type, size, styles) {
			var grad  = this.stage.createLinearGradient(size.startX, size.startY, size.endX, size.endY);
			styles.forEach(function(v, i) {
				grad.addColorStop(v.offset, v.color);
			});
			this.stage.fillStyle = grad;
		},
		//線描画
		drawLine: function(startX, startY, endX, endY) {
			this.stage.beginPath();
			this.stage.moveTo(startX, startY);
			this.stage.lineTo(endX, endY);
			this.stage.stroke();
		},
		//矩形描画
		drawRect: function(x, y, w, h, rad) {
			if(rad) {
				this.stage.save();
				var rotateW = Math.abs(x + (w / 2));
				var rotateH = Math.abs(y + (h / 2));
				this.stage.translate(rotateW, rotateH);
				this.stage.beginPath();
				this.stage.rotate(rad * Math.PI / 180);
				this.stage.rect(-(w / 2), -(h / 2), w, h);
				this.stage.restore();
			} else {
				this.stage.beginPath();
				this.stage.rect(x, y, w, h);
			}
			this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
			return {
				isHit: function(e) {
					var target = e.target.getBoundingClientRect();
					var mouseX = (e.pageX - (window.scrollX + target.left)) * 2;//canvasを1/2で表示しているので倍にする
					var mouseY = (e.pageY - (window.scrollY + target.top)) * 2;
					if(mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h)
						return true;
					else
						return false;
				}
			};
		},
		//円描画
		drawCircle: function(centerX, centerY, rad) {
			this.stage.beginPath();
			this.stage.arc(centerX, centerY, rad, 0, Math.PI * 2, false);
			if(!this.noFill)
				this.stage.fill();
			if(!this.noStroke)
				this.stage.stroke();
		},
		isHitCircle: function(target, current, distance) {
			if(dist(target.x, target.y, current.x, current.y) <= distance)
				return true;
			else
				return false;
			//円同士が重なっているかを中心座標から計算
			function dist(x1, y1, x2, y2) {
			  var a = x1 - x2;
			  var b = y1 - y2;
			  var d = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
			  return d;
			}
		},
		//多角形描画
		drawPolygon: function(centerX, centerY, p, rad, rotate) {
			var point = [];
			var angle = 360 / p;
			this.stage.save();
		 	this.stage.beginPath();
			if(rotate) {
				for(var i = 0; i < p; i += 1) {
					point.push( getPoint(0, 0, (angle * i), rad) );
				}
				this.stage.translate(0, 0);//描画する位置まで動かす
				this.stage.translate(centerX, centerY);//描画するエリアの幅と高さ分移動
				this.stage.rotate(rotate * Math.PI / 180);//回転
				this.stage.moveTo(point[0].x, point[0].y);
				for(var i = 1; i < p; i += 1){
					this.stage.lineTo(point[i].x, point[i].y);
				}
				this.stage.lineTo(point[0].x, point[0].y);
			} else {
				for(var i = 0; i < p; i += 1) {
					point.push(getPoint(centerX, centerY, (angle * i), rad));
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
			
			function getPoint(x, y, angle, r) {
				var p = {x: x + r * Math.cos(angle * Math.PI / 180), y: y + r * Math.sin(angle * Math.PI / 180) };
				return p;
			};
		},
		//二次ベジェ曲線
		drawQuadraticCurve: function(startX, startY, points) {
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
		drawBezierCurve: function(startX, startY, points) {
			var len = points.length;
			var prev = { x: startX, y: startY };
			this.stage.beginPath();
			this.stage.moveTo(prev.x, prev.y);
			for(var i = 0; i < len; i += 1) {
				this.stage.bezierCurveTo(
					points[i].cpx, points[i].cpy,
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
		drawImage: function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
			var sx = sx || 0;
			var sy = sy || 0;
			var sw = sw || image.width;
			var sh = sh || image.height;
			var dx = dx || 0;
			var dy = dy || 0;
			var dw = dw || sw;
			var dh = dh || sh;
			this.stage.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
		},
		//ベジェで揺らめく円 http://jsdo.it/asou_jp/qWr9
		drawBezierCircle: function(centerX, centerY, rad, p) {
	    	var points = [];
		    for (var i = 0; i < p; i++) {
		        var point, angle, rot;　//角度
		        rot = i / p;　//ラジアン角
		        angle = (Math.PI * 2) * rot;
		        point = {}; 
		        point.x = rad * Math.cos(angle) + centerX;
		        point.y = rad * Math.sin(angle) + centerY;
		        //座標初期値
		        point.bx = point.x;
		        point.by = point.y;
		        // 角度
		        point.angleX = point.angleY = 0;
		        // 振幅
		        point.mx = Math.random() * 50 - 20;
		        point.my = Math.random() * 50 - 20;
		        // 角度の増加量
		        point.sx = Math.random() * 3 + 1;
		        point.sy = Math.random() * 3 + 1;
		        //配列に追加
		        points.push(point);
		    }
		    draw(points, this.stage);
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
			    	    
			        point.x = point.bx + Math.cos(point.angleX * Math.PI / 180) * point.mx;
			        point.y = point.by + Math.sin(point.angleY * Math.PI / 180) * point.my;
			        
			        point.angleX += point.sx;
			        point.angleY += point.sy;
			        //次の点との中間座標
			    	anchorPoint = interpolate(point, nextPoint, 0.5);
			    	anchorPointList.push(anchorPoint);
			    	//点と点の中間座標
			    	controlPoint1 = interpolate(anchorPoint, nextPoint, 0.6);
			    	controlPoint1List.push(controlPoint1);
			        //点と点の中間座標
			        controlPoint2 = interpolate(anchorPoint, point, 0.6);
			    	controlPoint2List.push(controlPoint2);
			    }
			    // 最初のコントロールポイントを描画用に最期に入れ替える
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
		drawEllipse: function(centerX, centerY, w, h) {
			var radW = w / 2;
			var radH = h / 2;
			this.stage.beginPath();
			this.stage.bezierCurveTo(centerX, centerY - radH, centerX + radW , centerY - radH, centerX + radW, centerY);
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
			if(this.isTouch) {
				var touchList = e.changedTouches;
				px = touchList[0].clientX;
				py = touchList[0].clientY;
			}
		    var x = px - rect.left;
		    var y = py - rect.top;
		    return {x: x, y: y};
		}
	};
	
