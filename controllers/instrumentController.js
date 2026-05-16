const pool = require("../db/pool");

// GET /instruments/new
exports.createInstrumentForm = async (req, res) => {
  try {
    // Fetch categories and brands so the form dropdowns have data
    const categoriesQuery = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    const brandsQuery = await pool.query("SELECT * FROM brands ORDER BY name ASC");

    res.render("instrumentForm", {
      title: "Add New Instrument",
      instrument: null, // null because we are creating, not editing
      categories: categoriesQuery.rows,
      brands: brandsQuery.rows,
    });
  } catch (err) {
    console.error("Error loading instrument form:", err);
    res.status(500).send("Error loading the instrument creation form.");
  }
};

// POST /instruments (Submit the new instrument)
exports.createInstrument = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id, brand_id } = req.body;
    
    await pool.query(
      "INSERT INTO instruments (name, description, price, stock_quantity, category_id, brand_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, description, price, stock_quantity, category_id, brand_id]
    );
    
    // Redirect back to the specific category dashboard view after saving
    res.redirect(`/categories/${category_id}`);
  } catch (err) {
    console.error("Error creating instrument:", err);
    res.status(500).send("Error saving the instrument to the database.");
  }
};

// GET /instruments/:id (View details of a single instrument)
exports.viewInstruments = async (req, res) => {
  try {
    const instrumentId = req.params.id;
    const query = `
      SELECT i.*, c.name AS category_name, b.name AS brand_name 
      FROM instruments i
      JOIN categories c ON i.category_id = c.id
      JOIN brands b ON i.brand_id = b.id
      WHERE i.id = $1
    `;
    const { rows } = await pool.query(query, [instrumentId]);
    
    if (rows.length === 0) {
      return res.status(404).send("Instrument not found");
    }
    
    res.render("instrumentDetail", { instrument: rows[0] });
  } catch (err) {
    console.error("Error viewing instrument:", err);
    res.status(500).send("Error fetching instrument details.");
  }
};

// GET /instruments/:id/edit
exports.editInstrumentForm = async (req, res) => {
  try {
    const instrumentId = req.params.id;
    const instrumentQuery = await pool.query("SELECT * FROM instruments WHERE id = $1", [instrumentId]);
    
    if (instrumentQuery.rows.length === 0) {
      return res.status(404).send("Instrument not found");
    }

    const categoriesQuery = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    const brandsQuery = await pool.query("SELECT * FROM brands ORDER BY name ASC");

    res.render("instrumentForm", {
      title: "Edit Instrument",
      instrument: instrumentQuery.rows[0],
      categories: categoriesQuery.rows,
      brands: brandsQuery.rows,
    });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Error loading editing interface.");
  }
};

// POST /instruments/:id/update
exports.updateInstrument = async (req, res) => {
  try {
    const instrumentId = req.params.id;
    const { name, description, price, stock_quantity, category_id, brand_id } = req.body;
    
    await pool.query(
      "UPDATE instruments SET name=$1, description=$2, price=$3, stock_quantity=$4, category_id=$5, brand_id=$6 WHERE id=$7",
      [name, description, price, stock_quantity, category_id, brand_id, instrumentId]
    );
    
    res.redirect(`/instruments/${instrumentId}`);
  } catch (err) {
    console.error("Error updating instrument:", err);
    res.status(500).send("Error saving instrument modifications.");
  }
};

// POST /instruments/:id/delete
exports.deleteInstrument = async (req, res) => {
  try {
    const instrumentId = req.params.id;
    
    // Find the category id first so we can redirect cleanly after deletion
    const { rows } = await pool.query("SELECT category_id FROM instruments WHERE id = $1", [instrumentId]);
    if (rows.length === 0) return res.status(404).send("Instrument not found");
    
    const categoryId = rows[0].category_id;
    
    await pool.query("DELETE FROM instruments WHERE id = $1", [instrumentId]);
    res.redirect(`/categories/${categoryId}`);
  } catch (err) {
    console.error("Error deleting instrument:", err);
    res.status(500).send("Error removing instrument from stock.");
  }
};