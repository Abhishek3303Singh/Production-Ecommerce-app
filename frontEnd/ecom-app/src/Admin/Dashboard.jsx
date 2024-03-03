import React, { useEffect } from 'react'
import SideBar from './SideBar'
import { Link } from 'react-router-dom'
import './style/dashboard.css'
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import MetaData from '../components/routes/MetaData'
import { getAdminOrders, clrErr } from '../store/allOrdersSlice'
import { getAllUsers, clearError } from '../store/adminUsersSlie'
import { getAllProducts, clearErr } from '../store/adminProductSlice'
import { useAlert } from 'react-alert';
import { useDispatch, useSelector } from 'react-redux'
// import { Doughnut, Line } from "react-chartjs-2";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, registerables, } from 'chart.js';
import { Chart } from 'react-chartjs-2'
ChartJS.register(...registerables);

const data = [
  { Month: 'JAN', TotalOrders: 6, TotalValue: 700, NewUser: 10 },
  { Month: 'FEB', TotalOrders: 10, TotalValue: 550, NewUser: 8 },
  { Month: 'MAR', TotalOrders: 50, TotalValue: 600, NewUser: 3 },
  { Month: 'Apr', TotalOrders: 20, TotalValue: 500, NewUser: 5 },
  { Month: 'May', TotalOrders: 15, TotalValue: 1000, NewUser: 16 },
  { Month: 'Jun', TotalOrders: 5, TotalValue: 1500, NewUser: 20 },
  { Month: 'Jul', TotalOrders: 30, TotalValue: 400, NewUser: 11 },
]

const Dashboard = () => {
  // const lineState={
  //   labels:['Initial Amount', 'Ammount Earned'],
  //   datasets:[
  //   {
  //     label:'Total Amount',
  //     backgroundColor:['red'],
  //     hoverBackgroundColor:['blue'],
  //     data:[0, 50000]
  //   },
  //   ],
  // }

  // const data = {
  //   labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  //   datasets: [
  //     {
  //       label: "Orders",
  //       data: [3300, 5309, 1805, 4122, 4422, 650],
  //       fill: true,
  //       backgroundColor: "rgba(75,192,192,0.2)",
  //       borderColor: "rgba(75,192,192,1)"
  //     },
  //     {
  //       label: "Total Amount",
  //       data: [0, 500000],
  //       fill: false,
  //       borderColor: "#742774"
  //     }
  //   ]
  // };
  // const options = {
  //   legend: {
  //     display: false
  //   },
  //   scales: {
  //     yAxes: [{
  //       ticks: {
  //         color: "red",
  //         stepSize: 3
  //       }
  //     }]
  //   },
  // }

  const { adminOrders, status, resError } = useSelector((state) => state.allOrders)
  const { users, status: userStatus, resError: userResError } = useSelector((state) => state.Allusers)
  const { resErr, products, status: productStatus } = useSelector((state) => state.adminProducts)
  const alert = useAlert()
  const dispatch = useDispatch()
  const lineState = {
    labels: ['Initial Amount', 'Amount Earned'],
    datasets: [
      {
        label: "Total Amount",
        data: [0, 50000],
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        color: 'red',
        scaleStepWidth: 1,

      },


    ]
  };
  useEffect(() => {
    if (resError) {
      alert.error(adminOrders?.message)
      dispatch(clrErr())
    }
    if (userResError) {
      alert.error(users?.message)
      dispatch(clearError())
    }
    if (resErr) {
      alert.error(products?.message)
      dispatch(clearErr())

    }
    dispatch(getAllProducts())
    dispatch(getAdminOrders())
    dispatch(getAllUsers())
  }, [dispatch, alert])

  let outOfStock = 0;

  products &&
    products.forEach((item) => {
      if (item.Stock === 0) {
        outOfStock += 1;
      }
    });


  const doughnutState = {
    labels: ["Out of Stock", "InStock"],
    datasets: [
      {
        backgroundColor: ["red", "blue"],
        hoverBackgroundColor: ["rgb(3, 239, 251)", "#00ff9d"],
        data: [outOfStock, products.length - outOfStock],
      },
    ],
  };
  let totalOrdersValue = 0;
  adminOrders && adminOrders?.orders?.forEach((item) => {
    totalOrdersValue += item.totalPrice
  })
  console.log(products.length, 'productsLength')
  return (
    <>
      <MetaData title='Admin Panel' />
      <div className='dashboard-main-container'>
        <div className="sidebar-container">
          <SideBar />
        </div>


        <div className="dashboard-container">
          <h1>Dashboard</h1>
          <header>
            <h1>Total Amount</h1>
            <h1>&#8377;{totalOrdersValue}</h1>
          </header>

          <div className='overview-container'>
            <Link to='/admin/products'> <LocalMallIcon /> <p>Product</p>  <p>{products && products.length}</p> </Link>
            <Link to='/admin/orders'> <ListAltIcon /> <p>Orders</p> <p>{adminOrders && adminOrders?.orders?.length}</p> </Link>
            <Link to='/admin/users'> <PeopleIcon /><p> Users</p> <p>{users?.users?.length}</p> </Link>

          </div>
          <div className="graph-container">
            <div className="hacrt-graph">
              {/* <Line data={data} /> */}

              {/* <Line data={data} options={options} /> */}
              <LineChart width={600} height={400} data={data} >
                <Line type='monotone' dataKey="TotalValue" stroke="#d000ff" strokeWidth={3} />
                <Line type='monotone' dataKey="TotalOrders" stroke="orange" strokeWidth={3} />
                <CartesianGrid stroke="#505e5a" />
                <XAxis dataKey='Month' stroke='#02fda5' />
                <YAxis stroke='#02fda5' />
                <Tooltip />
                <Legend />
              </LineChart>


            </div>
            <div className="stock-chart">
              {/* <Line data={lineState} /> */}
              <Doughnut data={doughnutState} />
              {/* <LegendJS stroke='white'/>              */}
            </div>
            <div className='pie-chart-container'>
              <LineChart width={600} height={400} data={data} >
                <Line type='monotone' dataKey="TotalOrders" stroke="red" strokeWidth={3} />
                <CartesianGrid stroke="#505e5a" />
                <XAxis dataKey='Month' stroke='#3bfe05' />
                <YAxis stroke='#3bfe05' />
                <Tooltip />
                <Legend />
              </LineChart>
            </div>

            <div className="user-chart-container">

              <LineChart width={400} height={400} data={data} >
                <Line type='monotone' dataKey="NewUser" stroke="aqua" strokeWidth={3} />
                <CartesianGrid stroke="#505e5a" />
                <XAxis dataKey='Month' stroke='#fff' />
                <YAxis stroke='#fff' />
                <Tooltip />
                <Legend />
              </LineChart>

            </div>
          </div>



        </div>




      </div>
    </>

  )
}

export default Dashboard