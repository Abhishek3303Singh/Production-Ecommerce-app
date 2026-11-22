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
      if(item.variantId && !mongoose.isValidObjectId(item.variantId)){
        throw new Error('Invalid variant')
      }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) throw new Error("Invalid quantity");
    const key = `${item.product}:${item.variantId || ''}`
    const prev= wanted.get(key)
    wanted.set(key, {product:String(item.product), variantId:item.variantId ? String(item.variantId) : '',  qty:(prev?.qty || 0) + qty});
  }
const ids = [...new Set([...wanted.values()].map((w)=>w.product))]

  // i m reading from primary db bacause replica may shows stale stock

  const products = await ProductModels.find({_id: { $in: ids}}).read("primary");

  const byId = new Map(products.map((prod) => [String(prod._id), prod]));
  const orderProduct = [];
  for (const {product:id, variantId, qty} of wanted.values()) {
    const prd = byId.get(id);
    // now i m checking cart product is available is db or not

    if (!prd)
      throw new Error("A product is in your cart is no longer available");
      let variant = null 
      let available = prd.Stock;
      if(prd?.variants.length){
        if(!variantId){
          throw new Error(`Please choose size/color for ${prd.title}`)
        }
        variant = prd.variants.id(variantId)
        if(!variant){
          throw new Error(`${prd.title} that option is no longer available.`)
        }
        available = variant.Stock
      }
      else if(variantId){
        throw new Error('Invalid option')
      }
      const label = variant ? `(${[variant.size, variant.color].filter(Boolean).join(', ')})` : '';

    if (qty > MAX_QTY_PER_ITEM)
      throw new Error(`You can buy at most ${MAX_QTY_PER_ITEM} of ${prd.title} ${label}`);
    if (available < qty)
      throw new Error(`${prd.title} ${label} has only ${available} left`);
    orderProduct.push({
      product: prd._id,
      variantId:variant?._id,
      color:variant?.color,
      size:variant?.size,
      sku:variant?.sku,
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
