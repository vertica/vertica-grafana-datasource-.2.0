'use strict';

System.register(['lodash', './response_parser'], function (_export, _context) {
  "use strict";

  var _, ResponseParser, _createClass, VerticaDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_response_parser) {
      ResponseParser = _response_parser.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      VerticaDatasource = function () {
        function VerticaDatasource(instanceSettings, backendSrv, $q, templateSrv, timeSrv) {
          _classCallCheck(this, VerticaDatasource);

          this.backendSrv = backendSrv;
          this.q = $q;
          this.name = instanceSettings.name;
          this.id = instanceSettings.id;
          this.responseParser = new ResponseParser(this.q);
          this.templateSrv = templateSrv;
          this.timeSrv = timeSrv;
        }

        _createClass(VerticaDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var queries = options.targets.map(function (target) {
              return {
                refId: target.refId,
                datasourceId: _this.id,
                rawSql: _this.templateSrv.replace(target.rawSql, options.scopedVars),
                format: target.format
              };
            });

            if (queries.length === 0) {
              return this.$q.when({ data: [] });
            }

            return this.backendSrv.datasourceRequest({
              url: '/api/tsdb/query',
              method: 'POST',
              data: {
                from: options.range.from.valueOf().toString(),
                to: options.range.to.valueOf().toString(),
                queries: queries
              }
            }).then(this.responseParser.processQueryResult);
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(query, optionalOptions) {
            var _this2 = this;

            var refId = 'tempvar';
            if (optionalOptions && optionalOptions.variable && optionalOptions.variable.name) {
              refId = optionalOptions.variable.name;
            }

            var interpolatedQuery = {
              refId: refId,
              datasourceId: this.id,
              rawSql: this.templateSrv.replace(query, {}, this.interpolateVariable),
              format: 'table'
            };

            var range = this.timeSrv.timeRange();
            var data = {
              queries: [interpolatedQuery],
              from: range.from.valueOf().toString(),
              to: range.to.valueOf().toString()
            };

            return this.backendSrv.datasourceRequest({
              url: '/api/tsdb/query',
              method: 'POST',
              data: data
            }).then(function (data) {
              return _this2.responseParser.parseMetricFindQueryResult(refId, data);
            });
          }
        }, {
          key: 'interpolateVariable',
          value: function interpolateVariable(value, variable) {
            var _this3 = this;

            if (typeof value === 'string') {
              if (variable.multi || variable.includeAll) {
                return this.queryModel.quoteLiteral(value);
              } else {
                return value;
              }
            }

            if (typeof value === 'number') {
              return value;
            }

            var quotedValues = _.map(value, function (v) {
              return _this3.queryModel.quoteLiteral(v);
            });
            return quotedValues.join(',');
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.metricFindQuery('SELECT VERSION()', {}).then(function (res) {
              return { status: 'success', message: 'Connection to ' + res[0].text + ' successful!' };
            }).catch(function (err) {
              if (err.data && err.data.message) {
                return { status: 'error', message: err.data.message };
              } else {
                return { status: 'error', message: err.status };
              }
            });
          }
        }]);

        return VerticaDatasource;
      }();

      _export('default', VerticaDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
