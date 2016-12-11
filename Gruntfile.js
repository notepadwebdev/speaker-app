// Load Grunt
module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        paths: {
            dev: 'src',
            dist: 'dist'
        },

        // CSS
        sass: { // Begin Sass Plugin
            dev: {
                options: {
                    sourcemap: 'none'
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dev %>/scss',
                    src: ['**/*.scss'],
                    dest: '<%= paths.dev %>/css',
                    ext: '.css'
                }]
            }
        },
        cssmin: { // Begin CSS Minify Plugin
            target: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.dev %>/css',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= paths.dist %>/css',
                    ext: '.css'
                }]
            }
        },

        // JS
        modernizr: {
            custom: {
                "parseFiles": true,
                "customTests": [],
                "devFile": 'node_modules/modernizr/bin/modernizr',
                "dest": '<%= paths.dev %>/js/vendor/modernizr.js',
                "tests": [
                    "touchevents"
                ],
                options: [
                    "domPrefixes",
                    "prefixes",
                    "mq",
                    "testAllProps",
                    "testProp",
                    "testStyles",
                    "html5shiv",
                    "setClasses"
                ],
                "uglify": true,
                "files": {
                    "src": [
                        "<%= paths.dev %>/scss/**/*.scss",
                        "<%= paths.dev %>/js/app/**/*.js"
                    ]
                },
            },
        },
        browserify: {
            dev: {
                options: {
                    transform: [
                        ["babelify", { "presets": ["es2015"] }]
                    ]
                },
                files: {
                    "<%= paths.dev %>/js/bundle.js": ["<%= paths.dev %>/js/app/**/*.js"]
                }
            },
        },
        uglify: { // Begin JS Uglify Plugin
            build: {
                src: ['<%= paths.dev %>/js/bundle.js'],
                dest: '<%= paths.dist %>/js/bundle.js'
            }
        },

        // IMAGES
        imagemin: {
            dist: {
                options: {
                    cache: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= paths.dev %>',
                    src: ['**/*.{png,gif,jpg}'],
                    dest: '<%= paths.dist %>'
                }]
            }
        },

        clean: {
            dist: {
                expand: true,
                src: ['./dist']
            }
        },
        copy: {
            dist: {
                files: [{
                    src: '<%= paths.dev %>/index.html',
                    dest: '<%= paths.dist %>/index.html'
                },
                {
                    expand: true,
                    cwd: '<%= paths.dev %>/js/vendor/',
                    src: '**/*',
                    dest: '<%= paths.dist %>/js/vendor/'
                },
                {
                    expand: true,
                    cwd: '<%= paths.dev %>/audio/',
                    src: '**/*',
                    dest: '<%= paths.dist %>/audio/'
                }],
            }
        },

        watch: {
            css: {
                files: '<%= paths.dev %>/**/*.scss',
                tasks: ['sass', 'cssmin'],
                options: {
                    livereload: true,
                },
            }
        },

        // SERVER
        express: {
            options: {
                port: 3000,
                debug: true
            },
            server: {
                options: {
                    script: './server.js'
                }
            }
        },
        open: {
            dev: {
                path: "http://localhost:3000/index.html"
            }
        }


    });

    // Load ALL grunt tasks
    require('load-grunt-tasks')(grunt);

    // Default dev task
    grunt.registerTask('default', [
        'modernizr',
        'sass',
        'cssmin',
        'browserify',
        'express',
        'open',
        'watch'
    ]);

    // Build task
    grunt.registerTask('build', [
        'clean:dist',
        'imagemin',
        'sass',
        'cssmin',
        'browserify',
        'copy:dist',
        'uglify'
    ]);
};
