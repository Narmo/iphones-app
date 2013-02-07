<?php
/*
Controller name: iOS App
Controller description: iOS App API
*/
class JSON_API_App_Controller {
	function __construct() {
		
	}

	public function hello_world() {
		return array('message' => 'Hello, world!');
	}

	/**
	 * Выводим список последних постов
	 * @return array
	 */
	public function posts() {
		global $json_api;
		$posts = $json_api->introspector->get_posts();
		return $this->posts_result($posts);
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

		return $json_api->introspector->get_comments($json_api->query->id);
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

	protected function posts_result($posts) {
		global $wp_query;

		foreach ($posts as $post) {
			unset(
				$post->categories, $post->type, $post->slug, $post->status,
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