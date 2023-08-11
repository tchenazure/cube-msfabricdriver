"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadJDBCDriver = void 0;
const path_1 = __importDefault(require("path"));
const shared_1 = require("@cubejs-backend/shared");
function acceptedByEnv() {
    const acceptStatus = (0, shared_1.getEnv)('msfabricAcceptPolicy');
    if (acceptStatus) {
        console.log('You accepted Terms & Conditions for MSFabric JDBC driver by CUBEJS_DB_MSFABRIC_ACCEPT_POLICY');
    }
    if (acceptStatus === false) {
        console.log('You declined Terms & Conditions for MSFabric JDBC driver by CUBEJS_DB_MSFABRIC_ACCEPT_POLICY');
        console.log('Installation will be skipped');
    }
    return acceptStatus;
}
async function downloadJDBCDriver() {
    const driverAccepted = acceptedByEnv();
    if (driverAccepted) {
        console.log('Downloading msal4j-1.13.3');
        await (0, shared_1.downloadAndExtractFile)('https://repo1.maven.org/maven2/com/microsoft/azure/msal4j/1.13.3/msal4j-1.13.3.jar', {
            showProgress: true,
            cwd: path_1.default.resolve(path_1.default.join(__dirname, '..', 'download')),
        });
        console.log('Downloading mssql-jdbc-12.1.0.jre11-preview');
        await (0, shared_1.downloadAndExtractFile)('https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.1.0.jre11-preview/mssql-jdbc-12.1.0.jre11-preview.jar', {
            showProgress: true,
            cwd: path_1.default.resolve(path_1.default.join(__dirname, '..', 'download')),
        });
        console.log('Download jar files completed');
        return path_1.default.resolve(path_1.default.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'));
    }
    return null;
}
exports.downloadJDBCDriver = downloadJDBCDriver;
//# sourceMappingURL=installer.js.map