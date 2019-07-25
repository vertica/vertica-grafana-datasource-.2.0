import _ from 'lodash';

export default class ResponseParser {
  constructor($q) {
      this.q = $q
  }

  processQueryResult(res) {
    const data = [];

    if (!res.data.results) {
      return { data: data };
    }

    for (const key in res.data.results) {
      const queryRes = res.data.results[key];

      if (queryRes.series) {
        for (const series of queryRes.series) {
          data.push({
            target: series.name,
            datapoints: series.points,
            refId: queryRes.refId,
            meta: queryRes.meta,
          });
        }
      }

      if (queryRes.tables) {
        for (const table of queryRes.tables) {
          table.type = 'table';
          table.refId = queryRes.refId;
          table.meta = queryRes.meta;
          data.push(table);
        }
      }
    }

    return { data: data };
  }

  parseMetricFindQueryResult(refId, results) {
    if (!results || results.data.length === 0 || results.data.results[refId].meta.rowCount === 0) {
      return [];
    }

    const columns = results.data.results[refId].tables[0].columns;
    const rows = results.data.results[refId].tables[0].rows;
    const textColIndex = this.findColIndex(columns, '__text');
    const valueColIndex = this.findColIndex(columns, '__value');

    if (columns.length === 2 && textColIndex !== -1 && valueColIndex !== -1) {
      return this.transformToKeyValueList(rows, textColIndex, valueColIndex);
    }

    return this.transformToSimpleList(rows);
  }

  transformToKeyValueList(rows, textColIndex, valueColIndex) {
    const res = [];

    for (let i = 0; i < rows.length; i++) {
      if (!this.containsKey(res, rows[i][textColIndex])) {
        res.push({
          text: rows[i][textColIndex],
          value: rows[i][valueColIndex],
        });
      }
    }

    return res;
  }

  transformToSimpleList(rows) {
    const res = [];

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        const value = rows[i][j];
        if (res.indexOf(value) === -1) {
          res.push(value);
        }
      }
    }

    return _.map(res, value => {
      return { text: value };
    });
  }

  findColIndex(columns, colName) {
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].text === colName) {
        return i;
      }
    }

    return -1;
  }

  containsKey(res, key) {
    for (let i = 0; i < res.length; i++) {
      if (res[i].text === key) {
        return true;
      }
    }
    return false;
  }

}
