const fs = require('fs');

const header = `// ==UserScript==
// @name        Support context
// @description Add context about support on MDN documentation, using your own browserslist as a target.
// @match       https://developer.mozilla.org/*
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==


`

const contents = fs.readFileSync('./userscript/support-context.user.js', 'utf8');
if (contents.trim().startsWith(header)) {
	process.exit(0);
}

fs.writeFileSync('./userscript/support-context.user.js', header + contents, 'utf8');
