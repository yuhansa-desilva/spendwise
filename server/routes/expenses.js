import express from "express";
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

export default router;