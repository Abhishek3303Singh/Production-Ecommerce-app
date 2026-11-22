import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAlert } from 'react-alert'
import { FaShoppingCart } from 'react-icons/fa'
import { BsFillLightningFill } from 'react-icons/bs'
import { addToCart } from '../../store/cartSlice'
import './addToCart.css'

const AddToCart = ({
    id,
    product,
    variantId = null,
    disabled = false,
    maxQty,
    needsSelection = false,
    onNeedSelection,
    onJumpToPicker,
    selectionLabel = '',
}) => {
    const alert = useAlert()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { isAuthenticated } = useSelector((state) => state.user)

    const [quantity, setQuantity] = useState(1)
    const [busy, setBusy] = useState(false)
    const [barVisible, setBarVisible] = useState(false)
    const anchorRef = useRef(null)

    const cap = Math.max(1, Math.min(Number(maxQty ?? product?.Stock) || 1, 10))

    // The selected variant can change; keep the quantity within its stock
    useEffect(() => { setQuantity((q) => Math.min(q, cap)) }, [cap])

    // Show the sticky bar whenever the in-page buttons are out of view
    useEffect(() => {
        const el = anchorRef.current
        if (!el || typeof IntersectionObserver === 'undefined') return
        const io = new IntersectionObserver(
            ([entry]) => setBarVisible(!entry.isIntersecting),
            { rootMargin: '-120px 0px -70px 0px' }   // ignore the strips under the sticky header and the bottom nav
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    const dec = () => setQuantity((q) => Math.max(1, q - 1))
    const inc = () => setQuantity((q) => Math.min(cap, q + 1))

    // Returns true only if the item really was added
    const addItem = async () => {
        if (disabled || busy) return false
        if (needsSelection) { onNeedSelection?.(); return false }
        if (!isAuthenticated) { navigate('/login'); return false }
        setBusy(true)
        try {
            await dispatch(addToCart(id, quantity, variantId))
            return true
        } catch (e) {
            alert.error(e?.message || 'Could not add to cart')
            return false
        } finally {
            setBusy(false)
        }
    }

    const handleAdd = async () => { if (await addItem()) alert.success('Added to your cart') }
    const handleBuyNow = async () => { if (await addItem()) navigate('/shipping') }   // checks out the whole cart, so use '/cart' if you prefer

    const price = Number(product?.offerPrice || 0).toLocaleString('en-IN')

    return (
        <>
            <div className="prdDetailsCard__detailsBlock1__3__1__1">
                <h1 className="Qty-text">Qty:</h1>
                <button type="button" className="inc-Qty" aria-label="Decrease quantity" onClick={dec} disabled={disabled || quantity <= 1}>−</button>
                <input className="Qty" readOnly type="number" value={quantity} aria-label="Quantity" />
                <button type="button" className="dec-Qty" aria-label="Increase quantity" onClick={inc} disabled={disabled || quantity >= cap}>+</button>
            </div>

            <div className="cat-btn-cont" ref={anchorRef}>
                <button type="button" className="prdDetailsCard__detailsBlock1__3__1__add" onClick={handleAdd} disabled={disabled || busy}>
                    <FaShoppingCart /> {disabled ? 'Out of stock' : busy ? 'Adding…' : 'Add to cart'}
                </button>
                <button type="button" className="prdDetailsCard__detailsBlock1__3__1__buy" onClick={handleBuyNow} disabled={disabled || busy}>
                    <BsFillLightningFill /> Buy Now At &#x20B9;{price}
                </button>
            </div>

            {/* Sticky bar on phones; rendered in <body> so no parent can break position: fixed */}
            {!disabled && createPortal(
                <div className={`buy-bar${barVisible ? ' show' : ''}`} aria-hidden={!barVisible}>
                    <button type="button" className="buy-bar-info" onClick={onJumpToPicker}>
                        <span className="buy-bar-price">&#x20B9;{price}</span>
                        {needsSelection
                            ? <span className="buy-bar-sel warn">Select a size ›</span>
                            : selectionLabel && <span className="buy-bar-sel">{selectionLabel} ›</span>}
                    </button>
                    <button type="button" className="buy-bar-add" onClick={handleAdd} disabled={busy}>Add to cart</button>
                    <button type="button" className="buy-bar-buy" onClick={handleBuyNow} disabled={busy}>Buy now</button>
                </div>,
                document.body
            )}
        </>
    )
}

export default React.memo(AddToCart)