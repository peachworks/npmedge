var fs = require('fs');
var semver = require('semver');
var npm = require('npm');
var a = require('async');
var v = require('valentine');
var path = require('path');
var conf, path;
var opt = require('optimist')
    .usage('Usage: $0 [--help] [path/to/package.json]')
    .check(function(argv) {
        if(!argv.help) {
            path = argv._.length > 0 ? argv._[0] : './package.json';
            try {
                path = fs.realpathSync(path);
            } catch(e) {
                throw new Error('File ' + path + ' does not exist');
            }
            conf = JSON.parse(fs.readFileSync(path));
        }
    })
    ['default']('l', 'warn')
    .string('l')
    .alias('l', 'loglevel')
    .describe('l', 'Loglevel for npm commands')
    .boolean('h')
    .alias('h', 'help')
    .describe('h', 'Show this message');
var argv = opt.argv;
if(argv.help) {
    opt.showHelp();
} else {
    npm.load(conf, function(err) {
        if(err) {
            throw err;
        }
        npm.config.set('loglevel', argv.loglevel);
        var get = function(deps) {
            return v.map(v.keys(deps), function(packageName) {
                return {
                    packageName : packageName,
                    version : deps[packageName]
                };
            }, deps);
        };
        var deps = [];
        if(typeof conf.dependencies !== 'undefined') {
            deps = v.merge(deps, get(conf.dependencies));
        }
        if(typeof conf.devDependencies !== 'undefined') {
            deps = v.merge(deps, get(conf.devDependencies));
        }
        a.map(deps, function(dep, cb) {
            npm.commands.show([dep.packageName, 'versions'], true, function(err, data) {
                if(err) {
                    cb(err, null);
                    return;
                }
                var versions = data[Object.keys(data)[0]].versions;
                cb(null, {
                    "package": dep.packageName,
                    "specifiedVersion": dep.version,
                    "latestVersion": versions[versions.length - 1]
                });
            });
        }, function(err, versions) {
            if(err) {
                throw err;
            }
            versions.forEach(function(p) {
                if(!semver.satisfies(p.latestVersion, p.specifiedVersion)) {
                    console.log(p['package'] + ' has ' + p.latestVersion + ', but ' + p.specifiedVersion + ' is specified');
                }
            });
        });
    });
}
