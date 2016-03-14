'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyPlan;

var _cccfDockerInstructions = require('cccf-docker-instructions');

var _cccfDockerInstructions2 = _interopRequireDefault(_cccfDockerInstructions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeOutputFields(service) {
  delete service.placement;
  delete service.driver;
  service.host = 'tcp://' + service.host.ip + ':4243';
  service.memory = service.memory + 'b';
  service['cpu-shares'] = service.cpu;
  delete service.cpu;
  return service;
}

function applyPlan(plan) {
  // perform depending on driver
  var add_cmds = _cccfDockerInstructions2.default.run(plan.add.map(removeOutputFields));
  var stop_cmds = _cccfDockerInstructions2.default.stop(plan.remove.map(removeOutputFields));
  var rm_cmds = _cccfDockerInstructions2.default.rm(plan.remove.map(removeOutputFields));

  // run stop in paralell
  // then run rm
  // then run add

  return rm_cmds.concat(add_cmds).join('\n');
}