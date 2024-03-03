import { useState, useEffect } from "react";
import { redirect, useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";
import {BsFillEyeFill} from 'react-icons/bs'
import { useDispatch } from 'react-redux'
import {clearErr, login } from "../../store/userSlice";
import { useSelector } from "react-redux";
import {useAlert} from 'react-alert'
import {STATUSES} from '../../store/userSlice'
import Loader from "../layout/loader/Loader";
import {toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import 'animate.css'
const Login = () => {
    const [email, setEmail] = useState({ email: '' });
    const [password, setPassword] = useState({ password: '' });
    const [showPass, setshowPass] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {user, status, isAuthenticated, resError} = useSelector((state)=>state.user)
    const [shake ,setShake] = useState(false)
    // useEffect(() => {
    //     const userAuth = localStorage.getItem('userData');
    //     if (userAuth) {
    //         navigate('/product')
    //     }
        
    // })
    const alert = useAlert()
    const location = useLocation()
    
    useEffect(()=>{
        if(resError){
            // alert(user.message)
            alert.error(user.message)
            // toast(user.message)
            setShake(true)
            dispatch(clearErr())
            
            

        }
        const redirect = location.search ? location.search.split('=')[1] : "products"
        // console.log(location, 'loctaion')
        // console.log(location.search.split('=')[1], 'pathName')
        if(isAuthenticated){
            // navigate('/products')
            navigate(`/${redirect}`)

        }
    },[dispatch, isAuthenticated, resError])

    useEffect(() => {
        const listener = (event) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                    dispatch(login(email, password))
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);
    
    

    const handleLogin =  () => {
        // console.log(email)
        // console.log(email.email, password.password)

        dispatch(login(email, password))
        // let loginResponse = await fetch('http://localhost:8081/api/v1/login', {
        //     method: 'Post',
        //     headers: {

        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },
        //     body: JSON.stringify(
        //         {
        //             email: email.email,
        //             password: password.password
        //         }
        //     )
        // });
        // loginResponse = await loginResponse.json()
        // console.log(loginResponse.status);
        // console.log(loginResponse.token);
        // if(loginResponse.status.toLocaleLowerCase() !== 'failed'){
        //     localStorage.setItem('userData', JSON.stringify( loginResponse ))

        // }
        // if(localStorage.getItem('userData')){
        //     navigate('/product')
        // }
        // else{
        //     alert(loginResponse.message)
        // }
    }
    if(status==STATUSES.LOADING){
        return <Loader />
    }

    return (
        <>
            <div className={shake ? 'login-background animate__animated animate__shakeX' :'login-background '}>
                <div className={shake ? 'inp-container animate__animated animate__shakeX':'inp-container'}>

                    <div className="wlcm">
                        <h2>WELCOME BACK</h2>
                        <p>Nice to see you again</p>
                        {/* <p>Login to continue</p> */}

                    </div>

                    <div className="input">
                        <h1 className="login" >Login</h1>
                        <input type="text" name="" id="username" placeholder="Email" onChange={(e) => { setEmail({ ...email, email: e.target.value }) }} />
                        <span className="input-span"></span>
                        <div>
                        <input type={`${showPass? "text":'password'}`} name="" id="password" placeholder="Password" onChange={(e) => { setPassword({ ...password, password: e.target.value }) }} />
                        
                        <button className="showPass" onClick={()=>{setshowPass(!showPass)}}><BsFillEyeFill /></button>
                        </div>
                       
                        
                        <span className="input-span"></span>
                        <p><Link to="/fogotpassword">Forgot Password</Link></p>
                        <button className="signup" onClick={handleLogin}>Login</button>
                        {/* {console.log(password.password)} */}
                        <p className="redir">don't have an account ? <Link to="/signup">Register</Link></p>
                    </div>
                </div>


            </div>


        </>
    )
}
export default Login;