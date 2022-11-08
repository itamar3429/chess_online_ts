const gulp = require("gulp");
const clean = require("gulp-clean");
const sass = require("gulp-sass")(require("sass"));
// const browserSync = require("browser-sync").create();
const { exec } = require("child_process");

// Removes previous dist
gulp.task("start", () => {
	return gulp
		.src("./dist", {
			allowEmpty: true,
		})
		.pipe(clean());
});

// Creates js bundle from several js files
gulp.task("bundle", (cb) => {
	exec("webpack", (err, msg) => {
		console.log(msg || err);
		cb();
	});
	// return webpack(webpackConfig).pipe(gulp.dest("./dist"));
});

// Converts scss to css
gulp.task("scss", () => {
	return gulp
		.src("./src/**/*.scss", { allowEmpty: true })
		.pipe(sass())
		.pipe(gulp.dest("./dist"));
});

// Transfers static files
gulp.task("static", () => {
	return gulp
		.src(["src/**/*", "!src/**/*.ts", "!src/**/*.scss"], { allowEmpty: true })
		.pipe(gulp.dest("./dist/"));
});

// Initial ts compile
gulp.task("tsc", (cb) => {
	exec("tsc", (err, msg) => {
		cb();
	});
});

// // Browser Sync
// gulp.task("browser-sync", () => {
// 	browserSync.init({
// 		browser: "google-chrome",
// 		port: 4000,
// 		server: {
// 			baseDir: "./dist",
// 		},
// 	});
// });

// // Browser Sync live reload
// gulp.task("browser-sync-watch", () => {
// 	gulp.watch("./dist/styles.css").on("change", browserSync.reload);
// 	gulp.watch("./dist/app.js").on("change", browserSync.reload);
// 	gulp.watch("./dist/index.html").on("change", browserSync.reload);
// });

// Watch scss files
gulp.task("watch-scss", () => {
	return gulp.watch("./src/**/*.scss", gulp.series("scss"));
});

// Watch static files
gulp.task("watch-static", () => {
	return gulp.watch(
		["src/**/*", "!src/**/*.ts", "!src/**/*.scss"],
		gulp.series("static")
	);
});

// Watch ts files
gulp.task("tsc-w", () => {
	const process = exec("tsc -w");

	process.stdout.on("data", (msg) => {
		console.log(msg);
	});
});

// Watch tsc files
gulp.task("watch-js", () => {
	return gulp.watch("./dist/public/js/**/*.js", gulp.series("bundle"));
});

gulp.task("server", () => {
	const process = exec("nodemon dist/server.js");

	process.stdout.on("data", (msg) => {
		console.log(msg);
	});
});

gulp.task("remove-source", () => {
	return gulp.src(["./dist/**/*.js.map"], { allowEmpty: true }).pipe(clean());
});

gulp.task(
	"build",
	gulp.series("start", "tsc", "scss", "static", "bundle", "remove-source")
);

// Run all together
gulp.task(
	"default",
	gulp.series(
		"build",
		gulp.parallel(
			"watch-scss",
			"watch-static",
			"tsc-w",
			"watch-js",
			"server"
		),
		(cb) => cb()
	)
);

// Run all together
gulp.task(
	"browser",
	gulp.series(
		"build",
		gulp.parallel(
			// "browser-sync",
			// "browser-sync-watch",
			"watch-scss",
			"watch-static",
			"tsc-w",
			"watch-js"
		),
		(cb) => cb()
	)
);
