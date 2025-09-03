import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config/config";
import { SignOptions, Secret } from "jsonwebtoken";
import { CustomError } from "../utils/error";
import User, { IUser } from "../models/userModel";
import mongoose from "mongoose";

// Generate JWT token
const generateToken = (id: string, role: string) => {
  const options: SignOptions = { expiresIn: "7d" };
  return jwt.sign({ id, role }, config.jwtSecret as Secret, options);
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role = "farmer" } = req.body;

    // Validate input
    if (!name || !email || !password) {
      throw new CustomError("Please provide all required fields", 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new CustomError("User already exists", 400);
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password, // Password will be hashed automatically in pre-save middleware
      role,
    });

    // Create user object without password
    const userWithoutPassword = {
      id: newUser._id,
      name: newUser.get("name"),
      email: newUser.email,
      role: newUser.role,
    };

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.role);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: userWithoutPassword,
      token,
      access_token: token,
      user_id: newUser._id,
      role: newUser.role,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Validate input
    if (!email || !password) {
      throw new CustomError("Please provide email and password", 400);
    }

    // Find user - now we need to explicitly select the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log(`User with email ${email} not found`);
      throw new CustomError("Invalid credentials", 401);
    }
    console.log(`User found: ${user._id}`);

    // Check if password exists in the user document
    console.log(`Password exists in user document: ${!!user.password}`);

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log(`Password match result: ${isMatch}`);

    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Create user object without password
    const userWithoutPassword = {
      id: user._id,
      name: user.get("name"),
      email: user.email,
      role: user.role,
    };

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    const responseObj = {
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token,
      access_token: token,
      user_id: user._id,
      role: user.role,
    };

    console.log(
      "Sending login response:",
      JSON.stringify(responseObj, null, 2)
    );

    res.status(200).json(responseObj);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find user by ID from authenticated token
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Return user without password
    const userWithoutPassword = {
      id: user._id,
      name: user.get("name"),
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Update user fields
    if (name) user.set("name", name);
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by pre-save middleware

    // Save updated user
    const updatedUser = await user.save();

    // Return user without password
    const userWithoutPassword = {
      id: updatedUser._id,
      name: updatedUser.get("name"),
      email: updatedUser.email,
      role: updatedUser.role,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
