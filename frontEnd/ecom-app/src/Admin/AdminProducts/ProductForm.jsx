import React, { useState } from 'react'
import { useAlert } from 'react-alert'
import useCatalog from '../../utils/useCatalog'
import './productForm.css'

const MAX_IMAGES = 8
const COLOR_HEX = {
    black: '#000000', white: '#ffffff', red: '#d32f2f', blue: '#1976d2', navy: '#0d1b4c',
    green: '#2e7d32', grey: '#9e9e9e', gray: '#9e9e9e', yellow: '#fbc02d', pink: '#ec407a',
    maroon: '#800000', beige: '#d9c7a3', brown: '#6d4c41', orange: '#fb8c00', purple: '#7b1fa2',
    olive: '#708238', cream: '#fffdd0',
}

let uid = 0
const nextKey = () => `k${++uid}`
const newRow = (o = {}) => ({ k: nextKey(), size: '', color: '', colorHex: '', sku: '', stock: 0, hexTouched: false, ...o })
const sameKey = (v) => `${v.size.trim().toLowerCase()}|${v.color.trim().toLowerCase()}`

const toFrom = (prod) => ({
    name: prod?.name || '',
    title: prod?.title || '',
    brand: prod?.brand || '',
    price: prod?.price ?? '',
    offerPrice: prod?.offerPrice ?? '',
    category: prod?.category || '',
    productType: prod?.productType || '',
    gender: prod?.gender || '',
    description: prod?.description || '',
    stock: prod?.Stock ?? 0,
    attributes: prod?.attributes ? { ...prod.attributes } : {},
    searchKeywords: prod?.searchKeywords ? [...prod.searchKeywords] : [],
    variants: (prod?.variants || []).map((v) => newRow({
        _id: v._id, sku: v.sku || '', size: v.size || '', color: v.color || '',
        colorHex: v.colorHex || '', stock: v.stock ?? 0, hexTouched: !!v.colorHex,
    })),
})

// Shrink photos before upload: smaller payloads, faster pages, and a fixed order
const resizeImage = (file, max = 1600, quality = 0.85) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
        return reject(new Error(`${file.name} is not an image.`))
    }
    if (file.size > 10 * 1024 * 1024) {
        return reject(new Error(`${file.name} is larger than 10 MB.`))
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.onload = () => {
        const img = new Image()
        img.onerror = () => reject(new Error(`${file.name} could not be opened.`))
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height))
            const canvas = document.createElement('canvas')
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#fff'                  // transparent PNGs would turn black as JPEG
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.src = reader.result
    }
    reader.readAsDataURL(file)
})

const Field = ({ id, label, error, children }) => (
    <div className={`pf-field ${error ? 'has-error' : ''}`}>
        <label htmlFor={id}>{label}</label>
        {children}
        {error && <span className="pf-error" role="alert">{error}</span>}
    </div>
)

