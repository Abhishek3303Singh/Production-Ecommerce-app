import { bySize } from "./sizeSort";
export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`
export const getPricing = (p={})=>{
    const price = Number(p.price) || 0 ;
    const offer = Number(p.offerPrice) || price
    const off = price > 0 && offer < price ? Math.round((1-offer / price) * 100) : 0
    
    return {price, offer, off}
}

export const isSoldOut = (p={}) => !(Number(p.Stock) > 0)

// sizes that are actually instock

export const getSizes = (p = {}) => {
    return [...new Set((p.variants || []).filter((v)=>v.size && Number(v.stock) > 0 ).map((v)=>v.size))].sort(bySize)
}