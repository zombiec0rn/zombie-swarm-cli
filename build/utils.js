'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initCmd = initCmd;
exports.validateArgs = validateArgs;
exports.readConfigFile = readConfigFile;
exports.querySwarmNodes = querySwarmNodes;
var request = require('request');
var route = require('./route');
var async = require('async');
var _mdns = require('./mdns');

// NOTE:
// `initCmd` needs to be called whenever mdns is involved.
// It creates a `route` for mdns packets -> interface
// and hooks up listeners to remove this route when app exits.
function initCmd(args) {
  // Prevent app from closing immediately
  process.stdin.resume();
  // exitHandler
  function exitHandler(err) {
    route.del(args, function () {
      console.error(err);
      process.exit();
    });
  }

  // Call exitHandler on exit
  process.on('exit', exitHandler);
  process.on('SIGINT', exitHandler);
  process.on('uncaughtException', exitHandler);

  // Add route
  route.add(args);
}

var defaultOptions = [{
  name: 'interface',
  help: 'Which interface to use (required)'
}];
exports.defaultOptions = defaultOptions;
function validateArgs(args) {
  if (!args.interface) {
    console.log('Missing required argument `interface`. Exiting...');
    process.exit(1);
  }
}

function readConfigFile(args) {
  try {
    return yaml.safeLoad(fs.readFileSync(args.file));
  } catch (e) {
    throw e;
    process.exit(1);
  }
}

function querySwarmNodes(callback, args, queryTime) {
  queryTime = queryTime || 5000;
  var mdns = _mdns.default(args);
  _mdns.onResponse(mdns, function (answers) {
    async.map(answers, function (a, cb) {
      request('http://' + a.data + ':8901', function (err, res, body) {
        if (res.statusCode != 200) return cb(err, a);
        var info = JSON.parse(body);
        info.ip = a.data;
        cb(err, info);
      });
    }, function (err, res) {
      mdns.destroy();
      callback(err, res);
    });
  }, queryTime);
  _mdns.query(mdns);
}