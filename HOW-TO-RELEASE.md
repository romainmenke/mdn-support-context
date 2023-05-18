# How to release

## Before you start

1. Update the version in `manifest.json`
2. Update the version in `package.json`
3. Run `npn update && npm install`
4. Run `npm run build`

## Chrome

1. Visit : https://chrome.google.com/u/1/webstore/devconsole/
2. Compress ./mdn-support-context
3. Upload the zip file

## Firefox

1. Visit : https://addons.mozilla.org/en-US/developers/addon/support-context/edit
2. Compress **the contents** of ./mdn-support-context
3. Upload the zip file
