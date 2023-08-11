"use strict";
/**
 * @copyright Cube Dev, Inc.
 * @license Apache-2.0
 * @fileoverview The `MSFabricDriver` and related types declaration.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSFabricDriver = void 0;
const shared_1 = require("@cubejs-backend/shared");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jdbc_driver_1 = require("@cubejs-backend/jdbc-driver");
const MSFabricQuery_1 = require("./MSFabricQuery");
const installer_1 = require("./installer");
async function fileExistsOr(fsPath, fn) {
    if (fs_1.default.existsSync(fsPath)) {
        return fsPath;
    }
    return fn();
}
const MSFabricToGenericType = {
    'decimal(10,0)': 'bigint',
};
async function resolveJDBCDriver() {
    return fileExistsOr(path_1.default.join(process.cwd(), 'msal4j-1.13.3.jar'), async () => fileExistsOr(path_1.default.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'), async () => {
        const pathOrNull = await (0, installer_1.downloadJDBCDriver)();
        if (pathOrNull) {
            return pathOrNull;
        }
        throw new Error('Please download and place msal4j-1.13.3.jar inside your ' +
            'project directory');
    }));
}
/**
 * MSFabric driver class.
 */
class MSFabricDriver extends jdbc_driver_1.JDBCDriver {
    static dialectClass() {
        return MSFabricQuery_1.MSFabricQuery;
    }
    /**
     * Returns default concurrency value.
     */
    static getDefaultConcurrency() {
        return 2;
    }
    /**
     * Class constructor.
     */
    constructor(conf = {}) {
        const dataSource = conf.dataSource ||
            (0, shared_1.assertDataSource)('default');
        let showSparkProtocolWarn = false;
        let url = conf?.url ||
            (0, shared_1.getEnv)('connectionstring', { dataSource }) ||
            (0, shared_1.getEnv)('jdbcUrl', { dataSource });
        const config = {
            ...conf,
            url,
            dbType: 'msfabric',
            drivername: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
            customClassPath: undefined,
            properties: {
                // PWD-parameter passed to the connection string has higher priority,
                // so we can set this one to an empty string to avoid a Java error.
                PWD: (0, shared_1.getEnv)('password', { dataSource }) ||
                    '',
                UserAgentEntry: 'CubeDev_Cube',
            },
            database: (0, shared_1.getEnv)('dbName', { required: false, dataSource }),
            pollInterval: (conf?.pollInterval ||
                (0, shared_1.getEnv)('dbPollMaxInterval', { dataSource })) * 1000,
        };
        super(config);
        this.config = config;
        this.showSparkProtocolWarn = showSparkProtocolWarn;
    }
    /**
     * @override
     */
    readOnly() {
        return !!this.config.readOnly;
    }
    /**
     * @override
     */
    capabilities() {
        return { unloadWithoutTempTable: true };
    }
    /**
     * @override
     */
    setLogger(logger) {
        super.setLogger(logger);
        this.showDeprecations();
    }
    /**
     * @override
     */
    async loadPreAggregationIntoTable(preAggregationTableName, loadSql, params, _options) {
        return super.loadPreAggregationIntoTable(preAggregationTableName, loadSql, params, _options);
    }
    /**
     * @override
     */
    async query(query, values) {
        return super.query(query, values);
    }
    /**
     * Returns pre-aggregation schema name.
     */
    getPreaggsSchemaName() {
        const schema = (0, shared_1.getEnv)('preAggregationsSchema');
        if (schema) {
            return schema;
        }
        else {
            const devMode = process.env.NODE_ENV !== 'production' || (0, shared_1.getEnv)('devMode');
            return devMode
                ? 'dev_pre_aggregations'
                : 'prod_pre_aggregations';
        }
    }
    showDeprecations() {
    }
    /**
     * @override
     */
    async getCustomClassPath() {
        return resolveJDBCDriver();
    }
    /**
     * Returns quoted string.
     */
    quoteIdentifier(identifier) {
        return `\`${identifier}\``;
    }
    /**
     * Returns the JS type by the MSFabric type.
     */
    toGenericType(columnType) {
        return MSFabricToGenericType[columnType.toLowerCase()] || super.toGenericType(columnType);
    }
}
exports.MSFabricDriver = MSFabricDriver;
//# sourceMappingURL=MSFabricDriver.js.map