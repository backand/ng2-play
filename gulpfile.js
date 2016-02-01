var gulp = require('gulp');

var PATHS = {
    src: 'src/**/*.ts'
};

gulp.task('clean', function (done) {
    var del = require('del');
    del(['dist'], done);
});

gulp.task('ts2js', function () {
    var typescript = require('gulp-typescript');
    var tscConfig = require('./tsconfig.json');

    var tsResult = gulp
        .src(PATHS.src)
        .pipe(typescript(tscConfig.compilerOptions));

    return tsResult.js.pipe(gulp.dest('dist'));
});

// copy dependencies
gulp.task('copy', ['clean'], function() {
    return gulp.src([
            './node_modules/angular2/bundles/angular2-polyfills.js',
            './node_modules/es6-shim/es6-shim.min.js',
            './node_modules/systemjs/dist/system.js',
            './node_modules/rxjs/bundles/Rx.js',
            './node_modules/angular2/bundles/angular2.min.js',
            './node_modules/angular2/bundles/http.min.js'
        ])
        .pipe(gulp.dest('./dist/lib'))
});


gulp.task('index', ['copy'], function(){
    return gulp.src([
            './index.html'
        ])
        .pipe(gulp.dest('./dist'))
});

gulp.task('play', ['ts2js'], function () {
    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');

    var port = 9000, app;

    gulp.watch(PATHS.src, ['ts2js']);

    app = connect().use(serveStatic(__dirname));
    http.createServer(app).listen(port, function () {
        open('http://localhost:' + port);
    });
});

gulp.task('default', ['play']);
