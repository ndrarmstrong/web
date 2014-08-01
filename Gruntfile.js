//
// Grunt build file for website
//
"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Clean output directory
        clean: {
            site:["_site"]
        },

        exec: {
            // Build Jekyll site to _site (development config)
            "jekyll-develop": {
                command: "jekyll build --config _config.yml,_config_develop.yml"
            },
            // Build Jekyll site to _site (release config)
            "jekyll-release": {
                command: "jekyll build --config _config.yml,_config_release.yml"
            }
        },

        copy: {
            // Copy unchanged assets directly;
            // built assets get copied by the respective task
            assets: {
                expand: true,
                cwd: 'assets-copy/',
                src: '**',
                dest: '_site/assets'
            }
        },

        // Build customized bootstrap
        subgrunt: {
            bootstrap: {
                'bootstrap-3.2.0' : ['dist-css']
            }
        },

        // Combine CSS files
        concat: {
            "assets-css": {
                src: [
                    'bootstrap-3.2.0/dist/css/bootstrap.css',
                    'assets-build/css/font-awesome.css',
                    'assets-build/css/syntax-github.css',
                    'assets-build/css/blog.css'],
                dest: '_site/assets/css/blog.css'
            }
        },

        // Minify CSS
        cssmin: {
            assets: {
                files: {
                    '_site/assets/css/blog.min.css': ['_site/assets/css/blog.css']
                }
            }
        },

        // Minify HTML
        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            site: {
                files: [{
                    expand: true,
                    cwd: '_site/',
                    src: '**/*.html',
                    dest: '_site/'
                }]
            }
        },

        // Static file server for built files
        connect: {
            server: {
                options: {
                    port: 4000, // Same as Jekyll serve
                    base: '_site',
                    livereload: true
                }
            }
        },

        // Watch for changes
        watch: {
            options: {
                livereload: true
            },
            sources: {
                files: [
                    '*.markdown',
                    '_config.yml',
                    'feed.xml',
                    'sitemap.xml',
                    '_drafts/**',
                    '_includes/**',
                    '_layouts/**',
                    '_posts/**',
                    'about/**',
                    'assets-build/**',
                    'assets-copy/**',
                    'blog/**',
                    'portfolio/**',
                    'projects/**'],
                tasks: ['rebuild']
            }
        },

        // Run server while watching
        concurrent: {
            develop: {
                tasks: ['connect:server:keepalive', 'watch:sources'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });


    // Build targets
    // -------------

    // Build phases
    grunt.registerTask('build-pre', ['clean', 'subgrunt:bootstrap']);
    grunt.registerTask('build-post', ['copy:assets', 'concat:assets-css']);

    // 'default' is run when you just type 'grunt'
    grunt.registerTask('default', ['build-pre', 'rebuild']);

    // Rebuild builds _site without rebuilding everything
    grunt.registerTask('rebuild', ['clean', 'exec:jekyll-develop', 'build-post'])

    // 'release' builds the site for release
    grunt.registerTask('release', ['exec:jekyll-release', 'build-post', 'cssmin:assets', 'htmlmin:site']);

    // 'develop' re-builds whenever the source files change
    grunt.registerTask('develop', ['default', 'concurrent:develop']);


    // Grunt plugins
    // --------------

    // Automatically load all tasks from package.json
    require('load-grunt-tasks')(grunt);
};