const FormBody = ({ catalog, mode, initial, submitting, submitLabel, onSubmit }) => {
    const alert = useAlert()
    const isEdit = mode === 'edit'

    const [f, setF] = useState(() => toFrom(initial))
    const [kept, setKept] = useState(() => initial?.Image || [])
    const [added, setAdded] = useState([])
    const [errors, setErrors] = useState({})
    const [kw, setKw] = useState('')
    const [genColors, setGenColors] = useState('')
    const [genSizes, setGenSizes] = useState([])
    const [imgBusy, setImgBusy] = useState(false)

    const cat = catalog[f.category]
    const type = cat?.types?.[f.productType]
    const hasVariants = !!cat?.hasVariants
    const totalStock = f.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0)
    const imageCount = kept.length + added.length
    const legacyCategory = isEdit && initial?.category && !catalog[initial.category]

    const up = (k, v) => setF((p) => ({ ...p, [k]: v }))

    const changeCategory = (name) => {
        const hasData = f.variants.length || Object.keys(f.attributes).length
        if (hasData && !window.confirm('Changing the category clears the type, attributes and sizes. Continue?')) return
        setF((p) => ({ ...p, category: name, productType: '', gender: '', attributes: {}, variants: [] }))
        setGenSizes([])
    }

    const changeType = (t) => setF((p) => {
        const allowed = catalog[p.category]?.types?.[t]?.attributes || []
        const attributes = Object.fromEntries(Object.entries(p.attributes).filter(([k]) => allowed.includes(k)))
        return { ...p, productType: t, attributes }
    })

    // ---- variants ----
    const setRow = (k, patch) => setF((p) => ({ ...p, variants: p.variants.map((v) => (v.k === k ? { ...v, ...patch } : v)) }))
    const delRow = (k) => setF((p) => ({ ...p, variants: p.variants.filter((v) => v.k !== k) }))
    const addRow = () => setF((p) => ({ ...p, variants: [...p.variants, newRow()] }))

    const changeColor = (v, color) => {
        const known = COLOR_HEX[color.trim().toLowerCase()]
        setRow(v.k, { color, ...(known && !v.hexTouched ? { colorHex: known } : {}) })
    }

    const generate = () => {
        const colors = [...new Set(genColors.split(',').map((s) => s.trim()).filter(Boolean))]
        if (!genSizes.length && !colors.length) return alert.error('Pick sizes or type colors first')
        const cs = colors.length ? colors : ['']
        const ss = genSizes.length ? genSizes : ['']
        setF((p) => {
            const have = new Set(p.variants.map(sameKey))
            const rows = []
            cs.forEach((c) => ss.forEach((s) => {
                const r = newRow({ size: s, color: c, colorHex: COLOR_HEX[c.toLowerCase()] || '' })
                if (!have.has(sameKey(r))) { have.add(sameKey(r)); rows.push(r) }
            }))
            return { ...p, variants: [...p.variants, ...rows] }
        })
    }

    // ---- keywords ----
    const addKeywords = () => {
        const w = kw.trim().toLowerCase()
        if (!w) return alert.error('Please enter a keyword.')
        if (f.searchKeywords.includes(w)) return alert.error('Keyword already exists')
        up('searchKeywords', [...f.searchKeywords, w])
        setKw('')
    }

    const suggestKeywords = () => {
        const text = [f.title, f.brand, f.productType, f.category, f.gender, ...Object.values(f.attributes)].join(' ')
        const words = text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2)
        const phrases = [`${f.brand} ${f.productType}`.trim().toLowerCase(), f.title.trim().toLowerCase()].filter(Boolean)
        up('searchKeywords', [...new Set([...f.searchKeywords, ...phrases, ...words])].slice(0, 20))
    }

    // ---- images ----
    const onFile = async (e) => {
        const files = Array.from(e.target.files || [])
        e.target.value = ''
        const room = Math.max(0, MAX_IMAGES - imageCount)
        if (files.length > room) alert.info(`Only ${room} more image(s) fit (max ${MAX_IMAGES})`)
        setImgBusy(true)
        try {
            const urls = await Promise.all(files.slice(0, room).map((file) => resizeImage(file)))   // Promise.all keeps the order
            setAdded((a) => [...a, ...urls.map((url) => ({ k: nextKey(), url }))])
        } catch (err) {
            alert.error(err.message)
        } finally {
            setImgBusy(false)
        }
    }

    // ---- validate and submit ----
    const validate = () => {
        const e = {}
        const price = Number(f.price)
        const offer = Number(f.offerPrice)

        if (f.name.trim().length < 4) e.name = 'Name must be at least 4 characters'
        if (f.title.trim().length < 2) e.title = 'Enter a short title'
        if (f.brand.trim().length < 2) e.brand = 'Enter the brand'
        if (!(price > 0)) e.price = 'Enter the price'
        if (!(offer > 0)) e.offerPrice = 'Enter the offer price'
        else if (offer > price) e.offerPrice = 'Offer price cannot be higher than the price'

        if (!f.category) e.category = 'Choose a category'
        else if (!f.productType) e.productType = 'Choose a product type'
        if (cat?.genders && !f.gender) e.gender = 'Choose a gender'

        if (hasVariants) {
            const seen = new Set()
            const bad = []
            f.variants.forEach((v) => {
                const key = sameKey(v)
                const n = Number(v.stock)
                if ((!v.size.trim() && !v.color.trim()) || seen.has(key) || !Number.isInteger(n) || n < 0) bad.push(v.k)
                seen.add(key)
            })
            if (!f.variants.length) e.variants = 'Add at least one size/color variant'
            else if (bad.length) {
                e.variants = 'Fix the highlighted rows: each needs a size or color, a unique combination, and whole-number stock'
                e.badRows = bad
            }
        } else if (!(Number.isInteger(Number(f.stock)) && Number(f.stock) >= 0)) {
            e.stock = 'Stock must be a whole number, 0 or more'
        }

        if (f.description.trim().length < 20) e.description = 'Write at least 20 characters'
        if (!f.searchKeywords.length) e.searchKeywords = 'Add at least one search keyword'
        if (!imageCount) e.images = 'Add at least one image'
        return e
    }

    const submit = (event) => {
        event.preventDefault()
        if (submitting || imgBusy) return

        const e = validate()
        setErrors(e)
        const first = Object.keys(e).find((k) => k !== 'badRows')
        if (first) {
            alert.error('Please fix the highlighted fields')
            document.getElementById(`pf-${first}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
            return
        }

        const formData = new FormData()
        ;['name', 'title', 'brand', 'price', 'offerPrice', 'category', 'productType', 'description']
            .forEach((k) => formData.set(k, String(f[k]).trim()))
        if (f.gender) formData.set('gender', f.gender)
        formData.set('searchKeywords', JSON.stringify(f.searchKeywords))
        formData.set('attributes', JSON.stringify(f.attributes))
        formData.set('variants', JSON.stringify(f.variants.map(({ k, hexTouched, ...v }) => ({
            ...v, colorHex: v.colorHex || undefined, stock: Number(v.stock) || 0,
        }))))
        if (!hasVariants) formData.set('Stock', String(Number(f.stock)))   // with variants the server sums the total

        if (isEdit) {
            formData.set('keepImages', JSON.stringify(kept.map((i) => i.public_id)))
            added.forEach((i) => formData.append('newImages', i.url))
        } else {
            added.forEach((i) => formData.append('Image', i.url))
        }
        onSubmit(formData)
    }

    return (
        <form className="add-product-form pf" onSubmit={submit} noValidate>
            {legacyCategory && (
                <p className="pf-banner">
                    This product's category "{initial.category}" isn't in the catalog. Pick the right category and type, then save.
                </p>
            )}

            <section className="pf-section">
                <h3>Basic information</h3>
                <Field id="pf-name" label="Name" error={errors.name}>
                    <input id="pf-name" type="text" value={f.name} onChange={(e) => up('name', e.target.value)} />
                </Field>
                <div className="half-input-container">
                    <Field id="pf-title" label="Title" error={errors.title}>
                        <input id="pf-title" value={f.title} onChange={(e) => up('title', e.target.value)} />
                    </Field>
                    <Field id="pf-brand" label="Brand" error={errors.brand}>
                        <input id="pf-brand" value={f.brand} onChange={(e) => up('brand', e.target.value)} />
                    </Field>
                </div>
            </section>

            <section className="pf-section">
                <h3>Category</h3>
                <div className="half-input-container">
                    <Field id="pf-category" label="Category" error={errors.category}>
                        <select id="pf-category" value={f.category} onChange={(e) => changeCategory(e.target.value)}>
                            <option value="">Choose category</option>
                            {Object.keys(catalog).map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field id="pf-productType" label="Product type" error={errors.productType}>
                        <select id="pf-productType" value={f.productType} disabled={!cat} onChange={(e) => changeType(e.target.value)}>
                            <option value="">{cat ? 'Choose type' : 'Choose a category first'}</option>
                            {cat && Object.keys(cat.types).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>
                </div>
                {cat?.genders && (
                    <Field id="pf-gender" label="Gender" error={errors.gender}>
                        <select id="pf-gender" value={f.gender} onChange={(e) => up('gender', e.target.value)}>
                            <option value="">Choose gender</option>
                            {cat.genders.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </Field>
                )}
            </section>

            <section className="pf-section">
                <h3>Pricing</h3>
                <div className="half-input-container">
                    <Field id="pf-price" label="Price (MRP)" error={errors.price}>
                        <input id="pf-price" type="number" min="0" value={f.price} onChange={(e) => up('price', e.target.value)} />
                    </Field>
                    <Field id="pf-offerPrice" label="Offer price" error={errors.offerPrice}>
                        <input id="pf-offerPrice" type="number" min="0" value={f.offerPrice} onChange={(e) => up('offerPrice', e.target.value)} />
                    </Field>
                </div>
            </section>

            {hasVariants ? (
                <section className="pf-section" id="pf-variants">
                    <h3>Sizes and colors <small>Total stock: {totalStock}</small></h3>

                    <div className="pf-gen">
                        <strong>Quick add</strong>
                        {(type?.sizes || []).length > 0 && (
                            <div className="pf-chips">
                                {type.sizes.map((s) => (
                                    <button type="button" key={s}
                                        className={`pf-chip ${genSizes.includes(s) ? 'on' : ''}`}
                                        onClick={() => setGenSizes((g) => (g.includes(s) ? g.filter((x) => x !== s) : [...g, s]))}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                        <input placeholder="Colors, comma separated (Black, White, Navy)"
                            value={genColors} onChange={(e) => setGenColors(e.target.value)} />
                        <button type="button" className="pf-btn" onClick={generate}>Add all combinations</button>
                    </div>

                    {errors.variants && <span className="pf-error" role="alert">{errors.variants}</span>}

                    {f.variants.length > 0 && (
                        <div className="pf-table-wrap">
                            <table className="pf-table">
                                <thead>
                                    <tr><th>Size</th><th>Color</th><th>Swatch</th><th>Stock</th><th>SKU</th><th /></tr>
                                </thead>
                                <tbody>
                                    {f.variants.map((v) => (
                                        <tr key={v.k} className={errors.badRows?.includes(v.k) ? 'has-error' : ''}>
                                            <td><input aria-label="Size" value={v.size} onChange={(e) => setRow(v.k, { size: e.target.value })} /></td>
                                            <td><input aria-label="Color" value={v.color} onChange={(e) => changeColor(v, e.target.value)} /></td>
                                            <td><input type="color" aria-label="Swatch color" value={v.colorHex || '#cccccc'}
                                                onChange={(e) => setRow(v.k, { colorHex: e.target.value, hexTouched: true })} /></td>
                                            <td><input type="number" min="0" aria-label="Stock" value={v.stock}
                                                onChange={(e) => setRow(v.k, { stock: e.target.value })} /></td>
                                            <td><input aria-label="SKU" value={v.sku} onChange={(e) => setRow(v.k, { sku: e.target.value })} /></td>
                                            <td><button type="button" className="pf-x" aria-label="Remove row" onClick={() => delRow(v.k)}>✕</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <button type="button" className="pf-btn ghost" onClick={addRow}>+ Add a row</button>
                </section>
            ) : (
                <section className="pf-section">
                    <h3>Stock</h3>
                    <Field id="pf-stock" label="Units in stock" error={errors.stock}>
                        <input id="pf-stock" type="number" min="0" value={f.stock} onChange={(e) => up('stock', e.target.value)} />
                    </Field>
                </section>
            )}

            {type?.attributes?.length > 0 && (
                <section className="pf-section">
                    <h3>Details <small>Shown on the product page and used by filters</small></h3>
                    <div className="pf-attrs">
                        {type.attributes.map((attr) => (
                            <Field key={attr} id={`pf-attr-${attr}`} label={attr}>
                                <input id={`pf-attr-${attr}`} value={f.attributes[attr] || ''}
                                    onChange={(e) => up('attributes', { ...f.attributes, [attr]: e.target.value })} />
                            </Field>
                        ))}
                    </div>
                </section>
            )}

            <section className="pf-section search-keywords-section" id="pf-searchKeywords">
                <h3>Search keywords</h3>
                <div className="keyword-input-container">
                    <input value={kw} placeholder="Add a keyword and press Enter"
                        onChange={(e) => setKw(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeywords() } }} />
                    <button type="button" className="add-keyword-btn" onClick={addKeywords}>Add</button>
                    <button type="button" className="pf-btn ghost" onClick={suggestKeywords}>Suggest</button>
                </div>
                {errors.searchKeywords && <span className="pf-error" role="alert">{errors.searchKeywords}</span>}
                {f.searchKeywords.length > 0 && (
                    <div className="keywords-list">
                        {f.searchKeywords.map((w) => (
                            <div key={w} className="keyword-tag">
                                <span className="keyword-text">{w}</span>
                                <button type="button" className="remove-keyword-btn" aria-label={`Remove ${w}`}
                                    onClick={() => up('searchKeywords', f.searchKeywords.filter((x) => x !== w))}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="pf-section">
                <Field id="pf-description" label="Description" error={errors.description}>
                    <textarea id="pf-description" rows="5" value={f.description}
                        onChange={(e) => up('description', e.target.value)} />
                </Field>
            </section>

            <section className="pf-section" id="pf-images">
                <h3>Images <small>{imageCount}/{MAX_IMAGES} · the first image is the main one</small></h3>
                {errors.images && <span className="pf-error" role="alert">{errors.images}</span>}
                <div className="pf-images">
                    {kept.map((img) => (
                        <figure key={img.public_id}>
                            <img src={img.url} alt="" />
                            <button type="button" aria-label="Remove image"
                                onClick={() => setKept((k) => k.filter((x) => x.public_id !== img.public_id))}>✕</button>
                        </figure>
                    ))}
                    {added.map((img) => (
                        <figure key={img.k} className="new">
                            <img src={img.url} alt="" />
                            <button type="button" aria-label="Remove image"
                                onClick={() => setAdded((a) => a.filter((x) => x.k !== img.k))}>✕</button>
                        </figure>
                    ))}
                    {imageCount < MAX_IMAGES && (
                        <label className="pf-add-img">
                            {imgBusy ? 'Processing…' : '+ Add images'}
                            <input type="file" accept="image/*" multiple hidden onChange={onFile} disabled={imgBusy} />
                        </label>
                    )}
                </div>
            </section>

            <div className="product-submit-btn">
                <button id="submit-btn" type="submit" disabled={submitting || imgBusy}>
                    {submitting ? 'Saving…' : submitLabel}
                </button>
            </div>
        </form>
    )
}

const ProductForm = (props) => {
    const { catalog, loading, error } = useCatalog()
    if (loading) return <p className="pf-note">Loading catalog…</p>
    if (error || !catalog) return <p className="pf-note pf-error">Could not load the catalog ({error}). Refresh to retry.</p>
    return <FormBody catalog={catalog} {...props} />
}

export default ProductForm