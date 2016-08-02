const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

const jsFiles = ['*.js', 'src/**/*.js'];

gulp.task('watch', function () {

    var options = {
        script: 'server.js',
        delayTime: 1,
        env: {
            PORT: 3000
        },
        watch: jsFiles
    };

    return nodemon(options)
        .on('restart', function () {
            console.log('Restarting...');
        });
});

gulp.task('default', ['watch']);