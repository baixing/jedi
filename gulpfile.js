import gulp from 'gulp'
import babel from 'gulp-babel'
import sourcemaps from 'gulp-sourcemaps'

const SCRIPT_SRC = 'new-src/**/*.js'
const DEST_DIR = 'src'

gulp.task('default', gulp.series(compileScripts))

gulp.task('dev', () => {
	gulp.watch(SCRIPT_SRC, gulp.series(compileScripts))
})

function compileScripts() {
	gulp.src(SCRIPT_SRC)
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(DEST_DIR))
}
