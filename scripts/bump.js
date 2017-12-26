var semver = require('semver');
var fs = require('fs');
var path = require('path');
var packageJson = require('./../package.json');
var exec = require('child_process').execSync;
var argv = process.argv.slice(2);

var incIdentifier = argv[0];
var preId = argv[1] || '';

packageJson.version = semver.inc(packageJson.version, incIdentifier, preId);

fs.writeFileSync(path.resolve(__dirname, '../package.json'), JSON.stringify(packageJson, null, '    '));

exec(
    `git tag v${packageJson.version}`
);

console.log(`Bumped version to v${packageJson.version}`);

exec(
    `git add . && git commit -m "Bump to ${packageJson.version}" --no-verify`
);