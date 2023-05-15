const bcd = require('@mdn/browser-compat-data');
const browserslist = require('browserslist');

let browserslistUserSettings = null;

const MDNToBrowserlist = {
  chrome_android: 'and_chr',
  safari_ios: 'ios_saf',
  firefox_android: 'and_ff',
  opera_android: 'op_mob',
  samsunginternet_android: 'samsung',
  webview_android: 'android',
};

const ignoreBrowsersBrowserslist = /^(op_mini|and_uc|and_qq|kaios|bb|baidu|and_chr|android|and_ff)/i;
const ignoreBrowsersMDN = /^(chrome_android|firefox_android|webview_android|oculus)/i;

function featureToBrowsersList(feature) {
  let browsers = [];

  if (!feature.__compat || !feature.__compat.support) {
    return browsers;
  }

  const status = feature.__compat.status;
  if (status && status.experimental) return false
  if (status && status.deprecated) return false;

  const query = [];
  const support = feature.__compat.support;

  for (const browser in support) {
    if (ignoreBrowsersMDN.test(browser)) continue;

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

        if (versionAdded.startsWith('≤')) {
          versionAdded = versionAdded.substring(1);
        }

        query.push(`${MDNToBrowserlist[browser] || browser} >= ${versionAdded}`);
      }
    }
  }

  browsers.push(
    ...browserslist(query, {
      ignoreUnknownVersions: true,
    })
  );

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

function renderCard(data) {
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

  let mainCard = `
    <details class="baseline-indicator supported support-context" style="background: hsl(${Math.round(hue)}deg ${saturation}% ${lightness}%)">
      <summary>
        <h2>Supported in: <span class="not-bold">${data.percentageOfTarget}% of your targets ${data.percentageOfTarget === '100.0' ? '🎉' : ''}</span></h2><br>
        <div>Stable in: ${data.numberOfVendorImplementations} ${data.numberOfVendorImplementations === 1 ? 'engine' : 'engines'}</div>
      </summary>
      
      <div class="extra">${advice}</div>
    </details>`;
  
  const div = document.createElement('div');
  div.innerHTML = mainCard;
  return div;
}

let init = () => {
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
    if (browser.startsWith('safari')) {
      hasSafari = true;
    } else if (browser.startsWith('chrome')) {
      hasChrome = true;
    } else if (browser.startsWith('firefox')) {
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
      baselineIndicator.replaceWith(renderCard(renderData));
    } else {
      let h1 = document.querySelector('h1');
      if (h1) {
        h1.after(renderCard(renderData));
      }
    };
  }

  init = () => { };
};

init();

document.addEventListener('readyStateChange', init);

chrome.storage.sync.get(
  { browserslist: 'defaults' },
  (items) => {
    browserslistUserSettings = items.browserslist;
    init();
  }
);
