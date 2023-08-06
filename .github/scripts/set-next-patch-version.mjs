import fs from 'fs';
import path from 'path';
import semver from 'semver';

const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const version = semver.parse(packageJSON.version, true);
if (!version) {
	throw new Error('Invalid version in package.json');
}

const nextVersion = semver.inc(version, 'patch');

{
	packageJSON.version = nextVersion;
	fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, '\t') + '\n', 'utf8');
}

{
	const manifestJSON = JSON.parse(fs.readFileSync(path.join('mdn-support-context', 'manifest.json'), 'utf8'));
	manifestJSON.version = nextVersion;
	fs.writeFileSync(path.join('mdn-support-context', 'manifest.json'), JSON.stringify(manifestJSON, null, '\t') + '\n', 'utf8');
}

