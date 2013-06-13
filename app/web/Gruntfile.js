module.exports = function(grunt) {
	var path = require('path');
	var _ = require('underscore');

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-frontend');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compress');

	grunt.registerMultiTask('touch', 'Toches (creates or modifies) file', function() {
		var content = this.data.content;
		var f = this.data.file;
		grunt.file.write(f, (typeof content == 'function') ? content(f) : content);
	});

	grunt.initConfig({
		handlebars: {
			main: {
				files: {
					'js/templates.js': 'templates/*.hbs'
				},
				options: {
					wrapped: false,
					namespace: 'Handlebars._templates'
				}
			}
		},

		requirejs: {
			compile: {
				options: {
					name: 'main',
					optimize: 'uglify2',
					baseUrl: './js',
					out: './out/app.js'
				}
			}
		},

		copy: {
			fonts: {
				files: [
					{
						src: './css/fonts/*', 
						dest: './out/fonts/',
						expand: true,
						flatten: true
					}
				]
			},
			app: {
				files: [{
					src: './out/app.zip',
					dest: '../iPhones News/Resources/',
					expand: true,
					flatten: true
				}]
			}
		},

		frontend: {
			main: {
				options: {
					webroot: './out',
					srcWebroot: './'
				},
				'css-file': {
					'./out/main.css': './css/main.css'
				},
				js: {
					files: {
						'out/libs.js': [
							'./js/lib/Modernizr.js',
							'./js/lib/zepto.js',
							'./js/lib/underscore.js',
							'./js/lib/underscore-ext.js',
							'./js/lib/pointerEvents.js',
							'./js/lib/swype.js',
							'./js/lib/tween.js',
							'./js/lib/handlebars.js',
							'./js/lib/delayedAjax.js',
							'./js/lib/leaf-preloader.js',
							'./js/lib/require.js',
							'./js/templates.js'
						]
					}
					
				}
			}
		},

		touch: {
			main: {
				file: './out/version.txt',
				content: function() {
					return Date.now();
				}
			}
		},

		compress: {
			main: {
				options: {
					archive: 'out/app.zip'
				},
				files: [{
					cwd: 'out/',
					expand: true,
					src: ['**/*', '!*.zip']
				}]
			}
		},

		watch: {
			templates: {
				files: 'templates/*.*',
				tasks: ['handlebars']	
			}
		}
	});

	// Default task.
	grunt.registerTask('default', ['handlebars', 'requirejs', 'frontend', 'copy:fonts', 'touch', 'compress']);
	grunt.registerTask('app', ['default', 'copy:app']);
};