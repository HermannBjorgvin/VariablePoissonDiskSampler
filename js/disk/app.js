// app

define([
	'jquery',
	'underscore'
], function($, _){
	var initialize = function(){

		var canvas = document.getElementById('disk');
		var ctx = canvas.getContext('2d');

		var img = document.createElement('canvas');
		var imgPadding = 40;
		var imgData = undefined;

        canvas.height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth;

		// Initialize disk
		var disk = [];
		disk.push({
			x: canvas.width/2,
			y: canvas.height/2,
			active: true,
			index: 0
		});

		var minRadius = 2;
		var maxRadius = 20;

		// Wait for image, then start this funkin disk
		var heavyImage = new Image();
		heavyImage.addEventListener("load", function() {
			start();
		}, false);
		heavyImage.src = "./img/coke.png";

		var start = function(){
	        img.height = canvas.offsetHeight;
	        img.width = canvas.offsetWidth;
			drawImageScaled(heavyImage, img.getContext('2d'));
			imgData = img.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

			// Renderer
			// renderLoop();

			diskLoop();
		}

		function imagePixelBrightness(x, y){
			var pixelData = [
				Math.min(
					imgData.data[(Math.floor(y) * canvas.width * 4 + Math.floor(x) * 4)],
					imgData.data[(Math.floor(y) * canvas.width * 4 + Math.floor(x) * 4 + 1)],
					imgData.data[(Math.floor(y) * canvas.width * 4 + Math.floor(x) * 4 + 2)]
				)
			];

			if (imgData.data[(Math.floor(y) * canvas.width * 4 + Math.floor(x) * 4 + 3)] == 0) {
				pixelData = [255, 255, 255, 255];
			};

			var sum = pixelData.reduce(function(a, b) { return a + b; });
			var avg = sum / pixelData.length;

			if (avg === undefined) {
				return 255;
			};

			return avg/255;
		}

		function drawImageScaled(img, pCtx) {
			var canvas = pCtx.canvas ;
			var hRatio = canvas.width  / img.width    ;
			var vRatio =  canvas.height / img.height  ;
			var ratio  = Math.min ( hRatio, vRatio );
			var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
			var centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
			pCtx.clearRect(0,0,canvas.width, canvas.height);
			pCtx.drawImage(img, 0,0, img.width, img.height,
						  centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
		}

		function pointConstruct(p_x, p_y){
			this.x = p_x;
			this.y = p_y;
			this.active = true;
			this.index = disk.length;
		}

		function drawPoint (x, y) {
			ctx.beginPath();
			ctx.arc(x, y, 1, 0, 2 * Math.PI, false);
			ctx.fill();
		}

		function diskLoop(){
			// Find active point within canvas bounds
			var activePoint = _.find((disk), function(point){
				return (
					point.active === true &&
					point.x > 0 &&
					point.x < canvas.width &&
					point.y > 0 &&
					point.y < canvas.height
				);
			});

			if (activePoint === undefined){
				console.log("Forrit lokið");
			}
			else if (activePoint !== undefined) {
				var candidate = undefined;
				var candidateFound = (function(){
					for (var c = 30 - 1; c >= 0; c--) {
						var radian = Math.random() * 2 * Math.PI;

						var randLength = Math.random() * maxRadius + maxRadius;

						var candidateX = activePoint.x + Math.sin(radian) * randLength;
						var candidateY = activePoint.y + Math.cos(radian) * randLength;

						var neighboorConflict = false;

						var brightness = imagePixelBrightness(candidateX, candidateY);
						radius = brightness * (maxRadius-minRadius) + minRadius;

						// If point is outside of canvas bounds return neighboor conflict
						if (
							candidateX > 0 &&
							candidateX < canvas.width &&
							candidateY > 0 &&
							candidateY < canvas.height
						){
							for (var n = disk.length - 1; n >= 0; n--) {

								var distance = Math.sqrt(
									Math.pow(disk[n].x - candidateX,2) +
									Math.pow(disk[n].y - candidateY,2)
								);

								if (distance < radius) {
									neighboorConflict = true;
									break;
								};
							};
						}
						else{
							neighboorConflict = true;
						};

						if (neighboorConflict === false) {
							candidate = new pointConstruct(candidateX, candidateY);
							drawPoint(candidateX, candidateY);
							return true;
						};
					};

					return false;
				})();

				if (candidateFound === false) {
					// If no candidate was found, deactivate disk
					activePoint.active = false;
				}
				else{
					disk.push(candidate);
				};
				
				// setTimout every 100 points as to not exceed maximum call stack
				if (disk.length % 100 === 0) {
					setTimeout(function(){
						diskLoop();
					}, 1);
				}
				else{
					diskLoop();
				};
			};
		}

		function renderLoop () {
			setInterval(function(){
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.beginPath();

				ctx.fillStyle = '#000';
				for (var y = 0; y < disk.length; y++) {
					ctx.beginPath();
					ctx.arc(disk[y].x, disk[y].y, 1, 0, 2 * Math.PI, false);
					ctx.fill();
				};
			}, 1000/4);
		}

	};

	return {
		initialize: initialize
	};
});
