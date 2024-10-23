const { client } = require("../config/db");
async function fetchActivity(idlead) {
  try {
    const query = `
       SELECT 
        a.idactivity, 
        a.idlead, 
        a.idmeta_activity,
        e.firstname,
        e.middlename,
        e.lastname,
        e.fullname,
        e.identity, 
        om.meta_data_name 
    FROM 
        oppurtunity.activity a 
    JOIN 
        oppurtunity."lead" l ON a.idlead = l.idlead
    JOIN 
        core.entity e ON l.identity_oppurtunity = e.identity
    JOIN 
        oppurtunity.op_metadata om ON a.idmeta_activity = om.idmetadata
    WHERE 
        a.idlead = $1
        AND a.activeflag = 1;
    `;

    const res = await client.query(query, [idlead]);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function createActivity(activityData) {
  try {
    const query = `
        INSERT INTO oppurtunity.activity (
        idactivity,
        modified_date,
        activity_end_date,
        sortorder,
        eff_from_date,
        activeflag,
        idlead,
        activity_start_date,
        description,
        eff_to_date,
        idmeta_activity,
        createdby,
        modifiedby,
        created_date,
        idmeta_title_activity
        ) 
        VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
    `;
    const res = await client.query(query, [
      activityData.idactivity,
      activityData.modifiedDate || null,
      activityData.activityEndDate || null,
      activityData.sortOrder || null,
      activityData.effFromDate || null,
      activityData.activeFlag || null,
      activityData.idLead || null,
      activityData.activityStartDate || null,
      activityData.description || null,
      activityData.effToDate || null,
      activityData.idmetaActivity || null,
      activityData.createdBy || null,
      activityData.modifiedBy || null,
      activityData.createdDate || null,
      activityData.idmetaTitleActivity || null,
    ]);
    console.log(res.rowCount);
    return res.rowCount;
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

module.exports = {
  fetchActivity,
  createActivity,
};
