const { client } = require("../config/db");
async function getNewLeadCounts(identity) {
  try {
    const query = `
        SELECT COUNT(*) as leads_count
        FROM oppurtunity.lead l
        WHERE l.idmeta_lead_status = '721fe429ffcb4453ba09354ed4cef3fa'
        AND l.createdby = $1;
    `;
    const res = await client.query(query, [identity]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

const quoteCount = async () => {
  try {
    const query = `
      SELECT COUNT(*) AS quote_count
      FROM quote.quote;
      `;
    const res = await client.query(query);
    return res.rows;
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
};

module.exports = {
  getNewLeadCounts,
  quoteCount,
};
