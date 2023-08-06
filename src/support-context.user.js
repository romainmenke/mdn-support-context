const { supportContext } = require('./core');

const updateBrowserslistUserSettings = (newBrowserslist) => {
	GM.setValue('browserslist', newBrowserslist);
};

requestAnimationFrame(() => {
	GM.getValue('browserslist', 'defaults').then((browserslistUserSettings) => {
		supportContext(browserslistUserSettings, updateBrowserslistUserSettings);

		document.addEventListener('readyStateChange', () => {
			supportContext(browserslistUserSettings, updateBrowserslistUserSettings);
		});
	});
});
