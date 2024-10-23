const { client } = require("../config/db");
async function getLeadData() {
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
    identity_lead_createdby = '5dceb723474645b1b5958eda0d97f6c2'
GROUP BY
    l.idmeta_lead_type, om.meta_data_name
ORDER BY
    lead_count DESC;`;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query for leadData", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function allLeads() {
  try {
    const query = `
select e.fullname,l.idlead,ec.contact_value as mobile,l.idmeta_lead_type as status from oppurtunity."lead" l 

inner join core.entity e on e."identity" = l.identity_lead_createdby 

inner join core.entity_urc_auth eua on eua."identity" = e."identity" 

left join core.entity_contact ec on ec.identity_urc_auth = eua.identity_urc_auth 

where 

ec.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705' and -- hardcoded

eua.identity_urc_auth = '7bd1f963d5094d3fbd492a8c947cb104'and ---  dynamic Agent Entity user role

l.idmeta_lead_status = '721fe429ffcb4453ba09354ed4cef3fa' --- harcode lead type - NEW
        `;
    /* inner join core.entity e on e."identity" = l.identity_lead_createdby 
        inner join core.entity_urc_auth eua on eua."identity" = e."identity" 
        left join core.entity_contact ec on ec.identity_urc_auth = eua.identity_urc_auth 
        
        */
    const res = await client.query(query);
    return res.rows;
  } catch (err) {
    console.error("Error executing query for allLeads", err.stack);
    throw err;
  }
}

module.exports = {
  getLeadData,
  allLeads,
};
