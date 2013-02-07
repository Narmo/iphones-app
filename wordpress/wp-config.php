<?php
/**
 * Основные параметры WordPress.
 *
 * Этот файл содержит следующие параметры: настройки MySQL, префикс таблиц,
 * секретные ключи, язык WordPress и ABSPATH. Дополнительную информацию можно найти
 * на странице {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Кодекса. Настройки MySQL можно узнать у хостинг-провайдера.
 *
 * Этот файл используется сценарием создания wp-config.php в процессе установки.
 * Необязательно использовать веб-интерфейс, можно скопировать этот файл
 * с именем "wp-config.php" и заполнить значения.
 *
 * @package WordPress
 */

// ** Параметры MySQL: Эту информацию можно получить у вашего хостинг-провайдера ** //
/** Имя базы данных для WordPress */
define('DB_NAME', 'iphones_wp');

/** Имя пользователя MySQL */
define('DB_USER', 'sergey');

/** Пароль к базе данных MySQL */
define('DB_PASSWORD', 'gfhjkm');

/** Имя сервера MySQL */
define('DB_HOST', ':/tmp/mysql.sock');

/** Кодировка базы данных для создания таблиц. */
define('DB_CHARSET', 'utf8');

/** Схема сопоставления. Не меняйте, если не уверены. */
define('DB_COLLATE', '');

/**#@+
 * Уникальные ключи и соли для аутентификации.
 *
 * Смените значение каждой константы на уникальную фразу.
 * Можно сгенерировать их с помощью {@link https://api.wordpress.org/secret-key/1.1/salt/ сервиса ключей на WordPress.org}
 * Можно изменить их, чтобы сделать существующие файлы cookies недействительными. Пользователям потребуется снова авторизоваться.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'Ilju(V+9=S=8=)3J*6|fR=&lR-A3O#2j>&&&GH+Fj7y9la6^x&7x%JYX2i& C>e9');
define('SECURE_AUTH_KEY',  'O,o9`|bv$/NenFi`YNhL3@@M)<Q<9`.32=5e!yesR/Q6yk+t^TfM94Br;5{Ys*O]');
define('LOGGED_IN_KEY',    '_re~*odR!t<,xd~yI-I5;+-9L=!h9S%^DFZCb_j+5&V|]dTSQA!U`f)a4)evNUAD');
define('NONCE_KEY',        'gnXA76+`{-#->@%]TBq[,z}b{WV+~ka3tQsk49Or{2rg!>LaOu04hyy>Iw%{TS7r');
define('AUTH_SALT',        'tV||uJ#-Irp-5yo8%(P/%^1Gx(}r]B`87P;NC-?s+/Md[Ukq4]+#jhEJD$t[Jp;!');
define('SECURE_AUTH_SALT', '1PKbv7Y8^&UFD5_7w&1fLp0WMhs-(X@!?`hm},+|xk+E!a7^DmOPKVwR?>PduM=s');
define('LOGGED_IN_SALT',   'PWU+*SpPu/m6Y-P: F>v+G2n YN#-[Mv#hEz7IAXRrw}_A+)*xv5LG+VnS.lcv7z');
define('NONCE_SALT',       'uzEeVvym#1%99 }7q$sCP(o}iFgz 0oL=//p%+`c_]TIUdn@~u]J#?!&>jH(5hc+');

/**#@-*/

/**
 * Префикс таблиц в базе данных WordPress.
 *
 * Можно установить несколько блогов в одну базу данных, если вы будете использовать
 * разные префиксы. Пожалуйста, указывайте только цифры, буквы и знак подчеркивания.
 */
$table_prefix  = 'wp_';

/**
 * Язык локализации WordPress, по умолчанию английский.
 *
 * Измените этот параметр, чтобы настроить локализацию. Соответствующий MO-файл
 * для выбранного языка должен быть установлен в wp-content/languages. Например,
 * чтобы включить поддержку русского языка, скопируйте ru_RU.mo в wp-content/languages
 * и присвойте WPLANG значение 'ru_RU'.
 */
define('WPLANG', 'ru_RU');

/**
 * Для разработчиков: Режим отладки WordPress.
 *
 * Измените это значение на true, чтобы включить отображение уведомлений при разработке.
 * Настоятельно рекомендуется, чтобы разработчики плагинов и тем использовали WP_DEBUG
 * в своём рабочем окружении.
 */
define('WP_DEBUG', false);

/* Это всё, дальше не редактируем. Успехов! */

/** Абсолютный путь к директории WordPress. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Инициализирует переменные WordPress и подключает файлы. */
require_once(ABSPATH . 'wp-settings.php');
