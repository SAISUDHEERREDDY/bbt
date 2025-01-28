const options = require('./options');

// Load the overrides file if it exists
let overrides = {};
try {
  overrides = require('./proxy-overrides');
} catch (e) {
  // We are really okay if the module really isn't found
  if (e.code !== 'MODULE_NOT_FOUND') {
    console.info('loading overrides failed with an error:', e);
  }
}

const target = overrides.target ? overrides.target : options.pugina3700;
const streamingTarget = overrides.streamingTarget
  ? overrides.streamingTarget
  : target;

module.exports = [
  {
    context: [
      '/video_player/',
      '/opt',
      '/vod_apis/',
      '/images/',
      '/lms/',
      '/admin/'
    ],
    target: `http://${target}`,
    secure: false,
    changeOrigin: true,
    router: {
      '/video_player/**': `${target}/video_player/`,
      '/opt/**': `${target}/opt/`,
      '/vod_apis/**': `${target}/vod_apis/`,
      '/images/**': `${target}/images/`,
      '/lms/**': `${target}/lms/`,
      '/admin/**': `${target}/admin/`
    }
  },
  {
    context: ['/streaming/'],
    target: `http://${streamingTarget}`,
    secure: false,
    changeOrigin: true,
    router: {
      '/streaming/**': `${streamingTarget}/streaming/`
    }
  }
];
