import React, { PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import {
  DataSourcePluginOptionsEditorProps,
  onUpdateDatasourceOption,
  onUpdateDatasourceSecureJsonDataOption,
  updateDatasourcePluginResetOption,
} from '@grafana/data';
import { VerticaDataSourceOptions, VerticaSecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<VerticaDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    const { options } = this.props;
    const { secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as VerticaSecureJsonData;

    return (
      <div>
        <h3 className="page-heading">Vertica Connection</h3>
        <div className="gf-form-group">
          <div className="gf-form">
            <FormField
              label="Host"
              labelWidth={7}
              inputWidth={30}
              onChange={onUpdateDatasourceOption(this.props, 'url')}
              value={options.url || ''}
              placeholder="localhost:5433"
              required
            />
          </div>
          <div className="gf-form">
            <FormField
              label="Database"
              labelWidth={7}
              inputWidth={30}
              onChange={onUpdateDatasourceOption(this.props, 'database')}
              value={options.database || ''}
              placeholder="database name"
              required
            />
          </div>
          <div className="gf-form-inline">
            <div className="gf-form">
              <FormField
                label="User"
                labelWidth={7}
                inputWidth={15}
                onChange={onUpdateDatasourceOption(this.props, 'user')}
                value={options.user || ''}
                placeholder="user"
                required
              />
            </div>
            <div className="gf-form">
              <SecretFormField
                isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
                value={secureJsonData.password || ''}
                label="Password"
                placeholder="secure json field (backend only)"
                labelWidth={7}
                inputWidth={15}
                onReset={() => updateDatasourcePluginResetOption(this.props, 'password')}
                onChange={onUpdateDatasourceSecureJsonDataOption(this.props, 'password')}
              />
            </div>
          </div>
        </div>
        <div className="gf-form-group">
          <div className="grafana-info-box">
            <h5>User Permission</h5>
            <p>
              The database user should only be granted SELECT permissions on the specified database &amp; tables you
              want to query. Grafana does not validate that queries are safe so queries can contain any SQL statement.
              For example, statements like <code>DELETE FROM user;</code> and <code>DROP TABLE user;</code> would be
              executed. To protect against this we
              <strong>Highly</strong> recommend you create a specific Vertica user with restricted permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
