module.exports={
    Fashion :{
        hasVariants:true,
        genders:['Men', 'Women', 'Kids', 'Unisex'],
        types:{
            'T-Shirt':{size:['XS', 'S', 'M', 'L', 'XL', 'XXL'], attributes:['Material', 'Fit', 'Sleeve', 'Pattern', 'Neck']},
            'Shirt':{size:['XS', 'S', 'L', 'XL', 'XXL'], attributes:['Material', 'Fit', 'Sleeve', 'Pattern']},
            'Jeans':{size:['28', '30', '32', '34', '36', '38'], attributes:['Material', 'Fit', 'Rise', 'Wash']},
            'Kurtas':{size:['S', 'L', 'XL', 'XXL'], attributes:['Material', 'Fit', 'Sleeve', 'Occasion']},
            'Dresses':{size:['XS', 'S', 'L', 'XL'], attributes:['Material', 'Length', 'Occasion', 'Pattern']},
            'Footwear':{size:['6', '7', '8', '9', '10'], attributes:['Material', 'Closure', 'Occasion']}
        }
    },
    Electronics: {
        hasVariants: false,
        types: {
          'Smartwatch':        { attributes: ['Display Type', 'Strap Material', 'Connectivity', 'Battery Life', 'Water Resistance'] },
          'Earbuds':           { attributes: ['Type', 'Connectivity', 'Battery Life', 'Water Resistance', 'Mic'] },
          'Bluetooth Speaker': { attributes: ['Speaker Type', 'Connectivity', 'Battery Life', 'Water Resistance'] },
          'Headphones':        { attributes: ['Type', 'Connectivity', 'Battery Life', 'Noise Cancellation'] },
          'PC Accessories':    { attributes: ['Connectivity', 'Compatibility'] },
        },
    },

    'Sports & Fitness': {
        hasVariants: false,
        types: {
          'Gym Accessories':   { attributes: ['Material', 'Suitable For'] },
          'Fitness Equipment': { attributes: ['Material', 'Weight', 'Suitable For'] },
        },
      },
      Beauty: {
        hasVariants: false,
        types: {
          'Deodorant': { attributes: ['Volume', 'Fragrance', 'Gender'] },
          'Skin Care':  { attributes: ['Volume', 'Skin Type'] },
          'Make-up':    { attributes: ['Shade', 'Finish'] },
        },
      },
}