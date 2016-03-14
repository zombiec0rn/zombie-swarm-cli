'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makePlan;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _zombieScheduler = require('@zombiec0rn/zombie-scheduler');

var _zombieScheduler2 = _interopRequireDefault(_zombieScheduler);

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

var _lodash = require('lodash.uniq');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCurrent(nodes) {
  return [];
}

function makePlan(nodes, wanted) {
  var current = getCurrent(nodes);

  var tags = (0, _lodash2.default)(nodes.reduce(function (t, n) {
    return t.concat(n.tags || []);
  }, []).concat(wanted.reduce(function (t, s) {
    return t.concat(s.placement || []);
  }, [])));

  var tagmap = tags.reduce(function (m, t) {
    m[t] = {};
    m[t].nodes = nodes.filter(function (n) {
      return (n.tags || []).indexOf(t) >= 0;
    });
    m[t].wanted = wanted.filter(function (s) {
      return (s.placement || []).indexOf(t) >= 0;
    });
    return m;
  }, {});

  var wantedmap = wanted.reduce(function (m, s) {
    m[s.id] = s;
    return m;
  }, {});

  // TODO: Sometimes we need to place on all tags, or.. ?
  // Perhaps we need to add another property or expand tag (stick:gateway)
  // to support both "on one of these" and "on all of these"
  // Right now I think we only support "on one of these"

  var tagadds = [];
  tags.forEach(function (t) {
    var tagplan = _zombieScheduler2.default.spread(tagmap[t].nodes, tagmap[t].wanted);
    tagplan.add.forEach(function (s) {
      (0, _object2.default)(s, wantedmap[s.id]);
    });
    tagadds = tagadds.concat(tagplan.add);
  });

  var wantedids = wanted.map(function (s) {
    return s.id;
  });
  var tagaddids = tagadds.map(function (s) {
    return s.id;
  });

  var plan = _zombieScheduler2.default.spread(nodes, wanted, current.concat(tagadds));
  plan.keep = plan.keep.filter(function (s) {
    var istagadd = tagaddids.indexOf(s.id) >= 0;
    if (istagadd) plan.add.push(s); // unshift ? make room for tagged services first ??
    return !istagadd;
  });

  return plan;
}