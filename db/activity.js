const {client} = require("../config/db")
async function getUsers() {
  try {
    const query = `
        SELECT
          e."identity" AS entity_ref,
          uad."oid" AS e_object,
          e.firstname,
          e.middlename,
          e.lastname,
          e.fullname,
          e.dob,
          uad.reg_mobile_number,
          uad.upn_iam AS upn,
          uad.reg_email AS reg_email_id
        FROM core.user_auth_data uad
        INNER JOIN core.entity e ON e."identity" = uad."identity"
      `;
    const res = await client.query(query);
    return res.rows; // Return the result rows
  } catch (err) {
    console.error("Error executing query", err.stack);
    throw err; // Rethrow the error for handling in the controller
  }
}

module.exports = {
    getUsers
}