const OrderModel = require('../dataBase/product/order');
const ProductModels = require('../dataBase/product/Product');
const UserModel = require('../dataBase/User');
const { ORDER_STATUS } = require('../utils/orderStatus');

const TZ = 'Asia/Kolkata';
const DAY_MS = 24 * 60 * 60 * 1000;
const LOW_STOCK = 5;

// Revenue counts only paid orders that were not cancelled
const PAID = {
  'paymentInformation.status': 'succeeded',
  orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] },
};

const istDay = (d) => d.toLocaleDateString('en-CA', { timeZone: TZ });   // YYYY-MM-DD
const lastDays = (n) =>
  Array.from({ length: n }, (_, i) => istDay(new Date(Date.now() - (n - 1 - i) * DAY_MS)));
const pctChange = (now, before) =>
  before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null;
const toInt = (f) => ({ $convert: { input: f, to: 'int', onError: 0, onNull: 0 } });
const toNum = (f) => ({ $convert: { input: f, to: 'double', onError: 0, onNull: 0 } });

exports.getDashboardStatus = async (req, res) => {
  try {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;

    const dayList = lastDays(days);
    const since = new Date(`${dayList[0]}T00:00:00+05:30`);       // midnight IST, first day
    const prevSince = new Date(since.getTime() - days * DAY_MS);  // the period before it

    const [split, daily, pipeline, topProducts, stock, lowStock, recent, userAgg, pendingCount, cities] =
      await Promise.all([
        // This period vs the previous one
        OrderModel.aggregate([
          { $match: { ...PAID, paidAtDate: { $gte: prevSince } } },
          { $group: { _id: { $gte: ['$paidAtDate', since] }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
        ]),

        // Revenue per day (IST)
        OrderModel.aggregate([
          { $match: { ...PAID, paidAtDate: { $gte: since } } },
          { $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAtDate', timezone: TZ } },
              revenue: { $sum: '$totalPrice' },
              orders: { $sum: 1 },
          } },
        ]),

        // Orders by status (all time, excluding unpaid attempts)
        OrderModel.aggregate([
          { $match: { orderStatus: { $ne: ORDER_STATUS.PENDING } } },
          { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]),

        // Top products by revenue in the period
        OrderModel.aggregate([
          { $match: { ...PAID, paidAtDate: { $gte: since } } },
          { $unwind: '$orderProduct' },
          { $group: {
              _id: '$orderProduct.product',
              title: { $first: '$orderProduct.title' },
              image: { $first: '$orderProduct.image' },
              units: { $sum: toInt('$orderProduct.quantity') },
              revenue: { $sum: { $multiply: [toNum('$orderProduct.offerPrice'), toNum('$orderProduct.quantity')] } },
          } },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
        ]),

        // Stock health
        ProductModels.aggregate([
          { $group: {
              _id: null,
              total: { $sum: 1 },
              out: { $sum: { $cond: [{ $lte: ['$Stock', 0] }, 1, 0] } },
              low: { $sum: { $cond: [{ $and: [{ $gt: ['$Stock', 0] }, { $lte: ['$Stock', LOW_STOCK] }] }, 1, 0] } },
          } },
        ]),
        ProductModels.find({ Stock: { $lte: LOW_STOCK } })
          .sort({ Stock: 1 }).limit(8).select('title Stock category Image').lean(),

        // Recent paid orders
        OrderModel.find({ orderStatus: { $ne: ORDER_STATUS.PENDING } })
          .sort({ _id: -1 }).limit(8)
          .populate('user', 'name')
          .select('totalPrice orderStatus paidAtDate shippingAddress.name user').lean(),

        // Customers: total, this period per day, previous period count
        UserModel.aggregate([
          { $project: { created: { $toDate: '$_id' } } },
          { $facet: {
              total: [{ $count: 'n' }],
              current: [
                { $match: { created: { $gte: since } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$created', timezone: TZ } }, n: { $sum: 1 } } },
              ],
              previous: [{ $match: { created: { $gte: prevSince, $lt: since } } }, { $count: 'n' }],
          } },
        ]),

        // Checkouts started but not paid (cleaned up after 24h)
        OrderModel.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),

        // Where orders go
        OrderModel.aggregate([
          { $match: { ...PAID, paidAtDate: { $gte: since } } },
          { $group: {
              _id: { $toLower: { $trim: { input: { $ifNull: ['$shippingAddress.city', ''] } } } },
              orders: { $sum: 1 },
              revenue: { $sum: '$totalPrice' },
          } },
          { $match: { _id: { $ne: '' } } },
          { $sort: { orders: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const cur = split.find((r) => r._id === true) || { revenue: 0, orders: 0 };
    const prev = split.find((r) => r._id === false) || { revenue: 0, orders: 0 };

    const dailyMap = new Map(daily.map((d) => [d._id, d]));
    const series = dayList.map((date) => ({
      date,
      revenue: dailyMap.get(date)?.revenue || 0,
      orders: dailyMap.get(date)?.orders || 0,
    }));

    const u = userAgg[0] || { total: [], current: [], previous: [] };
    const userMap = new Map(u.current.map((d) => [d._id, d.n]));
    const newCustomers = u.current.reduce((s, d) => s + d.n, 0);
    const prevCustomers = u.previous[0]?.n || 0;

    const s = stock[0] || { total: 0, out: 0, low: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        days,
        kpis: {
          revenue: { value: cur.revenue, change: pctChange(cur.revenue, prev.revenue) },
          orders: { value: cur.orders, change: pctChange(cur.orders, prev.orders) },
          avgOrderValue: { value: cur.orders ? Math.round(cur.revenue / cur.orders) : 0 },
          newCustomers: { value: newCustomers, change: pctChange(newCustomers, prevCustomers) },
        },
        totals: { products: s.total, customers: u.total[0]?.n || 0, awaitingPayment: pendingCount },
        series,
        signups: dayList.map((date) => ({ date, count: userMap.get(date) || 0 })),
        pipeline: Object.fromEntries(pipeline.map((p) => [p._id, p.count])),
        topProducts,
        cities: cities.map((c) => ({ city: c._id, orders: c.orders, revenue: c.revenue })),
        stock: { total: s.total, out: s.out, low: s.low, inStock: s.total - s.out - s.low, lowList: lowStock },
        recent,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'failed', message: e.message });
  }
};