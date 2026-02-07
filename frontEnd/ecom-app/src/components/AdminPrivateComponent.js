import {Navigate, Outlet} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAlert } from 'react-alert';
const AdminPrivateComponent=()=>{
    const {user, status, isAuthenticated} = useSelector((state)=>state.user)
    const alert = useAlert()
    
    
    // const userAuth = localStorage.getItem('userData')
    // return userAuth? <Outlet />:<Navigate to="/login" />

    return isAuthenticated && user.role == 'Admin' ? alert.error('sorry Invalid Url') :<Outlet />
}
export default AdminPrivateComponent;
