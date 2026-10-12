export const buildFilterParams = (f, page = 1) => {
    const params = new URLSearchParams();
    if (f.price[0] > 0) params.append('price[gte]', f.price[0]);
    if (f.price[1] < 50000) params.append('price[lte]', f.price[1]);
    if (f.ratings > 0) params.append('ratings[gte]', f.ratings);
    if (f.category && f.category !== 'All') params.append('category', f.category);
    if (f.productType) params.append('productType', f.productType);
    if (f.brand) params.append('brand', f.brand);
    Object.entries(f.attributes || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
        if (value) params.append(`attributes.${key}`, value);
    });
    if (page > 1) params.append('page', page);
    return params;
};