const { client } = require("../config/db");
async function getLeadTypeData(identity) {
  try {
    const query = `SELECT
    l.idmeta_lead_type as lead_meta_data,
    om.meta_data_name as lead_type,
    COUNT(l.idmeta_lead_type) AS lead_count
    FROM
    oppurtunity."lead" l
    INNER JOIN
    oppurtunity.op_metadata om
    ON om.idmetadata = l.idmeta_lead_type
    WHERE
    identity_lead_createdby = $1
    GROUP BY
    l.idmeta_lead_type, om.meta_data_name
    ORDER BY
    lead_count DESC;`;
    const res = await client.query(query, [identity]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query for leadData", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function getLeadStatusData(identity) {
  try {
    const query = `
      SELECT
      l.idmeta_lead_status AS lead_meta_status_data,
      om.meta_data_name AS lead_status,
      COUNT(l.idmeta_lead_status) AS lead_status_count,
      om.sub_meta_detail::text AS meta_detail  -- Convert JSON to text
      FROM
      oppurtunity."lead" l
      INNER JOIN
      oppurtunity.op_metadata om
      ON 
      om.idmetadata = l.idmeta_lead_status
      WHERE
      identity_lead_createdby = $1
      GROUP BY
      l.idmeta_lead_status, om.meta_data_name, om.sub_meta_detail::text  -- Convert to text in GROUP BY
      ORDER BY
      lead_status_count DESC;
    `;
    const res = await client.query(query, [identity]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query for leadData", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function allLeads(identity, leadWithPagination) {
  try {
    const {leadStatus, pageNumber, pageCount} = leadWithPagination
    const query = `
      SELECT
      e1.fullname,
      l.idlead,
      ec.contact_value AS mobile,
      l.idmeta_lead_type,
      om.meta_data_name AS leadtype
      FROM
      oppurtunity."lead" l
      INNER JOIN
      oppurtunity.op_metadata om ON om.idmetadata = l.idmeta_lead_type
      INNER JOIN
      core.entity e1 ON e1."identity" = l.identity_oppurtunity
      INNER JOIN
      core.entity e ON e."identity" = l.identity_lead_createdby
      LEFT JOIN
      core.entity_contact ec ON ec."identity" = e1."identity"
      WHERE
      ec.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705' AND
      l.identity_lead_createdby = $1 AND -- dynamic Agent Entity user role
      l.idmeta_lead_status = $2
      ORDER BY
      ec.idmeta_contact_type DESC
      LIMIT $3 OFFSET ($4 - 1) * $3;
    `;
    const res = await client.query(query, [identity, leadStatus,pageCount, pageNumber]);
    return res.rows;
  } catch (err) {
    console.error("Error executing query for allLeads", err.stack);
    throw err;
  }
}

module.exports = {
  getLeadTypeData,
  getLeadStatusData,
  allLeads,
};
