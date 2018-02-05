/*
 * Generated on 2018-02-03
 * generator-assemble v0.5.0
 * https://github.com/assemble/generator-assemble
 *
 * Copyright (c) 2018 Hariadi Hinta
 * Licensed under the MIT license.
 */

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// '<%= config.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= config.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	// Project configuration.
	grunt.initConfig({

		config: {
			src: 'src',
			dist: 'dist'
		},

		// adding 2-5
		pkg: grunt.file.readJSON('package.json'),

		packageModules: {
			dist: {
				src: 'package.json',
				dest: '<%= config.dist %>'
			}
		},

		bower_concat: {
			concat_all: {
				dest: {
					js: '<%= config.dist %>/assets/vendor.js',
					css: '<%= config.dist %>/assets/vendor.css'
				},
				exclude: [
					'bootstrap'
				],
				mainFiles: {
					// 'simple-statistics': ''
				}
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['<%= config.src %>/scripts/addons/*.js', '<%= config.src %>/scripts/*.js'],
				dest: '<%= config.dist %>/main.js'
			}
		},

		watch: {
			assemble: {
				files: ['<%= config.src %>/{content,data,templates}/{,*/}*.{md,hbs,yml}'],
				tasks: ['assemble']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.dist %>/{,*/}*.html',
					'<%= config.dist %>/assets/{,*/}*.css',
					'<%= config.dist %>/assets/{,*/}*.js',
					'<%= config.dist %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					open: true,
					base: [
						'<%= config.dist %>'
					]
				}
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					// '<%= config.dist %>/assets/scripts/addons.js': ['<%= config.src %>/scripts/addons/*.js']
					// 'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
					'<%= config.dist %>/main.min.js': ['<%= config.dist %>/main.js'],
					'<%= config.dist %>/assets/vendor.min.js': ['<%= config.dist %>/assets/vendor.js']
				}
			}
		},

		postcss: {
			options: {
				processors: [
					require('autoprefixer')({ browsers: 'last 2 versions' })
				]
			},
			dist: {
				src: '<%= config.src %>/assets/*.css'
			}
		},

		assemble: {
			pages: {
				options: {
					flatten: true,
					assets: '<%= config.dist %>/assets',
					layout: '<%= config.src %>/templates/layouts/default.hbs',
					data: '<%= config.src %>/data/*.{json,yml}',
					partials: '<%= config.src %>/templates/partials/*.hbs',
					plugins: ['assemble-contrib-permalinks','assemble-contrib-sitemap'],
				},
				files: {
					'<%= config.dist %>/': ['<%= config.src %>/templates/pages/*.hbs'],
					'<%= config.dist %>/pages/': ['<%= config.src %>/templates/pages/sectors/*.hbs']
				}
			},
			options: {
				helpers: ['<%= config.src %>/helpers/*.js', './node_modules/handlebars-helpers/{,*/}*.js']
			}
		},

		copy: {
			bootstrap: {
				expand: true,
				cwd: 'bower_components/bootstrap/dist/',
				// cwd: 'node_modules/bootstrap/dist/',
				src: '**',
				dest: '<%= config.dist %>/assets/'
			},
			// jquery: {
			// 	expand: true,
			// 	cws: 'node_modules/jquery/dist/',
			// 	src: 'jquery.min.js',
			// 	dest: '<%= config.dist %>/assets/'
			// },

			// add 2-5
			img: {
				expand: true,
				cwd: '<%= config.src %>/assets/img/',
				src: '**',
				dest: '<%= config.dist %>/assets/img/',
				filter: 'isFile',
				flatten: true
			},
			// scripts: {
			// 	expand: true,
			// 	cwd: '<%= config.src %>/scripts/',
			// 	src: ['*.js', 'addons/*.js'],
			// 	dest: '<%= config.dist %>/assets/scripts/'
			// },
			css: {
				expand: true,
				cwd: '<%= config.src %>/assets/',
				src: '*.css',
				dest: '<%= config.dist %>/assets/'
			},
			data: {
				expand: true,
				cwd: '<%= config.src %>/assets/data/',
				src: '**',
				dest: '<%= config.dist %>/assets/data/',
				flatten: false
			},
			json: {
				expand: true,
				cwd: '<%= config.src %>/assets/json/',
				src: '*.json',
				dest: '<%= config.dist %>/assets/json/'
			}
		},

		sass: {
			options: {
				// sourceMap: true
			},
			dist: {
				files: {
					'<%= config.src %>/assets/main.css': '<%= config.src %>/assets/main.scss'
				}
			}
		},

		// Before generating any new files,
		// remove any previously-created files.
		clean: ['<%= config.dist %>/**/*.{html,xml}']

	});

	grunt.loadNpmTasks('assemble');
	grunt.loadNpmTasks('grunt-contrib-concat');
	// grunt.loadNpmTasks('grunt-package-modules');

	grunt.registerTask('server', [
		'build',
		'connect:livereload',
		'watch'
	]);

	grunt.registerTask('build', [
		'clean',
		'bower_concat',
		'concat',
		'sass',
		'uglify',
		// 'packageModules',
		'copy',
		'assemble'
	]);

	grunt.registerTask('default', [
		'build'
	]);

};
