const mongoose = require("mongoose");
const {ORDER_STATUS } = require('../../utils/orderStatus')
const orderSchema = new mongoose.Schema({
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    instate: { type: String, required: true },
    pincode: { type: Number, required: true },
    landmark: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    phoneNo: { type: Number, required: true },
    lat:{type:Number},
    lng:{type:Number},
     // GeoJSON for geospatial querie
     location:{
      type:{
        type:String,
        enum:['Point'],
        default:'Point'
      },
      coordinates:{
        type:[Number],
        default:[0,0]
      }
     },
  },
  orderProduct: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "products",
        required: true,
      },
      name: { type: String, required: true },
      price: { type: String, required: true },
      offerPrice: { type: String, required: true },
      image: { type: String, required: true },
      stock: { type: String },
      title: { type: String },
      quantity: { type: String, required: true },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
  paymentInformation: {
    id: { type: String},
    status: { type: String, default:'pending'},
  },
  razorpayOrderId:{type : String, unique:true, sparse:true}, // i m linking order to Razorpay..
  paidAtDate: { type: Date},
  productPrice: { type: Number, required: true },
  vatPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  orderStatus: { type: String, required: true, enum: Object.values(ORDER_STATUS), default:ORDER_STATUS.IN_PROCESS},
  deliveredDate: { type: Date},
},
{timestamps:true}
);

orderSchema.index({"shippingAddress.location": "2dsphere"})
orderSchema.index(
  {createdAt: 1},
  {expireAfterSeconds: 60* 60 * 24, partialFilterExpression:{orderStatus:ORDER_STATUS.PENDING}}
)

module.exports = mongoose.model("Order", orderSchema);
