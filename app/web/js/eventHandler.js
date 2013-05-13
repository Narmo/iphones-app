define(['article', 'utils', 'feed', 'splash', 'comments', 'nav-history', 'article-reel', 'auth', 'preloader', 'locker', 'network'],
function(article, utils, feed, splash, comments, nav, articleReel, auth, preloader, locker, network) {
	return {
		handle: function(cmd, elem) {
			if (locker.locked()) {
				return;
			}

			var parts = cmd.split(':');
			var command = parts.shift();
			var params = parts.join(':');
			if (params && params.charAt(0) == '{') {
				params = JSON.parse(params);
			}

			// console.log('handle trigger', command, params);
			switch (command) {
				case 'show_comments':
					comments.showForPost(params);
					break;

				case 'show_category_for_post':
					var post = feed.getPost(params);
					var cat = utils.getKnownCategory(post) || post.categories[0];
					var pl = preloader.createForBlock(elem);
					locker.lock('category_posts');
					feed.get('category_posts', {slug: cat.slug}, function(data) {
						if (data && data.posts) {
							articleReel.create(cat.title, data.posts, {
								complete: function(reel) {
									pl && pl.destroy();
									locker.unlock('category_posts');
									nav.go(reel);
								}
							});
						} else {
							pl && pl.destroy();
							locker.unlock('category_posts');
						}
					});
					break;

				case 'show_post':
				case 'show_page':
					var feedName = command == 'show_page' ? 'page' : 'post';
					locker.lock('post');
					var pl = preloader.createForBlock(elem);
					feed.get(feedName, {id: params}, function(data) {
						if (data && (data.post || data.page)) {
							nav.go(article.create(data.post || data.page));
						}

						pl && pl.destroy();
						locker.unlock('post');
					});
					break;

				case 'reload_splash':
					if (!network.ensureOnline()) {
						return;
					}
					
					var oldReel = $('.tiles-reel');
					splash.reload($('.tiles-reel'), function(newReel) {
						if (newReel) {
							// лента обновилась, заменим её в истории
							nav.replace(oldReel[0], newReel[0]);
						}
					});
					break;
					
				case 'authorize':
					auth.show(function(status) {
						if (status) {
							nav.back();
						}
					});
					break;
					
				case 'add_comment':
					comments.showForm(_.isObject(params) ? params : {post_id: params});
					break;

				case 'reply':
					comments.showReplyWidget(elem);
					break;
			}
		}
	}
});