const order = require("../dataBase/product/order");
const OrderModel = require("../dataBase/product/order");
const ProductModels = require("../dataBase/product/Product");

// create Order
exports.creatNewOrder = async (req, res) => {
  try {
    // console.log(req.body.order)
    const {
      shippingAddress,
      orderProduct,
      paymentInformation,
      productPrice,
      vatPrice,
      shippingPrice,
      totalPrice,
    } = req.body.order;
    const order = await OrderModel.create({
      shippingAddress,
      orderProduct,
      paymentInformation,
      productPrice,
      vatPrice,
      shippingPrice,
      totalPrice,
      paidAtDate: Date.now(),
      user: req.user._id,
    });

    res.status(200).json({
      status: "success",
      order,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

//
exports.singleOrder = async (req, res) => {
  try {
    // we are takin user name and email through userId
    const order = await OrderModel.findById(req.params.id).populate(
      "user",
      "name  email"
    );
    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found!",
      });
    }
    return res.status(200).json({
      status: "success",
      order,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// My all Orders 

exports.myOrders = async (req, res, next) => {
  try {
    // Get All orders of Logged-in user
    const orders = await OrderModel.find({ user: req.user._id });
    return res.status(200).json({
      status: "success",
      orders,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

// Get all Orders -- Admin

exports.allOrders = async (req, res, next) => {
  try {
    // Get All orders of Logged-in user
    const orders = await OrderModel.find();

    let totalOrdervalue = 0;
    orders.forEach((order) => {
      totalOrdervalue += order.totalPrice;
    });
    return res.status(200).json({
      status: "success",
      totalOrdervalue,
      orders,
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};

/// Update Product Status and update Quantity..
exports.updateProductStatus = async (req, res) => {
  // console.log(req.body, 'checking reqData')
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      status: "failed",
      message: "Product not found",
    });
  }
  if (order.orderStatus == "Delivered") {
    return res.status(404).json({
      status: "failed",
      message: "This product has been delivered..",
    });
  }
  if (req.body.status === "Shipped") {
    order.orderProduct.forEach(async (odr) => {
        // console.log(odr.product.id)
      await updateStock(odr.product, odr.quantity);
    });
  }
  order.orderStatus= req.body.status
  if (req.body.status === "Delivered") {
    order.deliveredDate = Date.now();
  }
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message:'Order Status Updated successfully'
  });
};

async function updateStock(id, quantity) {
    // console.log("id",id, quantity)
  const product = await ProductModels.findById(id);
//   console.log(product)
  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Delete Order -- Admin
exports.deleteOrder = async (req, res) => {
  console.log(req.params.id, 'delete-order-id')
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order Not Found.",
      });
    }
    await order.remove();
    res.status(200).json({
      status: "success",
    });
  } catch (e) {
    res.status(400).json({
      status: "failed",
      message: e.message,
    });
  }
};
