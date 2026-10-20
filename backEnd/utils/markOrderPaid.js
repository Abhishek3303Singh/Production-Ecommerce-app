const mongoose = require("mongoose");
const Order = require("../dataBase/product/order");
const ProductModel = require("../dataBase/product/Product");
const razorpayInstance = require("../config/razorpay");

class StockError extends Error {}

async function refundForStockIssue(razorpayOrderId, paymentId) {
  // Recoord the situation first
  await Order.updateOne(
    { razorpayOrderId, 'paymentInformation.status': 'pending' },
    { $set: { 'paymentInformation.status': 'refund_pending', 'paymentInformation.id': paymentId, orderStatus: 'Cancelled' } }
  );

  try {
    await razorpayInstance.payments.refund(paymentId, {});
    await Order.updateOne(
      { razorpayOrderId },
      { $set: { "paymentInformation.status": "refunded" } }
    );
  } catch (err) {
    console.error(
      "Refund Failed, manual action needed",
      paymentId,
      err.message
    );
  }
}
// idempotent : only first caller can move pending to succeeded no matter how many call requeted

async function makeOrderPaid(razorpayOrderId, paymentId) {
  const session = await mongoose.startSession();
  try {
    let paidOrder = null;
    await session.withTransaction(async () => {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId, "paymentInformation.status": "pending" },
        {
          $set: {
            "paymentInformation.status": "succeeded",
            "paymentInformation.id": paymentId,
            paidAtDate: new Date(),
            orderStatus: "In Process",
          },
        },

        { new: true, session }
      );
      if (!order) {
        const exists = await Order.exists({ razorpayOrderId }).session(session);
        if (!exists) console.error('PAYMENT WITHOUT ORDER, needs manual review or refund:', razorpayOrderId, paymentId);
        return; // otherwise the other path already handled it
      }; 
      for (const item of order.orderProduct) {
        const qty = Number(item.quantity);

        const res = await ProductModel.updateOne(
          { _id: item.product, Stock: { $gte: qty } },
          { $inc: { Stock: -qty, sold: qty } },
          { session }
        );
        if (res.modifiedCount !== 1)
          throw new StockError(`Insufficient stock :${item.title}`);
      }
      paidOrder = order;
    });
    return paidOrder;
  } catch (err) {
    console.log('outof stock err')
    if (err instanceof StockError) {
        // The transaction rolled back, so the customer paid but we can't ship
    console.log('outof stock err')

        await refundForStockIssue(razorpayOrderId, paymentId);
        return null;
      }
    throw err;
  } finally {
    await session.endSession();
  }
}

module.exports = { makeOrderPaid };
