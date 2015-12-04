module.exports = function(grunt) {

  var app_js_src = [ 'client/js/mixins/*.js',
                     'client/js/app.js',
                     'client/js/controllers/**/*.js',
                     'client/js/services/**/*.js',
                     'client/js/filters/**/*.js',
                     'client/js/directives/**/*.js',
                     '!**/*.min.js' ];
  var spec_js_src = [ 'spec/client/**/*Spec.js' ];
  var spec_js_helpers = [ 'spec/client/helpers/*.js' ];
  var spec_js = spec_js_helpers.concat(spec_js_src);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      app_src: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          src: app_js_src
        }
      },
      spec_src: {
        options: {
          jshintrc: '.jshintrc_spec'
        },
        files: {
          src: spec_js
        }
      }
    },
    uglify: {
      app_src: {
        options: {
          compress: {
            drop_console: true
          }
        },
        files: {
          'client/js/app.min.js': app_js_src
        }
      }
    },
    sass: {
      dist: {
        files: {
          'client/css/app.css': 'client/css/app.scss'
        }
      }
    },
    ngtemplates: {
      'clickApp.services': {
        cwd:      'client',
        src:      'partials/**/*.html',
        dest:     'client/js/services/htmlTemplates.js',
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
              'client/lib/ramda/dist/ramda.js',
              'client/lib/underscore.string/dist/underscore.string.js',
              'client/lib/angular/angular.js',
              'client/lib/angular-ui-router/release/angular-ui-router.min.js',
              'client/lib/angular-mocks/angular-mocks.js',
              'client/lib/mousetrap-1.5.2/mousetrap.js',
          ],
          outfile: 'spec/client/SpecRunner.html',
          keepRunner: true
        }
      }
    },
    watch: {
      app_src: {
        files: app_js_src,
        tasks: [ 'jshint:app_src', 'uglify:app_src' ],
        options: {
          spawn: true
        }
      },
      spec_src: {
        files: spec_js.concat(app_js_src),
        tasks: [ 'jshint:app_src', 'jshint:spec_src', 'jasmine:spec' ],
        options: {
          spawn: true
        }
      },
      jshint: {
        files: spec_js.concat(app_js_src),
        tasks: [ 'jshint' ],
        options: {
          spawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('build', [ 'ngtemplates', 'uglify', 'sass' ]);
};
