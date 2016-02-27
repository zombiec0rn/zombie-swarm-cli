#!/usr/bin/env node
'use strict';

var route = require('./route');

require('subcmd')({
  name: 'zombie-swarm',
  usage: 'Usage: zombie-swarm [COMMAND] [OPTIONS]',
  options: [],
  command: function command(args) {
    global.args = args;
    route.add(args);
    console.log('default, what to do?', args);
  },
  commands: [require('./sub-commands/ls').default]
}, {
  autoHelp: true
})(process.argv.slice(2));

//so the program will not close instantly
process.stdin.resume();
function exitHandler(err) {
  route.del(args, function () {
    process.exit();
  });
}

//do something when app is closing
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('uncaughtException', exitHandler);