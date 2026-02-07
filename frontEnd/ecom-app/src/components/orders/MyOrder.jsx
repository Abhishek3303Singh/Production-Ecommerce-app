import './myOrder.css'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { clearErr, myOrdersDetails } from '../../store/myOrderSlice'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Loader from '../layout/loader/Loader'
import { STATUSES } from '../../store/myOrderSlice'
import { Link } from 'react-router-dom'
import MetaData from '../routes/MetaData'
const MyOrder = () => {
    const { status, resError, myOrders } = useSelector((state) => state.myOrders)
    console.log(myOrders, 'MyOrders')
    const dispatch = useDispatch()
    const alert = useAlert()
    const navigate = useNavigate()

    useEffect(() => {
        if (resError) {
            alert.error(myOrders.message)
            dispatch(clearErr())
        }
        else {
            dispatch(myOrdersDetails())
        }
    }, [dispatch])

    if (status === 'loading') {
        return (
            <Loader />
        )
    }
    return (
        <>
        <MetaData title='myOrders'></MetaData>
            <header className='order-heading'>
                My Orders
            </header>
            <div className="my-orders-container">
                {
                    myOrders?.orders?.map((item, key) => (



                        // console.log(item.orderProduct,'Order-Products')
                        // console.log('Controller is There', item.orderProduct)
                        // setOrderStatus(item?.orderStatus)
                        (item?.orderProduct?.map((prod, key) => (
                            <Link to={`/order/details/${item._id}`}>
                                <div className="ordercart" key={item.product}>
                                    <div className="order-img-container">
                                        <img src={prod.image} alt="" />

                                    </div>
                                    <div className='order-prod-title'>
                                        <h3 className='orders-text'>{prod.title}</h3>
                                    </div>
                                    <div className="order-price-container">
                                        <h3 className='orders-text'> ₹{(parseInt(prod.offerPrice) + (parseInt(prod.offerPrice)) * 0.28).toFixed(1)}</h3>
                                    </div>
                                    <div className="order-status">
                                        <h3 className='orders-text'><span className={item.orderStatus == 'Delivered' ? 'delivered-dot' : 'inprocess-dot'}></span>
                                            <span className={item.orderStatus == 'Delivered' ? 'delivered' : 'inprocess'}></span>{item.orderStatus}</h3>
                                    </div>
                                </div>
                            </Link>
                        )))


                    ))
                }
            </div>
        </>
    )
}
export default MyOrder