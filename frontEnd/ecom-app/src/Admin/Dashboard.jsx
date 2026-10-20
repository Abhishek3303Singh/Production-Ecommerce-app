import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import SideBar from './SideBar'
import MetaData from '../components/routes/MetaData'
import { ORDER_STATUS, STATUS_CLASS } from '../utils/orderStatus'
import './style/dashboard.css'

const apiUrl = process.env.REACT_APP_API_BASE_URL
const RANGES = [7, 30, 90]
const PIPELINE = [
  ORDER_STATUS.IN_PROCESS, ORDER_STATUS.SHIPPED, ORDER_STATUS.ON_THE_WAY,
  ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED,
]

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const compact = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`)
const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

const Kpi = ({ label, value, change, note }) => (
  <div className="dash-card dash-kpi">
    <span className="dash-kpi-label">{label}</span>
    <strong className="dash-kpi-value">{value}</strong>
    {change != null ? (
      <span className={`dash-change ${change >= 0 ? 'up' : 'down'}`}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs previous period
      </span>
    ) : (
      <span className="dash-change muted">{note || 'No earlier data to compare'}</span>
    )}
  </div>
)

const Dashboard = () => {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError('')
    fetch(`${apiUrl}/api/v1/admin/dashboard?days=${days}`, { credentials: 'include', signal: ctrl.signal })
      .then(async (r) => {
        const json = await r.json()
        if (!r.ok) throw new Error(json.message || 'Could not load the dashboard')
        return json.data
      })
      .then(setData)
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
  }, [days, reload])

  const stockPie = data && [
    { name: 'In stock', value: data.stock.inStock, color: '#2e7d32' },
    { name: `Low (≤5)`, value: data.stock.low, color: '#f5a623' },
    { name: 'Out of stock', value: data.stock.out, color: '#fd4444' },
  ]
  const hasSales = data?.kpis.orders.value > 0

  return (
    <>
      <MetaData title="Admin Panel" />
      <div className="dashboard-main-container">
        <div className="dashboard-sidebar-container"><SideBar/></div>

        <div className="dashboard-container">
          <div className="dash-head">
            <div>
              <h1>Dashboard</h1>
              <p className="dash-sub">Paid orders only. Cancelled and unpaid checkouts are excluded.</p>
            </div>
            <div className="dash-range" role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <button key={r} className={days === r ? 'active' : ''} onClick={() => setDays(r)}>
                  {r} days
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="dash-error">
              {error} <button onClick={() => setReload((n) => n + 1)}>Retry</button>
            </div>
          )}

          {!data && loading && <p className="dash-sub">Loading…</p>}

          {data && (
            <div className={loading ? 'dash-body dash-updating' : 'dash-body'}>
              <div className="dash-kpis">
                <Kpi label="Revenue" value={inr(data.kpis.revenue.value)} change={data.kpis.revenue.change} />
                <Kpi label="Orders" value={data.kpis.orders.value} change={data.kpis.orders.change} />
                <Kpi label="Average order" value={inr(data.kpis.avgOrderValue.value)} note="Revenue ÷ orders" />
                <Kpi label="New customers" value={data.kpis.newCustomers.value} change={data.kpis.newCustomers.change} />
              </div>

              <div className="dash-strip">
                <Link to="/admin/products"><b>{data.totals.products}</b> products</Link>
                <Link to="/admin/users"><b>{data.totals.customers}</b> customers</Link>
                <span><b>{data.totals.awaitingPayment}</b> awaiting payment</span>
                <Link to="/admin/products" className={data.stock.out ? 'warn' : ''}>
                  <b>{data.stock.out}</b> out of stock
                </Link>
              </div>

              <div className="dash-grid">
                <section className="dash-card dash-wide">
                  <h3>Revenue</h3>
                  {hasSales ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={data.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#eee" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={dayLabel} minTickGap={28} tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={compact} width={52} tick={{ fontSize: 12 }} />
                        <Tooltip
                          labelFormatter={dayLabel}
                          formatter={(v, name) => (name === 'revenue' ? [inr(v), 'Revenue'] : [v, 'Orders'])}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#fd4444" strokeWidth={2} fill="#fd4444" fillOpacity={0.12} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <p className="dash-empty">No paid orders in this period yet.</p>}
                </section>

                <section className="dash-card">
                  <h3>Stock health</h3>
                  {data.stock.total > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={stockPie} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                            {stockPie.map((s) => <Cell key={s.name} fill={s.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <ul className="dash-legend">
                        {stockPie.map((s) => (
                          <li key={s.name}><i style={{ background: s.color }} />{s.name}<b>{s.value}</b></li>
                        ))}
                      </ul>
                    </>
                  ) : <p className="dash-empty">No products yet.</p>}
                </section>

                <section className="dash-card dash-wide">
                  <h3>Order pipeline</h3>
                  <div className="dash-pipeline">
                    {PIPELINE.map((s) => (
                      <Link to="/admin/orders" key={s} className={`dash-step ${STATUS_CLASS[s]}`}>
                        <b>{data.pipeline[s] || 0}</b><span>{s}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="dash-card">
                  <h3>New customers</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.signups} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" tickFormatter={dayLabel} minTickGap={28} tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={dayLabel} />
                      <Bar dataKey="count" name="Signups" fill="#131921" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>

                <section className="dash-card dash-wide">
                  <h3>Top products</h3>
                  {data.topProducts.length ? (
                    <table className="dash-table">
                      <thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
                      <tbody>
                        {data.topProducts.map((p) => (
                          <tr key={p._id}>
                            <td className="dash-prod">
                              {p.image && <img src={p.image} alt="" />}<span>{p.title}</span>
                            </td>
                            <td>{p.units}</td><td>{inr(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="dash-empty">No sales in this period.</p>}
                </section>

                <section className="dash-card">
                  <h3>Top cities</h3>
                  {data.cities.length ? (
                    <ul className="dash-list">
                      {data.cities.map((c) => (
                        <li key={c.city}><span>{titleCase(c.city)}</span><b>{c.orders} orders</b></li>
                      ))}
                    </ul>
                  ) : <p className="dash-empty">No data yet.</p>}
                </section>

                <section className="dash-card dash-wide">
                  <h3>Recent orders</h3>
                  {data.recent.length ? (
                    <table className="dash-table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {data.recent.map((o) => (
                          <tr key={o._id}>
                            <td><Link to={`/admin/order/${o._id}`}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                            <td>{o.user?.name || o.shippingAddress?.name || '—'}</td>
                            <td>{o.paidAtDate ? new Date(o.paidAtDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                            <td>{inr(o.totalPrice)}</td>
                            <td><span className={`dash-pill ${STATUS_CLASS[o.orderStatus] || ''}`}>{o.orderStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="dash-empty">No orders yet.</p>}
                </section>

                <section className="dash-card">
                  <h3>Low stock</h3>
                  {data.stock.lowList.length ? (
                    <ul className="dash-list">
                      {data.stock.lowList.map((p) => (
                        <li key={p._id}>
                          <Link to={`/admin/product/${p._id}`}>{p.title}</Link>
                          <b className={p.Stock <= 0 ? 'bad' : 'warn'}>{p.Stock <= 0 ? 'Out' : `${p.Stock} left`}</b>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="dash-empty">Everything is well stocked.</p>}
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard