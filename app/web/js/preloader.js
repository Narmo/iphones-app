/**
 * Модуль для показа прелоудера на блоках
 */
define(function() {

	/**
	 * Возвращает набор параметров для 
	 * @param  {Element} elem
	 */
	function paramsForTarget(elem) {
		var size = elem.offsetWidth / 2;
		var leafHeight = Math.round(size * 0.55);

		return {
			start_color: 'rgba(255, 255, 255, 0.7)',
			end_color: 'rgba(127, 127, 127, 0.2)',
			round: 1,
			width: Math.round(size * 0.2),
			height: leafHeight,
			offset: size - leafHeight
		};
	}

	return {
		/**
		 * Создаёт прелоудер на указанном элементе. Пытается
		 * найти стандартную цель, куда нужно его добавить,
		 * и на основе её габаритов создаёт прелоудер
		 * @param  {Element} block
		 */
		createForBlock: function(block) {
			block = $(block);
			var target = block.find('.preloader-target')[0];
			if (target) {
				var params = paramsForTarget(target);
				var pl = leaf_preloader(target, params);
				pl.start();
				return pl;
			}
		}
	}
});