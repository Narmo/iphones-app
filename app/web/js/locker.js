/**
 * Центральный модуль, который отвечает за блокировку 
 * взаимодействия с интерфейсом. Различные модули создают
 * слбственные замки, а также удаляют их. В случае, если есть
 * хотя бы один замок, интерфейс блокируется и всё взаимодействие
 * прекращается.
 */
define(function() {
	var locks = {};

	return {
		/**
		 * Создаёт замок с указанным названием
		 * @param  {String} name Название замка
		 */
		lock: function(name) {
			if (!(name in locks)) {
				locks[name] = 0;
			}

			locks[name]++;
		},

		/**
		 * Снимает замок с указанного имени
		 * @param  {String} name Название замка
		 */
		unlock: function(name) {
			if (name in locks) {
				locks[name]--;

				if (locks[name] <= 0) {
					delete locks[name];
				}
			}
		},

		/**
		 * Проверяет, существуют ли активные блокировки
		 */
		locked: function() {
			return !!_.keys(locks).length;
		},

		lockNames: function() {
			return _.keys(locks);
		}
	};
});