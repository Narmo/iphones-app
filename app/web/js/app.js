$(function() {

	var articleTmpl = _.template('<div class="article__image-holder">' +
		'<img src="<%- image %>" class="article__image" />' + 
		'</div>' +
		'<h2 class="article__add-comment"><i class="icon icon_comment icon_comment_dark icon_comment_add"></i></h2>' + 
		'<h2 class="article__title"><%- title %></h2>' + 
		'<h3 class="article__author"><%- author.name %>, <%- date_formatted %></h3>' + 
		'<%= content %>');

	var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 
		'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

	Handlebars.registerHelper('format_date', function(str) {
		return new Handlebars.SafeString(formatDate(str));
	});

	/**
	 * Возвращает указанный наблон
	 * @param  {String} name Название шаблона (без пути и расширения)
	 * @return {Object}
	 */
	function t(name) {
		return app.templates['templates/' + name + '.hbs'];
	}


	/**
	 * Парсит дату, пришедшую из JSON API, в объект Date
	 * @param  {String} str
	 * @return {Date}
	 */
	function parseDate(str) {
		var m = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
		return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], 0) : null;
	}

	/**
	 * Форматирует дату в удобочитаемый формат
	 * @param  {Object} dt Дата для преобразования (строка из JSON API 
	 * или <code>Date</code>)
	 * @return {String}
	 */
	function formatDate(dt) {
		if (_.isString(dt)) {
			dt = parseDate(dt);
		}

		var str = dt.getDate() + ' ' + months[dt.getMonth()];
		if ((new Date).getFullYear() != dt.getFullYear()) {
			str += ' ' + dt.getFullYear();
		}

		return str;
	}

	/**
	 * Возвращает коэффициент масштабирования, при котором прямоугольник
	 * <code>originalSize</code> полносью заполнит прямоугольник 
	 * <code>maxSize</code>. Коэффициент может быть как больше, так и меньше 1.
	 * 
	 * @param {Rect} maxSize Прямоугольник, в который нужно вписаться 
	 * @param {Rect} originalSize Прямогульник, который должен вписаться в 
	 * <code>originalSize</code>
	 * @returns {Number}
	 */
	function getScaleCoeff(maxSize, originalSize) {
		var wCoeff = maxSize.width / originalSize.width;
		var hCoeff = maxSize.height /originalSize.height;
		return Math.max(wCoeff, hCoeff);
	}

	function unescapeHTML(html) {
		var entities = {
			"quot": "\u0022",
			"amp": "\u0026",
			"apos": "\u0027",
			"lt": "\u003C",
			"gt": "\u003E"
		};

		return html.replace(/\&(\w+);/g, function(full, name) {
			return (name in entities) ? entities[name] : full;
		});
	}

	/**
	 * Читает RSS-ленту в JSON-формат
	 * @param  {Document} doc RSS-лента
	 * @return {Array}     Преобразованные в JSON данные
	 */
	function readFeed(doc) {
		return $('item', doc).map(function(i, item) {
			item = $(item);
			var img = null;
			var desc = unescapeHTML(item.find('description').text()).replace(/<img\s+.+?>/, function(str) {
				if (/\ssrc=['"](.+?)['"]/.test(str)) {
					img = RegExp.$1;
				}

				return '';
			});
			
			return {
				title: item.find('title').text(),
				id: item.find('guid').text(),
				image: img,
				content: desc
			};
		});
	}


	function renderFeed(data, options) {
		options = _.extend({
			waitImages: false,
			classNames: ''
		}, options || {});

		var feed = $('<section class="tiles ' + options.classNames + '"></section>')
			.appendTo(document.body);

		var complete = function() {
			if (options.callback) {
				options.callback(feed);
			}
		};

		var images = [];
		var onLoad = function() {
			// считаем правильные габариты картинки
			var parent = this.parentNode;
			var vp = {
				width: parent.offsetWidth,
				height: parent.offsetHeight
			};

			var img = {
				width: this.naturalWidth,
				height: this.naturalHeight
			}

			var coeff = Math.min(getScaleCoeff(vp, img), 1);
			this.style.width = Math.round(coeff * img.width) + 'px';
			this.style.height = Math.round(coeff * img.height) + 'px';

			images = _.without(images, this);
			if (!images.length && options.waitImages) {
				complete();
			}
		};

		_.each(data, function(item) {
			var tile = $('<div class="tiles__item" data-feed-id="' + item.id + '"><h2 class="tiles__title">' + item.title + '</h2>' + (item.tileAddon || '') + '</div>');
			feed.append(tile);

			if (item.image) {
				var img = new Image;
				img.className = 'tiles__image';
				img.onload = onLoad;
				img.src = item.image;

				images.push(img);
				tile.append(img);
			}
		});

		return feed;
	}

	function createFeedUI(feed) {
		var reel = $('.tiles-reel');

		reel.append(renderFeed(feed.slice(0, 3), {
			classNames: 'tiles_main'
		}));

		var restPayload = feed.slice(3);
		var itemsPerPage = 6;
		for (var i = 0; i < restPayload.length; i += itemsPerPage) {
			reel.append(renderFeed(restPayload.slice(i, i + itemsPerPage)));
		}

		var emptySection = '<div class="tiles swype-empty"></div>';
		reel.prepend(emptySection).append(emptySection);

		var transitionGroup = swype.setup(_.toArray(reel.find('.tiles')), {
			active: 1,
			viewport: reel[0],
			tapzone: 0
		});
	}

	function render(template, data) {
		var tmpl = t(template);
		if (!tmpl) {
			throw 'Can’t find "' + template + '" template';
		}

		tmpl = Handlebars.template(tmpl);
		return $(tmpl(data));
	}

	// $.get('./feed.xml', function(data) {
	// 	feed = readFeed(data);
	// 	createFeedUI(feed);
	// });
	
	createFeedUI(feed);

	$(document)
		.on('pointertap', '.tiles__item', function(evt) {
			if (!feed) {
				return;
			}

			var feedId = $(this).attr('data-feed-id');
			var feedData = _.find(feed, function(item) {
				return item.id == feedId;
			});

			if (feedData) {
				// if (!feedData.date_formatted) {
				// 	feedData.date_formatted = formatDate(feedData.date)
				// }

				// $('.article__content').html(articleTmpl(feedData));

				$(document.body)
					.append(render('article', feedData))
					.addClass('article-mode');
			}
		})
		.on('pointertap', '.article__h', function() {
			$(document.body).removeClass('article-mode');
		});

	swype.addPointerTest(function() {
		return !$(document.body).hasClass('article-mode');
	});
});