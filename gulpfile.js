import gulp from 'gulp'
import babel from 'gulp-babel'

const SCRIPT_SRC = 'new-src/**/*.js'
const DEST_DIR = 'src'

gulp.task('default', gulp.series(compileScripts))

gulp.task('dev', () => {
	gulp.watch(SCRIPT_SRC, gulp.series(compileScripts))
})

function compileScripts() {
	gulp.src(SCRIPT_SRC)
		.pipe(babel())
		.pipe(gulp.dest(DEST_DIR))
}
