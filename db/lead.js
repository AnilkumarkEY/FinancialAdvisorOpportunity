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
    AND l.activeflag = 1
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
      AND l.activeflag = 1
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
    const { leadStatus, pageNumber, pageCount } = leadWithPagination;
    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM oppurtunity."lead" l
      INNER JOIN core.entity_contact ec ON ec."identity" = l.identity_oppurtunity
      WHERE ec.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705' 
      AND l.identity_lead_createdby = $1 
      AND l.activeflag = 1
      AND l.idmeta_lead_status = $2;
    `;
    const countRes = await client.query(countQuery, [identity, leadStatus]);
    const totalCount = parseInt(countRes.rows[0].totalcount, 10);
    const totalPages = Math.ceil(totalCount / pageCount);
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
      l.idmeta_lead_status = $2 AND
      l.activeflag = 1
      ORDER BY
      l.created_date DESC,  -- ordering by created_date in descending order
      ec.idmeta_contact_type DESC
      LIMIT $3 OFFSET ($4 - 1) * $3;
    `;
    const res = await client.query(query, [
      identity,
      leadStatus,
      pageCount,
      pageNumber,
    ]);
    const result = {
      leads: res.rows,
      totalCount,
      totalPages,
    };
    return result;
  } catch (err) {
    console.error("Error executing query for allLeads", err.stack);
    throw err;
  }
}

async function inprogressLeadList(identity, leadWithPagination) {
  const { leadStatus, pageNumber, pageCount } = leadWithPagination;
  try {
    const query = `
      SELECT DISTINCT l.idmeta_lead_status 
      FROM oppurtunity."lead" l  
      INNER JOIN oppurtunity.op_metadata om 
      ON om.meta_data_name = l.idmeta_lead_status 
      WHERE om.idmetamaster = $2
      AND l.activeflag = 1 
      AND identity_lead_createdby = $1;
    `;
    const resForDistinct = await client.query(query, [identity, leadStatus]);
    const distinctStatuses = [
      ...new Set(resForDistinct.rows.map((item) => item.idmeta_lead_status)),
    ];
    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM oppurtunity."lead" l
      INNER JOIN core.entity_contact ec ON ec."identity" = l.identity_oppurtunity
      WHERE ec.idmeta_contact_type = 'eef8f47d787041b59afd37937deed705' 
      AND l.identity_lead_createdby = $1 
      AND l.activeflag = 1 
      AND l.idmeta_lead_status::uuid = ANY($2::uuid[]);
    `;
    const queryToGetPagination = `
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
      l.activeflag = 1 AND
      l.idmeta_lead_status::uuid = ANY($2::uuid[])
      ORDER BY
      l.created_date DESC,
      ec.idmeta_contact_type DESC
      LIMIT $3 OFFSET ($4 - 1) * $3;
    `;
    const countRes = await client.query(countQuery, [
      identity,
      distinctStatuses,
    ]);
    const totalCount = parseInt(countRes.rows[0].totalcount, 10);
    const totalPages = Math.ceil(totalCount / pageCount);

    const res = await client.query(queryToGetPagination, [
      identity,
      distinctStatuses,
      pageCount,
      pageNumber,
    ]);
    const result = {
      leads: res.rows,
      totalCount,
      totalPages,
    };
    return result;
  } catch (error) {
    console.error("Error executing query for allLeads", error.stack);
    throw error;
  }
}

async function updateLeadType(idlead, idmeta_lead_type, identity) {
  try {
    const query = `
      UPDATE oppurtunity."lead"
      SET idmeta_lead_type = $1
      WHERE idlead = $2 AND identity_lead_createdby = $3;
    `;
    const res = await client.query(query, [idmeta_lead_type, idlead, identity]);
    console.log(res.rowCount);
    return res.rowCount;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function updateLeadStatus(idlead, idmeta_lead_status, identity) {
  try {
    const query = `
      UPDATE oppurtunity."lead"
      SET idmeta_lead_status = $1
      WHERE idlead = $2 AND identity_lead_createdby = $3;
    `;
    const res = await client.query(query, [
      idmeta_lead_status,
      idlead,
      identity,
    ]);
    console.log(res.rowCount);
    return res.rowCount;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw error;
  }
}

async function getLeadTimeline(leadId) {
  try {
    const query = `
      select
      a.idactivity,
      a.idmeta_activity,
      om_activity.meta_data_name as activity_type,
      om_title.meta_data_name as activity_title,
      a.description,
      a.activity_start_date,
      a.activity_end_date,
      a.created_date::timestamp AS created_date_utc
      from oppurtunity.activity a
      inner join oppurtunity.op_metadata om_activity on om_activity.idmetadata = a.idmeta_activity
      inner join oppurtunity.op_metadata om_title on om_title.idmetadata = a.idmeta_title_activity
      inner join core.event_transaction et on et.event_transaction_ref = a.idactivity
      inner join core.event_def_allowed_source edas on edas.idevent_def_allowed_source = et.idevent_def_allowed_source
      inner join oppurtunity.op_metadata evt_filter on evt_filter.meta_data_name = edas.idevent_defination
      where a.idlead = $1
      AND a.active_flag = true
    `;
    const res = await client.query(query, [leadId]);
    return res.rows;
  } catch (error) {
    throw error;
  }
}

async function getStatusName(leadStatus) {
  const query = `
  select om.meta_data_name 
  from oppurtunity.op_metadata om 
  where om.idmetadata = $1
  `;
  const res = await client.query(query, [leadStatus]);
  return res.rows;
}

module.exports = {
  getLeadTypeData,
  getLeadStatusData,
  allLeads,
  inprogressLeadList,
  updateLeadType,
  updateLeadStatus,
  getLeadTimeline,
  getStatusName,
};
