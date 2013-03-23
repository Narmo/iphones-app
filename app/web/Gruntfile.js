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