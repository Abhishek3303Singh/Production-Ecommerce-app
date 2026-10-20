import React, { useState, useEffect } from 'react'
import './updateOrder.css'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { getOrderDetails, clearError } from '../../store/orderDetailsSlice'
import { clrErr, setUpdateOrderStatus, resetIsUpdate } from '../../store/allOrdersSlice'
import Loader from '../../components/layout/loader/Loader'
import SideBar from '../SideBar'
import { ORDER_STATUS, FULFILMENT_FLOW, STATUS_CLASS } from '../../utils/orderStatus'

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const PAYMENT_LABEL = {
    succeeded: ['Paid', 'pay-ok'],
    pending: ['Awaiting payment', 'pay-wait'],
    failed: ['Failed', 'pay-bad'],
    refund_pending: ['Refund needed', 'pay-bad'],
    refunded: ['Refunded', 'pay-wait'],
}

const UpdateOrders = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const alert = useAlert()
    const { order, resError } = useSelector((state) => state.orderDetails)
    const { status: updateStatus, resError: updateError, updateOrder, isUpdated } =
        useSelector((state) => state.allOrders)

    const [nextStatus, setNextStatus] = useState('')

    // 1. Load the order when the id changes
    useEffect(() => {
        dispatch(getOrderDetails(id))
    }, [dispatch, id])

    // 2. Load errors
    useEffect(() => {
        if (resError) {
            alert.error(order?.order?.message || 'Could not load this order')
            dispatch(clearError())
        }
    }, [resError, order, alert, dispatch])

    // 3. Update errors
    useEffect(() => {
        if (updateError) {
            alert.error(updateOrder?.message || 'Could not update the order')
            dispatch(clrErr())
        }
    }, [updateError, updateOrder, alert, dispatch])

    // 4. After a successful update: notify, reset the form, refetch ONCE
    useEffect(() => {
        if (isUpdated) {
            alert.success('Order status updated')
            setNextStatus('')
            dispatch(resetIsUpdate())
            dispatch(getOrderDetails(id))
        }
    }, [isUpdated, id, alert, dispatch])

    const o = order?.order
    // Don't show a previously opened order while the new one loads
    if (!o || String(o._id) !== String(id)) return <Loader />

    const current = o.orderStatus
    const pay = o.paymentInformation || {}
    const [payText, payClass] = PAYMENT_LABEL[pay.status] || [pay.status || '—', 'pay-wait']
    const statusClass = STATUS_CLASS[current] || 'inprocess'
    const updating = updateStatus === 'loading'

    // Only the next step in the flow is offered
    const idx = FULFILMENT_FLOW.indexOf(current)
    const nextOptions = idx === -1 ? [] : FULFILMENT_FLOW.slice(idx + 1, idx + 2)

    const handleSubmit = () => {
        if (!nextStatus) return alert.error('Choose a status first')
        if (
            nextStatus === ORDER_STATUS.DELIVERED &&
            !window.confirm('Mark this order as delivered? This cannot be undone.')
        ) return
        dispatch(setUpdateOrderStatus(nextStatus, id))
    }

    return (
        <div className="upade-order-container">
            <div className="order-sidebar"><SideBar /></div>

            <div>
                <header className="update-order-heading">Update Order Panel</header>

                {/* Payment captured but the order was cancelled: needs a manual refund */}
                {pay.status === 'refund_pending' && (
                    <div className="refund-banner">
                        Payment received but the order was cancelled (out of stock). Refund payment{' '}
                        <b>{pay.id}</b> from the Razorpay dashboard.
                    </div>
                )}

                <div className="orderDetails-container">
                    <div className="left-orderDetails-container">
                        <div className="orderDetails-address">
                            <h3>Order #{o._id}</h3>
                        </div>

                        <div className="heading-orderDetails">
                            <h3>Customer: {o.user?.name || '—'}</h3>
                            <p>{o.user?.email}</p>
                            <p>User ID: {o.user?._id || o.user}</p>
                        </div>

                        <div className="address-text-orderUpdate">
                            <div className="address-delivery">
                                <h3>Delivery Address</h3>
                                <h4><span>Name:&#160;</span>{o.shippingAddress?.name}</h4>
                                <p><span>Phone:&#160;</span>{o.shippingAddress?.phoneNo}</p>
                                <p>
                                    <span>Address:&#160;</span>{o.shippingAddress?.address}, City:&#160;{o.shippingAddress?.city},&#160;
                                    State:&#160;{o.shippingAddress?.instate}, Pincode:&#160;{o.shippingAddress?.pincode},&#160;
                                    <b>Landmark:&#160;</b>{o.shippingAddress?.landmark}
                                </p>
                            </div>

                            <div className="orderDetails-status">
                                <h3>Order-Status</h3>
                                <p>Ordered:&#160;{fmtDate(o.createdAt || o.paidAtDate)}</p>
                                <p>Status:&#160;<span className={`status-pill ${statusClass}`}>{current}</span></p>
                                {current === ORDER_STATUS.DELIVERED && (
                                    <p>Delivered on {fmtDate(o.deliveredDate)}</p>
                                )}
                            </div>

                            <div className="orderDetails-payment-status">
                                <h3>Payment-Status</h3>
                                <p><span className={`status-pill ${payClass}`}>{payText}</span></p>
                                <p>Paid:&#160;{fmtDate(o.paidAtDate)}</p>
                                {pay.id && <p className="pay-id">Payment ID: {pay.id}</p>}
                            </div>
                        </div>

                        {o.orderProduct?.map((item, i) => (
                            <div className="ordersDetails-img-container" key={`${item.product}-${i}`}>
                                <img src={item.image} alt={item.title || item.name} />
                                <p>{item.title || item.name}</p>
                                <p>
                                    Total: {item.quantity} x {item.offerPrice} ={' '}
                                    {inr(Number(item.quantity) * Number(item.offerPrice))}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="right-orderDetails-container">
                        <div className="orderDetails-payment-details">
                            <h3>Order Summary</h3>
                            <div className="orderDetails-price-details">
                                <div className="orderDetails-price-txt">
                                    <p>Price (Items-{o.orderProduct?.length || 0})</p>
                                    <p>Tax</p>
                                    <p>Delivery Charges</p>
                                </div>
                                <div className="orderDetails-amount">
                                    <p>{inr(o.productPrice)}</p>
                                    <p>{inr(o.vatPrice)}</p>
                                    <p style={{ color: 'green' }}>
                                        {o.shippingPrice > 0 ? inr(o.shippingPrice) : 'Free'}
                                    </p>
                                </div>
                            </div>
                            <div className="orderDetails-cart-total">
                                <div className="orderDdetails-Total-Amount"><h2>Payable Amount</h2></div>
                                <div className="orderDdetails-Total-Amount"><h2>{inr(o.totalPrice)}</h2></div>
                            </div>
                        </div>

                        <div className="update-order-status">
                            <h3>Change Order Status</h3>

                            {nextOptions.length === 0 ? (
                                <p className="status-note">
                                    {current === ORDER_STATUS.DELIVERED
                                        ? 'This order is delivered. No further updates.'
                                        : `A "${current}" order can't be updated.`}
                                </p>
                            ) : (
                                <>
                                    <label htmlFor="order-status" className="sr-only">New status</label>
                                    <select
                                        id="order-status"
                                        className="order-status-select"
                                        value={nextStatus}
                                        onChange={(e) => setNextStatus(e.target.value)}
                                        disabled={updating}
                                    >
                                        <option value="">Choose status</option>
                                        {nextOptions.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>

                        {nextOptions.length > 0 && (
                            <div className="update-order-status-btn">
                                <button
                                    className="status-update-btn"
                                    onClick={handleSubmit}
                                    disabled={!nextStatus || updating}
                                >
                                    {updating ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateOrders