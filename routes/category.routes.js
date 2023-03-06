require("dotenv/config");
const express = require("express");
const router = express.Router();
const { Category } = require("../models/category.model");

router.post(`/`, async (req, res) => {
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  await category.save();

  if (!category) return res.status(404).send("the category cannot be created!");
  res.send(category);
});

router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.get("/:id", async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(500).json({ success: false });
    }
    res.send(category);
});

router.put("/:id", async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    );
    if (!category) {
        res.status(500).json({ success: false });
    }
    res.send(category);
});

/**
 *
 */
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const category = await Category.findByIdAndRemove(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: "the category is not found!",
      });
    } else {
      res
        .status(200)
        .json({ success: true, message: "the category is deleted!" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

module.exports = router;
