import express from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Every route in this file requires a valid token
router.use(auth);

// POST /api/expenses  -> add an expense
router.post("/", async (req, res) => {
  try {
    const { amount, description, category, date } = req.body;

    if (amount === undefined || !description) {
      return res
        .status(400)
        .json({ message: "Amount and description are required" });
    }

    const expense = await Expense.create({
      user: req.userId,
      amount,
      description,
      category,
      date,
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
        if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/expenses  -> list my expenses, newest first
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/expenses/:id  -> update one of my expenses
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const { amount, description, category, date } = req.body;
    const updates = {};
    if (amount !== undefined) updates.amount = amount;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error(err);
        if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/expenses/:id  -> delete one of my expenses
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;