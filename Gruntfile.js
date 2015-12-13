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
    eslint: {
      app_src: {
        src: app_js_src,
        options: {
          config: '.eslintrc.json'
        }
      },
      spec_src: {
        src: spec_js_src,
        options: {
          config: '.eslintrc.json'
        }
      }
    },
    useminPrepare: {
      html: 'client/index-dev.html',
      options: {
        dest: 'client',
        flow: {
          steps: {
            js: ['uglify']
          },
          post: {
            js: [{
              name: 'uglify',
              createConfig: function (context, block) {
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
      html: ['client/index.html']
    },
    copy: {
      html: {
	src: 'client/index-dev.html',
        dest: 'client/index.html'
      }
    },
    concat: {
      appendTemplates: {
        src: [ 'client/js/app.min.js', 'client/js/services/htmlTemplates.js' ],
        dest: 'client/js/app.min.js'
      }
    },
    sass: {
      dist: {
        files: {
          'client/css/app.css': 'client/css/app.scss'
        }
      },
      options: {
        style: 'compressed'
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
              'client/lib/mousetrap/mousetrap.js',
          ],
          outfile: 'spec/client/SpecRunner.html',
          keepRunner: true
        }
      }
    },
    watch: {
      app_src: {
        files: app_js_src,
        tasks: [ 'eslint:app_src', 'uglify:app_src' ],
        options: {
          spawn: true
        }
      },
      spec_src: {
        files: spec_js.concat(app_js_src),
        tasks: [ 'eslint:app_src', 'eslint:spec_src', 'jasmine:spec' ],
        options: {
          spawn: true
        }
      },
      eslint: {
        files: spec_js.concat(app_js_src),
        tasks: [ 'eslint' ],
        options: {
          spawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('build', [
    'ngtemplates',
    'copy:html',
    'useminPrepare',
    'uglify:generated',
    'usemin',
    'concat:appendTemplates',
    'sass'
  ]);
};
