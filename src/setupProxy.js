// setupProxy.js - Configure API proxy with error handling
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const backendTarget = 'http://127.0.0.1:5000';
  app.use(
    ['/api', '/admin', '/generate-image', '/generate-video', '/generate-code', '/ollama', '/webcache', '/session'],
    createProxyMiddleware({
      target: backendTarget,
      changeOrigin: true,
      onError: (err, req, res) => {
        res.status(503).json({
          error: 'Backend service unavailable',
          message: `Make sure the AION backend is running at ${backendTarget}`,
        });
      },
    })
  );
};
