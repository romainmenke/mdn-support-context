import bcd from '@mdn/browser-compat-data' assert { type: 'json' };
import fs from 'fs';

const ignoreBrowsersMDN = /^(chrome_android|firefox_android|webview_android|oculus|nodejs|deno)/i;

const MDNToBrowserlist = {
	safari_ios: 'ios_saf',
	opera_android: 'op_mob',
	samsunginternet_android: 'samsung',
	chrome: 'chrome',
	edge: 'edge',
	firefox: 'firefox',
	ie: 'ie',
	opera: 'opera',
	safari: 'safari'
};

function reduceDataFromBCD(obj) {
	if (!obj) return;

	delete obj.__meta;

	if (obj.__compat) {
		delete obj.__compat.mdn_url;
		delete obj.__compat.source_file;
		delete obj.__compat.spec_url;
		delete obj.__compat.description;
	}

	if (obj.__compat && obj.__compat.support) {
		let minimalSupport = {};
		let support = obj.__compat.support;

		for (const browser in support) {
			if (ignoreBrowsersMDN.test(browser)) continue;
			if (!MDNToBrowserlist[browser]) continue;

			if (support[browser]) {
				let versions = Array.isArray(support[browser]) ? support[browser] : [support[browser]];

				for (let i = 0; i < versions.length; i++) {
					let versionInfo = versions[i];
					let versionAdded = versionInfo.version_added;
					if (!versionAdded) continue;
					if (versionInfo.flags) continue;
					if (versionInfo.version_removed) continue;
					if (versionInfo.prefix) continue;
					if (versionInfo.alternative_name) continue;
					if (versionInfo.partial_implementation) continue;

					if (versionAdded === true) {
						versionAdded = '1';
					}

					if (versionAdded.startsWith('≤')) {
						versionAdded = versionAdded.substring(1);
					}

					if (Number.isNaN(Number(versionAdded))) {
						continue;
					}

					if (minimalSupport[MDNToBrowserlist[browser]]) {
						console.log(obj, 'minimalSupport[browser]', minimalSupport[MDNToBrowserlist[browser]]);
					}

					minimalSupport[MDNToBrowserlist[browser]] = versionAdded;
				}
			}
		}

		obj.__compat = minimalSupport;
	}

	if (obj.__compat && obj.__compat.status) {
		delete obj.__compat.status;
	}

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key) === false) continue;

		if (key === '__compat') continue;

		if (typeof obj[key] === 'string') continue;
		if (typeof obj[key] === 'number') continue;
		if (typeof obj[key] === 'boolean') continue;

		if (obj[key].__compat?.status) {
			const status = obj[key].__compat.status;
			if (status && (status.experimental || status.deprecated)) {
				delete obj[key];
				continue
			}
		}

		reduceDataFromBCD(obj[key]);
	}
}

const bcdCopy = structuredClone(bcd);
delete bcdCopy.browsers;

reduceDataFromBCD(bcdCopy);

fs.writeFileSync('./src/bcd.js', `
module.exports = ${JSON.stringify(bcdCopy)};
`);
