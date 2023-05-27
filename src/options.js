const saveOptions = () => {
	let browserslist = document.getElementById('browserslist').value.trim();
	if (!browserslist) {
		browserslist = 'defaults';
	}

	chrome.storage.sync.set(
		{ browserslist: browserslist },
		() => {
			// Update status to let user know options were saved.
			const status = document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(() => {
				status.textContent = '';
			}, 750);
		}
	);
};

document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.sync.get((items) => {
		if (!items || !items.browserslist) {
			document.getElementById('browserslist').value = 'defaults';
			return;
		}

		document.getElementById('browserslist').value = items.browserslist;
	});
});

document.getElementById('save').addEventListener('click', saveOptions);
