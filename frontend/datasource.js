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

    const queries = options.targets.map((target) => {
      return {
        refId: target.refId,
        datasourceId: this.id,
        rawSql: this.templateSrv.replace(target.rawSql),
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
