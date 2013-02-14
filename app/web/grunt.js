module.exports = function(grunt) {
	var path = require('path');
	var _ = require('underscore');

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-frontend');
	grunt.loadNpmTasks('grunt-contrib-handlebars');

	grunt.initConfig({
		handlebars: {
			main: {
				files: {
					'js/templates.js': 'templates/*.hbs'
				},
				options: {
					namespace: 'Handlebars._templates'
				}
			}
		},
		watch: {
			files: 'templates/*.*',
			tasks: ['handlebars']
		}
	});

	// Default task.
	grunt.registerTask('default', 'handlebars');
};