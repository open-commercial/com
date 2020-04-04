// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  idSucursal: 1,
  appVersion: Math.floor(Math.random() * 100), // random entre 0 y 100
  appName: 'SIC_COM'
};
