export const ORDER_STATUS = Object.freeze({
    PENDING: 'Pending payment',
    IN_PROCESS: 'In process',
    SHIPPED: 'Shipped',
    ON_THE_WAY: 'On the way',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
});

export const FULFILMENT_FLOW = [
    ORDER_STATUS.IN_PROCESS,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.ON_THE_WAY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
];

// CSS class per status (the first five already exist in your CSS)
export const STATUS_CLASS = {
    [ORDER_STATUS.PENDING]: 'inprocess',
    [ORDER_STATUS.IN_PROCESS]: 'inprocess',
    [ORDER_STATUS.SHIPPED]: 'shipped',
    [ORDER_STATUS.ON_THE_WAY]: 'onWay',
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 'outDelivery',
    [ORDER_STATUS.DELIVERED]: 'delivered',
    [ORDER_STATUS.CANCELLED]: 'cancelled',
};