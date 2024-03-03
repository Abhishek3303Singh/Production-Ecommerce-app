// import backimage from '../imageFolder/bck.jpg'
import ImageSlider from './ImageSlider';
import './homecss/home.css'
import HomeProduct from '../products/HomeProducts'
import MetaData from '../routes/MetaData';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getAllProducts } from '../../store/productSlice';
import { STATUSES } from '../../store/productSlice';
import Loader from '../layout/loader/Loader';
// import bankoffer from '../../images/banner.png'

// import { useAlert } from 'react-alert';
// const product ={
//     name:"Sony Bravia 164 cm (65) XR Series 4K Ultra HD Smart OLED Google TV",
//     _id:"123456Abc40",
//     image:[ {url : 'http://localhost:3000/camera.png', title:'E-commercer'},],
//     price: "₹ 284,990",


// }
const Home = () => {
    // const alert = useAlert();


    const slides = [  // slid[2].url
        { url: 'http://localhost:3000/g2.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/bnr5.png', title: 'E-commercer' },
        { url: 'http://localhost:3000/gy1.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/g4.png', title: 'E-commercer' },
        { url: 'http://localhost:3000/gy2.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/sports3.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/music2.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/music4.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/g3.png', title: 'E-commercer' },
        { url: 'http://localhost:3000/music5.jpg', title: 'E-commercer' },
        { url: 'http://localhost:3000/music6.jpg', title: 'E-commercer' },


    ]
    const imageContainer = {
        width: '100%',
        height: '50vh',
        margin: " 0px auto ",
    }

    const dispatch = useDispatch();
    const { products, status, productsCount, responseStatus} = useSelector((state) => state.product);
    // console.log('status',responseStatus)
    useEffect(() => {
        // if(responseStatus=="failed"){
        //     return alert.error(responseStatus)
        // }
        dispatch(getAllProducts())
    }, [dispatch])

    if(status == STATUSES.LOADING){
        return <>
            <Loader /> 
        </>
    }
    if(status==STATUSES.ERROR){
        return <h2 style={{color:"red", width:"40%", margin:"auto"}}>Oops! something went wrong. <span style={{fontSize:"40px"}}> &#128580;</span> </h2> 
    }
    return (
        <>
            <MetaData title="FunHub" />
            <div>

                <div style={imageContainer}>
                    <ImageSlider slides={slides} />
                </div>

            </div>

            <h2 className='ProductHeading'>Featured Product</h2>
            <div className="containerProduct" id="containerProduct">
                {
                 products &&   products.map((prd) => (
                        <HomeProduct product={prd}></HomeProduct>
                    ))
                }



            </div>


        </>
    )
}
export default Home;


