// setupProxy.js - Configure API proxy with error handling
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
      onError: (err, req, res) => {
        // Gracefully handle proxy errors
        res.status(503).json({
          error: 'Backend service unavailable',
          message: 'Make sure the Python backend is running on port 5000',
        });
      },
    })
  );
};
