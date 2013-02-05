module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    nodeunit: {
      files: ['test/**/*.js']
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        loopfunc: true,
        forin: false,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        supernew: true
      },
      globals: {
        gt: true
      },
      files: ['grunt.js', 'tasks/**/*.js']
    },

    compass: {
      dist: {
        options: {
          sassDir: 'sass',
          cssDir: 'css',
          debug_info: true,
          no_line_comments: true
        }
      }
    },

    translate: {
      options: {
        configDir: './test/translations',
        requireJS: true,
        defaultLanguage: 'en' // grunt-translate use it to update translation.
      },
      compile: {
        output: './test/translations/output'
      },
      update: {
        src: ['./test/example/**/*.js']
      },
      server: {
        port: 3000
      }
    },

    'compile-templates': {
      dist: {
        options: {
            variable: 'tmpl',
            prefix: 'doT.template(',
            suffix: ')',
            root: __dirname + '/app/profiles'
        },
        src: ['tasks/**/*.dot'],
        dest: 'tasks/translation_interface/build/tmpl.js'
      }
    },

    watch: {
      templates: {
        files: '**/*.dot',
        tasks: ['compile-templates']
      }
    }

  });
  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-dot-compiler');


  // Default task.
  grunt.registerTask('default', 'lint translate:update translate:compile test');



};
