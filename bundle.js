const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['vision_tracker_src.js'],
  bundle: true,
  outfile: 'headless/tracker.js',
  minify: true,
  sourcemap: false,
}).catch(() => process.exit(1));
