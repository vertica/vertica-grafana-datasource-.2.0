"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function get() {
    return _editor["default"];
  }
});
Object.defineProperty(exports, "MonacoDiffEditor", {
  enumerable: true,
  get: function get() {
    return _diff["default"];
  }
});

var _editor = _interopRequireDefault(require("./editor"));

var _diff = _interopRequireDefault(require("./diff"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }