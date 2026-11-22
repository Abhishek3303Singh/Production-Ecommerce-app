const ORDER=['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
const rank = (size)=>{
    const i = ORDER.indexOf(String(size).toUpperCase())
     return i === -1 ? 100 : i
    }


export const bySize = (a,b)=>{
   return rank(a) - rank(b) || String(a).localeCompare(String(b), undefined, {numeric:true})
}