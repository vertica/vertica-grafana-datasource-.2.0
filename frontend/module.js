
import VerticaDatasource from './datasource';
// import { VerticaQueryCtrl } from './query_ctrl';
import { VerticaConfigCtrl } from './config_ctrl';

class VerticaAnnotationsQueryCtrl {}
VerticaAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

class EmptyQueryCtrl{}
EmptyQueryCtrl.templateUrl = 'partials/query.editor.html';

export {
  VerticaDatasource as Datasource,
  EmptyQueryCtrl as QueryCtrl,
  VerticaConfigCtrl as ConfigCtrl,
  VerticaAnnotationsQueryCtrl as AnnotationsQueryCtrl,
}
