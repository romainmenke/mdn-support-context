const { supportContext } = require('./core');

requestAnimationFrame(() => {
	chrome.storage.sync.get((items) => {
		let browserslistUserSettings = 'defaults';
		if (items && items.browserslist) {
			browserslistUserSettings = items.browserslist;
		}

		supportContext(browserslistUserSettings);

		document.addEventListener('readyStateChange', () => {
			supportContext(browserslistUserSettings);
		});
	});
});
