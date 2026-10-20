const mongoose = require("mongoose");
const ProductModels = require("../dataBase/product/Product");

const GST_RTAE = 0.18;
const FREE_SHIPPING_ABOVE = 499;
const SHIPPING_FEE = 40;
const MAX_QTY_PER_ITEM = 10;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

async function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Cart is empty");

  // merge dupicate so stock check sees the truly qty..
  const wanted = new Map();
  for (const item of items) {
    if (!mongoose.isValidObjectId(item?.product))
      throw new Error("Invalid product in cart");
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity");
    wanted.set(String(item.product), (wanted.get(String(item.product)) || 0) + qty);
  }

  // i m reading from primary db bacause replica may shows stale stock

  const products = await ProductModels.find({
    _id: { $in: [...wanted.keys()] },
  }).read("primary");
  const byId = new Map(products.map((prod) => [String(prod._id), prod]));
  const orderProduct = [];
  for (const [id, qty] of wanted) {
    const prd = byId.get(id);
    // now i m checking cart product is available is db or not

    if (!prd)
      throw new Error("A product is in your cart is no longer available");
    if (qty > MAX_QTY_PER_ITEM)
      throw new Error(`you can buy at most ${MAX_QTY_PER_ITEM}`);
    if (prd.Stock < qty)
      throw new Error(`${prd.title} has only ${prd.Stock} left`);
    orderProduct.push({
      product: prd._id,
      name: prd.name,
      title: prd.title,
      price: String(prd.price),
      offerPrice: String(prd.offerPrice),
      image: prd?.Image?.[0].url || "",
      stock: String(prd.Stock),
      quantity: String(qty),
    });
  }
  const productPrice = round2(
    orderProduct.reduce(
      (s, i) => s + Number(i.offerPrice) * Number(i.quantity),
      0
    )
  );
  const vatPrice = round2(productPrice * GST_RTAE);
  const shippingPrice = productPrice > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const totalPrice = round2(productPrice + vatPrice + shippingPrice);
  return { orderProduct, productPrice, vatPrice, shippingPrice, totalPrice };
}
module.exports = { priceCart };
