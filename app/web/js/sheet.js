/**
 * Модуль для работы с листами: рисует страницу с указанными данными
 * и возвращает DOM-элемент, который можно поместить на страницу
 */
define(['require', 'utils'], function(require, utils) {
	return {
		create: function(data) {
			return $(utils.render('sheet', data));
		}
	};
});