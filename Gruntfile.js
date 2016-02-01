module.exports = function(grunt) {

  var app_js_src = [ 'client/dev/js/**/*.js',
                     '!**/*.min.js' ];
  var spec_js_src = [ 'spec/client/js/**/*Spec.js' ];
  var spec_js_helpers = [ 'spec/client/js/helpers/*.js' ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      app_src: {
        src: [ 'client/dev/app/**/*.es6' ],
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
          cwd: 'client/dev/app',
          src: ['**/*.es6'],
          dest: 'client/dev/app',
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
        options: {
          loadPath: [ 'client/dev/app' ],
          style: 'compressed'
        },
        files: {
          'client/dist/css/app.min.css': 'client/dev/app/styles/app.scss'
        }
      }
    },
    ngtemplates: {
      'clickApp.services': {
        cwd:      'client/dev/',
        src:      'app/**/*.html',
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
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('gruntify-eslint');
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
};
