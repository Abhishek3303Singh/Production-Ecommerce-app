import React, { useCallback, useMemo, useState } from 'react'
import { bySize } from '../../utils/sizeSort'
import './variantPicker.css'

const hasStock = (v) => Number(v?.stock) > 0

export function useVariantSelection(variants, productId) {
    const list = useMemo(() => (Array.isArray(variants) ? variants : []), [variants])

    const colors = useMemo(() => {
        const map = new Map()
        list.forEach((v) => {
            if (!v.color) return
            const c = map.get(v.color) || { name: v.color, hex: '', stock: 0 }
            if (!c.hex && v.colorHex) c.hex = v.colorHex
            c.stock += Number(v.stock) || 0
            map.set(v.color, c)
        })
        return [...map.values()]
    }, [list])

    const sizes = useMemo(
        () => [...new Set(list.map((v) => v.size).filter(Boolean))].sort(bySize),
        [list]
    )

    // Only what the shopper clicked is stored, per product. Everything else is derived,
    // so a color and size are always valid, even right after the product loads.
    const [choice, setChoice] = useState({ id: null, color: null, size: null })
    const mine = choice.id === productId ? choice : { color: null, size: null }

    const defaultColor = colors.find((c) => c.stock > 0)?.name || colors[0]?.name || ''
    const color = colors.length
        ? (colors.some((c) => c.name === mine.color) ? mine.color : defaultColor)
        : ''

    const sizeAvailable = useCallback(
        (s) => list.some((v) => v.size === s && hasStock(v) && (!colors.length || v.color === color)),
        [list, colors.length, color]
    )

    const size = useMemo(() => {
        if (mine.size && sizeAvailable(mine.size)) return mine.size        // cleared automatically if this color doesn't have it
        if (sizes.length === 1 && sizeAvailable(sizes[0])) return sizes[0] // a single size is selected for the shopper
        return ''
    }, [mine.size, sizes, sizeAvailable])

    const variant = useMemo(() => {
        if (!list.length) return null
        if (sizes.length && !size) return null
        if (colors.length && !color) return null
        return list.find((v) =>
            (!sizes.length || v.size === size) && (!colors.length || v.color === color)) || null
    }, [list, sizes.length, colors.length, size, color])

    const pickColor = useCallback((c) =>
        setChoice((p) => ({ id: productId, color: c, size: p.id === productId ? p.size : null })), [productId])
    const pickSize = useCallback((s) =>
        setChoice((p) => ({ id: productId, color: p.id === productId ? p.color : null, size: s })), [productId])

    return { hasVariants: list.length > 0, colors, sizes, color, size, variant, pickColor, pickSize, sizeAvailable }
}

const VariantPicker = ({ sel, showError }) => {
    if (!sel.hasVariants) return null
    const { variant } = sel

    return (
        <div className="vp">
            {sel.colors.length > 0 && (
                <div className="vp-group">
                    <p className="vp-label">Color: <b>{sel.color}</b></p>
                    <div className="vp-colors" role="radiogroup" aria-label="Color">
                        {sel.colors.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                role="radio"
                                aria-checked={sel.color === c.name}
                                disabled={c.stock <= 0}
                                className={`vp-color${sel.color === c.name ? ' on' : ''}`}
                                onClick={() => sel.pickColor(c.name)}
                            >
                                <span className="vp-dot" style={{ backgroundColor: c.hex || '#ddd' }} />
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {sel.sizes.length > 0 && (
                <div className="vp-group">
                    <p className="vp-label">Size: <b>{sel.size || 'Select a size'}</b></p>
                    <div className={`vp-chips${showError && !sel.size ? ' shake' : ''}`} role="radiogroup" aria-label="Size">
                        {sel.sizes.map((s) => (
                            <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={sel.size === s}
                                disabled={!sel.sizeAvailable(s)}
                                className={`vp-chip${sel.size === s ? ' on' : ''}`}
                                onClick={() => sel.pickSize(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    {showError && !sel.size && <p className="vp-error" role="alert">Please select a size</p>}
                </div>
            )}

            {variant && variant.stock > 0 && variant.stock <= 5 && (
                <p className="vp-low">Only {variant.stock} left</p>
            )}
        </div>
    )
}

export default VariantPicker