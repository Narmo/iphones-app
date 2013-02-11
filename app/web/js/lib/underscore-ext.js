/**
 * Расширения для Underscore
 */
(function(){
	var trim = String.prototype.trim || function() {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	};
	
	// Regular expression used to split event strings
	var eventSplitter = /\s+/;
	
	  // Create a local reference to slice/splice.
	  var slice = Array.prototype.slice;
	
	_.events = {
		/**
		 * Bind one or more space separated events, `events`, to a `callback`
		 * function. Passing `"all"` will bind the callback to all events fired.
		 * @param {String} events
		 * @param {Function} callback
		 * @param {Object} context
		 * @memberOf eventDispatcher
		 */
		on: function(events, callback, context) {
			var calls, event, node, tail, list;
			if (!callback)
				return this;
			
			events = events.split(eventSplitter);
			calls = this._callbacks || (this._callbacks = {});

			// Create an immutable callback list, allowing traversal during
			// modification.  The tail is an empty object that will always be used
			// as the next node.
			while (event = events.shift()) {
				list = calls[event];
				node = list ? list.tail : {};
				node.next = tail = {};
				node.context = context;
				node.callback = callback;
				calls[event] = {
					tail : tail,
					next : list ? list.next : node
				};
			}

			return this;
		},

		/**
		 * Remove one or many callbacks. If `context` is null, removes all
		 * callbacks with that function. If `callback` is null, removes all
		 * callbacks for the event. If `events` is null, removes all bound
		 * callbacks for all events.
		 * @param {String} events
		 * @param {Function} callback
		 * @param {Object} context
		 */
		off: function(events, callback, context) {
			var event, calls, node, tail, cb, ctx;

			// No events, or removing *all* events.
			if (!(calls = this._callbacks))
				return;
			if (!(events || callback || context)) {
				delete this._callbacks;
				return this;
			}

			// Loop through the listed events and contexts, splicing them out of the
			// linked list of callbacks if appropriate.
			events = events ? events.split(eventSplitter) : _.keys(calls);
			while (event = events.shift()) {
				node = calls[event];
				delete calls[event];
				if (!node || !(callback || context))
					continue;
				// Create a new list, omitting the indicated callbacks.
				tail = node.tail;
				while ((node = node.next) !== tail) {
					cb = node.callback;
					ctx = node.context;
					if ((callback && cb !== callback) || (context && ctx !== context)) {
						this.on(event, cb, ctx);
					}
				}
			}

			return this;
		},
		
		/**
		 * Trigger one or many events, firing all bound callbacks. Callbacks are
		 * passed the same arguments as `trigger` is, apart from the event name
		 * (unless you're listening on `"all"`, which will cause your callback
		 * to receive the true name of the event as the first argument).
		 * @param {String} events
		 */
		trigger: function(events) {
			var event, node, calls, tail, args, all, rest;
			if (!(calls = this._callbacks))
				return this;
			all = calls.all;
			events = events.split(eventSplitter);
			rest = slice.call(arguments, 1);

			// For each event, walk through the linked list of callbacks twice,
			// first to trigger the event, then to trigger any `"all"` callbacks.
			while (event = events.shift()) {
				if (node = calls[event]) {
					tail = node.tail;
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, rest);
					}
				}
				if (node = all) {
					tail = node.tail;
					args = [ event ].concat(rest);
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || this, args);
					}
				}
			}

			return this;
		}
	};
	
	_.mixin({
		/**
		 * Копирование свойств объекта.
		 * @param {Object} obj Объект, который нужно скопировать
		 * @param {Object} names Названия полей, которые нужно скопировать.
		 * Если это массив, то копируются поля с указанными именами,
		 * если это объект, то копируются поля с указанными ключами и 
		 * переименовываются в соответствии со значениями ключей
		 * @returns {Object}
		 * @memberOf Underscore
		 */
		copyObj: function(obj, names) {
			var result = {};
			if (_.isArray(names))
				_.each(names, function(name) {
					if (name in obj)
						result[name] = obj[name];
				});
			else if (names)
				_.each(names, function(name, key) {
					if (key in obj)
						result[name] = obj[key];
				});
			else
				result = _.clone(obj);
			
			return result;
		},
		
		/**
		 * Восстанавливает объект, полученный из <code>copyObj</code>: 
		 * переименовывает сокращённые названия полей в полные
		 * @param {Object} obj
		 * @param {Object} names
		 * @returns {Object}
		 */
		restoreObj: function(obj, names) {
			if (names && _.isObject(names)) {
				var revNames = {};
				_.each(names, function(v, k) {
					revNames[v] = k;
				});
				
				var result = {};
				_.each(obj, function(value, key) {
					if (key in revNames) {
						result[revNames[key]] = value;
					} else {
						result[key] = value;
					}
				});
				
				return result;
			}
			
			return obj;
		},
		
		/**
		 * Обрезает пробелы в начале и в конце строки
		 * @param {String} str
		 * @returns {String}
		 */
		trim: function(str) {
			return trim.call(str);
		},
		
		/**
		 * Проверяет, есть ли свойство <code>property</code> у объекта 
		 * <code>obj</code>. Если его нет, то создаёт его со значением 
		 * <code>defaultValue</code>
		 * @param {Object} obj
		 * @param {String} property
		 * @param {Object} defaultValue
		 * @returns {Object} Значение свойства <code>propery</code>
		 */
		supplyWith: function(obj, property, defaultValue) {
			if (!(property in obj))
				obj[property] = defaultValue;
			
			return obj[property];
		}
	});
})();