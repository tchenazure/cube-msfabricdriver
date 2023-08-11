"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const shared_1 = require("@cubejs-backend/shared");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const installer_1 = require("./installer");
(async () => {
    try {
        if ((!fs_1.default.existsSync(path_1.default.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'))) ||
            (!fs_1.default.existsSync(path_1.default.join(__dirname, '..', 'download', 'mssql-jdbc-12.1.0.jre11-preview.jar')))) {
            await (0, installer_1.downloadJDBCDriver)();
        }
    }
    catch (e) {
        await (0, shared_1.displayCLIError)(e, 'Cube.js Microsoft Fabric JDBC Installer');
    }
})();
//# sourceMappingURL=post-install.js.map