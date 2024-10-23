const { client } = require("../config/db");

async function checkActiveFlag(oid) {
  try {
    const query = `
          SELECT 
              e.activeflag
          FROM 
              core.entity e 
          JOIN 
              core.user_auth_data u ON u.identity = e.identity
          WHERE 
              u.oid = $1;
        `;
    const res = await client.query(query, [oid]);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

async function insertSessionData(oid, idsession, tokenExpiryTime) {
  // Convert the Unix timestamp to a PostgreSQL timestamp
  const sessionExpiryDate = new Date(tokenExpiryTime * 1000).toISOString();

  const query = `
      UPDATE core.user_auth_data
      SET idsession = $1, sessionexpirytime = $2
      WHERE oid = $3
      `;

  try {
    const result = await client.query(query, [
      idsession,
      sessionExpiryDate,
      oid,
    ]);
    console.log("Update successful:", result);
    return result;
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error; // Rethrow the error for further handling if needed
  }
}

async function checkValidRoute(oid, eventDefination) {
  try {
    const query = `
          select uad."identity",eua.idurc,vedcc.idevent_defination,vedcc.is_matching 
          from core.user_auth_data uad 
          inner join core.entity_urc_auth eua on eua.identity = uad."identity"
          inner join core.vw_event_def_category_check vedcc on vedcc.idurc = eua.idurc 
          where "oid" = $1 and idevent_defination = $2
          `;
    const res = await client.query(query, [oid, eventDefination]);
    console.log(oid, eventDefination);
    return res.rows;
  } catch (error) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

const insertEventTransaction = async (data) => {
  const { identity, idurc, idevent_defination, idevent_transaction } = data;
  const allowedSourceQuery = `
    Select idevent_def_allowed_source from core.event_def_allowed_source where idevent_defination = $1
    `;
  const entityUrcAuthQuery = `Select identity_urc_auth from core.entity_urc_auth where idurc = $1`;
  const query = `
        INSERT INTO core.event_transaction (idevent_transaction, idevent_def_allowed_source, 
        identity, identity_urc_auth, event_start_time, event_endtime)
        VALUES ($1, $2, $3, $4, NOW(), NOW());
      `;

  try {
    const entityUrcAuthResult = await client.query(entityUrcAuthQuery, [idurc]);
    const allowedSourceResult = await client.query(allowedSourceQuery, [
      idevent_defination,
    ]);

    console.log(allowedSourceResult.rows, entityUrcAuthResult.rows);
    idevent_def_allowed_source =
      allowedSourceResult.rows[0].idevent_def_allowed_source;
    identity_urc_auth = entityUrcAuthResult.rows[0].identity_urc_auth;
    const result = await client.query(query, [
      idevent_transaction,
      idevent_def_allowed_source,
      identity,
      identity_urc_auth,
    ]);
    console.log("Insert successful:", result);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

module.exports = { checkActiveFlag, insertEventTransaction, insertSessionData, checkValidRoute};
