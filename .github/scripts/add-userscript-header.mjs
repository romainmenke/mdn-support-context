import fs from 'fs';

const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;

const header = `// ==UserScript==
// @name        Support context
// @version     ${version}
// @description Add context about support on MDN documentation, using your own browserslist as a target.
// @author      Romain Menke
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
