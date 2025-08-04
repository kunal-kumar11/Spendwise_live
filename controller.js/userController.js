const User=require('../model/User.js')
const Expense=require('../model/Expense.js')

// Add an expense + update total in a transaction
const POSTuserDetails = async (req, res) => {
  const { description, amount, category } = req.body;
  const userId = req.user.userId;

  try {
    // 1. Create a new expense document linked to user
    const newExpense = new Expense({
      description,
      amount,
      category,
      user: userId
    });

    const savedExpense = await newExpense.save();

    // 2. Update user's totalexpenses by incrementing it
    // Use $inc operator to add the amount to totalexpenses
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalexpenses: amount } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Respond with the created expense (including createdAt)
    res.status(201).json({
      id: savedExpense._id,
      description: savedExpense.description,
      amount: savedExpense.amount,
      category: savedExpense.category,
      createdAt: savedExpense.createdAt
    });

  } catch (error) {
    console.error('Error in POSTuserDetails:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Delete an expense + update total in a transaction
const DELETEuserDetails = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.userId;

  try {
    // 1. Find the expense to delete (and ensure it belongs to the user)
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const amount = parseFloat(expense.amount); // Convert Decimal128 or Number safely

    // 2. Delete the expense
    await Expense.deleteOne({ _id: expenseId, user: userId });

    // 3. Subtract the amount from user's totalexpenses
const updatedUser = await User.findOneAndUpdate(
  { _id: userId, totalexpenses: { $ne: 0 } },  // ✅ only update if not zero
  { $inc: { totalexpenses: -amount } },
  { new: true }
);


    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Respond with success
    return res.status(200).json({
      message: 'Expense deleted and total updated successfully',
    });

  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all expenses of the logged-in user
const GETuserDetails = async (req, res) => {
  const userId = req.user.userId;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    // 1. Get total count of user’s expenses
    const totalCount = await Expense.countDocuments({ user: userId });

   
    // 2. Fetch paginated expenses for the user
    const expenses = await Expense.find({ user: userId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      expenses,
      totalCount
    });
  } catch (error) {
    console.error('Error fetching user expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Get leaderboard: usernames and total expenses
const GETNameTotalSum = async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, totalexpenses: 1, _id: 0 }) // select only needed fields
      .sort({ totalexpenses: -1 }); // sort in descending order

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Database error' });
  }
};


const GETuserDetailsdownload = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch expenses for the user
    const expenses = await Expense.find({ user: userId }).sort({ createdAt: -1 });

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: 'No expenses found for CSV download.' });
    }

    // Build CSV string
    let csv = 'Description,Amount,Category,Date\n';

    csv += expenses.map(e => {
      const description = `"${(e.description || '').replace(/"/g, '""')}"`; // escape quotes
      const amount = e.amount;
      const category = e.category;
      const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '';
      return `${description},${amount},${category},${date}`;
    }).join('\n')

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Error in creating CSV file' });
  }
};


const PUTusersDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateId = req.params.id;
    const { description, amount, category } = req.body;

    if (!updateId || !description || !amount || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Find the existing expense to get the old amount
    const existingExpense = await Expense.findOne({ _id: updateId, user: userId });
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized' });
    }

    const oldAmount = parseFloat(existingExpense.amount.toString()); // ✅ Convert Decimal128 to number
    const newAmount = parseFloat(amount); // ✅ Ensure numeric value for subtraction

    // 2. Update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: updateId, user: userId },
      { description, amount: newAmount, category },
      { new: true }
    );

    // 3. Update user's totalexpenses by the **difference**
    const amountDifference = oldAmount - newAmount;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { totalexpenses: -amountDifference } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 4. Respond with updated data
    return res.status(200).json({
      message: 'Expense updated and total adjusted successfully',
      updatedExpense,
      updatedTotal: updatedUser.totalexpenses,
    });

  } catch (error) {
    console.error('Update failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {
  POSTuserDetails,
  DELETEuserDetails,
  GETuserDetails,
  GETNameTotalSum,
  GETuserDetailsdownload,
  PUTusersDetails
};
;