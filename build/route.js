'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.del = del;

var _iproute = require('iproute');

var _iproute2 = _interopRequireDefault(_iproute);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var route = {
  type: 'unicast',
  to: '224.0.0.0/4',
  scope: 'link'
};

function add(args, callback) {
  route.dev = args.interface;
  _iproute2.default.route.add(route, function (err) {
    if (err) console.log(err);
    if (typeof callback == 'function') callback();
  });
}

function del(args, callback) {
  route.dev = args.interface;
  _iproute2.default.route.delete(route, function (err) {
    if (err) console.log(err);
    if (typeof callback == 'function') callback();
  });
}