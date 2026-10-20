const ORDER_STATUS = Object.freeze({
    PENDING: 'Pending payment',
    IN_PROCESS: 'In process',
    SHIPPED: 'Shipped',
    ON_THE_WAY: 'On the way',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  });
  
  // The order an admin moves a paid order through (forward only)
  const FULFILMENT_FLOW = [
    ORDER_STATUS.IN_PROCESS,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.ON_THE_WAY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
  ];
  
  module.exports = { ORDER_STATUS, FULFILMENT_FLOW };