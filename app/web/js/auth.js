/**
 * @memberOf __authModule
 */
define(
['sheet', 'utils', 'nav-history', 'notifier', 'storage'], 
/**
 * @memberOf __authModule
 * @constructor 
 * @param {sheetModule} sheet
 * @param {utilsModule} utils
 * @param {navModule} nav
 * @param {notifierModule} notifier
 * @param {storageModule} storage
 */
function(sheet, utils, nav, notifier, storage) {

	var domain = 'http://localhost:8104';
	var urls = {
		nonce: domain + '/api/core/get_nonce/?controller=auth&method=generate_auth_cookie',
		auth: domain + '/api/auth/generate_auth_cookie/',
		validate: domain + '/api/auth/get_currentuserinfo/'
	};
	
	/**
	 * Системная информация для авторизации
	 */
	var authInfo = {
		nonce: null,
		cookie: null
	};
	
	/**
	 * Информация о текущем пользователе. Если <code>null</code>, занчит,
	 * пользователь не авторизирован
	 */
	var userInfo = null;
	
	function request(url, callback) {
		var args = _.toArray(arguments);
		callback = _.last(args);
		args = _.initial(args);
		var data = args.length > 1 ? args[1] : null;
		
		$.ajax({
			url: url,
			dataType: 'jsonp',
			data: data,
			success: function(response) {
				if (response && response.status == 'ok') {
					callback(true, response);
				} else {
					callback(false, response.error);
				}
			},
			error: function() {
				callback(false);
			}
		});
	}
	
	var module = {
		
		/**
		 * Показывает форму авторизации
		 * @memberOf authModule
		 * @param {Function} callback
		 * @returns {Zepto}
		 */
		show: function(callback) {
			var form = sheet.create({
				back_label: 'Вход на iphones.ru',
				content: utils.render('auth')
			}, {
				features: ['no-scroll', 'auth']
			});
			
			var that = this;
			form
				.on('history:anim-forward', function() {
					form.find('input').eq(0).focus();
				})
				.on('submit', function(evt) {
					evt.preventDefault();
					var username = form.find('input[name="username"]').val();
					var password = form.find('input[name="password"]').val();
					that.authorize(username, password, callback || _.identity);
				});
			
			nav.go(form);
			return form;
		},
		
		/**
		 * Авторизация пользователя
		 * @param {String} username
		 * @param {String} password
		 * @param {Function} callback
		 * @returns
		 */
		authorize: function(username, password, callback) {
			var that = this;
			// авторизация происходит в два шага:
			// 1. Сначала получаем nonce
			// 2. Затем непосредственно авторизируем пользователя
			request(urls.nonce, function(success, response) {
				if (!success) {
					var errorMessage = response || 'Unable to obtain nonce token';
					notifier.error(errorMessage);
					return callback(false, errorMessage);
				}
				
				authInfo.nonce = response.nonce;
				
				request(urls.auth, {
					nonce: authInfo.nonce,
					username: username,
					password: password
				}, function(success, response) {
					if (!success) {
						var errorMessage = response || 'Unable to authorize user';
						notifier.error(errorMessage);
						return callback(false, errorMessage);
					}
					
					authInfo.cookie = response.cookie;
					userInfo = response.user;
					
					// сохраним данные о текущем пользователе
					storage.set('authInfo', JSON.stringify(authInfo));
					
					callback(true, userInfo);
					that.trigger('authorized');
				});
			});
		},
		
		/**
		 * Проверяет, является ли текущая сессия авторизированной
		 * @returns {Boolean}
		 */
		isAuthorized: function() {
			return !!userInfo;
		},
		
		/**
		 * Показывает вид <code>view</code> только в том случае, если пользователь
		 * авторизирован. Если пользователь не авторизирован, сначала показывается 
		 * вид с формой авторизации, а уже затем <code>view</code>
		 * @param {Element} view
		 */
		showAuthorizedView: function(view) {
			if (this.isAuthorized()) {
				nav.go(view);
			} else {
				var that = this;
				this.show(function(success, userData) {
					if (success) {
						that.updateUserInfo(view);
						nav.insertAt(view, -1);
						nav.back();
					}
				});
			}
		},
		
		/**
		 * Возвращает информацию о текущем пользователе
		 * @returns {Object} Вернёт <code>null</code> если пользователь 
		 * не авторизирован
		 */
		getUserInfo: function() {
			return userInfo;
		},
		
		/**
		 * Вспомогательная функция, которая обновляет поля с информацией о 
		 * пользователе
		 * @param {Element} ctx Контекстный элемент, в котором нужно менять данные
		 */
		updateUserInfo: function(ctx) {
			if (!this.isAuthorized()) {
				return;
			}
			
			var user = this.getUserInfo();
			$('.user-profile_auth', ctx || document).each(function(i, section) {
				section = $(section);
				
				section.find('.user-profile__avatar').html('<img src="http://www.gravatar.com/avatar/' + user.hash + '?s=50" />');
				section.find('.user-profile__name').text(user.nicename || user.username);
			});
		},
		
		/**
		 * Проверяет текущую сессию пользователя и по возможности логинит его
		 */
		check: function(callback) {
			callback = callback || _.identity;
			var that = this;
			try {
				var _authInfo = storage.get('authInfo');
				if (_authInfo) {
					_authInfo = JSON.parse(_authInfo);
					request(urls.validate, _authInfo, function(status, response) {
						if (status) {
							authInfo = _authInfo;
							userInfo = response.user;
							console.log('session restored');
							callback(true, userInfo);
							that.trigger('authorized');
						} else {
							callback(false);
						}
					});
				}
			} catch (e) {
				callback(false);
			}
		},
		
		logout: function() {
			userInfo = null;
			this.trigger('logout');
		}
	};
	
	return _.extend(module, _.events);
});