import './myOrder.css'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { clearErr, myOrdersDetails } from '../../store/myOrderSlice'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import Loader from '../layout/loader/Loader'
import { STATUSES } from '../../store/myOrderSlice'
import MetaData from '../routes/MetaData'

const statusConfig = {
    Delivered: { color: 'delivered', label: 'Delivered' },
    Shipped: { color: 'shipped', label: 'Shipped' },
    Processing: { color: 'processing', label: 'Processing' },
    Cancelled: { color: 'cancelled', label: 'Cancelled' },
};

const MyOrder = () => {
    const { status, resError, myOrders } = useSelector((state) => state.myOrders)
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()

    useEffect(() => {
        if (resError) {
            alert.error(myOrders.message)
            dispatch(clearErr())
        } else {
            dispatch(myOrdersDetails())
        }
    }, [dispatch])

    if (status === 'loading') {
        return <Loader />
    }

    const hasOrders = myOrders?.orders?.length > 0;

    return (
        <>
            <MetaData title='My Orders'></MetaData>

            <div className="orders-page">
                <div className="orders-page-header">
                    <h1>My Orders</h1>
                    {hasOrders && (
                        <span className="orders-count">{myOrders.orders.length} order{myOrders.orders.length > 1 ? 's' : ''}</span>
                    )}
                </div>

                {!hasOrders ? (
                    <div className="orders-empty">
                        <span className="orders-empty-icon">📦</span>
                        <h3>No orders yet</h3>
                        <p>When you place an order, it'll show up here.</p>
                        <button onClick={() => navigate('/products')}>Start Shopping</button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {myOrders.orders.map((item) => {
                            const statusInfo = statusConfig[item.orderStatus] || statusConfig.Processing;
                            const orderDate = item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })
                                : null;

                            return item.orderProduct?.map((prod, key) => (
                                <Link to={`/order/details/${item._id}`} className="order-card" key={`${item._id}-${key}`}>
                                    <div className="order-card-img">
                                        <img src={prod.image} alt={prod.title} />
                                    </div>

                                    <div className="order-card-body">
                                        <h3 className="order-card-title">{prod.title}</h3>
                                        {orderDate && <span className="order-card-date">Ordered on {orderDate}</span>}
                                        <span className="order-card-id">Order #{item._id?.slice(-8).toUpperCase()}</span>
                                    </div>

                                    <div className="order-card-meta">
                                        <span className="order-card-price">
                                            ₹{(parseInt(prod.offerPrice) + (parseInt(prod.offerPrice)) * 0.28).toFixed(0)}
                                        </span>
                                        <span className={`order-status-badge ${statusInfo.color}`}>
                                            <span className="status-dot"></span>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        })}
                    </div>
                )}
            </div>
        </>
    )
}
export default MyOrder