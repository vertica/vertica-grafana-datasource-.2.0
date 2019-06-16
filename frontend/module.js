
import VerticaDatasource from './datasource';
//import { VerticaQueryCtrl } from './query_ctrl';
import { VerticaConfigCtrl } from './config_ctrl';
import { QueryCtrl } from 'app/plugins/sdk';

class VerticaAnnotationsQueryCtrl {}
VerticaAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

class EmptyQueryCtrl extends QueryCtrl {

  /** @ngInject */
  constructor($scope, $injector, templateSrv, $q, uiSegmentSrv) {
    super($scope, $injector);

    this.target = this.target
    this.target.format = 'table';
    this.target.rawSql = 'SELECT \n\
$__time(end_time), \n\
average_cpu_usage_percent \n\
FROM \n\
v_monitor.cpu_usage \n\
WHERE \n\
$__timeFilter(end_time)';
 }
}
EmptyQueryCtrl.templateUrl = 'partials/query.editor.1.html';

export {
  VerticaDatasource as Datasource,
  //VerticaQueryCtrl as QueryCtrl,
  EmptyQueryCtrl as QueryCtrl,
  VerticaConfigCtrl as ConfigCtrl,
  VerticaAnnotationsQueryCtrl as AnnotationsQueryCtrl,
}
