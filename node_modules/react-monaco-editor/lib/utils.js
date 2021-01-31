"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processSize = processSize;
exports.noop = noop;

function processSize(size) {
  return !/^\d+$/.test(size) ? size : "".concat(size, "px");
}

function noop() {}