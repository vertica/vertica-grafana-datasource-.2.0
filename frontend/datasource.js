import _ from 'lodash';
import ResponseParser from './response_parser';

export default class VerticaDatasource {

  constructor(instanceSettings, backendSrv, $q, templateSrv, timeSrv) {
    this.instanceSettings = instanceSettings;
    this.backendSrv = backendSrv;
    this.q = $q;
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.responseParser = new ResponseParser(this.q);
    this.templateSrv = templateSrv;
    this.timeSrv = timeSrv;
  }

  query(options) {

    console.log(options)

    var newTargets = options.targets

    const queries = newTargets.map((target) => {

      // console.log("*******")
      // console.log(target)
      // console.log(target["rawSql"])
      // console.log("refId: ", target.refId)
      // console.log("rawSQL (in):  ", target.rawSql)
      // console.log("rawSQL (out): ", this.templateSrv.replace(target.rawSql))

      return {
        refId: target.refId,
        datasourceId: this.id,
        rawSql: "SELECT \n$__time(end_time), \naverage_cpu_usage_percent \nFROM \nv_monitor.cpu_usage \nWHERE \n$__timeFilter(end_time)",
        //rawSql: this.templateSrv.replace(target.rawSql),
        format: target.format,
      };
    })

    if (queries.length === 0) {
      return this.$q.when({ data: [] });
    }

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: queries,
        },
      })
      .then(this.responseParser.processQueryResult);
  }

  metricFindQuery(query, optionalOptions) {
    let refId = 'tempvar';
    if (optionalOptions && optionalOptions.variable && optionalOptions.variable.name) {
      refId = optionalOptions.variable.name;
    }

    const interpolatedQuery = {
      refId: refId,
      datasourceId: this.id,
      rawSql: this.templateSrv.replace(query, {}, this.interpolateVariable),
      format: 'table',
    };

    const range = this.timeSrv.timeRange();
    const data = {
      queries: [interpolatedQuery],
      from: range.from.valueOf().toString(),
      to: range.to.valueOf().toString(),
    };

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: data,
      })
      .then(data => this.responseParser.parseMetricFindQueryResult(refId, data));
  }

  interpolateVariable(value, variable) {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return this.queryModel.quoteLiteral(value);
      } else {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    const quotedValues = _.map(value, v => {
      return this.queryModel.quoteLiteral(v);
    });
    return quotedValues.join(',');
  }

  annotationQuery(options) {
    if (!options.annotation.rawQuery) {
      return this.$q.reject({
        message: 'Query missing in annotation definition',
      });
    }

    const query = {
      refId: options.annotation.name,
      datasourceId: this.id,
      rawSql: this.templateSrv.replace(options.annotation.rawQuery, options.scopedVars, this.interpolateVariable),
      format: 'table',
    };

    return this.backendSrv
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: {
          from: options.range.from.valueOf().toString(),
          to: options.range.to.valueOf().toString(),
          queries: [query],
        },
      })
      .then(data => this.responseParser.transformAnnotationResponse(options, data));
  }

  testDatasource() {
    return this.metricFindQuery('SELECT VERSION()', {})
      .then(res => {
        return { status: 'success', message: 'Connection to ' + res[0].text + ' successful!' };
      })
      .catch(err => {
        if (err.data && err.data.message) {
          return { status: 'error', message: err.data.message };
        } else {
          return { status: 'error', message: err.status };
        }
      });
  }
}
