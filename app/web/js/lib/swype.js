/**
 * iOS-like view transitions
 */
var swype = (function() {
	
	var defaultOptions = {
		flipDistance: 200,
		tapzone: 0.3,
		xCoeff: 0.4,
		yCoeff: 0.4,
		maxShadeOpacity: 0.7,
		shadeOpacityOffset: 0.2,
		viewportTest: function(viewport, x, y) {
			return viewport.left <= x && viewport.right >= x
				&& viewport.top <= y && viewport.bottom >= y;
		}
	};
	
	var groups = [];
	/** @type TransitionGroup */
	var activeGroup = null;
	
	var ua = navigator.userAgent;
	
	var allowDrag = Modernizr.touch || ua.match(/windows\s+phone\s+os/i);
	allowDrag = true;
	
	var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	
	var transformCSS = Modernizr.prefixed('transform');
	// Do not use translate3d in Chrome since it breaks text rendering
	var translateTmpl = _.template(Modernizr.csstransforms3d && !isChrome 
			? 'translate3d(<%= x %>px, <%= y %>px, 0)'
			: 'translate(<%= x %>px, <%= y %>px)');
	
	var flipTmpl = _.template('rotateX(<%= angle %>deg)');
	
	var animDefaults = {
		duration: 350,
		easing: 'easeOutCubic'
	};
	
	var pointerTests = [];
	
	function dasherize(name) {
		return name.replace(/[A-Z]/g, function(ch) {
			return '-' + ch.toLowerCase();
		});
	}
	
	/**
	 * @type TransitionGroup
	 * @param {Array} elems
	 * @param {Object} options
	 */
	function TransitionGroup(elems, options) {
		this.elems = elems;
		this.options = _.extend({}, defaultOptions, options || {});
		this.activeElementIndex = -1;
		this.distance = {
			x: 0,
			y: 0
		};
		
		this._animating = false;
		this._locked = false;
		this.activateElement(options.active || 0);
	}
	
	TransitionGroup.prototype = {
		/**
		 * Check is passed point is inside group's viewport (or active area)
		 * @param {Number} x
		 * @param {Number} y
		 */
		isPointInViewport: function(x, y) {
			if (this.locked()) {
				return false;
			}
			
			var viewport = this.getViewport();
			if (viewport) {
				// we have viewport, check its bounds
				return this.options.viewportTest(viewport, x, y);
			}
			
			// if viewport options is not defined, it assumes that
			// active area is current window viewport, i.e. it always resolves to
			// true
			return true;
		},
		
		locked: function(val) {
			if (arguments.length)
				this._locked = !!val;
			
			return this._locked;
		},
		
		getViewport: function() {
			var viewport = this.options.viewport;
			
			if (_.isFunction(viewport))
				return viewport();
			
			var docElem = document.documentElement;
			var win = window;
			var body = document.body;
			var box = {top: 0, left: 0, width: win.innerWidth, height: win.innerHeight};
			
			if (_.isElement(viewport)) {
				var rect = viewport.getBoundingClientRect();
				box.left = rect.left;
				box.top = rect.top;
				box.width = rect.right - rect.left;
				box.height = rect.bottom - rect.top;
			}
			
			// viewport is not defined, get it from current window state
			var clientTop  = docElem.clientTop  || body.clientTop  || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;
			var scrollTop  = win.pageYOffset || docElem.scrollTop;
			var scrollLeft = win.pageXOffset || docElem.scrollLeft;
			
			box.top += scrollTop - clientTop;
			box.left += scrollLeft - clientLeft;
			box.right = box.left + box.width;
			box.bottom = box.top + box.height;
			
			return box;
		},
		
		getViewportWidth: function() {
			var vp = this.getViewport();
			return vp.right - vp.left;
		},
		
		getViewportHeight: function() {
			var vp = this.getViewport();
			return vp.bottom - vp.top;
		},
		
		/**
		 * Returns element for transition from group's list 
		 * @param {Number} ix
		 * @returns {HTMLElement}
		 */
		getElement: function(ix) {
			return this.elems[ix];
		},
		
		releaseElements: function() {
			$(this.elems).removeClass('swype-item swype-item_current swype-item_next swype-item_prev');
		},
		
		activateElement: function(ix) {
			this.releaseElements();
			
			this.activeElementIndex = ix;
			$(this.nextElement()).addClass('swype-item swype-item_next');
			$(this.prevElement()).addClass('swype-item swype-item_prev');
			$(this.activeElement()).addClass('swype-item swype-item_current');
		},
		
		/**
		 * Returns currently active element from list 
		 * @param {Number} ix
		 * @returns {HTMLElement}
		 */
		activeElement: function() {
			return this.getElement(this.activeElementIndex);
		},
		
		hasNext: function() {
			var el = this.nextElement();
			return el && !$(el).hasClass('swype-empty');
		},
		
		nextElement: function() {
			return this.getElement(this.activeElementIndex + 1);
		},
		
		hasPrev: function() {
			var el = this.prevElement();
			return el && !$(el).hasClass('swype-empty');
		},
		
		prevElement: function() {
			return this.getElement(this.activeElementIndex - 1);
		},
		
		/**
		 * Go to next item
		 * @returns {Tween}
		 */
		next: function(callback, options) {
			if (!this.locked() && !this._animating && this.hasNext()) {
				var start, end;
				options = options || {};
				if (options.axis === 'y' || this.pointerMoved === 'y') {
					start = this.distance.y;
					end = -this.options.flipDistance * 2;
					options.axis = 'y';
				} else {
					start = this.distance.x;
					end = -this.getViewportWidth();
					options.axis = 'x';
				}
				
				return this.animate(start, end, function() {
					this.activateElement(this.activeElementIndex + 1);
					
					this.trigger('next');
					swype.trigger('next');
					
					if (this.options.nextComplete)
						this.options.nextComplete.call(this);
					
					if (callback)
						callback.call(this);
				}, options);
			}
			
			return null;
		},
		
		/**
		 * Go to previous item
		 * @returns {Tween}
		 */
		prev: function(callback, options) {
			if (!this.locked() && !this._animating && this.hasPrev()) {
				var start, end;
				options = options || {};
				if (options.axis === 'y' || this.pointerMoved === 'y') {
					start = this.distance.y;
					end = this.options.flipDistance * 2;
					options.axis = 'y';
				} else {
					start = this.distance.x;
					end = this.getViewportWidth();
					options.axis = 'x';
				}
				
				return this.animate(start, end, function() {
					this.activateElement(this.activeElementIndex - 1);
					
					this.trigger('prev');
					swype.trigger('prev');
					
					if (this.options.prevComplete)
						this.options.prevComplete.call(this);
					
					if (callback)
						callback.call(this);
				}, options);
			}
			
			return null;
		},
		
		animate: function(start, end, callback, options) {
			var that = this;
			this._animating = true;
			
			options = options || {};
			if (!options.duration) {
				options.duration = Math.min(Math.max(Math.abs(end - start), animDefaults.duration), 700);
			}
			
			var stepFn = _.bind(options.axis === 'y' ? this.flipTo : this.moveTo, this);
			
			return new Tween(_.extend({}, animDefaults, {
				step: function(pos) {
					stepFn((end - start) * pos + start);
				},
				complete: function() {
					that._animating = false;
					that.cleanUp();
					if (!that.options.noAutoReset)
						that.resetPos();
					swype.trigger('animationComplete');
					
					if (that.options.animationComplete)
						that.options.animationComplete.call(that);
					
					if (callback)
						callback.call(that);
				}
			}, options));
		},
		
		resetPos: function() {
			this.cleanUp();
			
			this.activeElement().style[transformCSS] = '';
			var p = this.prevElement();
			if (p) {
				p.style[transformCSS] = '';
			}
		},
		
		cleanUp: function() {
			if (this._flipData) {
				_.each(this._flipData, function(el) {
					if (el && el.nodeType) {
						$(el).remove();
					}
				});
//				$(this._flipData.wrap).remove();
				
				var elMain = this.activeElement();
				$(elMain.parentNode)
					.removeClass('swype-flip_v-prev swype-flip_v-next');
				
				var elems = _.compact([elMain, this.prevElement(), this.nextElement()]);
				_.each(elems, function(el) {
					el.style.clip = 'auto';
				});
				
				this._flipData = null;
			}
		},
		
		/**
		 * Горизонтальное перемещение страниц
		 * @param {Number} pos Смещение по горизонтали
		 */
		moveTo: function(pos) {
			this.distance.x = pos;
			
			this.trigger('moveTo', pos);
			
			this.activeElement().style[transformCSS] = translateTmpl({
				x: Math.min(pos, 0), 
				y: 0
			});
			
			var p = this.prevElement();
			if (p) {
				p.style[transformCSS] = translateTmpl({
					x: Math.max(pos, 0), 
					y: 0
				});
			}
		},
		
		/**
		 * Вертикальное перемещение страниц (переворачивание)
		 * @param {Number} pos Смещение по вертикали
		 */
		flipTo: function(pos) {
			var elMain = this.activeElement();
			
			if (!this._flipData) {
				
				var next = this.nextElement();
				var prev = this.prevElement();
				var cur = this.activeElement();
				
				var wrapper = $('<div class="swype-flip"></div>');
				
				var elems = _.map([cur, next, prev], function(el) {
					return $(el).clone().appendTo(wrapper)[0];
				});
				
				this._flipData = {
					wrap: wrapper[0],
					cur: elems[0],
					next: elems[1],
					prev: elems[2],
					dir: null
				};
				
				_.each(['cur', 'next', 'prev'], function(key) {
					if (this._flipData[key]) {
						this._flipData[key + 'Shade'] = $('<div class="swype-flip__shade"></div>')
							.appendTo(this._flipData[key])[0];
					}
				}, this);
				
				wrapper.insertBefore(elMain);
			}
			
			this.distance.y = pos;
			var delta = pos;
			var opt = this.options;
			var angle = Math.min(Math.max(-90 * delta / opt.flipDistance, -180), 180);
			var absAngle = Math.abs(angle);
//			var shadeOpacity = (absAngle % 90) / 90 * this.options.maxShadeOpacity;
			
			var elCur = this._flipData.cur;
			var elNext = this._flipData.next;
			var elPrev = this._flipData.prev;
			
			var shCur = this._flipData.curShade;
			var shNext = this._flipData.nextShade;
			var shPrev = this._flipData.prevShade;
			
			
			
			// важно лишний раз не дёргать offsetHeight, так как это свойство
			// вызывает reflow. Поэтому переменную half получаем отдельно в 
			// каждом условии
			if (delta < 0) {
				// перелистываем к следующей странице
				if (this._flipData.dir !== 'next') {
					$(elMain.parentNode)
						.removeClass('swype-flip_v-prev')
						.addClass('swype-flip_v-next');
					
					var half = Math.round(elCur.offsetHeight / 2);
					elCur.style.clip = 'rect(' + half + 'px, auto, auto, auto)';
					
					shCur.style.backgroundColor = '#fff';
					
					elNext.style.clip = elMain.style.clip = 'rect(auto, auto, ' + half + 'px, auto)';
					shNext.style.backgroundColor = '#000';
					
					this._flipData.dir = 'next';
				}
				
				elNext.style[transformCSS] = flipTmpl({angle: angle - 180});
				if (absAngle > 90) {
					shNext.style.opacity = (1 - (absAngle % 90) / 90) * opt.maxShadeOpacity - opt.shadeOpacityOffset;
				}
			} else if (delta > 0) {
				// перелистываем к предыдущей странице
				if (this._flipData.dir !== 'prev') {
					$(elMain.parentNode)
						.removeClass('swype-flip_v-next')
						.addClass('swype-flip_v-prev');
					
					var half = Math.round(elCur.offsetHeight / 2);
					elCur.style.clip = 'rect(auto, auto, ' + half + 'px, auto)';
					shCur.style.backgroundColor = '#000';
					
					elPrev.style.clip = elMain.style.clip = 'rect(' + half + 'px, auto, auto, auto)';
					shPrev.style.backgroundColor = '#fff';
					
					this._flipData.dir = 'prev';
				}
				
				elPrev.style[transformCSS] = flipTmpl({angle: 180 + angle});
				if (absAngle > 90) {
					shPrev.style.opacity = (1 - (absAngle % 90) / 90) * opt.maxShadeOpacity - opt.shadeOpacityOffset;
				}
			}
			
			if (absAngle < 90) {
				shCur.style.opacity = absAngle / 90 * opt.maxShadeOpacity - opt.shadeOpacityOffset; 
			}
			elCur.style[transformCSS] = flipTmpl({angle: angle});
			
			this.trigger('flipTo', delta, angle);
		},
		
		/**
		 * Callback function for pointer-down event (mousedown or touchstart)
		 * @param {Event} evt
		 */
		onPointerDown: function(evt) {
			this.pointerStart = {x: evt.pageX, y: evt.pageY};
			/** @type String */
			this.pointerMoved = null;
			this._moveCoords = [];
			this.activateElement(this.activeElementIndex);
			this._swipeHandled = false;
			this.trigger('pointerDown', evt);
		},
		
		/**
		 * Callback function for pointer-up event (mouseup or touchend)
		 * @param {Event} evt
		 */
		onPointerUp: function(evt) {
			var delta, coeff, maxDistance;
			if (this.pointerMoved) {
				if (!this._swipeHandled) {
					if (this.pointerMoved === 'y') {
						delta = this.distance.y;
						coeff = this.options.yCoeff;
						maxDistance = this.options.flipDistance;
						
					} else {
						delta = this.distance.x;
						coeff = this.options.xCoeff;
						maxDistance = this.getViewportWidth();
					}
					
					// если переместили указатель — смотрим на расстояние.
					// если оно достаточно для перемещения к следующему/предыдущему
					// элементу — перемещаемся, иначе — возвращаемся в исходную точку
					if ( !(delta < -maxDistance * coeff && this.next()) && !(delta > maxDistance * coeff && this.prev()) ) {
						this.animate(delta, 0, null, {
							axis: this.pointerMoved
						});
					}
				}
				
				this.pointerStart = null;
			} else if (this.options.tapzone) {
				// указатель не перемещался — делаем переход по тап-зонам
				return;
			}
			
			this.trigger('pointerUp', evt);
		},
		
		onPointerTap: function(evt) {
			if (this.options.tapzone && !this._animating) {
				// указатель не перемещался — делаем переход по тап-зонам
				var vp = this.getViewport();
				var vpWidth = vp.right - vp.left;
				var pointerX = evt.pageX - vp.left;
				
				if (pointerX < vpWidth * this.options.tapzone) {
					this.prev();
				} else if (pointerX > vpWidth * (1 - this.options.tapzone)) {
					this.next(null, {
						easing: 'easeInOutCubic'
					});
				}
				
				this.trigger('pointerTap', evt);
			}
		},
		
		/**
		 * Callback function for pointer-move event (mousemove or touchmove)
		 * @param {Event} evt
		 */
		onPointerMove: function(evt) {
			var coords = {x: evt.pageX, y: evt.pageY};
			this._moveCoords.push(coords);
			var dx = coords.x - this.pointerStart.x;
			var dy = coords.y - this.pointerStart.y;
			
			if (this.pointerMoved) {
				var isX = this.pointerMoved === 'x';
				var delta = isX ? dx : dy;
				var fn = isX ? 'moveTo' : 'flipTo';
				var coeff = this.options[this.pointerMoved + 'Coeff'];
				
				// обработка перемещения указателя
				if ((delta > 0 && !this.hasPrev()) || (delta < 0 && !this.hasNext())) {
					// пользователь хочет перейти к следующему/предыдущему элементу,
					// но его нет, поэтому перемещаемся с небольшой инерцией
					delta *= coeff;
				}
				
				this[fn](delta);
			} else {
				// определяем, началось ли движение
				var threshold = 5;
				
				var adx = Math.abs(dx);
				var ady = Math.abs(dy);
				if (Math.max(adx, ady) > threshold) {
					this.pointerMoved = ady > adx ? 'y' : 'x';
				}
			}
			
			this.trigger('pointerMove', evt);
		},
		
		onPointerSwipe: function(evt) {
			if (this.locked())
				return;
			
			var dir = evt.swipeDirection;
			
			if ((dir == 'left' || dir == 'up') && this.hasNext()) {
				this.next(null, {axis: dir == 'up' ? 'y' : 'x'});
				this._swipeHandled = true;
			} else if ((dir == 'right' || dir == 'down') && this.hasPrev()) {
				this.prev(null, {axis: dir == 'down' ? 'y' : 'x'});
				this._swipeHandled = true;
			}
			
			this.trigger('pointerSwipe', evt);
		},
		
		destroy: function() {
			groups = _.without(groups, this);
			this.trigger('destroy');
			this.off();
		}
	};
	
	// Добавляем event-методы
	_.extend(TransitionGroup.prototype, _.events);
	
	function locateActiveGroup(evt) {
		return _.find(groups, function(item) {
			return item.isPointInViewport(evt.pageX, evt.pageY);
		});
	}
	
	function addEvent(name, callback) {
		$(document).on(name, callback);
	}
	
	// XXX контроллер, которые делегирует pointer-события контекстной группе
	addEvent('pointerstart', function(evt) {
		// let's see if we're able to handler this event
		if (_.find(pointerTests, function(fn) {
			return fn(evt) === false;
		})) 
			return activeGroup = null;
		
		// locate group that matches pointer
		if (activeGroup = locateActiveGroup(evt)) {
			activeGroup.onPointerDown(evt);
		}
	});
	
	addEvent('pointermove', function(evt) {
		if (allowDrag && activeGroup) {
			activeGroup.onPointerMove(evt);
			evt.preventDefault();
		}
	});
	
	addEvent('pointerend', function(evt) {
		if (activeGroup) {
			activeGroup.onPointerUp(evt);
			if (evt.moved)
				activeGroup = null;
		}
	});
	
	addEvent('pointerswipe', function(evt) {
		if (activeGroup) {
			activeGroup.onPointerSwipe(evt);
		}
	});
	
	addEvent('pointertap', function(evt) {
		if (activeGroup) {
			activeGroup.onPointerTap(evt);
			activeGroup = null;
		}
	});
	
	return _.extend({
		setup: function(elems, options) {
			var group = new TransitionGroup(_.toArray(elems), options);
			groups.push(group);
			return group;
		},
		
		addPointerTest: function(fn) {
			if (!_.include(pointerTests, fn))
				pointerTests.push(fn);
		},
		
		removePointerTest: function(fn) {
			pointerTests = _.without(pointerTests, fn);
		}
	}, _.events);
})();