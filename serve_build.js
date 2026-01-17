const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const http = require('http');
const app = express();

// Simple proxy for API requests to the backend server.
// This handles requests to `/api/*` and forwards them to http://localhost:5000
app.use('/api', (req, res) => {
	try {
		const target = `http://localhost:5000${req.originalUrl}`;
		const options = {
			method: req.method,
			headers: Object.assign({}, req.headers)
		};

		// Remove host header to avoid backend rejecting the request
		delete options.headers.host;

		const proxyReq = http.request(target, options, proxyRes => {
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.pipe(res, { end: true });
		});

		proxyReq.on('error', (err) => {
			console.error('API proxy error:', err && err.message);
			res.statusCode = 502;
			res.end('Bad Gateway');
		});

		// Pipe the incoming request body to the backend
		req.pipe(proxyReq, { end: true });
	} catch (e) {
		console.error('API proxy caught exception:', e && e.message);
		res.statusCode = 500;
		res.end('Internal server error');
	}
});

// Serve static build files
// Safety-first root route: serve a minimal safe page so the browser always shows something
// Serve the SPA index at the root so the app is visible at '/'
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Keep a safe-mode informational page available at /safe-mode
app.get('/safe-mode', (req, res) => {
	const safeHtml = `<!doctype html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<title>AION (safe mode)</title>
			<style>body{font-family:Inter,Arial,Helvetica,sans-serif;background:#0b0b0d;color:#e6eef6;margin:0;display:flex;align-items:center;justify-content:center;height:100vh} .card{max-width:820px;padding:28px;border-radius:12px;background:linear-gradient(180deg,#071226, #0c1320);box-shadow:0 6px 30px rgba(0,0,0,0.6)} a.button{display:inline-block;margin-top:12px;padding:10px 14px;background:#0ea5a0;color:#001; border-radius:8px;text-decoration:none}
			pre{white-space:pre-wrap;color:#ffd6d6;background:#1b0b0b;padding:12px;border-radius:8px}
			</style>
		</head>
		<body>
			<div class="card">
				<h1>AION — Safe Mode</h1>
				<p>The production build is being served. If the full UI fails to load, this safe mode page ensures you can access the app and developer tools.</p>
				<p>To open the original app, <a class="button" href="/">click here</a> (may show developer error UI).</p>
				<p>If you see a blank screen in the full app, open your browser DevTools → Console and paste the top red error here for a targeted fix.</p>
			</div>
		</body>
	</html>`;
	res.setHeader('Content-Type', 'text/html');
	res.send(safeHtml);
});
// Serve static build files (after our safe root route so it doesn't override it)
app.use(express.static(path.join(__dirname, 'build')));

// Fallback: serve index.html for other routes so SPA routing still works
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));
	
	// Debug capture route: serves the production index.html but injects a small
	// client-side script that captures runtime errors/unhandled rejections and
	// posts them to the backend at /api/log-client-error. Useful when you don't
	// want to copy/paste console stacks.
	app.get('/debug-capture', (req, res) => {
	  try {
	    const fs = require('fs');
	    const indexPath = path.join(__dirname, 'build', 'index.html');
	    let html = fs.readFileSync(indexPath, 'utf8');

	    const injector = `\n<script>\n(function(){\n  function send(obj){\n    try{\n      var payload=JSON.stringify(obj);\n      if(navigator.sendBeacon){ navigator.sendBeacon('/api/log-client-error', payload); return; }\n      fetch('/api/log-client-error',{method:'POST',headers:{'Content-Type':'application/json'},body:payload}).catch(()=>{});\n    }catch(e){}\n  }\n  window.addEventListener('error', function(e){\n    send({error:e.message,filename:e.filename,lineno:e.lineno,colno:e.colno,stack:e.error&&e.error.stack,when:'window-error'});\n  });\n  window.addEventListener('unhandledrejection', function(e){\n    var r = e.reason;\n    send({error:r&&r.message? r.message: String(r),stack:r&&r.stack,when:'unhandled-rejection'});\n  });\n  ['error','warn'].forEach(function(level){\n    var orig = console[level];\n    console[level] = function(){\n      try{ send({error: Array.prototype.slice.call(arguments).join(' '),when:'console-'+level}); }catch(e){}\n      if(orig && orig.apply) orig.apply(console, arguments);\n    };\n  });\n  // lightweight visual indicator
	  var ov = document.createElement('div'); ov.id='__aion_debug_overlay'; ov.style.position='fixed'; ov.style.right='12px'; ov.style.bottom='12px'; ov.style.padding='8px 10px'; ov.style.background='rgba(255,20,20,0.85)'; ov.style.color='#fff'; ov.style.fontFamily='sans-serif'; ov.style.zIndex='999999'; ov.style.borderRadius='6px'; ov.style.fontSize='13px'; ov.innerText='AION debug-capture active';\n  document.addEventListener('DOMContentLoaded', function(){ try{ document.body.appendChild(ov);}catch(e){} });\n})();\n</script>\n`;

	    // Inject before closing </head> if present, otherwise prepend
	    if(html.indexOf('</head>') !== -1){
	      html = html.replace('</head>', injector + '\n</head>');
	    } else {
	      html = injector + html;
	    }

	    res.setHeader('Content-Type', 'text/html');
	    res.send(html);
	  } catch (e) {
	    console.error('Failed to serve debug-capture:', e);
	    res.status(500).send('Failed to serve debug-capture');
	  }
	});

app.listen(port, () => console.log(`Serve build (safe mode): http://localhost:${port}`));
