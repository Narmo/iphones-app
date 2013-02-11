/**
 * Модуль, обеспечивающий абстракцию над устройством указания (мышь, тач-скрин).
 * Позволяет использовать одно и тоже наименование событий (pointerdown, 
 * pointermove и т.д.) для привязки обработчиков к элементам, а также эмулировать
 * некоторые touch-события для устройств, которые их не поддерживают.
 * @constructor
 * @memberOf __pointerEventsDefine
 * @param {Zepto} $
 */
(function() {
	var emulateMouse = true;
	var eventMap = Modernizr.touch || !emulateMouse ? {
		pointerstart: 'touchstart',
		pointermove: 'touchmove',
		pointerend: 'touchend'
	} : {
		pointerstart: 'mousedown',
		pointermove: 'mousemove',
		pointerend: 'mouseup'
	};
	
	var swipeThreshold = 20;
	
	var tapDelay = 250;
	
	var longTapDelay = 750, longTapTimeout = null;
	
	/** Информация об обрабатываемом событии */
	var pointerData = null;
	
	/**
	 * Инициирует событие longTap
	 */
	function longTap() {
		longTapTimeout = null;
		if (pointerData) {
			dispatchEvent('pointerlongtap', pointerData.initialEvent);
			dispatchEvent('pointerend', pointerData.initialEvent);
		}
		pointerData = null;
	}

	/**
	 * Отменяет запуск события longTap
	 */
	function cancelLongTap() {
		if (longTapTimeout)
			clearTimeout(longTapTimeout);
		longTapTimeout = null;
	}
	
	function getPointerCoords(evt) {
		if (evt.touches && evt.touches.length) {
			return {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
		}
		
		if (evt.data && 'x' in evt.data) {
			return {
				x: evt.data.x,
				y: evt.data.y
			};
		}
		
		return {
			x: evt.pageX,
			y: evt.pageY
		};
	}
	
	function getSwipeSpeed(coords) {
		coords = _.last(coords, 7).reverse();
		for (var i = 0, sumX = 0, sumY = 0, il = coords.length - 1; i < il; i++) {
			sumX += coords[i].x - coords[i + 1].x;
			sumY += coords[i].y - coords[i + 1].y;
		}
		
		return {
			x: sumX / il,
			y: sumY / il
		};
	}
	
	function isSingleTouch(evt) {
		return !evt.touches || evt.touches.length == 1;
	}
	
	function addEvent(name, callback) {
		$(document).bind(eventMap[name] || name, callback);
	}
	
	function dispatchEvent(name, originalEvent, options) {
		var evtData = _.extend({
			pageX: pointerData.end.x,
			pageY: pointerData.end.y,
			
			pageStartX: pointerData.start.x,
			pageStartY: pointerData.start.y,
			
			moved: pointerData.moved
		}, options || {});
		
		var evt = $.Event(name, evtData);
		try {
			$(originalEvent.target).trigger(evt);
		} catch (e) {}
		
		var isPrevented = 'isDefaultPrevented' in evt 
			? evt.isDefaultPrevented() 
			: evt.defaultPrevented;
			
		if (isPrevented)
			originalEvent.preventDefault();
			
		return evt;
	}
	
	addEvent('pointerstart', function(evt) {
		// let's see if we're able to handler this event
		if (!isSingleTouch(evt)) 
			return;
		
		var coords = getPointerCoords(evt);
		pointerData = {
			start: coords, 
			end: coords,
			initialEvent: evt,
			timestamp: +new Date,
			moveCoords: []
		};
		
//		longTapTimeout = setTimeout(longTap, longTapDelay);
		
		dispatchEvent('pointerstart', evt);
	});
	
	addEvent('pointermove', function(evt) {
		if (!pointerData)
			return;
		
		cancelLongTap();
		
		pointerData.end = getPointerCoords(evt);
		pointerData.moved = true;
		pointerData.moveCoords.push(pointerData.end);
		
		if (!isSingleTouch(evt)) {
			dispatchEvent('pointerend', evt);
			pointerData = null;
		} else {
			dispatchEvent('pointermove', evt);
		}
	});
	
	addEvent('pointerend', function(evt) {
		cancelLongTap();
		if (pointerData) {
			if (!pointerData.moved) {
				var now = +new Date;
				dispatchEvent('pointerend', evt);
				if (now - pointerData.timestamp <= tapDelay) {
					dispatchEvent('pointertap', evt);
				}
			} else {
				// handle swipe, if possible
				if (pointerData.moveCoords.length > 1) {
					var delta, dir;
					var swipeSpeed = getSwipeSpeed(pointerData.moveCoords);
					if (Math.abs(swipeSpeed.y) > Math.abs(swipeSpeed.x)) {
						delta = swipeSpeed.y;
						dir = ['down', 'up'];
					} else {
						delta = swipeSpeed.x;
						dir = ['right', 'left'];
					}
					
					if (Math.abs(delta) > swipeThreshold) {
						dispatchEvent('pointerswipe', evt, {
							swipeDirection: delta > 0 ? dir[0] : dir[1],
							swipeSpeed: delta
						});
						swipeHandled = true;
					}
				}
				
				dispatchEvent('pointerend', evt);
			}
			
			pointerData = null;
		}
	});
})();