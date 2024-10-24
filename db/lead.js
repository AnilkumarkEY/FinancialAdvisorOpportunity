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
    const res = await client.query(query,[identity]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query for leadData", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function getLeadStatusData(identity) {
  try {
    const query = `SELECT
      l.idmeta_lead_status as lead_meta_status_data,
      om.meta_data_name as lead_status,
      COUNT(l.idmeta_lead_status) AS lead_status_count
      FROM
      oppurtunity."lead" l
      INNER JOIN
      oppurtunity.op_metadata om
      ON om.idmetadata = l.idmeta_lead_status
      WHERE
      identity_lead_createdby = $1
      GROUP BY
      l.idmeta_lead_status, om.meta_data_name
      ORDER BY
      lead_status_count DESC;
    `;
    const res = await client.query(query,[identity]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query for leadData", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function allLeads(identity,leadStatus) {
  try {
    const query = `
    select
      e1.fullname,
      l.idlead,
      ec.contact_value as mobile,
      l.idmeta_lead_type,
      om.meta_data_name as leadtype
      from oppurtunity."lead" l
      inner join oppurtunity.op_metadata om on om.idmetadata = l.idmeta_lead_type
      inner join core.entity e1 on e1."identity" = l.identity_oppurtunity
      inner join core.entity e on e."identity" = l.identity_lead_createdby
      left join core.entity_contact ec on ec."identity" = e1."identity"
      where
      ec.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705'and -- and -- hardcoded
      l.identity_lead_createdby = $1 and ---  dynamic Agent Entity user role
      l.idmeta_lead_status = $2
      order by ec.idmeta_contact_type desc
    `;
    const res = await client.query(query,[identity,leadStatus]);
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
