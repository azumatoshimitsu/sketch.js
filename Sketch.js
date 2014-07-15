//***************************************
//Sketch.js
//MIT license. 
//Copyright (c) 2014 Azuma Toshimitsu
//vosegus.org

var Sketch = function(canvasid) {
	var isRetina   = false;
	this.element   = document.getElementById(canvasid);
	this.stage     = this.element.getContext('2d');
	this.width     = this.element.width;
	this.height    = this.element.height;

	if(isRetina) {
		this.element.style.width = (this.width / 2) + 'px';
		this.element.style.height = (this.height / 2) + 'px';
	}
}

	Sketch.prototype.stage  = this.stage;
	Sketch.prototype.width  = this.width;
	Sketch.prototype.height = this.height;

	//canvas をクリア
	Sketch.prototype.clear = function () {
		this.stage.clearRect(0, 0, this.width, this.height);
	};
	Sketch.prototype.setFillColor = function(color) {
		this.stage.fillStyle = color;
		console.log(this.stage.fillStyle);
	};
	Sketch.prototype.setStrokeColor = function(color) {
		this.stage.strokeStyle = color;
	};
	//線描画
	Sketch.prototype.drawLine = function(startX, startY, endX, endY) {
		this.stage.beginPath();
		this.stage.moveTo(startX, startY);
		this.stage.lineTo(endX, endY);
		this.stage.stroke();
	};
	//矩形描画
	Sketch.prototype.drawRect = function(x, y, w, h, rad) {
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
	};
	//円描画
	Sketch.prototype.drawCircle = function(centerX, centerY, rad) {
		this.stage.beginPath();
		this.stage.arc(centerX, centerY, rad, 0, Math.PI * 2, false);
		this.stage.fill();
		this.stage.stroke();
		return {
			isHit:function(e){
				var target = e.target.getBoundingClientRect();
				var mouseX = (e.pageX - (window.scrollX + target.left))*2;
				var mouseY = (e.pageY - (window.scrollY + target.top))*2;
				if(Math.dist(mouseX,mouseY,x,y) <= rad)
					return true;
				else
					return false;
			}
		};
	};
	//多角形描画
	Sketch.prototype.drawPolygon = function(centerX, centerY, p, rad, rotate) {
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
		this.stage.fill();
		this.stage.stroke();
		this.stage.restore();
		
		function getPoint(x, y, angle, r) {
			var p = {x: x + r * Math.cos(angle * Math.PI / 180), y: y + r * Math.sin(angle * Math.PI / 180) };
			return p;
		};
	};
	//曲線描画
	Sketch.prototype.drawQuadraticCurve = function(startX, startY, points) {//2次曲線
		var len = points.length;
		var prev = { x: startX, y: startY };
		this.stage.beginPath();
		this.stage.moveTo(prev.x, prev.y);
		for(var i = 0; i < len; i += 1) {
			this.stage.quadraticCurveTo(points[i].cpx, points[i].cpy, points[i].x, points[i].y);
			prev = { x: points[i].x, y: points[i].y }
		}
		this.stage.fill();
		this.stage.stroke();
	};
	//ベジェで揺らめく円 http://jsdo.it/asou_jp/qWr9
	Sketch.prototype.drawBezierCircle = function(centerX, centerY, rad, p) {
    	var points = [];
	    for (var i = 0; i < p; i++) {
	        var point, angle, rot;
	        //角度
	        rot = i / p;
	        //ラジアン角
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
		    	anchorPointList.push(anchorPoint);	        //点と点の中間座標
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
		    ctx.stroke();
		    ctx.fill();

			function interpolate(pt1, pt2, f) {
			    var diffX = pt2.x - pt1.x,//相対値 x
			        diffY = pt2.y - pt1.y;//相対値 y
			    return {
			        x: pt1.x + diffX * f,
			    	y: pt1.y + diffY * f
			    };
			};
		};
    };
	//楕円描画
	Sketch.prototype.drawEllipse = function(centerX, centerY, w, h) {
		var radW = w / 2;
		var radH = h / 2;
		this.stage.beginPath();
		this.stage.bezierCurveTo(centerX, centerY - radH, centerX + radW , centerY - radH, centerX + radW, centerY);
		this.stage.bezierCurveTo(centerX + radW, centerY, centerX + radW, centerY + radH, centerX, centerY + radH);
		this.stage.bezierCurveTo(centerX, centerY + radH, centerX - radW, centerY + radH, centerX - radW, centerY);
		this.stage.bezierCurveTo(centerX - radW, centerY, centerX - radW, centerY - radH, centerX, centerY - radH);
		this.stage.fill();
		this.stage.stroke();
	};
	
