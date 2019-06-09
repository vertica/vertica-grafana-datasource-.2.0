export class VerticaConfigCtrl {
  current: any;

  static templateUrl = 'partials/config.html';

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData.tlsmode = this.current.jsonData.tlsmode || 'none';
    this.current.jsonData.usePreparedStatements = this.current.jsonData.usePreparedStatements || true;
  }
}
