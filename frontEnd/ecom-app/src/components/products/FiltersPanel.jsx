import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Box from "@mui/material/Box";
import Slider from '@mui/material/Slider';
import Rating from "@mui/material/Rating";
import { useFilters } from './FilterContext';
import { buildFilterParams } from '../../utils/buildFilterParams';


const apiUrl = process.env.REACT_APP_API_BASE_URL;

const categories = [
    'Electronics', 'Sports & Fitness', 'Fashion', 'Home & Health',
    'GenZTrends', 'Home&Kitchen', 'Beauty', 'Toys & Baby',
    'Lifestyle', 'SmartPhone', 'Others'
];

// Context/URL store comma-joined strings; the draft uses arrays so checkboxes are easy
const toList = (s) => (s ? s.split(',').filter(Boolean) : []);

const toDraft = (f = {}) => ({
    price: f.price || [0, 10000],
    category: f.category || '',
    ratings: f.ratings || 0,
    productType: toList(f.productType),
    brand: toList(f.brand),
    attributes: Object.fromEntries(
        Object.entries(f.attributes || {}).map(([k, v]) => [k, toList(v)])
    ),
});

const fromDraft = (d) => ({
    price: d.price,
    category: d.category,
    ratings: d.ratings,
    productType: d.productType.join(','),
    brand: d.brand.join(','),
    attributes: Object.fromEntries(
        Object.entries(d.attributes).filter(([, v]) => v.length).map(([k, v]) => [k, v.join(',')])
    ),
});

const toggleIn = (arr, value) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

const EMPTY_DRAFT = toDraft();

const AccordionSection = ({ title, isOpen, onToggle, children }) => (
    <div className="accordion-section">
        <button className="accordion-header" onClick={onToggle}>
            <span>{title}</span>
            <span className={`accordion-arrow ${isOpen ? 'open' : ''}`}>▾</span>
        </button>
        {isOpen && <div className="accordion-body">{children}</div>}
    </div>
);

const CheckRow = ({ label, checked, onChange }) => (
    <label className="check-row">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span>{label}</span>
    </label>
);

