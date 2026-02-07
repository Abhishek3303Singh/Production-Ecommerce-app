const produtsModel = require("../dataBase/product/Product")
const Trie = require("./trie")

const productsTrie =new Trie;

async function buildTrieSuggestion(){
    const products = await produtsModel.find({}, "searchKeywords")
    // inserting all the products in my product Trie one by one
    products.forEach(product=>{
        product.searchKeywords.forEach(keyword=>{
            productsTrie.insert(keyword.toLowerCase())
        })
    })

    console.log("Product TRIE IS LOADING")

}

module.exports = {productsTrie, buildTrieSuggestion};