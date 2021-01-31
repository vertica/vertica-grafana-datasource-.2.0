import defaults from 'lodash/defaults';

import React, { PureComponent, FormEvent } from 'react';
import { TextArea, InlineLabel } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, VerticaDataSourceOptions, VerticaQuery } from './types';

type Props = QueryEditorProps<DataSource, VerticaQuery, VerticaDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: FormEvent<HTMLTextAreaElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, queryString: event.currentTarget.value });
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryString } = query;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineLabel width="auto"> Query </InlineLabel>
          <TextArea
            name="querytext"
            value={queryString}
            onChange={this.onQueryTextChange}
            css={{}}
            width="auto"
            rows={queryString.split(/\r\n|\r|\n/).length}
            spellCheck={false}
            required
          />
        </div>
      </div>
    );
  }
}
