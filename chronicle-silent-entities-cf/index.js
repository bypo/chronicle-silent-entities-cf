// [START chronicleSilentEntities]
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const functions = require('@google-cloud/functions-framework');

var sanitizer = require("string-sanitizer");

/**
 * HTTP Cloud Function that returns BigQuery query results
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('chronicleSilentEntities', async (req, res) => {
  // Define parameters
  const sec_late = (sanitizer.sanitize(req.query.sec_late) || 600);
  const limit_count = (sanitizer.sanitize(req.query.limit_count) || 100 );
  const chronicle_tla = (sanitizer.sanitize(req.query.chronicle_tla) || 'none' );

  if(chronicle_tla=='none')
     res.status(500).send(`Error 'chronicle_tla' http parameter not specified`);

  // Define the SQL queries
  const sqlQuery1 = `
      SELECT principal.hostname as gateway, MAX(metadata.event_timestamp.seconds) as maxtime, count(*) FROM chronicle-${chronicle_tla}.datalake.events as events
      WHERE DATE(hour_time_bucket) > DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) group by 1 having count(*) > 1000 
      and (unix_seconds(current_timestamp()) - maxtime ) > ${sec_late} 
      ORDER BY gateway 
      LIMIT ${limit_count}`
  
  const options1 = {
    query: sqlQuery1,
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
    res.status(500).send(`Error querying BigQuery (query1): ${err} and ${sqlQuery1}`);
    
  }

});
// [END chronicleSilentEntities]
