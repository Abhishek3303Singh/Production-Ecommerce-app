const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`)

exports.paymentProcess= async(req, res, next)=>{
    try{
        // console.log(req.body, 'payment1')
        // console.log(req.body.amount, 'payment2')

        const payment = await stripe.paymentIntents.create({
            amount:req.body.amount,
            currency:'inr',
            metadata:{
                company:'FunHub'
            }
        })
        // console.log(payment, 'paymentresponse')
        
        res.status(200).json({
            status:'success',
            client_secret:payment.client_secret
        })
    }
    catch(e){
        res.status(400).json({
            status:'failed',
            message:e.message
        })

    }
} 

exports.stripeKeySend= async(req, res, next)=>{
    try{
        // console.log('StripeApiKey=',process.env.STRIPE_API_KEY)
        res.status(200).json({
            status:'success',
            stripeApiKey:`${process.env.STRIPE_API_KEY}`
        })
    }
    catch(e){
        res.status(400).json({
            status:'failed',
            message:e.message
        })

    }
} 