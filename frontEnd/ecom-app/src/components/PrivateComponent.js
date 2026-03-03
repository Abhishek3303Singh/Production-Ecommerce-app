import {Navigate, Outlet} from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './layout/loader/Loader';
const PrivateComponent=()=>{
    const {status, isAuthenticated} = useSelector((state)=>state.user)

    if(status==="LOADING"){
        return <Loader/>
    }
    
    
    // const userAuth = localStorage.getItem('userData')
    // return userAuth? <Outlet />:<Navigate to="/login" />
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
export default PrivateComponent;
