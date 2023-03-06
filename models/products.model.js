const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *  schemas:
 *     Product:
 *      type: object
 *      properties:
 *         name:
 *          type: string
 *          description: The name of the product
 *          example: 'IPhone 12'
 *         description:
 *          type: string
 *          description: The description of the product
 *          example: 'IPhone 12 is the latest phone from Apple'
 *         richDescription:
 *          type: string
 *          description: The description of the product
 *          example: 'IPhone 12 is the latest phone from Apple'
 *         image:
 *          type: string
 *          description: The image of the product
 *          example: 'http://localhost:3000/public/images/1.jpg'
 *         images:
 *          type: array
 *          items:
 *           type: string
 *           description: The images of the product
 *           example: 'http://localhost:3000/public/images/1.jpg'
 *         brand:
 *          type: string
 *          description: The brand of the product
 *          example: 'Apple'
 *         price:
 *          type: number
 *          description: The price of the product
 *          example: 1000
 *         category:
 *          type: string
 *          description: The category of the product
 *          example: '5f9f5b0b0b5b0c2c1c8b0b0b'
 *         countInStock:
 *          type: number
 *          description: The countInStock of the product
 *          example: 100
 *         rating:
 *          type: number
 *          description: The rating of the product
 *          example: 4.5
 *         numReviews:
 *          type: number
 *          description: The numReviews of the product
 *          example: 10
 *         isFeatured:
 *          type: boolean
 *          description: The isFeatured of the product
 *          example: true
 *         dateCreated:
 *          type: date
 *          description: The dateCreated of the product
 *          example: '2020-11-01T00:00:00.000Z'
 *      required:
 *       - name
 *       - description
 *       - category
 */
const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
      default: "",
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: { type: Number, required: true, min: 0, max: 255 },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", {
  virtuals: true,
});

const Product = mongoose.model("Product", productSchema);

exports.Product = Product;
