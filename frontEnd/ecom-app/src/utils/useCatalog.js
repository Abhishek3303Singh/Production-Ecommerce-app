import { useEffect, useState } from "react";

const apiUrl = process.env.REACT_APP_API_BASE_URL
let cache = null  // catalog only change on deploy so fetach it once /page load

export default function useCatalog(){
    const [state, setState] = useState({catalog:cache, loading:!cache, error:''})
    useEffect(()=>{
        if(cache){
            return
        }
        let off = false
        fetch(`${apiUrl}/api/v1/catalog`, {credentials:"include"})
        .then((r)=>r.json()).then((j)=>{
            if(off) return
            if(j.status !=='success') throw new Error(j.message || 'failed');
            cache = j.catalog
            setState({catalog:cache, loading:false, error:''})
        })
        .catch((e)=>{
            if (!off) {
                setState({catalog:null, loading:false, error:e.message})
            }
        })
        return ()=>{off=true}
    }, [])
    return state
}
