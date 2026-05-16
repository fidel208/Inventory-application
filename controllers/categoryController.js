const pool = require("../db/pool");

exports.getAllCategories = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC",
    );
    res.render("categories", {
      title: "Instrument Categories",
      categories: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching categories");
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const categoryQuery = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId],
    );

    if (categoryQuery.rows.length === 0) {
      return res.status(404).send("Category not found");
    }

    const instrumentsQuery = await pool.query(
      "SELECT i.*, b.name AS brand_name FROM instruments i JOIN brands b ON i.brand_id = b.id WHERE i.category_id = $1 ORDER BY i.name ASC",
      [categoryId],
    );

    res.render("categoryDetail", {
      category: categoryQuery.rows[0],
      instruments: instrumentsQuery.rows || [],
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).send("Error fetching category details from database");
  }
};

exports.createCategoryForm = (req, res) => {
  res.render("categoryForm", { title: "Add new category", category: null });
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query(
      "INSERT INTO categories(name, description) VALUES($1, $2)",
      [name, description],
    );
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating category");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const checkItems = await pool.query(
      "SELECT id FROM instruments WHERE category_id = $1 LIMIT 1",
      [categoryId],
    );
    if (checkItems.rows.length > 0) {
      return res
        .status(400)
        .send(
          "Cannot delete category. It contains instruments. Move or delete them first",
        );
    }
    await pool.query("DELETE FROM categories WHERE id = $1", [categoryId]);
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting category");
  }
};
