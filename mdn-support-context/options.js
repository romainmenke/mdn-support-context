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

const restoreOptions = () => {
	chrome.storage.sync.get(
		{ browserslist: 'defaults' },
		(items) => {
			document.getElementById('browserslist').value = items.browserslist;
		}
	);
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
