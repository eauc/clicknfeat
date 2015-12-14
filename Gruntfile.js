module.exports = function(grunt) {

  var app_js_src = [ 'client/dev/js/**/*.js',
                     '!**/*.min.js' ];
  var spec_js_src = [ 'spec/client/js/**/*Spec.js' ];
  var spec_js_helpers = [ 'spec/client/js/helpers/*.js' ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      app_src: {
        src: 'client/dev/es6/',
        options: {
          config: '.eslintrc.json'
        }
      },
      spec_src: {
        src: 'spec/client/es6/',
        options: {
          config: '.eslintrc.json'
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      app_src: {
        files: [{
          expand: true,
          cwd: 'client/dev/es6',
          src: ['**/*.js'],
          dest: 'client/dev/js',
          ext: '.js'
        }]
      },
      spec_src: {
        files: [{
          expand: true,
          cwd: 'spec/client/es6',
          src: ['**/*.js'],
          dest: 'spec/client/js',
          ext: '.js'
        }]
      }
    },
    useminPrepare: {
      html: 'client/dev/index.html',
      options: {
        dest: 'client/dist/',
        flow: {
          steps: {
            js: ['uglify']
          },
          post: {
            js: [{
              name: 'uglify',
              createConfig: function (context) {
                var generated = context.options.generated;
                generated.options = {
                  sourceMap: true,
                  compress: {
                    drop_console: true
                  }
                };
              }
            }]
          }
        }
      }
    },
    usemin: {
      html: ['client/dist/index.html']
    },
    copy: {
      html: {
	src: 'client/dev/index.html',
        dest: 'client/dist/index.html'
      }
    },
    concat: {
      appendTemplates: {
        src: [ 'client/dist/js/app.min.js', 'client/dist/js/htmlTemplates.js' ],
        dest: 'client/dist/js/app.min.js'
      }
    },
    sass: {
      dist: {
        files: {
          'client/dist/css/app.css': 'client/dev/css/app.scss'
        }
      },
      options: {
        style: 'compressed'
      }
    },
    ngtemplates: {
      'clickApp.services': {
        cwd:      'client/dev/',
        src:      'partials/**/*.html',
        dest:     'client/dist/js/htmlTemplates.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes:      true,
            collapseWhitespace:             true,
            removeAttributeQuotes:          true,
            removeComments:                 true,
            removeEmptyAttributes:          true,
            removeRedundantAttributes:      true,
            removeScriptTypeAttributes:     true,
            removeStyleLinkTypeAttributes:  true
          }
        }
      }
    },
    jasmine: {
      spec: {
        src: app_js_src,
        options: {
          specs: spec_js_src,
          helpers: spec_js_helpers,
          vendor: [
              'client/dev/lib/babel-polyfill/browser-polyfill.js',
              'client/dev/lib/ramda/dist/ramda.js',
              'client/dev/lib/underscore.string/dist/underscore.string.js',
              'client/dev/lib/angular/angular.js',
              'client/dev/lib/angular-ui-router/release/angular-ui-router.min.js',
              'client/dev/lib/angular-mocks/angular-mocks.js',
              'client/dev/lib/mousetrap/mousetrap.js',
          ],
          outfile: 'spec/client/SpecRunner.html',
          keepRunner: true
        }
      }
    },
    watch: {
      app_src: {
        files: [ 'client/dev/es6/**/*.js' ],
        tasks: [ 'eslint:app_src', 'babel:app_src', 'uglify:app_src' ],
        options: {
          spawn: true
        }
      },
      spec_src: {
        files: [ 'client/dev/es6/**/*.js', 'spec/client/es6/**/*.js' ],
        tasks: [ 'eslint', 'babel', 'jasmine:spec' ],
        options: {
          spawn: true
        }
      },
      eslint: {
        files: [ 'client/dev/es6/**/*.js', 'spec/client/es6/**/*.js' ],
        tasks: [ 'eslint' ],
        options: {
          spawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('build', [
    'copy:html',
    'babel:app_src',
    'ngtemplates',
    'useminPrepare',
    'uglify:generated',
    'usemin',
    'concat:appendTemplates',
    'sass'
  ]);

  grunt.registerTask('test', [
    'babel',
    'jasmine'
  ]);
};
