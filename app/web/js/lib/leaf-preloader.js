/**
 * Leaf (Mac-like) preloader fully created in JS
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @type leaf_preloader
 * @memberOf __leaf_preloader
 */
var leaf_preloader = (/** @constructor */ function(/* Document */ document){
	var default_options = {
		count: 8,                        // total leafs
		start_color: 'rgba(0,0,0,0.5)',  // leaf base color
		end_color: 'rgba(0,0,0,1)',      // leaf highlight color
		width: 6,                        // leaf width
		height: 15,                      // leaf height
		round: 3,                        // leaf rounded corner radius
		offset: 10,                      // leaf offset from image center
		fade_in: 100,                    // duration of fade in animation
		fade_out: 300,                   // duration of fade out animation
		delay: 100                       // delay before jumping to next leaf
	};
	
	var pi2 = Math.PI * 2,
		anim_object = {
			next: -1,
			leaf: -1,
			list: []
		},
		vml_ns = 'pl_vml',
		createNode;
	
	var retina = window.devicePixelRatio > 1;
	
	/**
	 * Parse color into RGBA array
	 * @param {String} color Color in rgb(a) of hex(a) format
	 */
	function parseColor(color) {
		var result;
		// Look for rgba(num,num,num,float)
		if (result = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,(\s*\d(?:\.\d+)?))?\s*\)/.exec(color))
			return [
			        matchToInt(result, 1), 
			        matchToInt(result, 2), 
			        matchToInt(result, 3), 
			        parseFloat(result[4] || 1)
			        ];
		// Look for #a0b1c2ff
		if (result = /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?/i.exec(color))
			return [
				matchToInt(result, 1, 16), 
				matchToInt(result, 2, 16), 
				matchToInt(result, 3, 16), 
				result[4] ? matchToInt(result, 4, 16) / 255 : 1
			];
		// Look for #fff
		if (result = /#([a-f0-9])([a-f0-9])([a-f0-9])/i.exec(color))
			return [
				parseInt(result[1] + result[1], 16),
				parseInt(result[2] + result[2], 16),
				parseInt(result[3] + result[3], 16),
				1
			];

		// Otherwise, return black color
		return [0, 0, 0, 1];
	}
	
	/**
	 * Parse regex's match array element to integer
	 * @param {Array} match
	 * @param {Number} ix
	 */
	function matchToInt(match, ix, base) {
		return parseInt(match[ix], base || 10);
	}
	
	/**
	 * Blends two colors
	 * @param {Array} color1
	 * @param {Array} color2
	 * @param {Number} ratio
	 */
	function blendColor(color1, color2, ratio) {
		ratio = ratio || 0;
		var r = Math.round;
		return [
			r(color1[0] + (color2[0] - color1[0]) * ratio),
			r(color1[1] + (color2[1] - color1[1]) * ratio),
			r(color1[2] + (color2[2] - color1[2]) * ratio),
			color1[3] + (color2[3] - color1[3]) * ratio
		];
	}
	
	/**
	 * Output color array as CSS' 'rgb()' string
	 * @param {Array} color
	 * @return {String}
	 */
	function colorToRgb(color) {
		return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
	}
	
	/**
	 * @return {Element}
	 */
	function createElement(name, class_name) {
		var elem = document.createElement(name);
		if (class_name)
			elem.className = class_name;
			
		return elem;
	}
	
	function mergeOptions(opt) {
		var result = {};
		opt = opt || {};
		for (var p in default_options) if (default_options.hasOwnProperty(p)) {
			result[p] = (p in opt) ? opt[p] : default_options[p];
		}
		
		return result;
	}
	
	function getIx(id) {
		for (var i = 0, il = anim_object.list.length; i < il; i++) {
			if (anim_object.list[i].id == id)
				return i;
		}
		
		return -1;
	}
	
	function getAnim(id) {
		var ix = getIx(id);
		return ix != -1 ? anim_object.list[ix] : null;
	}
	
	function removeAnim(id) {
		var ix = getIx(id);
		if (ix != -1)
			anim_object.list.splice(ix, 1);
	}
	
	/**
	 * Returns leaf color for current animation state
	 * @param {Number} time Current time (milliseconds)
	 * @param {Number} id Leaf ID (index)
	 * @param {default_options} params
	 */
	function getColor(time, id, params) {
		if (!time) return params.start_color;
		
		var a = getAnim(id), color = null, prc;
		if (a) {
			prc = (time - a.start) / (a.end - a.start);
			switch (a.phase) {
				case 1: // fade in
					if (a.end <= time) {
						// end of phase
						color = params.end_color;
						a.phase++;
						a.start = time;
						a.end = time + params.fade_out;
					} else {
						color = blendColor(params.start_color, params.end_color, prc);
					}
					break;
				case 2: // fade out
					if (a.end <= time) {
						// end of animation
						color = params.start_color;
						removeAnim(id);
					} else {
						color = blendColor(params.end_color, params.start_color, prc);
					}
					break;
			}
		} else {
			color = params.start_color;
		}
		
		return color;
	}
	
	function setCSS(elem, css_str) {
		elem.style.cssText += ';' + css_str;
	}
	
	function tick(params, draw_fn) {
		var time = +new Date;
		if (time > anim_object.next) {
			// go to next leaf
			anim_object.next = time + params.delay;
			var leaf = anim_object.leaf + 1;
			if (leaf >= params.count)
				leaf = 0;
			
			removeAnim(leaf);
			anim_object.list.push({
				id: leaf,
				start: time,
				end: time + params.fade_in,
				phase: 1
			});
			
			anim_object.leaf = leaf;
		}
		
		draw_fn(time);
	}
	
	function getScaleRatio(context) {
		var devicePixelRatio = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;

        return devicePixelRatio / backingStoreRatio;
	}
	
	/**
	 * Canvas-based drawing engine
	 * @param {Element} elem
	 * @param {default_options} params
	 */
	var canvasEngine = function(elem, p) {
		var canvas = createElement('canvas', 'js-preloader'),
			/** @type {CanvasRenderingContext2D} */
			ctx = canvas.getContext('2d'),
			ratio = getScaleRatio(ctx);
			params = {};
		
		/**
		 * Draws a rounded rectangle using the current state of the canvas.
		 * 
		 * @param {CanvasRenderingContext2D} ctx
		 * @param {Number} x The top left x coordinate
		 * @param {Number} y The top left y coordinate
		 * @param {Number} width The width of the rectangle
		 * @param {Number} height The height of the rectangle
		 * @param {Number} radius The corner radius. Defaults to 5;
		 */
		var roundRect = function(ctx, x, y, width, height, radius) {
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.fill();
		};
		
		var update = function(p) {
			params = p;
			params.start_color = parseColor(params.start_color);
			params.end_color = parseColor(params.end_color);
			canvas.width = canvas.height = (params.height + params.offset + 1) * 2;
			
			if (ratio !== 1) {
				// upscale canvas
				var oldWidth = canvas.width;
		        var oldHeight = canvas.height;

		        canvas.width = oldWidth * ratio;
		        canvas.height = oldHeight * ratio;

		        canvas.style.width = oldWidth + 'px';
		        canvas.style.height = oldHeight + 'px';

		        // now scale the context to counter
		        // the fact that we've manually scaled
		        // our canvas element
		        ctx.scale(ratio, ratio);
		        ctx.save();
			}
		};
		
		/**
		 * Draw preloader state
		 */
		var draw = function(time) {
			var cw = canvas.width / ratio,
				ch = canvas.height / ratio,
				w = params.width,
				h = params.height,
				count = params.count;
				
			ctx.clearRect(0, 0, cw, ch);
			ctx.save();
			ctx.translate(cw / 2, ch / 2);
			
			for (var i = 0, color; i < count; i++) {
				color = getColor(time, i, params);
				
				ctx.save();
				ctx.fillStyle = colorToRgb(color);
				ctx.globalAlpha = color[3];
				ctx.rotate(i / count * pi2);
				ctx.translate(0, -params.offset);
				
				if (params.round) {
					// draw rounded rect
					roundRect(ctx, -w / 2, -h, w, h, params.round);
				} else {
					// draw solid rect
					ctx.fillRect(-w / 2, -h, w, h);
				}
				
				ctx.restore();
			}
			
			ctx.restore();
		};
		
		update(p);
		draw();
		
		if (elem)
			elem.appendChild(canvas);
		
		return {
			tick: function() {
				tick(params, draw);
			},
			update:update,
			container: function() {
				return canvas;
			}
		};
	};
	
	/**
	 * VML-based drawing engine
	 */
	var vmlEngine = function(elem, p) {
		var outer = createElement('span', 'js-preloader'),
			container = createElement('span', 'js-preloader-inner'),
			params = {};
		var leafs = new Array;
			
		function rotate(d, radius) {
			return  {
				x: Math.sin(pi2 * d) * radius,
				y: -Math.cos(pi2 * d) * radius
			};
		}
			
		var update = function(p) {
			params = p;
			params.start_color = parseColor(params.start_color);
			params.end_color = parseColor(params.end_color);
			
			var size = (params.height + params.offset) * 2,
				sub_px = params.width % 2 ? 0 : 0.5;
				
			setCSS(outer, 'width:' + size + 'px;height:' + size + 'px;');
			setCSS(container, 'position:relative;width:' + size + 'px;height:' + size + 'px;zoom:1;');
			
			// remove old leafs
			for (var i = 0, il = leafs.length; i < il; i++)
				leafs[i].parentNode.removeChild(leafs[i]);
			
			leafs.length = 0;
			
			// create new leafs
			for (var i = 0, il = params.count; i < il; i++) {
				var leaf = createNode('roundrect'),
					rot = rotate(i / il, params.offset + params.height / 2);
					
				rot.x += (size - params.width) / 2 - sub_px;
				rot.y += params.offset + params.height / 2 - sub_px;
				
				leaf.stroked = false;
				setCSS(leaf, 'top:' + rot.y + 'px;left:' + rot.x + 'px;width:' + params.width + 'px;height:' + params.height + 'px;rotation:' + 360 / il * i);
				leaf.arcSize = Math.min((params.round / Math.min(params.width, params.height) * 2), 1);
				
				var fill = createNode('fill');
				fill.color = colorToRgb(params.start_color);
				fill.opacity = params.start_color[3];
				
				leaf.appendChild(fill);
				container.appendChild(leaf);
				leafs.push(leaf);
			}
		};
			
		update(p);
		
		outer.appendChild(container);
		
		if (elem)
			elem.appendChild(outer);
		
		return {
			tick: function() {
				tick(params, function(time) {
					for (var i = 0, color, fill, il = leafs.length; i < il; i++) {
						color = getColor(time, i, params);
						fill = leafs[i].firstChild;
						fill.color = colorToRgb(color);
						fill.opacity = color[3];
					}
				});
			},
			update: update,
			container: function() {
				return outer;
			}
		};
	};
	
	var has_canvas = !!createElement('canvas').getContext;
	if (!has_canvas) {
		// init VML
		document.createStyleSheet().addRule("." + vml_ns, "behavior:url(#default#VML);position:absolute;display:inline-block;");
	    try {
	        !document.namespaces[vml_ns] && document.namespaces.add(vml_ns, "urn:schemas-microsoft-com:vml");
	        createNode = function (tagName) {
            	return document.createElement('<' + vml_ns + ':' + tagName + ' class="' + vml_ns + '">');
            };
	    } catch (e) {
	    	createNode = function (tagName) {
            	return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="' + vml_ns + '">');
            };
	    }
	}
	
	return function(elem, options) {
		if (elem && elem.jquery)
			elem = elem[0];
		else if (typeof elem == 'string')
			elem = document.getElementById(elem);
			
		if (elem && !elem.nodeType) {
			options = elem;
			elem = null;
		}
		
		options = mergeOptions(options || {});
		var is_active = false,
			engine = has_canvas ? canvasEngine(elem, options) : vmlEngine(elem, options);
			
		var _tick = null;
		if (window.requestAnimationFrame) {
			_tick = function() {
				if (is_active) {
					engine.tick();
					requestAnimationFrame(_tick);
				}
			};
		} else {
			_tick = function() {
				if (is_active) {
					engine.tick();
					setTimeout(_tick, 15);
				}
			};
		}
		
		return {
			/**
			 * @memberOf leaf_preloader
			 */
			start: function() {
				if (!is_active) {
					this.stop();
					is_active = true;
					_tick();
				}
			},
			
			stop: function() {
				is_active = false;
			},
			
			toggle: function() {
				if (is_active)
					this.stop();
				else
					this.start();
			},
			
			isActive: function() {
				return is_active;
			},
			
			getContainer: engine.container
		};
	};
})(document);