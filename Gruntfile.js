var _ = require('underscore'),
	pkg = require('./package.json'),
	fs = require('fs'),
	defaults = require('./config/default.json'),
	override = fs.existsSync('./build.json'),
	settings = override ? _(defaults).extend(require('./build.json')) : defaults,

	BUILTIN = [
	
		'bower_components/underscore/underscore.js',
		'src/lib/DOMParser.js',
		'src/Eclair.js'
		
	],
	MODULES = []

settings.version = pkg.version

settings.core.forEach(function (corefile) {
	
	BUILTIN.push('src/core/' + corefile + '.js')
	
})

settings.components.forEach(function (component) {

	var path = component.indexOf('.js') != -1 ? 
				'bower_components/' + component : 'src/components/' + component + '.js';

	BUILTIN.push(path)

})

settings.modules.forEach(function (module) {
	
	MODULES.push({
		name: module,
		path: 'src/modules/' + module + '.js'
	})
	
})

var makeTargets = function () {

	var args = _(arguments).toArray(),
		targets = _({})

	args.forEach(function (arg) {
		targets.extend(arg)
	})

	return targets._wrapped

}

var targetsFrom = function (files, dest) {

	targets = {}

	files.forEach(function (file) {
		targets[file.name] = {
			src: file.path,
			dest: dest + file.name + '.js'
		}
	})

	return targets

}

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		settings: settings,
		concat: makeTargets(
			{
				dist: {
					src: BUILTIN,
					dest: 'build/dist/eclair.js'
				}
			},
			targetsFrom(MODULES, 'build/dist/modules/')
		),
		uglify: makeTargets({
				options: {
					banner: '/*! <%= pkg.name %> - <%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'	
				},
				eclair: {
					src: BUILTIN,
					dest: 'build/min/eclair.min.js'
				}
			}, 
			targetsFrom(MODULES, 'build/min/modules/')
		),
		template: {
			dev: {
				engine: 'mustache',
				src: 'build/dist/eclair.js',
				dest: 'build/dist/eclair.js',
				variables: settings
			},
			min: {
				engine: 'mustache',
				src: 'build/min/eclair.min.js',
				dest: 'build/min/eclair.min.js',
				variables: settings
			}	
		},
		jsdoc: {
			dist: {
				src:[
					'build/dist/eclair.js',
					'src/modules/*.js'
				],
				dest: 'utils/doc',
				options: {
					template: 'utils/doc-template/'
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8888,
					hostname: null,
					keepalive: true
				}
			},
			inline: {
				options: {
					port: 8888
				}
			}
		},
		jasmine: {
			local: {
			  src: 'build/dist/eclair.js',
			  options: {
				specs: ['spec/*Spec.js', 'spec/modules/*Spec.js'],
				helpers: 'spec/*Helper.js'
			  }
			},
			connect: {
				src: 'build/dist/eclair.js',
  			  	options: {
					host: 'http://localhost:<%= connect.server.options.port %>/',
  					specs: ['spec/*Spec.js', 'spec/modules/*Spec.js'],
  					template: './spec/jasmine-template/Runner.tmpl'
  			  	}
			}
		}
	})

	// Grunt Concat Plugin
	grunt.loadNpmTasks('grunt-contrib-concat')

	// Grunt Uglify Plugin
	grunt.loadNpmTasks('grunt-contrib-uglify')

	// A Grunt Template Plugin
	// https://github.com/rockwood/grunt-templater/
	grunt.loadNpmTasks('grunt-templater')

	// Grunt JS Doc Template
	grunt.loadNpmTasks('grunt-jsdoc')

	grunt.loadNpmTasks('grunt-contrib-connect')

	grunt.loadNpmTasks('grunt-contrib-jasmine')
	
	grunt.registerTask('test', [
		'connect:inline',
		'jasmine:connect'
	])
	
	grunt.registerTask('server', [
	
		'jasmine:connect:build',
		'connect:server'
		
	])

	grunt.registerTask('default', [
		'concat',
		'uglify',
		'template',
		'test'
	])

}
