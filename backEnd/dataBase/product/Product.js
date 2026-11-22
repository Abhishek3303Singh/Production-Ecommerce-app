const mongoose = require('mongoose');
const variantSchema = mongoose.Schema({
    sku:{
        type:String,
        trim: true,
    },
    size:{
        type:String,
        trim:true,
        default:''
    },
    color:{
        type:String,
        trim:true,
        default:''
    },
    colorHex:{
        type:String,
        trim:true,
        match:[/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Invalid color code']
    },
    stock:{
        
        type:Number,
        required:true,
        min:[0, 'Stock can not be negative'], 
        default:0
        
    }
});
variantSchema.pre('validate', function (next){
    if(!this.size || ! this.color){
        return next(new Error('color and size reuired for eatch variant'))
    }
    next()
})
const productSchema = mongoose.Schema({
    title:{
        type:String,
        // require:[true, 'Please Enter The Productg Title']
        required:true,
        minLength:2,
        maxLength:200,


    },
    name:{
        type: String,
        required:[true, "Please Enter Product  Name"],
        minLength:4,
        maxLength:300,
    },
    brand:{
        type: String,
        required:[true, "Please Enter Brand Name"],
        minLength:2,
        maxLength:200,
    },
    category:{
        type:String,
        required:[true, "Please Add Product Category"],
        trim:true
    },
    productType:{
        type:String,
        required:[true, 'Please Add Product-Type'],
        trim:true
    },
    gender:{
        type:String,
        enum:{values:['Men', 'Women', 'Kids', 'Unisex'], message:'Invalid gender'  }
    },
    attributes:{
        type:Map,
        of:String,
        default:{}
    },
    variants:{
        type:[variantSchema], default:[]
    },

    price:{
        type:Number,
        required:[true],
        min:0
    },
    offerPrice:{
        type:Number,
        required:[true],
        min:0
    },
    Image:[
        {
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            }
        }
    ],
  
    description:{
        type: String,
        required:[true, "Please Add Product description."]
    },
    searchKeywords: {
        type: [String],
        index: true,
        required:[true, 'Add searchKeywords']
      },
    Stock:{
        type: Number,
        required:[true],
        maxLength:[3],
        min:0,
        default: 0
    },
    ratings:{
        type:Number,
        default :0
    },
    reviewsCount:{
        type: Number,
        default: 0
    },
    customerReview:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"users",
                require:true
            },  
            name:{
                type: String,
                // required: true
            },

            rating:{
                type:Number,
                
            },
            feedback:{
                type: String,

            }
        },
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
        require:true
    },
    views:{
        type:Number,
        default:0
    },
    sold:{
        type:Number,
        default:0
    },              

    
}, {timestamps:true});

productSchema.pre('validate', function(next){
    if(this.variants && this.variants.length){
        const seen = new Set();
        for(const vari of this.variants){
            const key = `${(vari.size || '').toLowerCase()} | ${(vari.color || '').toLowerCase()}`
            if(seen.has(key)) return next(new Error(`Dupicate variant: ${[vari.size, vari.color].filter(Boolean).join(' / ')}`))
            seen.add(key)
        }
        this.Stock = this.variants.reduce((sum, v)=> sum + (v.stock || 0), 0)
    }
    // only check price when they changed...

    if((this.isNew || this.isModifield('price') || this.isModifield('offerPrice')) && this.offerPrice> this.price){
        return next(new Error('Offer price can not be grater then price'))
    }
    next()
})
productSchema.index({category:1, productType:1, brand:1})
productSchema.index({category:1, price:1})
productSchema.index({createdAt:-1})
module.exports = mongoose.model("products", productSchema)