require("dotenv/config");
const express = require("express");
const router = express.Router();
const { Product } = require("../models/products.model");
const { Category } = require("../models/category.model");
const moongose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.post(`/`, uploadOptions.single('image') ,async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

  const product = Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  try {
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  // const productList = await Product.find().select('name image -_id');
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",")};
  }
  const productList = await Product.find(filter).populate(
    "category"
  );
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  if (!moongose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.put("/:id", uploadOptions.single('image'),async (req, res) => {
  if (!moongose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const productValidate = await Product.findById(req.params.id);
    if (!productValidate) return res.status(400).send("Invalid Product");

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    }else{
        imagePath = productValidate.image;
    }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!moongose.isValidObjectId(id)) {
    res.status(400).send("Invalid Product Id");
  }
  try {
    const product = await Product.findByIdAndRemove(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: "The product with the given ID was not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "The product is deleted!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
});

router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!moongose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router;
