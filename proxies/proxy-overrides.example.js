/**
 * This is an example file of how to use the the proxy-overrides to override
 * which servers get proxies.
 *
 * If you want to use this method of setting the proxies copy this file and
 * name it proxy-overrides.js. When the dev server starts it looks for this
 * file but doesn't error out if it can't find it.
 *
 * Additionally, proxy-overrides.js is ignored by git. You will never
 * accidentally commit it!
 */

// In a real overridde you might want to import the optional servers
const options = require('./options');

/*
 * module.exports is a special node variable. You can change what is in this
 * object but don't change the lvalue module.exports.
 */
module.exports = {
  target: 'google.com', // Regular API requests are going to google here
  streamingTarget: 'yahoo.com' // Streaming requests (for live) are going to yahoo.
};
