/* eslint import/no-unassigned-import: off */
const sqlService = require('../src/services/sqlservice');

(async () => {
  const response = await sqlService.getAccounts(undefined, 'M000')
  console.dir(response)
})()
