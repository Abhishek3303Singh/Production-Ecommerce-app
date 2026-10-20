
const OrderModel = require("../dataBase/product/order");
const ProductModels = require("../dataBase/product/Product");
const { ORDER_STATUS, FULFILMENT_FLOW } = require("../utils/orderStatus");


const notPending = { orderStatus: { $ne: ORDER_STATUS.PENDING } };

// create Order
// exports.creatNewOrder = async (req, res) => {
//   try {
//     // console.log(req.body.order)
//     const {
//       shippingAddress,
//       orderProduct,
//       paymentInformation,
//       productPrice,
//       vatPrice,
//       shippingPrice,
//       totalPrice,
//     } = req.body.order;
//     const enrichedShippingAddress = {
//       ...shippingAddress,
//       location: {
//         type: 'Point',
//         coordinates: [
//           shippingAddress.lng || 0,  // longitude FIRST
//           shippingAddress.lat || 0   // latitude second
//         ]
//       }
//     };

//     // console.log('enrichedShippingAddress', enrichedShippingAddress)
//     const order = await OrderModel.create({
//       shippingAddress: enrichedShippingAddress,
//       orderProduct,
//       paymentInformation,
//       productPrice,
//       vatPrice,
//       shippingPrice,
//       totalPrice,
//       paidAtDate: Date.now(),
//       user: req.user._id,
//     });

//     res.status(200).json({
//       status: "success",
//       order,
//     });
//   } catch (e) {
//     res.status(400).json({
//       status: "failed",
//       message: e.message,
//     });
//   }
// };

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
    const ownerId = String(order.user?._id || order.user);
    const isOwner = ownerId === String(req.user._id);
    const isAdmin = req.user.role === "Admin";
    if (!isOwner && !isAdmin) {
  
      return res.status(404).json({ status: "failed", message: "Order not found!" });
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
    const orders = await OrderModel.find({ user: req.user._id, ...notPending }).sort({_id:-1});
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
    const orders = await OrderModel.find(notPending).sort({_id:-1});

    let totalOrdervalue = 0;
    orders.filter((o)=>o.orderStatus !== ORDER_STATUS.CANCELLED).reduce((sum, o)=> sum + o.totalPrice, 0)
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
  const {status} = req.body
  const order = await OrderModel.findById(req.params.id);
  if (!order) {
    return res.status(404).json({
      status: "failed",
      message: "Product not found",
    });
  }
  if([ORDER_STATUS.PENDING , ORDER_STATUS.CANCELLED].includes(order.orderStatus)){
    return res.status(400).json({
      status:'failed',
      message: `A ${order.status} order can't be updated.`
    })
  }

  if (order.orderStatus == ORDER_STATUS.DELIVERED) {
    return res.status(404).json({
      status: "failed",
      message: "This order has already been delivered.",
    });
  }
const from = FULFILMENT_FLOW.indexOf(order.orderStatus)
const to = FULFILMENT_FLOW.indexOf(status)
if(to==-1){
  return res.status(400).json({
    status:'failed',
    message:'Invalid status.'
  })
}
if(to<=from){
  return res.status(400).json({
    status:'failed',
    message:'An order can mobve only forward.'
  })
}
// Save the change or update the status
order.orderStatus = status;

if(status === ORDER_STATUS.DELIVERED) order.deliveredDate = new Date();
await order.save({validateBeforeSave:false})

  res.status(200).json({
    status: "success",
    message:'Order status updated successfully'
  });
};


// Delete Order -- Admin
exports.deleteOrder = async (req, res) => {
  // console.log(req.params.id, 'delete-order-id')
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: "failed",
        message: "Order not found.",
      });
    }
    if(order.paymentInformation?.status === 'succeeded'){
      return res.status(400).json({
        status:'failed',
        message:"Paid order can't be deleted."
      })
    }

    await order.deleteOne();
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
