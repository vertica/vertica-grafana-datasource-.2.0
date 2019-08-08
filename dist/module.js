'use strict';

System.register(['./datasource', './query_ctrl', './config_ctrl'], function (_export, _context) {
  "use strict";

  var VerticaDatasource, VerticaQueryCtrl, VerticaConfigCtrl;
  return {
    setters: [function (_datasource) {
      VerticaDatasource = _datasource.default;
    }, function (_query_ctrl) {
      VerticaQueryCtrl = _query_ctrl.VerticaQueryCtrl;
    }, function (_config_ctrl) {
      VerticaConfigCtrl = _config_ctrl.VerticaConfigCtrl;
    }],
    execute: function () {
      _export('Datasource', VerticaDatasource);

      _export('QueryCtrl', VerticaQueryCtrl);

      _export('ConfigCtrl', VerticaConfigCtrl);
    }
  };
});
//# sourceMappingURL=module.js.map
