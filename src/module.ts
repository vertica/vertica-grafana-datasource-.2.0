import { VerticaDatasource } from './datasource';
import { VerticaQueryCtrl } from './query_ctrl';
import { VerticaConfigCtrl } from './config_ctrl';

class VerticaAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';

  /** @ngInject */
  constructor() {}
}

export {
  VerticaDatasource,
  VerticaDatasource as Datasource,
  VerticaQueryCtrl as QueryCtrl,
  VerticaConfigCtrl as ConfigCtrl,
  VerticaAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
