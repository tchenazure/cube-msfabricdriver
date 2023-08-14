import path from 'path';
import { downloadFile } from './downloadFile';
import { get } from 'env-var';

function acceptedByEnv() {
  const acceptStatus = get('CUBEJS_DB_MSFABRIC_ACCEPT_POLICY');
  if (acceptStatus) {
    console.log('You accepted Terms & Conditions for MSFabric JDBC driver by CUBEJS_DB_MSFABRIC_ACCEPT_POLICY');
  }

  if (acceptStatus === false) {
    console.log('You declined Terms & Conditions for MSFabric JDBC driver by CUBEJS_DB_MSFABRIC_ACCEPT_POLICY');
    console.log('Installation will be skipped');
  }

  return acceptStatus;
}

export async function downloadJDBCDriver(): Promise<string | null> {
  const driverAccepted = acceptedByEnv();

  if (driverAccepted) {
    console.log('Downloading msal4j-1.13.3');

    await downloadFile(
      'https://repo1.maven.org/maven2/com/microsoft/azure/msal4j/1.13.3/msal4j-1.13.3.jar',
      {
        showProgress: true,
        cwd: path.resolve(path.join(__dirname, '..', 'download')),
      }
    );

    console.log('Downloading mssql-jdbc-12.1.0.jre11-preview');
    await downloadFile(
      'https://repo1.maven.org/maven2/com/microsoft/sqlserver/mssql-jdbc/12.1.0.jre11-preview/mssql-jdbc-12.1.0.jre11-preview.jar',
      {
        showProgress: true,
        cwd: path.resolve(path.join(__dirname, '..', 'download')),
      }
    );

    console.log('Download jar files completed');

    return path.resolve(path.join(__dirname, '..', 'download', 'msal4j-1.13.3.jar'));
  }

  return null;
}
