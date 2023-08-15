/**
 * @copyright Cube Dev, Inc.
 * @license Apache-2.0
 * @fileoverview The `MSFabricDriver` and related types declaration.
 */

import {
  getEnv,
  assertDataSource,
} from '@cubejs-backend/shared';
import { get } from 'env-var';
import fs from 'fs';
import path from 'path';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  ContainerSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { DriverCapabilities, QueryOptions, UnloadOptions } from '@cubejs-backend/base-driver';
import {
  JDBCDriver,
  JDBCDriverConfiguration,
} from '@cubejs-backend/jdbc-driver';
import { MSFabricQuery } from './MSFabricQuery';
import { downloadJDBCDriver } from './installer';

export type MSFabricDriverConfiguration = JDBCDriverConfiguration &
  {
    /**
     * Driver read-only mode flag.
     */
    readOnly?: boolean,

    /**
     * Poll interval.
     */
    pollInterval?: number,

  };

async function fileExistsOr(
  fsPath: string,
  fn: () => Promise<string>,
): Promise<string> {
  if (fs.existsSync(fsPath)) {
    return fsPath;
  }
  return fn();
}

type ShowTableRow = {
  database: string,
  tableName: string,
  isTemporary: boolean,
};

type ShowDatabasesRow = {
  databaseName: string,
};

const MSFabricToGenericType: Record<string, string> = {
  'decimal(10,0)': 'bigint',
};

async function resolveJDBCDriver(): Promise<string> {
  return fileExistsOr(
    path.join(process.cwd(), 'msal4j-1.13.3.jar'),
    async () => fileExistsOr(
      path.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'),
      async () => {
        const pathOrNull = await downloadJDBCDriver();
        if (pathOrNull) {
          return pathOrNull;
        }
        throw new Error(
          'Please download and place msal4j-1.13.3.jar inside your ' +
          'project directory'
        );
      }
    )
  );
}

/**
 * MSFabric driver class.
 */
export class MSFabricDriver extends JDBCDriver {
  /**
   * Show warning message flag.
   */
  private showSparkProtocolWarn: boolean;

  /**
   * Read-only mode flag.
   */
  protected readonly config: MSFabricDriverConfiguration;

  public static dialectClass() {
    return MSFabricQuery;
  }

  /**
   * Returns default concurrency value.
   */
  public static getDefaultConcurrency(): number {
    return 2;
  }

  /**
   * Class constructor.
   */
  public constructor(
    conf: Partial<MSFabricDriverConfiguration> & {
      /**
       * Data source name.
       */
      dataSource?: string,

      /**
       * Max pool size value for the [cube]<-->[db] pool.
       */
      maxPoolSize?: number,

      /**
       * Time to wait for a response from a connection after validation
       * request before determining it as not valid. Default - 10000 ms.
       */
      testConnectionTimeout?: number,
    } = {},
  ) {
    const dataSource =
      conf.dataSource ||
      assertDataSource('default');

    let showSparkProtocolWarn = false;
    let url: string =
      conf?.url ||
      getEnv('jdbcUrl', { dataSource });

    const config: MSFabricDriverConfiguration = {
      ...conf,
      url,
      dbType: 'msfabric',
      drivername: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
      customClassPath: undefined,
      properties: {
        // PWD-parameter passed to the connection string has higher priority,
        // so we can set this one to an empty string to avoid a Java error.
        PWD:
          getEnv('sqlPassword', { dataSource }) ||
          '',
        UserAgentEntry: 'CubeDev_Cube',
      },
      database: getEnv('dbName', { required: false, dataSource }),
      pollInterval: (
        conf?.pollInterval ||
        getEnv('dbPollMaxInterval', { dataSource })
      ) * 1000,
    };
    super(config);
    this.config = config;
    this.showSparkProtocolWarn = showSparkProtocolWarn;
  }

  /**
   * @override
   */
  public readOnly() {
    return !!this.config.readOnly;
  }

  /**
   * @override
   */
  public capabilities(): DriverCapabilities {
    return { unloadWithoutTempTable: true };
  }

  /**
   * @override
   */
  public setLogger(logger: any) {
    super.setLogger(logger);
    this.showDeprecations();
  }

  /**
   * @override
   */
  public async loadPreAggregationIntoTable(
    preAggregationTableName: string,
    loadSql: string,
    params: unknown[],
    _options: any,
  ) {

      return super.loadPreAggregationIntoTable(
        preAggregationTableName,
        loadSql,
        params,
        _options,
      );
    
  }

  /**
   * @override
   */
  public async query<R = unknown>(
    query: string,
    values: unknown[],
  ): Promise<R[]> {
    
      return super.query(query, values);
   
  }

  /**
   * Returns pre-aggregation schema name.
   */
  public getPreaggsSchemaName(): string {
    const schema = getEnv('preAggregationsSchema');
    if (schema) {
      return schema;
    } else {
      const devMode =
        process.env.NODE_ENV !== 'production' || getEnv('devMode');
      return devMode
        ? 'dev_pre_aggregations'
        : 'prod_pre_aggregations';
    }
  }


  public showDeprecations() {

  }

  /**
   * @override
   */
  protected async getCustomClassPath() {
    return resolveJDBCDriver();
  }

  /**
   * Returns quoted string.
   */
  public quoteIdentifier(identifier: string): string {
    return `\`${identifier}\``;
  }

  /**
   * Returns the JS type by the MSFabric type.
   */
  public toGenericType(columnType: string): string {
    return MSFabricToGenericType[columnType.toLowerCase()] || super.toGenericType(columnType);
  }


}
