const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const list = (v) => {
    const raw = Array.isArray(v) ? v.join(',') : v;
    if (typeof raw !== 'string') return [];          // objects like brand[$ne]=x are ignored
    return raw.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 20);
};

const EXACT_FIELDS = ['category', 'productType', 'brand', 'gender'];
const RANGE_FIELDS = ['price', 'ratings'];
const SORTABLE = ['createdAt', 'price', 'offerPrice', 'ratings', 'sold', 'views'];

class Featurs {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword;
        if (typeof keyword === 'string' && keyword.trim()) {
            const rx = { $regex: esc(keyword.trim().slice(0, 60)), $options: 'i' };
            this.query = this.query.find({
                $or: [
                    { name: rx }, { title: rx }, { brand: rx }, { description: rx },
                    { category: rx }, { productType: rx }, { searchKeywords: rx },
                ],
            });
        }
        return this;
    }

    // Only known fields are turned into conditions, so operators can't be injected
    filter() {
        const q = this.queryString;
        const cond = {};

        EXACT_FIELDS.forEach((f) => {
            const values = list(q[f]);
            if (values.length) cond[f] = values.length === 1 ? values[0] : { $in: values };
        });

        RANGE_FIELDS.forEach((f) => {
            const raw = q[f];
            if (!raw || typeof raw !== 'object') return;
            const range = {};
            ['gt', 'gte', 'lt', 'lte'].forEach((op) => {
                const n = Number(raw[op]);
                if (raw[op] !== undefined && raw[op] !== '' && Number.isFinite(n)) range[`$${op}`] = n;
            });
            if (Object.keys(range).length) cond[f] = range;
        });

        // attributes.Color=Black,Green
        Object.keys(q).forEach((key) => {
            if (!key.startsWith('attributes.')) return;
            const attr = key.slice('attributes.'.length);
            if (!/^[\w\s&()\-]{1,40}$/.test(attr)) return;
            const values = list(q[key]);
            if (values.length) cond[`attributes.${attr}`] = values.length === 1 ? values[0] : { $in: values };
        });

        // size / color come from variants, and only combinations that are actually in stock
        const sizes = list(q.size);
        const colors = list(q.color);
        if (sizes.length || colors.length) {
            const m = { stock: { $gt: 0 } };
            if (sizes.length) m.size = { $in: sizes };
            if (colors.length) m.color = { $in: colors };
            cond.variants = { $elemMatch: m };
        }

        this.query = this.query.find(cond);
        return this;
    }

    sort() {
        const requested = typeof this.queryString.sort === 'string' ? this.queryString.sort.split(',') : [];
        const safe = requested.map((s) => s.trim()).filter((s) => SORTABLE.includes(s.replace(/^-/, '')));
        this.query = this.query.sort(safe.length ? safe.join(' ') : { createdAt: -1 });
        return this;
    }

    pagination(itemPerPage) {
        const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
        this.query = this.query.limit(itemPerPage).skip(itemPerPage * (page - 1));
        return this;
    }
}
module.exports = Featurs;