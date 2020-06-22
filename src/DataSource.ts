import { DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getBackendSrv, TemplateSrv, toDataQueryResponse } from '@grafana/runtime';
import { VerticaDataSourceOptions, VerticaQuery } from './types';
import { MetricFindValue } from '@grafana/data/types/datasource';
import { Table } from 'apache-arrow';
import _ from 'lodash';

export class DataSource extends DataSourceWithBackend<VerticaQuery, VerticaDataSourceOptions> {
  private templateSrv: TemplateSrv;

  constructor(instanceSettings: DataSourceInstanceSettings<VerticaDataSourceOptions>, templateSrv: TemplateSrv) {
    super(instanceSettings);
    this.templateSrv = templateSrv;
  }

  // @ts-ignore
  applyTemplateVariables(query: VerticaQuery, scopedVars: ScopedVars): VerticaQuery {
    return {
      ...query,
      rawSql: this.templateSrv.replace(query.rawSql, scopedVars, this.interpolateVariable),
    };
  }

  interpolateVariable(value: any, variable: any) {
    if (typeof value === 'string') {
      if (variable.multi || variable.includeAll) {
        return "'" + value.replace(/'/g, `''`) + "'";
      } else {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value;
    }

    const quotedValues = _.map(value, (v: string) => {
      return "'" + v.replace(/'/g, `''`) + "'";
    });
    return quotedValues.join(',');
  }

  metricFindQuery?(query: any, optionalOptions?: any): Promise<MetricFindValue[]> {
    const refId = optionalOptions.variable.name;

    const interpolatedQuery = {
      refId: refId,
      datasourceId: this.id,
      rawSql: this.templateSrv.replace(query, {}, this.interpolateVariable),
      format: 'table',
    };

    const range = optionalOptions.range;
    const data = {
      queries: [interpolatedQuery],
      from: range?.from.valueOf().toString(),
      to: range?.to.valueOf().toString(),
    };

    return getBackendSrv()
      .datasourceRequest({
        url: '/api/tsdb/query',
        method: 'POST',
        data: data,
      })
      .then(resp => {
        const data = toDataQueryResponse(resp);
        const table: Table = data.data[0].table;
        const col = table.getColumnAt(0);
        return _.map(col?.toArray(), v => ({ text: v }));
      });
  }
}
