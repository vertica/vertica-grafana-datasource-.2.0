import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineLabel, Switch, Field, InfoBox } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps, SelectableValue } from '@grafana/data';
import { VerticaDataSourceOptions, VerticaSecureJsonData } from './types';

const { SecretFormField, FormField, Select } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<VerticaDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      path: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiKey: event.target.value,
      },
    });
  };

  onResetAPIKey = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiKey: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiKey: '',
      },
    });
  };

  onHostChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      host: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onDatabaseChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      database: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onUserChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      user: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onPreparedStatementChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      usePreparedStatement: event.currentTarget.checked,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onConnectionLoadbalancingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      useConnectionLoadbalancing: event.currentTarget.checked,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onPasswordReset = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        password: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        password: '',
      },
    });
  };

  onPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        password: event.target.value,
      },
    });
  };

  onSSLModeChange = (selectedValue: SelectableValue<string>) => {
    const { onOptionsChange, options } = this.props;
    let val: 'none' | 'server' | 'server-strict';
    switch (selectedValue.value) {
      case 'none':
        val = 'none';
        break;
      case 'server':
        val = 'server';
        break;
      case 'server-strict':
        val = 'server-strict';
        break;
      default:
        val = 'none';
    }

    const jsonData = {
      ...options.jsonData,
      sslMode: val,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as VerticaSecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Host"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onHostChange}
            value={jsonData.host || ''}
            placeholder="localhost:5433"
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label="Database"
              labelWidth={6}
              inputWidth={20}
              onChange={this.onDatabaseChange}
              value={jsonData.database || ''}
              placeholder="vdb"
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label="User"
              labelWidth={6}
              inputWidth={8}
              onChange={this.onUserChange}
              value={jsonData.user || ''}
              placeholder="dbadmin"
            />
          </div>
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.password) as boolean}
              value={secureJsonData.password || ''}
              label="Password"
              placeholder="password"
              labelWidth={6}
              inputWidth={8}
              onReset={this.onPasswordReset}
              onChange={this.onPasswordChange}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineLabel width="auto"> SSL Mode </InlineLabel>
            <Select
              options={[
                { label: 'none', value: 'none' },
                { label: 'server', value: 'server' },
                { label: 'server-strict', value: 'server-strict' },
              ]}
              value={{ label: jsonData.sslMode || 'none', value: jsonData.sslMode || 'none' }}
              onChange={this.onSSLModeChange}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <Field
              label="Use Prepared Statement"
              description="If not set, query arguments will be interpolated into the query on the client side. If set, query arguments will be bound on the server."
            >
              <Switch
                value={jsonData.usePreparedStatement}
                disabled={false}
                onChange={this.onPreparedStatementChange}
                css={{ marginBottom: 'auto', marginTop: 'auto' }}
              />
            </Field>
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <Field
              label="Use Connection Load balancing"
              description="If set the query will be distrubted to vertica nodes"
            >
              <Switch
                value={jsonData.useConnectionLoadbalancing}
                disabled={false}
                onChange={this.onConnectionLoadbalancingChange}
                css={{ marginBottom: 'auto', marginTop: 'auto' }}
              />
            </Field>
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InfoBox title="User Permission" severity="info">
              <p>
                The database user should only be granted SELECT permissions on the specified database &amp; tables you
                want to query. Grafana does not validate that queries are safe so queries can contain any SQL statement.
                For example, statements like <code>DELETE FROM user;</code> and <code>DROP TABLE user;</code> would be
                executed. To protect against this we <strong>Highly</strong> recommend you create a specific Vertica
                user with restricted permissions.
              </p>
            </InfoBox>
          </div>
        </div>
      </div>
    );
  }
}
