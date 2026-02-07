import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { getAllProducts } from "../../store/productSlice";
import { STATUSES } from "../../store/productSlice";
import Loader from "../layout/loader/Loader";
import { useParams } from "react-router-dom";
import './products.css';

import FiltersPanel from "./FiltersPanel";

import MetaData from '../routes/MetaData';
import { useLocation } from "react-router-dom";
import ProductsBanner from "./ProductsBanner";
import ProductGrid from "./ProductGrid";
import PaginationBar from "./PaginationBar";
import CategoryStrip from "./CategoryStrip";
// import useDebounce from "../hooks/useDebounce";
import { useMemo } from "react";


const Products = () => {
    const [currPage, setCurrPage] = useState(1)
    // const [price, setPrice] = useState([0, 10000])
    const [category, setCategory] = useState("")
    // const [ratings, setRatings] = useState(0)
    const [filters, setFilters] = useState(
        {
            price: [0, 10000],
            category: "",
            ratings: 0,
        }
    )
    const { keyword } = useParams();
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)
    const paramName = searchParams.get('productName')
    const dispatch = useDispatch();
    const { products, status, productsCount, responseStatus, itemPerPage, filterProductcount } = useSelector((state) => state.product);

    useEffect(() => {
        setCategory(paramName)
    }, [])

    const categoryRef = useRef(null);

    useEffect(() => {
        const el = categoryRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            // only when mouse wheel scrolls vertically
            if (e.deltaY === 0) return;

            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };

        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
        };
    }, []);


    console.log('keyword', category)

    useEffect(() => {
        dispatch(getAllProducts(keyword, currPage, filters.price, filters.category, filters.ratings))
    }, [dispatch, keyword, currPage, filters.price, filters.category, filters.ratings])

    // let count = filterProductcount
    const visibleProducts = useMemo(() => {
        return products;
    }, [products]);

    const handleFilterChange = useCallback((data) => {
        setCurrPage(1)
        setFilters((prev) => {
            if (
                prev.price[0] === data.price[0] &&
                prev.price[1] === data.price[1] &&
                prev.category === data.category &&
                prev.ratings === data.ratings) {
                return prev;
            }
            return data

        });
    }, []);




    if (status == STATUSES.LOADING) {
        return <>
            <Loader />
        </>
    }

    if (status == STATUSES.ERROR) {
        return <h2 style={{ color: "red", width: "40%", margin: "auto" }}>Oops! something went wrong. <span style={{ fontSize: "40px" }}> &#128580;</span> </h2>
    }
    return (
        <>
            <MetaData title="PRODUCTS-FunHub"></MetaData>

            <ProductsBanner />


            {/* <h2 className='ProductHeading'>Products</h2> */}

            <div ref={categoryRef} className="category-container">
            
                <CategoryStrip onCategorySelect={(category) => {
                    handleFilterChange({
                        ...filters,
                        category
                    })
                }} />
            </div>


            <h2 className='ProductHeading'>Products</h2>
            <div className="product-main-container">
                {
                    (status == STATUSES.SUCCESS && products.length === 0 ? (<div className="prod-not-found-cont"><h1>Sorry! Product Not Found</h1><p>
                        We could not find any products for the selected filters
                    </p></div>) : <ProductGrid products={visibleProducts} />)
                }

                <div className="filter-container">
                    <FiltersPanel
                        onFilterChange={handleFilterChange}
                        initialFilters={filters}
                    />

                </div>
            </div>
            {itemPerPage < productsCount && (
                <div className="pagination-container">
                    <PaginationBar
                        currPage={currPage}
                        setCurrPage={setCurrPage}
                        productsCount={productsCount}
                        itemPerPage={itemPerPage}

                    />
                </div>
            )}

        </>
    )
}

export default Products;