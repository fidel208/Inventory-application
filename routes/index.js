const express = require("express");
const router = express.Router();
const categoryControl = require("../controllers/categoryController");
const instrumentControl = require("../controllers/instrumentController");

router.get("/", (req, res) => res.redirect("/categories"));

router.get("/categories", categoryControl.getAllCategories);
router.get("/categories/new", categoryControl.createCategoryForm);
router.post("/categories", categoryControl.createCategory); 
router.get("/categories/:id", categoryControl.getCategoryById);
router.post("/categories/:id/delete", categoryControl.deleteCategory);

router.get("/instruments/new", instrumentControl.createInstrumentForm);
router.post("/instruments", instrumentControl.createInstrument);
router.get("/instruments/:id", instrumentControl.viewInstruments);
router.get("/instruments/:id/edit", instrumentControl.editInstrumentForm);
router.post("/instruments/:id/update", instrumentControl.updateInstrument);
router.post("/instruments/:id/delete", instrumentControl.deleteInstrument);

module.exports = router;