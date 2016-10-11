'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applyPlan;

var _cccfDockerInstructions = require('cccf-docker-instructions');

var _cccfDockerInstructions2 = _interopRequireDefault(_cccfDockerInstructions);

var _clone = require('clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removeOutputFields(s) {
  var service = (0, _clone2.default)(s);
  delete service.placement;
  delete service.driver;
  service.host = 'tcp://' + service.host.ip + ':4243';
  service.memory = service.memory + 'b';
  service['cpu-shares'] = service.cpu;
  delete service.cpu;
  return service;
}

function applyPlan(plan, args) {
  args = args || {};
  // perform depending on driver
  var add_cmds = _cccfDockerInstructions2.default.run(plan.add.map(removeOutputFields));
  var stop_cmds = _cccfDockerInstructions2.default.stop(plan.remove.map(removeOutputFields));
  var rm_cmds = _cccfDockerInstructions2.default.rm(plan.remove.map(removeOutputFields));

  // TODO: run stop + rm (for each container) in paralell, then run add

  if (args['always-remove']) {
    (function () {
      var rmIds = plan.remove.map(function (p) {
        return p.id;
      });
      var addIds = plan.add.map(function (p) {
        return p.id;
      });
      var allNew = plan.add.filter(function (a) {
        return rmIds.indexOf(a.id) < 0;
      });
      var always_remove = _cccfDockerInstructions2.default.rm(allNew.map(removeOutputFields));
      rm_cmds = rm_cmds.concat(always_remove);
    })();
  }

  return stop_cmds.concat(rm_cmds, add_cmds);
}