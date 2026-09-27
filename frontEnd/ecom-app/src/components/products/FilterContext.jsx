import React, {createContext, useContext, useCallback, useState} from 'react'
const FilterContext = createContext(null)

export const FilterProvider = ({children})=>{
    const [filters, setFilters] = useState({
        price : [0, 50000],
        category: "",
        ratings: 0,
        productType: "",
        brand: "",
        attributes: {},
    })
    const updateFilters = useCallback((newFilters)=>{
        setFilters(prev=>({...prev, ...newFilters}))
    }, [])
    return (
        <FilterContext.Provider value={{filters, setFilters, updateFilters}}>
            {children}
        </FilterContext.Provider>
    )
}
export const useFilters = ()=>{
    const ctx = useContext(FilterContext)
    if(!ctx) throw new Error('useFilters must be used within a FilterProvider')
return ctx
};