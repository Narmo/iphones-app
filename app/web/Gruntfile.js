module.exports = function(grunt) {
	var path = require('path');
	var _ = require('underscore');

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-frontend');
	grunt.loadNpmTasks('grunt-contrib-handlebars');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');

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
							'./js/lib/require.js',
							'./js/templates.js'
						]
					}
					
				}
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
	grunt.registerTask('default', 'handlebars');
};