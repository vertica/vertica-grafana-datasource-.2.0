'use strict';

System.register(['app/plugins/sdk'], function (_export, _context) {
    "use strict";

    var QueryCtrl, VerticaQueryCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            QueryCtrl = _appPluginsSdk.QueryCtrl;
        }],
        execute: function () {
            _export('VerticaQueryCtrl', VerticaQueryCtrl = function (_QueryCtrl) {
                _inherits(VerticaQueryCtrl, _QueryCtrl);

                /** @ngInject */
                function VerticaQueryCtrl($scope, $injector, templateSrv, $q, uiSegmentSrv) {
                    _classCallCheck(this, VerticaQueryCtrl);

                    var _this = _possibleConstructorReturn(this, (VerticaQueryCtrl.__proto__ || Object.getPrototypeOf(VerticaQueryCtrl)).call(this, $scope, $injector));

                    _this.target = _this.target || {};
                    _this.target.format = _this.target.format || 'time_series';
                    _this.formats = [{ text: 'Time Series', value: 'time_series' }, { text: 'Table', value: 'table' }];
                    _this.target.rawSql = _this.target.rawSql || 'SELECT \n\
$__time(end_time), \n\
average_cpu_usage_percent \n\
FROM \n\
v_monitor.cpu_usage \n\
WHERE \n\
$__timeFilter(end_time)';
                    return _this;
                }

                return VerticaQueryCtrl;
            }(QueryCtrl));

            _export('VerticaQueryCtrl', VerticaQueryCtrl);

            VerticaQueryCtrl.templateUrl = 'partials/query.editor.html';
        }
    };
});
//# sourceMappingURL=query_ctrl.js.map
