<?php
/*
Controller name: iOS App
Controller description: iOS App API
*/
include_once('core.php');

class JSON_API_App_Controller {
	var $splashCatgories = array('news', 'appstore', 'accessories');
	var $splashPages = array('team', 'app-custom');
	var $totalSplashPages = 20;

	function __construct() {
		
	}

	/**
	 * Выводим список последних постов
	 * @return array
	 */
	public function posts() {
		global $json_api;
		$json_api->full_post = true;
		$posts = $json_api->introspector->get_posts();
		$json_api->full_post = false;
		return $this->posts_result($posts);
	}

	public function get_category_posts() {
		global $json_api;
		$core = new JSON_API_Core_Controller();
		$json_api->full_post = true;
		$result = $core->get_category_posts();
		$json_api->full_post = false;
		return $result;
	}

	/**
	 * Выводим данные для основной страницы приложения
	 * @return array
	 */
	public function splash_simple() {
		global $json_api, $wpdb;

		// получаем страницу «Приложение дня»
		// $app_day = $json_api->introspector->get_posts(array(
		// 	'pagename' => 'app-of-the-day'
		// ));

		$app_day = get_posts(array(
			'pagename' => 'app-of-the-day',
			'post_type' => 'page'
		));

		if (count($app_day)) {
			$p = $app_day[0];
			$app_day = array(
				'id' => $p->ID,
				'title' => $p->post_title,
				'content' => $p->post_content,
				'comment_count' => $p->comment_count,
				'date' => $p->post_date_gmt
			);
		} else {
			$app_day = null;
		}

		// получаем последние посты
		$total_posts = ($this->totalSplashPages - 1) * 6 + ($app_day ? 2 : 3);
		$recent_posts = get_posts(array(
			'posts_per_page' => $total_posts
		));

		$recent_posts = array_map(function($item) {
			$image = null;
			if (preg_match('/<img\s+[^>]*src=[\'"](.+?)[\'"].*?>/', $item->post_content, $images)) {
				$image = $images[1];
			}

			return array(
				'id' => $item->ID,
				'title' => $item->post_title,
				'image' => $image,
				'comment_count' => $item->comment_count,
				'date' => $item->post_date_gmt
			);
		}, $recent_posts);

		return array(
			'app' => empty($app_day) ? null : $app_day, 
			'posts' => $recent_posts
		);
	}

	/**
	 * Предыдущий вариант сплэш-страницы
	 * @return array
	 */
	public function splash() {
		global $json_api, $wpdb;
		// получаем ID всех категорий
		$slugs = "'" . implode("','", $this->splashCatgories) . "'";
		$cats = $wpdb->get_results(
			"
			SELECT a.slug, a.term_id AS id
			FROM $wpdb->terms AS a
			INNER JOIN $wpdb->term_taxonomy AS b
			ON a.term_id = b.term_id
			WHERE b.taxonomy = 'category' AND a.slug IN ($slugs)
			", OBJECT_K);

		// var_dump($cats);
		$posts = array_map(function($item) use($cats, $json_api) {
			if (array_key_exists($item, $cats)) {
				
				$p = get_posts(array(
					'posts_per_page' => 1,
					'category' => $cats[$item]->id
				));

				if (count($p)) {
					return new JSON_API_Post($p[0]);
				}
			}

			return false;
		}, $this->splashCatgories);

		// достаём страницы
		foreach ($this->splashPages as $page) {
			$p = get_posts(array(
				'pagename' => $page,
				'posts_per_page' => 1,
				'post_type' => 'page'
			));

			if (count($p)) {
				$posts[] = new JSON_API_Post($p[0]);
			}
		}

		return $this->posts_result(array_filter($posts));
	}

	/**
	 * Выводим комментарии к конкретному посту
	 * @return array
	 */
	public function comments() {
		global $json_api;
		if (!$json_api->query->id) {
			$json_api->error("You should provide 'id' query parameter");
		}

		$comments = $json_api->introspector->get_comments($json_api->query->id);

		return array('comments' => $comments);
	}

	public function create_comment() {
		global $json_api;

		if (!$json_api->query->cookie) {
			$json_api->error("You must include a 'cookie' authentication cookie. Use the `create_auth_cookie` Auth API method.");
		}

		$user_id = wp_validate_auth_cookie($json_api->query->cookie, 'logged_in');
		if (!$user_id) {
			$json_api->error("Invalid authentication cookie. Use the `generate_auth_cookie` Auth API method.");
		}

		if (!user_can($user_id, 'edit_posts')) {
			$json_api->error("You need to login with a user capable of creating posts.");
		}

		wp_set_current_user($user_id);

		nocache_headers();

		if (empty($_REQUEST['post_id'])) {
			$json_api->error("No post specified. Include 'post_id' var in your request.");
		} else if (empty($_REQUEST['content'])) {
			$json_api->error("Please include all required arguments (name, email, content).");
		}
		$pending = new JSON_API_Comment();
		return $pending->handle_submission();
	}

	function submit_comment() {
		global $json_api;
		nocache_headers();
		if (empty($_REQUEST['post_id'])) {
			$json_api->error("No post specified. Include 'post_id' var in your request.");
		} else if (empty($_REQUEST['name']) ||
	               empty($_REQUEST['email']) ||
	               empty($_REQUEST['content'])) {
			$json_api->error("Please include all required arguments (name, email, content).");
		} else if (!is_email($_REQUEST['email'])) {
			$json_api->error("Please enter a valid email address.");
		}

		if (!empty($_REQUEST['cookie'])) {
			$user_id = wp_validate_auth_cookie($_REQUEST['cookie'], 'logged_in');
			if ($user_id) {
				wp_set_current_user($user_id);
			}
		}

		$pending = new JSON_API_Comment();
		return $pending->handle_submission();
	}

	protected function posts_result($posts) {
		global $wp_query;

		foreach ($posts as $post) {
			unset(
				$post->status,
				$post->tags, $post->comments, $post->attachments, $post->excerpt
			);
		}

		return array(
			'count' => count($posts),
			'count_total' => (int) $wp_query->found_posts,
			'pages' => $wp_query->max_num_pages,
			'posts' => $posts
		);
	}
}
?>