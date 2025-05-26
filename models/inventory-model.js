const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get all single view inventory data
 * ************************** */
async function getInventory(){
  return await pool.query("SELECT * FROM public.inventory ORDER BY inv_make")
}

/* ***************************
 *  Get all single view inventory items and inv_id
 * ************************** */
async function getInventoryByInventoryId(inv_id) {
  try {
    if (isNaN(inv_id) || !Number.isInteger(Number(inv_id))) {
      throw new Error(`Invalid inventory ID: ${inv_id} is not an integer.`);
    }
    
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    
    return data.rows;
  } catch (error) {
    console.error("Error retrieving inventory: ", error)
    throw error;
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventory, getInventoryByInventoryId};