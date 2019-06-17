import { QueryCtrl } from 'app/plugins/sdk';

export class VerticaQueryCtrl extends QueryCtrl {

    /** @ngInject */
    constructor($scope, $injector, templateSrv, $q, uiSegmentSrv) {
      super($scope, $injector);
  
      this.target = this.target
      this.target.format = 'table';
      this.target.rawSql = this.target.rawSql || 'SELECT \n\
$__time(end_time), \n\
average_cpu_usage_percent \n\
FROM \n\
v_monitor.cpu_usage \n\
WHERE \n\
$__timeFilter(end_time)';
    }
}

VerticaQueryCtrl.templateUrl = 'partials/query.editor.html';