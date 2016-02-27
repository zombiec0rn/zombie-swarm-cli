'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

try {
    var doc = _jsYaml2.default.safeLoad(_fs2.default.readFileSync('./zombie-swarm.yml'));
    console.log(doc);
} catch (e) {
    console.log(e);
}