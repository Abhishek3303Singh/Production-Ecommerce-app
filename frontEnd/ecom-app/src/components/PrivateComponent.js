import {Navigate, Outlet} from 'react-router-dom';
import { useSelector } from 'react-redux';
const PrivateComponent=()=>{
    const {user, status, isAuthenticated} = useSelector((state)=>state.user)
    
    
    // const userAuth = localStorage.getItem('userData')
    // return userAuth? <Outlet />:<Navigate to="/login" />
    return !isAuthenticated ? <Navigate to="/login" />:<Outlet />
}
export default PrivateComponent;
