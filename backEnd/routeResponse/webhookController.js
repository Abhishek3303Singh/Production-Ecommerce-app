const crypto = require('crypto');
const Order = require("../dataBase/product/order");


exports.razorpayWebhook = async (req, res) => {
    try {
        // Verify webhook signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (signature !== digest) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        const event = req.body.event;
        const payment = req.body.payload.payment.entity;

        switch (event) {
            case 'payment.captured':
                // Payment successful
                console.log('Payment captured:', payment.id);
                
                // Update order status in database
                await Order.findOneAndUpdate(
                    { 'paymentInformation.id': payment.id },
                    {
                        'paymentInformation.status': 'captured',
                        orderStatus: 'Processing'
                    }
                );
                break;

            case 'payment.failed':
                console.log('Payment failed:', payment.id);
                
                await Order.findOneAndUpdate(
                    { 'paymentInformation.id': payment.id },
                    {
                        'paymentInformation.status': 'failed',
                        orderStatus: 'Failed'
                    }
                );
                break;

            default:
                console.log('Unhandled event:', event);
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: error.message });
    }
};