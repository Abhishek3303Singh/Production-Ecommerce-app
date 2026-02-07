import React from 'react'
import Pagination from 'react-js-pagination'
const PaginationBar = (
    {
        currPage,
        setCurrPage,
        productsCount,
        itemPerPage,
    }
) => {

    const setCurrPageNum = (e) => {
        setCurrPage(e)
    }
    return (
        <>
            <Pagination
                activePage={currPage}
                itemsCountPerPage={itemPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrPageNum}
                nextPageText='Next'
                prevPageText='Prev'
                firstPageText='First'
                lastPageText='Last'
                itemClass="page-item"
                linkClass="page-link"
                activeClass="activePageItem"
                activeLinkClass="activeLink"
            />
        </>
    )
}

export default PaginationBar