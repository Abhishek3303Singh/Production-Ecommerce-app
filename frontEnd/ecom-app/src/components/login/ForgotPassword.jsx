import { useState, useEffect } from "react";
import { forgotPassword } from "../../store/forgotPsaawordSlice";
import {useDispatch} from 'react-redux'
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import { clearErr } from "../../store/forgotPsaawordSlice";
import { useParams } from 'react-router-dom';
const ForgotPassword=()=>{
    const [email, setEmail] = useState({ email: '' });
    const dispatch = useDispatch()

    const {passwordResponse, status, isAuthenticated, resError} = useSelector((state=>state.forgotPassword))
    const alert = useAlert()
    useEffect(()=>{
        if(resError){
            alert.error(passwordResponse.message)
            dispatch(clearErr())
        }else if(isAuthenticated){
            alert.success(passwordResponse.message)
        }
    },[resError, isAuthenticated, dispatch])

    useEffect(() => {
        const listener = (event) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                dispatch(forgotPassword(email))
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);

    function handleSubmit(){
        dispatch(forgotPassword(email))
    }
    return(
        <>
        <div className="login-background">
            <div className="inp-container">

                <div className="wlcm">
                    <h2>WELCOME !</h2>
                    <p>Send link to id</p>

                </div>

                <div className="input">
                    <h3 className="login">Please Enter Registered id.</h3>
                    <input type="text" name="" id="username" placeholder="Email" onChange={(e) => { setEmail({ ...email, email: e.target.value }) }} />
                    <span className="input-span"></span> 
                    {/* <input type="password" name="" id="password" placeholder="Password" onChange={(e) => { setPassword({ ...password, password: e.target.value }) }} />
                    <span></span>
                    <p><Link to="/">Forgot Password</Link></p> */}
                    <button className="signup" onClick={handleSubmit} onKeyUp={handleSubmit}>Send</button>
                    {/* {console.log(password.password)} */}
                </div>
            </div>


        </div>


    </>
    )
}
export default ForgotPassword