/**
 * @memberOf __authModule
 */
define(
	['sheet', 'utils', 'nav-history'], 
	/**
	 * @memberOf __authModule
	 * @constructor 
	 * @param {sheetModule} sheet
	 * @param {utilsModule} utils
	 * @param {navModule} nav 
	 */
	function(sheet, utils, nav) {
		
		return {
			/**
			 * Показывает форму авторизации
			 * @memberOf authModule
			 * @returns {Zepto}
			 */
			show: function() {
				var form = sheet.create({
					back_label: 'Вход на iphones.ru',
					content: utils.render('auth')
				}, {
					features: ['no-scroll', 'auth']
				});
				
				form.on('history:anim-forward', function() {
					form.find('input').eq(0).focus();
				});
				
				nav.go(form);
				return form;
			}
		};
	}
);