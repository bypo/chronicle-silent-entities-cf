// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START chronicleSilentEntities]
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const functions = require('@google-cloud/functions-framework');

/**
 * HTTP Cloud Function that returns BigQuery query results
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('chronicleSilentEntities', async (req, res) => {
  // Define the SQL queries
  const sqlQuery1 = `
      SELECT DISTINCT events__intermediary.hostname as gateway, FROM \`chronicle-ita.datalake.events\` as events LEFT JOIN UNNEST(events.intermediary) AS events__intermediary
      WHERE metadata.ingested_timestamp.seconds > @sec_late  ORDER BY gateway LIMIT @limit_count;`
  const sqlQuery2 = `
      SELECT principal.hostname FROM \`chronicle-ita.datalake.events\` WHERE metadata.ingested_timestamp.seconds > @sec_late LIMIT @limit_count;`

  const options1 = {
    query: sqlQuery1,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'EU',
    params: {sec_late: 300, limit_count: 400},
  };

  const options2 = {
    query: sqlQuery2,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'EU',
    params: {sec_late: 300, limit_count: 400},
  };

  // Execute the query
  try {
    const [rows] = await bigquery.query(options1);
    // Send the results
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error querying BigQuery (query1): ${err}`);
  }

  // Execute the query
  try {
    const [rows] = await bigquery.query(options2);
    // Send the results
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error querying BigQuery (query2): ${err}`);
  }

});
// [END chronicleSilentEntities]
