
export class VerticaConfigCtrl {

    /** @ngInject */
    constructor($scope) {
        this.current.jsonData.tlsmode = this.current.jsonData.tlsmode || 'none';
        this.current.jsonData.usePreparedStatements = this.current.jsonData.usePreparedStatements || true;
    }
}

VerticaConfigCtrl.templateUrl = 'partials/config.html';