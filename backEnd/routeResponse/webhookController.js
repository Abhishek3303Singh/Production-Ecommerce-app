const crypto = require('crypto');
const Order = require("../dataBase/product/order");
const {markOrderPaid} = require('../utils/markOrderPaid')


exports.razorpayWebhook = async (req, res) => {
    try {
        const raw = req.rawBody;

        // Verify webhook signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const received = String(req.headers['x-razorpay-signature'] || '');

        if(!raw || !received) return res.sendStatus(400);

        const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
        
        const a = Buffer.from(expected);
        const b = Buffer.from(received);
        if(a.length !== b.length || !crypto.timingSafeEqual(a,b)) return res.sendStatus(400);

        const { event, payload } = req.body;

        if(event === 'paymet.captured' || event === 'order.paid'){
            const paymet = payload.payment.entity;
            await markOrderPaid(paymet.order_id, paymet.id)
        }
        return res.sendStatus(200)

        

        // switch (event) {
        //     case 'payment.captured':
        //         // Payment successful
        //         console.log('Payment captured:', payment.id);
                
        //         // Update order status in database
        //         await Order.findOneAndUpdate(
        //             { 'paymentInformation.id': payment.id },
        //             {
        //                 'paymentInformation.status': 'captured',
        //                 orderStatus: 'Processing'
        //             }
        //         );
        //         break;

        //     case 'payment.failed':
        //         console.log('Payment failed:', payment.id);
                
        //         await Order.findOneAndUpdate(
        //             { 'paymentInformation.id': payment.id },
        //             {
        //                 'paymentInformation.status': 'failed',
        //                 orderStatus: 'Failed'
        //             }
        //         );
        //         break;

        //     default:
        //         console.log('Unhandled event:', event);
        // }

        // res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: error.message });
    }
};