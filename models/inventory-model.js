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

/* ***************************
 *  Add classification data to database
 * ************************** */

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Database insert error:", error.message);
    throw error;
  }
}

/* ***************************
 *  Add inventory data to database
 * ************************** */
async function addInventory(inventoryData) {
  try {
    const sql = `
      INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_miles, inv_description, inv_price, inv_color, inv_image, inv_thumbnail)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      inventoryData.classification_id,
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_miles,
      inventoryData.inv_description,
      inventoryData.inv_price,
      inventoryData.inv_color,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Database Insert Error:", error.message);
    throw error;
  }
}

/* ***************************
 *  Update inventory data to database
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete inventory data to database
 * ************************** */
async function deleteInventory(inv_id,) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventory, getInventoryByInventoryId, addClassification, addInventory, updateInventory, deleteInventory};