// Copyright (c) 2019 Micro Focus or one of its affiliates.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
