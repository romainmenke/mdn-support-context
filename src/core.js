const bcd = require('./bcd');
const browserslist = require('browserslist');

const ignoreBrowsersBrowserslist = /^(op_mini|and_uc|and_qq|kaios|bb|baidu|and_chr|android|and_ff)/i;

function featureToBrowsersList(feature) {
	let browsers = [];

	if (!feature.__compat) {
		return browsers;
	}

	const support = feature.__compat;

	for (const browser in support) {
		if (support[browser] && !Number.isNaN(parseFloat(support[browser]))) {
			try {
				const newBrowsers = browserslist(
					browser + ' >= ' + support[browser],
					{
						ignoreUnknownVersions: true,
					}
				);

				browsers.push(...newBrowsers);
			} catch (e) {
				// DEBUG :
				// console.log(e);
			}
		}
	}

	for (const key in feature) {
		if (key === '__compat') continue;

		const browsersListForSubFeature = featureToBrowsersList(feature[key])
		if (browsersListForSubFeature === false) {
			continue;
		}

		const newSet = new Set(browsersListForSubFeature);
		browsers = browsers.filter((x) => newSet.has(x));
	}

	return browsers;
}

const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

function renderCard(data, browserslistUserSettings, updateBrowserslistUserSettings) {
	let threshold = Math.max(0, data.percentageOfTarget - 70) / 30;
	let hue = 140 * (threshold);
	let saturation = isDarkMode.matches ? 50 : 39;
	let lightness = isDarkMode.matches ? 12 : 93;

	let advice = '';

	if (data.percentageOfTarget < 50) {
		advice = `<p class="advice">This feature is not supported by half of your target browsers. Maybe it can be used as an enhancement, but it requires some investigation before adoption.</p>`;
	} else if (data.percentageOfTarget < 90) {
		advice = `<p class="advice">This feature is not supported by all your target browsers. Consider polyfills and transpilers to improve user experience.</p>`;
	}

	if (data.numberOfVendorImplementations === 0) {
		advice += `<p class="advice">This is an experimental feature. No browser engine has full support.</p>`;
	} else if (data.numberOfVendorImplementations === 1) {
		advice += `<p class="advice">This feature is only fully implemented in a single browser engine. It is not yet stable.</p>`;
	} else if (data.numberOfVendorImplementations === 3) {
		advice += `<p class="advice">This is a stable feature, it is fully implemented by all major browser engines.</p>`;
	}

	if (data.percentageOfTarget < 90 || data.numberOfVendorImplementations !== 3) {
		advice += `<p class="advice">Some API's consist of multiple sub features. Maybe the sub feature you want to use is fully supported. Consult the <a href="#browser_compatibility">compatibility table</a> for more details and context.</p>`;
	}

	let settings = '';
	if (updateBrowserslistUserSettings) {
		settings = `<div class="settings">
				<label for="rm-support-context-browserslist">Browserslist:</label>
				<input style="all: revert;" type="text" id="rm-support-context-browserslist" name="rm-support-context-browserslist" value="${browserslistUserSettings}">
				<button style="all: revert;" id="rm-support-context-browserslist-submit">Save</button>
			</div>
		`;
	}

	let mainCard = `
		<details class="baseline-indicator supported support-context" style="background: hsl(${Math.round(hue)}deg ${saturation}% ${lightness}%)">
			<summary>
				<h2>Supported in: <span class="not-bold">${data.percentageOfTarget}% of your targets ${data.percentageOfTarget === '100.0' ? '🎉' : ''}</span></h2><br>
				<div>Stable in: ${data.numberOfVendorImplementations}/3 browser engines</div>
			</summary>

			<div class="extra">${advice}</div>

			${settings}
		</details>`;

	const div = document.createElement('div');
	div.innerHTML = mainCard;

	if (updateBrowserslistUserSettings) {
		div.querySelector('#rm-support-context-browserslist-submit')?.addEventListener('click', () => {
			updateBrowserslistUserSettings(div.querySelector('#rm-support-context-browserslist')?.value);
		});
	}
	return div;
}

let didRender = false;

function supportContext(browserslistUserSettings, updateBrowserslistUserSettings) {
	if (!browserslistUserSettings) return;

	let dataEl = document.getElementById('hydration');
	if (!dataEl) return;

	let data = dataEl.textContent.trim();
	if (!data) return;

	let context = JSON.parse(data);

	let doc = context.doc;
	if (!doc) return;

	let browserCompat = doc.browserCompat;
	if (!browserCompat) return;
	if (!browserCompat.length) return;

	if (didRender) return;
	didRender = true;

	const supportTargetArray = browserslist(browserslistUserSettings, {
		ignoreUnknownVersions: true,
		mobileToDesktop: true
	}).filter((x) => !ignoreBrowsersBrowserslist.test(x));

	const supportTarget = new Set(supportTargetArray)
	const coverage = browserslist.coverage(supportTargetArray);

	let browsersWithSupportForFeature = [];
	let supportedAndTargetedBrowsers = [];

	for (let i = 0; i < browserCompat.length; i++) {
		const entry = browserCompat[i];
		const pathParts = entry.split('.');

		let obj = bcd;
		for (let j = 0; j < pathParts.length; j++) {
			const part = pathParts[j];
			obj = obj[part];
			if (!obj) break;
		}

		if (!obj) continue;

		const browsersListForFeature = featureToBrowsersList(obj);
		if (!browsersListForFeature) continue;

		const newSet = new Set(browsersListForFeature.filter((x) => !ignoreBrowsersBrowserslist.test(x)));

		if (i === 0) {
			browsersWithSupportForFeature = Array.from(newSet);
		} else {
			browsersWithSupportForFeature = supportedAndTargetedBrowsers.filter((x) => newSet.has(x));
		}
	}

	browsersWithSupportForFeature = new Set(browsersWithSupportForFeature);

	let hasSafari = false;
	let hasChrome = false;
	let hasFirefox = false;

	for (const browser of browsersWithSupportForFeature) {
		if (browser.startsWith('safari ')) {
			hasSafari = true;
		} else if (browser.startsWith('chrome ')) {
			hasChrome = true;
		} else if (browser.startsWith('firefox ')) {
			hasFirefox = true;
		}
	}

	const renderData = {
		percentageOfTarget: 0,
		numberOfVendorImplementations: 0
	};

	if (hasSafari) renderData.numberOfVendorImplementations++;
	if (hasChrome) renderData.numberOfVendorImplementations++;
	if (hasFirefox) renderData.numberOfVendorImplementations++;

	for (const targetedBrowser of supportTarget) {
		if (browsersWithSupportForFeature.has(targetedBrowser)) {
			supportedAndTargetedBrowsers.push(targetedBrowser);
			continue;
		}
	}

	const featureCoverage = browserslist.coverage(supportedAndTargetedBrowsers);
	renderData.percentageOfTarget = Math.min(100, ((featureCoverage / coverage) * 100)).toFixed(1);
	if (Number.isNaN(renderData.percentageOfTarget)) {
		renderData.percentageOfTarget = 0;
	}

	{
		let baselineIndicator = document.querySelector('.baseline-indicator:not(.support-context)');
		if (baselineIndicator) {
			baselineIndicator.replaceWith(renderCard(renderData, browserslistUserSettings, updateBrowserslistUserSettings));
		} else {
			let h1 = document.querySelector('h1');
			if (h1) {
				h1.after(renderCard(renderData, browserslistUserSettings, updateBrowserslistUserSettings));
			}
		};
	}
};

module.exports = {
	supportContext: supportContext
};
