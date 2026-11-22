export const GST_RATE = 0.18
export const FREE_SHIPPING_ABOVE = 499
export const SHIPPING_FEE = 40


const round2 =(n)=>Math.round((n + Number.EPSILON)*100)/100;
export const lineKey = (i) => `${i.product}:${i.variantId || ''}`

export const cartTotal = (items = [])=>{
    const mrp = items.reduce((sum, item)=> sum + Number(item.price || 0 ) * Number(item.quantity || 0), 0)
    const subTotal = round2(items.reduce((sum, item)=> sum + Number(item.offerPrice || 0) * Number(item.quantity || 0), 0))
    const gst = round2(subTotal * GST_RATE)
    const shipping = subTotal === 0 || subTotal >=FREE_SHIPPING_ABOVE ? 0 :SHIPPING_FEE
    return{
        mrp,
        subTotal,
        discount:Math.max(0, round2(mrp-subTotal)),
        gst,
        shipping,
        total:round2(subTotal + gst + shipping),
        itemCount:items.reduce((sum, item)=> sum + Number(item.quantity || 0), 0),
    }
}
  