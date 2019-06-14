
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

    this.target.rawQuery = true;

    // this.target = this.target;
    // this.queryModel = new VerticaQuery(this.target, templateSrv, this.panel.scopedVars);
    // this.metaBuilder = new VerticaMetaQuery(this.target, this.queryModel);
    // this.updateProjection();

    // this.formats = [{ text: 'Time series', value: 'time_series' }, { text: 'Table', value: 'table' }];

    // if (!this.target.rawSql) {
    //   // special handling when in table panel
    //   if (this.panelCtrl.panel.type === 'table') {
    //     this.target.format = 'table';
    //     this.target.rawSql = 'SELECT 1';
    //     this.target.rawQuery = true;
    //   } else {
    //     this.target.rawSql = defaultQuery;
    //     this.target.rawQuery = true;
    //     // TODO: re-enable "find a default metric table"
    //     // this.datasource.metricFindQuery(this.metaBuilder.getFindMetricTableSQL()).then(result => {
    //     //   if (result.length > 0) {
    //     //     this.target.table = result[0].text;
    //     //     let segment = this.uiSegmentSrv.newSegment(this.target.table);
    //     //     this.tableSegment.html = segment.html;
    //     //     this.tableSegment.value = segment.value;

    //     //     this.target.timeColumn = result[1].text;
    //     //     segment = this.uiSegmentSrv.newSegment(this.target.timeColumn);
    //     //     this.timeColumnSegment.html = segment.html;
    //     //     this.timeColumnSegment.value = segment.value;

    //     //     this.target.timeColumnType = 'timestamp';
    //     //     this.target.select = [[{ type: 'column', params: [result[2].text] }]];
    //     //     this.updateProjection();
    //     //     this.panelCtrl.refresh();
    //     //   }
    //     // });
    //   }
    // }

    // // If we don't have any table name yet, put a placeholder.
    // if (!this.target.table) {
    //   this.schemaSegment = uiSegmentSrv.newSegment({ value: 'select schema', fake: true });
    //   this.tableSegment = uiSegmentSrv.newSegment({ value: 'select table', fake: true });
    // } else {
    //   if (this.target.table.includes('.')) {
    //     const parts = this.target.table.split('.');
    //     this.schemaSegment = uiSegmentSrv.newSegment(parts[0]);
    //     this.tableSegment = uiSegmentSrv.newSegment(parts[1]);
    //   } else {
    //     this.schemaSegment = uiSegmentSrv.newSegment({ value: 'select schema', fake: true });
    //     this.tableSegment = uiSegmentSrv.newSegment(this.target.table);
    //   }
    // }

    // this.timeColumnSegment = uiSegmentSrv.newSegment(this.target.timeColumn);
    // this.metricColumnSegment = uiSegmentSrv.newSegment(this.target.metricColumn);

    // this.buildSelectMenu();
    // this.whereAdd = this.uiSegmentSrv.newPlusButton();
    // this.groupAdd = this.uiSegmentSrv.newPlusButton();

    // this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
    // this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
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
