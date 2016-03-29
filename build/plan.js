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

var _zombieServiceDiff = require('@zombiec0rn/zombie-service-diff');

var _zombieServiceDiff2 = _interopRequireDefault(_zombieServiceDiff);

var _object = require('object.assign');

var _object2 = _interopRequireDefault(_object);

var _lodash = require('lodash.uniq');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.find');

var _lodash4 = _interopRequireDefault(_lodash3);

var _randomString = require('random-string');

var _randomString2 = _interopRequireDefault(_randomString);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getCurrent(nodes) {
  var services = nodes.reduce(function (services, node) {
    var nodeServices = utils.extractServices(node);
    delete node.services;
    return services.concat(nodeServices);
  }, []);

  // Detect duplicate fingerprints
  // Randomize duplicate fingerprint (make sure they are re-evaluated)
  var duplicates = utils.detectDuplicateFingerprints(services);
  services.forEach(function (s) {
    if (duplicates.indexOf(s.fingerprint) >= 0) {
      s.fingerprint = (0, _randomString2.default)();
    }
  });

  return services;
}

function makePlan(nodes, _wanted) {
  /* PREPARING */
  // Extracting current services from nodes (with fingerprints)
  // Adding fingerprints to wanted
  var current = getCurrent(nodes);
  var wanted = _wanted.map(function (s) {
    s.fingerprint = _zombieServiceDiff2.default.fingerprint(s);
    return s;
  });

  /* TAGS & PLACEMENTS */
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

  /* TAG & PLACEMENT SCHEDULING */
  var tagadds = [];
  tags.forEach(function (t) {
    var tagplan = _zombieScheduler2.default.spread(tagmap[t].nodes, tagmap[t].wanted);
    tagplan.add.forEach(function (s) {
      (0, _object2.default)(s, wantedmap[s.id]);
    });
    tagadds = tagadds.concat(tagplan.add);
  });

  /* FINAL SCHEDULING */

  // We trust tagadds over current (we might have changed tags)
  // If a tagadd is in current we randomize the fingerprint to ensure re-eval
  current.forEach(function (s) {
    var tagadd = (0, _lodash4.default)(tagadds, { id: s.id });
    if (!tagadd) return;
    if (tagadd.host.hostname != s.host.hostname) {
      // Host mismatch
      s.fingerprint = (0, _randomString2.default)();
    } else if (tagadd.fingerprint != s.fingerprint) {
      // Fingerprint mismatch
      // Modifications to the same service - still tagged to same host
      s.fingerprint = (0, _randomString2.default)();
    } else {
      // No mismatch - keep in current / remove from tagadds
      tagadds = tagadds.filter(function (ta) {
        return ta.id != s.id;
      });
    }
  });

  var plan = _zombieScheduler2.default.spread(nodes, wanted, current.concat(tagadds));
  var tagaddids = tagadds.map(function (s) {
    return s.id;
  });
  plan.keep = plan.keep.filter(function (s) {
    var istagadd = tagaddids.indexOf(s.id) >= 0;
    if (istagadd) plan.add.push(s); // unshift ? make room for tagged services first ??
    return !istagadd;
  });

  /* CLEANUPS */
  // Add the fingerprint as env variable and remove property
  plan.add.forEach(function (s) {
    if (!s.env) s.env = [];
    s.env.push('ZOMBIE_SWARM_FINGERPRINT=' + s.fingerprint);
    delete s.fingerprint;
  });
  //console.log('PLAN', JSON.stringify(plan, null, 2))

  return plan;
}