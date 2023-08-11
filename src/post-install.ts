import 'source-map-support/register';

import { displayCLIError } from '@cubejs-backend/shared';

import fs from 'fs';
import path from 'path';
import { downloadJDBCDriver } from './installer';

(async () => {
  try {
    if (
      (!fs.existsSync(path.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'))) ||
      (!fs.existsSync(path.join(__dirname, '..', 'download', 'mssql-jdbc-12.1.0.jre11-preview.jar'))) 
    ) {
      await downloadJDBCDriver();
    }
  } catch (e: any) {
    await displayCLIError(e, 'Cube.js Microsoft Fabric JDBC Installer');
  }
})();
