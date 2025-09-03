import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/error";

// Mock products data (replace with database in production)
let products = [
  {
    id: "1",
    name: "Tomato Seeds",
    description: "High-quality tomato seeds for farming",
    price: 60,
    category: "seeds",
    inStock: true,
    imageUrl: "https://example.com/tomato-seeds.jpg",
    rating: 4.5,
    numReviews: 12,
    countInStock: 100,
  },
  {
    id: "2",
    name: "Organic Fertilizer",
    description: "Natural organic fertilizer for all crops",
    price: 120,
    category: "fertilizers",
    inStock: true,
    imageUrl: "https://example.com/fertilizer.jpg",
    rating: 4.2,
    numReviews: 8,
    countInStock: 50,
  },
  {
    id: "3",
    name: "Soil Moisture Sensor",
    description: "Digital sensor for monitoring soil moisture levels",
    price: 350,
    category: "devices",
    inStock: true,
    imageUrl: "https://example.com/sensor.jpg",
    rating: 4.8,
    numReviews: 15,
    countInStock: 30,
  },
];

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a real app, filter and paginate from database
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = products.find((p) => p.id === req.params.id);

    if (!product) {
      throw new CustomError("Product not found", 404);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin)
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      category,
      inStock,
      imageUrl,
      countInStock,
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      throw new CustomError("Please provide all required fields", 400);
    }

    // Create new product
    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: Number(price),
      category,
      inStock: inStock !== undefined ? inStock : true,
      imageUrl: imageUrl || "https://example.com/placeholder.jpg",
      rating: 0,
      numReviews: 0,
      countInStock: countInStock ? Number(countInStock) : 0,
    };

    // In a real app, save to database
    products.push(newProduct);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      category,
      inStock,
      imageUrl,
      countInStock,
    } = req.body;

    // Find product
    const productIndex = products.findIndex((p) => p.id === req.params.id);

    if (productIndex === -1) {
      throw new CustomError("Product not found", 404);
    }

    // Update product
    const updatedProduct = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      description: description || products[productIndex].description,
      price: price ? Number(price) : products[productIndex].price,
      category: category || products[productIndex].category,
      inStock: inStock !== undefined ? inStock : products[productIndex].inStock,
      imageUrl: imageUrl || products[productIndex].imageUrl,
      countInStock:
        countInStock !== undefined
          ? Number(countInStock)
          : products[productIndex].countInStock,
    };

    // Save updated product
    products[productIndex] = updatedProduct;

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find product
    const productIndex = products.findIndex((p) => p.id === req.params.id);

    if (productIndex === -1) {
      throw new CustomError("Product not found", 404);
    }

    // Remove product
    products = products.filter((p) => p.id !== req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
