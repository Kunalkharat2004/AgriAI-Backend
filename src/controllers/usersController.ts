import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { IUser } from "../utils/userTypes";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

export const userController = {
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      // Check if the email is already registered
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          const error = createHttpError(409, "Email is already in use");
          return next(error);
        }
      } catch (err) {
        return next(
          createHttpError(500, `Error while registering user,${err}`)
        );
      }

      let newUser: IUser;
      // Hashing the password
      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user in database
        newUser = await User.create({
          email,
          password: hashedPassword,
        });
      } catch (err) {
        return next(createHttpError(500, `Error while getting user ${err}`));
      }

      // JWT Token generation
      try {
        const token = sign(
          { sub: newUser._id, email: newUser.email },
          config.jwtSecret as string,
          { algorithm: "HS256", expiresIn: "7d" }
        );
        res.status(201).json({
          access_token: token,
          message: "Registration successful",
        });
      } catch (err) {
        next(createHttpError(500, `Error while sigining the JWT token,${err}`));
      }
    } catch (err) {
      console.error("Something went wrong!", err);
      // res.status(500).send({ message: "Server error, please try again later" });
      const error = createHttpError(
        500,
        "Server error, please try again later"
      );
      return next(error);
    }
  },

  loginUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = (await User.findOne({ email })) as IUser | null;

      if (!user) {
        const error = createHttpError(404, "Invalid credentials");
        return next(error);
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        const error = createHttpError(404, "Invalid credentials");
        return next(error);
      }

      // Check for hardcoded admin credentials
      let role = user.role || "user";
      if (email === "admin@gmail.com" && password === "Admin$123") {
        // Set admin role for this specific credential set
        role = "admin";

        // Update the user role in the database if needed
        if (user.role !== "admin") {
          await User.findByIdAndUpdate(user._id, { role: "admin" });
        }
      }

      const token = sign(
        { sub: user._id, email: user.email, role },
        config.jwtSecret as string,
        { algorithm: "HS256", expiresIn: "7d" }
      );
      res.status(200).json({
        access_token: token,
        user_id: user._id,
        role: role,
        message: "Login successful",
      });
    } catch (err) {
      next(err);
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        return next(createHttpError(400, "Email is required"));
      }
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return next(createHttpError(404, "User doesn't exist"));
      }

      const { newPassword, confirmNewPassword } = req.body;

      const updateData: { password?: string } = {};

      if (confirmNewPassword && newPassword) {
        const passwordComparisonResponse = newPassword === confirmNewPassword;
        if (!passwordComparisonResponse) {
          return next(createHttpError(401, "Password doesn't match"));
        }
        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await User.findOneAndUpdate(
        { email }, // Search by email
        updateData,
        { new: true }
      );

      res.json({
        message: "User data updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error occurred while updating user data!", err);
      return next(
        createHttpError(500, "Error occurred while updating user data!")
      );
    }
  },
};
