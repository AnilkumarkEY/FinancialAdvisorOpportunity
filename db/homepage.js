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

const getApplicationTrackerDetails = async (
  isCount,
  status,
  limit,
  offset,
  keyword = ""
) => {
  try {
    if (isCount) {
      let query = `SELECT COUNT(*), ROUND(SUM(premium),2) as TotalPremium FROM newbusiness.application_data WHERE status = $1`;
      const res = await client.query(query, [status]);
      return res?.rows[0] || 0;
    } else {
      let query = `SELECT *, TO_CHAR(updated_at, 'DDth Mon YYYY') FROM newbusiness.application_data WHERE status = $1 `;
      if (keyword) {
        query += ` AND (application_id ILIKE '%${keyword}%' OR application_json->'personalDetails'->>'firstName' ILIKE '%${keyword}%' OR application_json->'personalDetails'->>'middleName' ILIKE '%${keyword}%' OR application_json->'personalDetails'->>'lastName' ILIKE '%${keyword}%') `;
      }
      query += ` ORDER BY id DESC LIMIT $2 OFFSET $3`;
      console.log(query);
      const res = await client.query(query, [status, limit, offset]);
      return res?.rows || [];
    }
  } catch (error) {
    console.error("Error: ", error);
    throw error;
  }
};

module.exports = {
  getNewLeadCounts,
  quoteCount,
  getApplicationTrackerDetails,
};
