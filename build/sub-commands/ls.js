'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var prettyjson = require('prettyjson');
var request = require('request');
var async = require('async');
var route = require('../route');
var _mdns = require('../mdns');

var cmd = {
  name: 'ls',
  usage: 'Usage: zombie-swarm ls [OPTIONS]',
  options: [],
  command: function command(args) {
    global.args = args;
    route.add(args);
    var mdns = _mdns.default(args);
    _mdns.onResponse(mdns, function (answers) {
      async.map(answers, function (a, callback) {
        request('http://' + a.data + ':8901', function (err, res, body) {
          if (res.statusCode != 200) return callback(err, a);
          callback(err, JSON.parse(body));
        });
      }, function (err, res) {
        if (err) throw err;
        console.log(prettyjson.render(res));
        mdns.destroy();
        process.exit();
      });
    }, 5000);
    _mdns.query(mdns);
    console.log('Querying for swarm nodes...');
  }
};

exports.default = cmd;