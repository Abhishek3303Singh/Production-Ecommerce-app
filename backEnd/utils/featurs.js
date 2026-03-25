class Featurs{
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    // Search Products
    search(){
        const { keyword } = this.queryString;
        if (keyword && keyword.trim() !== ''){
            const searchTerm = keyword.trim();
            this.query = this.query.find({
                $or:[
                    {name:{$regex: searchTerm, $options:'i'}},
                    { title: { $regex: searchTerm, $options: "i" } },
                    { brand: { $regex: searchTerm, $options: "i" } },
                    { description: { $regex: searchTerm, $options: "i" } },
                    { category: { $regex: searchTerm, $options: "i" } },
                    { searchKeywords: { $regex: searchTerm, $options: "i" } },
                ]
            })
        }
        return this
    }

    // Filter the Product;
    filter(){
        const copyQuery = {...this.queryString}
        // console.log(copyQuery)

        // remove some fileds from query then filter
        // list of fields which is not required

       const arrOfremoveFields = ["keyword", 'page', 'limit'];
        arrOfremoveFields.forEach(key=>delete copyQuery[key])
        // console.log(copyQuery)

        // price filter
        let queryString = JSON.stringify(copyQuery)
        // console.log(queryString, 'queryString')
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`)
        // console.log(queryString, 'queryString')
        this.query = this.query.find(JSON.parse(queryString))
        // console.log(copyQuery)
        // console.log(this.query)
        return this;

    }
    // Pagination -- Item Per Page
    pagination(itemPerPage){
        const currentPage = Number(this.queryString.page)|| 1;
        const skip = itemPerPage *(currentPage-1)
        this.query = this.query.limit(itemPerPage).skip(skip)
        return this;
    }
    sort() {
        if (this.queryString.sort) {
          const sortBy = this.queryString.sort.split(',').join(' ');
          this.query = this.query.sort(sortBy);
        } else {
          // Default sort by newest first
          this.query = this.query.sort({ createdAt: -1 });
        }
        return this;
      }
}
module.exports = Featurs