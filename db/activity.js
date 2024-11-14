const { client } = require("../config/db");
async function fetchActivity(idlead, idmeta_activity) {
  try {
    const query = `
      select
      a.idlead,
      a.idactivity,
      a.idmeta_activity as activity_type,
      a.idmeta_title_activity as activity_title,
      mt.meta_data_name as activity_title_name,
      a.description,
      a.activity_start_date,
      a.activity_end_date
      from oppurtunity.activity a
      inner join oppurtunity."lead" l on l.idlead = a.idlead
      inner join oppurtunity.op_metadata mt on mt.idmetadata = a.idmeta_title_activity
      inner join oppurtunity.op_metadata ma on ma.idmetadata  = a.idmeta_activity
      where
      a.active_flag = true --- hardcode
      and a.idlead  = $1 --- dynamic pass lead id
      and a.idmeta_activity = $2
    `;

    const res = await client.query(query, [idlead,idmeta_activity]);
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
        idlead,
        activity_start_date,
        description,
        eff_to_date,
        idmeta_activity,
        createdby,
        modifiedby,
        idmeta_title_activity
        ) 
        VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
    `;
    const res = await client.query(query, [
      activityData.idactivity,
      activityData.modifiedDate || null,
      activityData.activityEndDate || null,
      activityData.sortOrder || null,
      activityData.effFromDate || null,
      activityData.idLead || null,
      activityData.activityStartDate || null,
      activityData.description || null,
      activityData.effToDate || null,
      activityData.idmetaActivity || null,
      activityData.createdBy || null,
      activityData.modifiedBy || null,
      activityData.idmetaTitleActivity || null,
    ]);
    console.log(res.rowCount);
    return res.rowCount;
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function deleteActivity(idlead, idactivity) {
  try {
    const query = `
      UPDATE oppurtunity."activity"
      SET active_flag = false
      WHERE idlead = $1 AND idactivity = $2;
    `;
    const res = await client.query(query, [idlead, idactivity]);
    console.log(res.rowCount);
    return res.rowCount;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw err;
  }
}

async function deleteAllActivities(idlead) {
  try {
    const query = `
    UPDATE oppurtunity."activity"
    SET active_flag = false
    WHERE idlead = $1;
  `;
    const res = await client.query(query, [idlead]);
    return res.rowCount;
  } catch (error) {
    throw error;
  }
}

async function updateActivity(activityData) {
  try {
    const query = `
      UPDATE oppurtunity."activity"
      SET
      idmeta_title_activity = $1,
      description = $2,
      activity_start_date = $3,
      activity_end_date = $4,
      modifiedby = $6,
      modified_date = NOW()
      WHERE idactivity = $5;
    `;
    const values = [
      activityData.activity_title,
      activityData.description,
      activityData.activity_start_date,
      activityData.activity_end_date,
      activityData.idactivity,
      activityData.identity,
    ];
    const res = await client.query(query, values);
    return res.rowCount;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error; // Rethrow the error for handling in the controller
  }
}

async function getReasons(metaDetailId) {
  try {
    const query = `
    select idmetadata,meta_data_name 
    from oppurtunity.op_metadata om 
    where sub_meta_detail = $1
    `;
    const res = await client.query(query, [metaDetailId]);
    return res.rows;
  } catch (error) {
    throw error;
  }
}

async function getReasonName(metaId) {
  try {
    const query = `
    select meta_data_name 
    from oppurtunity.op_metadata om 
    where idmetadata = $1
    `;
    const res = await client.query(query, [metaId]);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
}

async function updateStatusNotContactable(leadData) {
  try {
    const query = `
      UPDATE oppurtunity."lead"
      SET idmeta_lead_status = 'eb50fefac7f147d09049ccd156679a66',
      modifiedby = $2,
      modified_date = NOW()
      WHERE idlead = $1;
    `;
    const values = [leadData.leadId, leadData.identity];
    const res = await client.query(query, values);
    return res.rowCount;
  } catch (error) {
    throw error;
  }
}

async function deleteLead(leadData) {
  try {
    const query = `
      UPDATE oppurtunity."lead"
      SET activeflag = 0,
      modifiedby = $2,
      modified_date = NOW()
      WHERE idlead = $1;
    `;
    const values = [leadData.leadId, leadData.identity];
    const res = await client.query(query, values);
    return res.rowCount;
  } catch (error) {
    throw error;
  }
}

async function getActivities(activityType) {
  try {
    const query = `
      SELECT 
        mm.idmetamaster, 
        mm.meta_master_name,
        md.idmetadata, 
        md.meta_data_name
      FROM 
        oppurtunity.op_metamaster mm
      JOIN 
        oppurtunity.op_metadata md 
      ON 
        mm.idmetamaster = md.idmetamaster
      WHERE 
        mm.meta_master_name = $1
    `;
    // Run the query with 'activityType' as the filter
    const res = await client.query(query, [activityType]);
    return res.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  fetchActivity,
  createActivity,
  deleteActivity,
  updateActivity,
  deleteAllActivities,
  getReasons,
  updateStatusNotContactable,
  deleteLead,
  getReasonName,
  getActivities,
};
