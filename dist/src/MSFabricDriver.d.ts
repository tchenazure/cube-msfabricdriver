/**
 * @copyright Cube Dev, Inc.
 * @license Apache-2.0
 * @fileoverview The `MSFabricDriver` and related types declaration.
 */
import { DriverCapabilities } from '@cubejs-backend/base-driver';
import { JDBCDriver, JDBCDriverConfiguration } from '@cubejs-backend/jdbc-driver';
import { MSFabricQuery } from './MSFabricQuery';
export type MSFabricDriverConfiguration = JDBCDriverConfiguration & {
    /**
     * Driver read-only mode flag.
     */
    readOnly?: boolean;
    /**
     * Poll interval.
     */
    pollInterval?: number;
};
/**
 * MSFabric driver class.
 */
export declare class MSFabricDriver extends JDBCDriver {
    /**
     * Show warning message flag.
     */
    private showSparkProtocolWarn;
    /**
     * Read-only mode flag.
     */
    protected readonly config: MSFabricDriverConfiguration;
    static dialectClass(): typeof MSFabricQuery;
    /**
     * Returns default concurrency value.
     */
    static getDefaultConcurrency(): number;
    /**
     * Class constructor.
     */
    constructor(conf?: Partial<MSFabricDriverConfiguration> & {
        /**
         * Data source name.
         */
        dataSource?: string;
        /**
         * Max pool size value for the [cube]<-->[db] pool.
         */
        maxPoolSize?: number;
        /**
         * Time to wait for a response from a connection after validation
         * request before determining it as not valid. Default - 10000 ms.
         */
        testConnectionTimeout?: number;
    });
    /**
     * @override
     */
    readOnly(): boolean;
    /**
     * @override
     */
    capabilities(): DriverCapabilities;
    /**
     * @override
     */
    setLogger(logger: any): void;
    /**
     * @override
     */
    loadPreAggregationIntoTable(preAggregationTableName: string, loadSql: string, params: unknown[], _options: any): Promise<unknown[]>;
    /**
     * @override
     */
    query<R = unknown>(query: string, values: unknown[]): Promise<R[]>;
    /**
     * Returns pre-aggregation schema name.
     */
    getPreaggsSchemaName(): string;
    showDeprecations(): void;
    /**
     * @override
     */
    protected getCustomClassPath(): Promise<string>;
    /**
     * Returns quoted string.
     */
    quoteIdentifier(identifier: string): string;
    /**
     * Returns the JS type by the MSFabric type.
     */
    toGenericType(columnType: string): string;
}
//# sourceMappingURL=MSFabricDriver.d.ts.map