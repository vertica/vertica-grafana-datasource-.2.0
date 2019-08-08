'use strict';

System.register([], function (_export, _context) {
    "use strict";

    var VerticaConfigCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [],
        execute: function () {
            _export('VerticaConfigCtrl', VerticaConfigCtrl =

            /** @ngInject */
            function VerticaConfigCtrl($scope) {
                _classCallCheck(this, VerticaConfigCtrl);

                this.current.jsonData.tlsmode = this.current.jsonData.tlsmode || 'none';
                this.current.jsonData.usePreparedStatements = this.current.jsonData.usePreparedStatements || true;
            });

            _export('VerticaConfigCtrl', VerticaConfigCtrl);

            VerticaConfigCtrl.templateUrl = 'partials/config.html';
        }
    };
});
//# sourceMappingURL=config_ctrl.js.map
