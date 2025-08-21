const Bill = require('../models/Bill');
const Order = require('../models/Order');

/** Generate a bill from an existing order */
const generateBillFromOrder = async (req, res) => {
  const { orderId } = req.params;
  const { gstPercentage } = req.body;

  try {
    const order = await Order.findById(orderId).populate('items.menuItem').populate('restaurant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!req.user.restaurant || req.user.restaurant.toString() !== order.restaurant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to bill orders for this restaurant' });
    }

    const existingBill = await Bill.findOne({ order: orderId });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill already generated for this order' });
    }

    const itemsForBill = order.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalWithoutTax = order.totalAmount;
    const finalGstPercentage = gstPercentage || 18;
    const taxAmount = totalWithoutTax * (finalGstPercentage / 100);
    const totalAmount = totalWithoutTax + taxAmount;

    const bill = new Bill({
      restaurant: order.restaurant._id,
      order: order._id,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      items: itemsForBill,
      totalWithoutTax,
      gstPercentage: finalGstPercentage,
      totalAmount,
      generatedBy: req.user.id,
    });

    await bill.save();

    order.status = 'billed';
    await order.save();

    res.status(201).json(bill);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

/** ✅ Manual bill (no linked order) */
const generateManualBill = async (req, res) => {
  const { tableNumber, customerName, items, totalWithoutTax, gstPercentage, totalAmount } = req.body;

  try {
    if (!req.user.restaurant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const bill = new Bill({
      restaurant: req.user.restaurant,
      tableNumber,
      customerName,
      items,
      totalWithoutTax,
      gstPercentage: gstPercentage ?? 18,
      totalAmount,
      generatedBy: req.user.id,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

const getBillDetails = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.billId)
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name price');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (req.user.restaurant.toString() !== bill.restaurant._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }

    res.json(bill);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

const getRestaurantBillHistory = async (req, res) => {
  const { restaurantId } = req.params;
  const { filter } = req.query;

  try {
    if (req.user.restaurant.toString() !== restaurantId) {
      return res.status(403).json({ message: 'Not authorized to view bills for this restaurant' });
    }

    let query = { restaurant: restaurantId };
    const now = new Date();
    let startDate;

    switch (filter) {
      case 'last7':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last60':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 60);
        break;
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    const bills = await Bill.find(query)
      .populate('generatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  generateBillFromOrder,
  generateManualBill,
  getBillDetails,
  getRestaurantBillHistory,
};
