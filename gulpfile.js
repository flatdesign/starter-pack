"use strict";
 
var gulp = require("gulp");
var sass = require("gulp-sass");     // Преобразовует sass в css
var plumber = require("gulp-plumber");  // При ошибке не отсанавливает работу сервера
var postcss = require("gulp-postcss");		// Содержит в себе autoprefixer
var posthtml = require("gulp-posthtml");		// Содержит в себе posthtml-include
var include = require("posthtml-include");		// Позволяет вставлять в верстку другие элементы (спрайт)
var autoprefixer = require("autoprefixer");   // Проставляет префиксы для кроссбраузерности
var minify = require("gulp-csso");					// Минификацирует css
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");				// Преобразовывает изображения в формат webp
var svgstore = require("gulp-svgstore");		// формирует спрайт 
var rename = require("gulp-rename");			// Переименовывает файлы
var del = require("del");
var run = require("run-sequence");		// Запускает таски последовательно ( для сборки)
var server = require("browser-sync").create();		// Сервер
var uglify = require("gulp-uglify");		// минимизация js
var pump = require("pump");				// для js
var concat = require("gulp-concat");		//объединяет js файлы
 

gulp.task("style", function() {						
	gulp.src("sass/style.sass")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer()
			]))
		.pipe(gulp.dest("build/css"))
		.pipe(minify())
		.pipe(rename("style.min.css"))
		.pipe(gulp.dest("build/css"))
		.pipe(server.stream()); // обновление браузера
});

gulp.task("sprite", function() {
	return gulp.src("img/*.svg")
	.pipe(svgstore({
		inlineSvg: true
	}))
	.pipe(rename("sprite.svg"))
	.pipe(gulp.dest("build/img"))
	.pipe(gulp.dest("img"));
});

gulp.task("html", function() {
	return gulp.src("*.html")
	.pipe(posthtml([
		include()
		]))
	.pipe(gulp.dest("build"))
	.pipe(server.stream());
});

gulp.task("images", function() {								
	return gulp.src("img/**/*.+(png|jpg|svg)")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
		]))
	.pipe(gulp.dest("img"));
});

gulp.task("webp", function() {
	return gulp.src("img/**/*.+(png|jpg)")
	.pipe(webp({quality: 90}))
	.pipe(gulp.dest("img"));
});

gulp.task("copy", function() {
	return gulp.src([
		"fonts/**/*.+(woff|woff2)",
		"img/**/*"
		], {
			base: "."
		})
		.pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
	return del("build");
});

gulp.task('script', function () {
  return gulp.src([
//		"libs/jquery/dist/jquery.min.js",    //подключение библиотек


  	"js/script.js" // всегда в конце
  	])
  .pipe(concat("script.min.js"))
//  .pipe(uglify())									// минификация в конце проекта
 	.pipe(gulp.dest('build/js/'))
 	.pipe(server.stream());
});


gulp.task("build", function (done) {
	run (
		"clean",
		"copy",
		"style",
		"sprite",
		"script",
		"html",
		done
	);
});

gulp.task("serve", function() {
	server.init({
		server: "build/",
		notify: false,
		open: true,
		cors: true,
		ui: false
	});

	gulp.watch("sass/**/*.{scss,sass}", ["style"]).on("change", server.reload);
	gulp.watch("*.html", ["html"]).on("change", server.reload);
	gulp.watch("js/**/*.js", ["script"]).on("change", server.reload);
});