const FiltersPanel = () => {
    const { filters } = useFilters();
    const navigate = useNavigate();
    const { keyword } = useParams();

    const [draft, setDraft] = useState(() => toDraft(filters));
    const [productTypes, setProductTypes] = useState([]);
    const [facets, setFacets] = useState({ brands: [], attributes: {} });
    const [loadingStage, setLoadingStage] = useState(null); // 'productTypes' | 'facets' | null
    const [openSections, setOpenSections] = useState({});

    const optionsCache = useRef({});   // repeat clicks make no network call
    const filtersKey = JSON.stringify(filters);
    const typeKey = draft.productType.join(',');
    const hasChanges =
        buildFilterParams(fromDraft(draft)).toString() !== buildFilterParams(filters).toString();

    // Re-sync the draft when applied filters change elsewhere (strip, mobile sidebar, URL)
    useEffect(() => { setDraft(toDraft(filters)); }, [filtersKey]);

    const fetchOptions = useCallback(async (category, productType) => {
        const key = `${category}|${productType || ''}`;
        if (optionsCache.current[key]) return optionsCache.current[key];
        let url = `${apiUrl}/api/v1/products/filters?category=${encodeURIComponent(category)}`;
        if (productType) url += `&productType=${encodeURIComponent(productType)}`;
        const res = await fetch(url, { credentials: 'include' });
        const json = await res.json();
        optionsCache.current[key] = json.data || {};
        return optionsCache.current[key];
    }, []);

    // API call 1: category -> product types
    useEffect(() => {
        if (!draft.category) { setProductTypes([]); return; }
        let cancelled = false;
        setLoadingStage('productTypes');
        fetchOptions(draft.category)
            .then((d) => { if (!cancelled) setProductTypes(d.productTypes || []); })
            .catch(() => { if (!cancelled) setProductTypes([]); })
            .finally(() => { if (!cancelled) setLoadingStage(null); });
        return () => { cancelled = true; };
    }, [draft.category, fetchOptions]);

    // API call 2: category + product types -> brands and attributes
    useEffect(() => {
        if (!draft.category || !typeKey) { setFacets({ brands: [], attributes: {} }); return; }
        let cancelled = false;
        setLoadingStage('facets');
        fetchOptions(draft.category, typeKey)
            .then((d) => { if (!cancelled) setFacets({ brands: d.brands || [], attributes: d.attributes || {} }); })
            .catch(() => { if (!cancelled) setFacets({ brands: [], attributes: {} }); })
            .finally(() => { if (!cancelled) setLoadingStage(null); });
        return () => { cancelled = true; };
    }, [draft.category, typeKey, fetchOptions]);

    const isOpen = (key) => openSections[key] ?? true;   // sections default to open
    const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !isOpen(key) }));

    // Category is single-select (the options endpoint works per category)
    const pickCategory = (cat) =>
        setDraft((d) => ({ ...d, category: d.category === cat ? '' : cat, productType: [], brand: [], attributes: {} }));

    // Changing product types invalidates brand/attributes, since the options come from those types
    const toggleType = (type) =>
        setDraft((d) => ({ ...d, productType: toggleIn(d.productType, type), brand: [], attributes: {} }));

    const toggleBrand = (brand) =>
        setDraft((d) => ({ ...d, brand: toggleIn(d.brand, brand) }));

    const toggleAttribute = (key, value) =>
        setDraft((d) => {
            const next = toggleIn(d.attributes[key] || [], value);
            const attributes = { ...d.attributes };
            if (next.length) attributes[key] = next; else delete attributes[key];
            return { ...d, attributes };
        });

    // The ONLY thing that triggers a product fetch: navigate, then Products reads the URL
    const goTo = (f) => {
        const qs = buildFilterParams(f).toString();
        navigate(`${keyword ? `/products/${keyword}` : '/products'}${qs ? `?${qs}` : ''}`);
    };
    const applyFilters = () => goTo(fromDraft(draft));
    const clearFilters = () => { setDraft(EMPTY_DRAFT); goTo(fromDraft(EMPTY_DRAFT)); };

    const attributeKeys = Object.keys(facets.attributes || {});

    return (
        <div className="filters-panel">
            <h4 className="filters-panel-title">Filters</h4>

            <AccordionSection title="Categories" isOpen={isOpen('category')} onToggle={() => toggleSection('category')}>
                {categories.map((cat) => (
                    <CheckRow key={cat} label={cat} checked={draft.category === cat} onChange={() => pickCategory(cat)} />
                ))}
            </AccordionSection>

            {draft.category && (
                <AccordionSection title="Product type" isOpen={isOpen('productType')} onToggle={() => toggleSection('productType')}>
                    {loadingStage === 'productTypes' && <p className="filter-hint">Loading…</p>}
                    {loadingStage !== 'productTypes' && productTypes.length === 0 && (
                        <p className="filter-hint">No product types yet.</p>
                    )}
                    {productTypes.map((type) => (
                        <CheckRow key={type} label={type} checked={draft.productType.includes(type)} onChange={() => toggleType(type)} />
                    ))}
                </AccordionSection>
            )}

            {draft.productType.length > 0 && (
                <>
                    {loadingStage === 'facets' && <p className="filter-hint">Loading options…</p>}

                    {loadingStage !== 'facets' && facets.brands.length > 0 && (
                        <AccordionSection title="Brand" isOpen={isOpen('brand')} onToggle={() => toggleSection('brand')}>
                            {facets.brands.map((brand) => (
                                <CheckRow key={brand} label={brand} checked={draft.brand.includes(brand)} onChange={() => toggleBrand(brand)} />
                            ))}
                        </AccordionSection>
                    )}

                    {loadingStage !== 'facets' && attributeKeys.map((attrKey) => (
                        <AccordionSection
                            key={attrKey}
                            title={attrKey}
                            isOpen={isOpen(`attr:${attrKey}`)}
                            onToggle={() => toggleSection(`attr:${attrKey}`)}
                        >
                            {facets.attributes[attrKey].map((value) => (
                                <CheckRow
                                    key={value}
                                    label={value}
                                    checked={(draft.attributes[attrKey] || []).includes(value)}
                                    onChange={() => toggleAttribute(attrKey, value)}
                                />
                            ))}
                        </AccordionSection>
                    ))}
                </>
            )}

            <AccordionSection title="Price" isOpen={isOpen('price')} onToggle={() => toggleSection('price')}>
                <div className="box-text"><span>MIN:₹{draft.price[0]}</span> <span>MAX:₹{draft.price[1]}</span></div>
                <Box sx={{ width: '100%', margin: 'auto' }}>
                    <Slider
                        value={draft.price}
                        onChange={(e, v) => setDraft((d) => ({ ...d, price: v }))}
                        valueLabelDisplay="auto"
                        min={0}
                        max={10000}
                    />
                </Box>
            </AccordionSection>

            <AccordionSection title="Ratings" isOpen={isOpen('ratings')} onToggle={() => toggleSection('ratings')}>
                <Rating
                    name="simple-controlled"
                    value={draft.ratings}
                    onChange={(e, v) => setDraft((d) => ({ ...d, ratings: v || 0 }))}
                />
            </AccordionSection>

            <div className="filters-actions">
                <button className="filters-clear" onClick={clearFilters}>Clear All</button>
                <button className="filters-apply" onClick={applyFilters} disabled={!hasChanges}>Apply Filters</button>
            </div>
        </div>
    );
};

export default React.memo(FiltersPanel);