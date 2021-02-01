import { DataSourceInstanceSettings, MetricFindValue, DataFrame, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';
import { VerticaDataSourceOptions, VerticaQuery } from './types';

export class DataSource extends DataSourceWithBackend<VerticaQuery, VerticaDataSourceOptions> {
  templateSrv;
  constructor(instanceSettings: DataSourceInstanceSettings<VerticaDataSourceOptions>) {
    super(instanceSettings);
    this.templateSrv = getTemplateSrv();
  }

  applyTemplateVariables(query: VerticaQuery, scopedVars: ScopedVars): VerticaQuery {
    query.queryTemplated = this.templateSrv.replace(query.queryString, scopedVars);
    return query;
  }

  async metricFindQuery(query: string, options?: any) {
    const findVal: MetricFindValue[] = [];
    if (!query) {
      return Promise.resolve(findVal);
    }
    const response = await this.query({
      targets: [
        {
          queryType: 'table',
          queryString: query,
          queryTemplated: query,
        },
      ],
    } as any).toPromise();

    if (response.error) {
      throw new Error(response.error.message);
    }

    const data = response.data[0] as DataFrame;
    const textField = data.fields.find(f => f.name === '_text');
    const valueField = data.fields.find(f => f.name === '_value');

    switch (true) {
      case data.fields.length > 3:
        throw new Error(
          `Received more than two (${data.fields.length}) fields: ${data.fields.map(x => x.name).join(',')}`
        );
        break;
      case textField === undefined:
        throw new Error(
          `Variable query must have atleast one column with name '_text' fields: ${data.fields
            .map(x => x.name)
            .join(',')}`
        );
        break;
    }

    for (let i = 0; i < data.fields[0].values.length; i++) {
      let metricValue: MetricFindValue = {
        text: '',
        value: undefined,
      } as MetricFindValue;
      metricValue.text = textField?.values.toArray()[i];
      if (valueField === undefined) {
        metricValue.value = textField?.values.toArray()[i];
      } else {
        metricValue.value = valueField?.values.toArray()[i];
      }

      findVal.push(metricValue);
    }
    return findVal;
  }
}
