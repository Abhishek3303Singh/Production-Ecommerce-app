import React, { useEffect } from 'react'
import './style/changePass.css'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
// import { resetPassword } from "../../store/userSlice";
import { resetPassword } from '../../store/forgotPsaawordSlice'
import { useAlert } from 'react-alert'
import { setError } from '../../store/userSlice'
import { clearErr } from '../../store/userSlice'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Loader from '../layout/loader/Loader'
import {STATUSES} from '../../store/forgotPsaawordSlice'
import { ToastContainer, toast } from 'react-toastify';
import 'animate.css';
const ResetPassword = () => {
    const [shake, setShake] = useState(false)
    const [newPassword, setnewPassword] = useState({ newPassword: '' })
    const [confirmPassword, setconfirmPassword] = useState({ confirmPassword: '' })
    // const { passwordResponse, isAuthenticated, status, resError } = useSelector((state) => state.resetPassword)
    const {passwordResponse, status, isAuthenticated, resError} = useSelector((state=>state.forgotPassword))
    const dispatch = useDispatch()
    const alert = useAlert()
    const {token} = useParams()
    // const token = 'srtsty7657655fhgfdhgdfsxfg'
    console.log(token, 'Token')
    const navigate = useNavigate()


    const handleChange = () => {
        console.log(newPassword, confirmPassword, 'Password')
        if (newPassword.newPassword === confirmPassword.confirmPassword) {
            setShake(false)
            dispatch(resetPassword(token, newPassword, confirmPassword))
        } else {
            setShake(true)
            alert.show("New password and confirm password  don't match")
            
        }


    }
    useEffect(()=>{
        if(resError){
            alert.error(passwordResponse.message)
            dispatch(clearErr())
        }
        if(isAuthenticated){
            alert.success('Your Password Updated Successfully')
            navigate('/login')
        }
    })

    useEffect(() => {
        const listener = (event) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                if (newPassword.newPassword === confirmPassword.confirmPassword) {

                    dispatch(resetPassword(token, newPassword, confirmPassword))
                } else {
                    alert.show("New password and confirm password  don't match")
                }
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);


    if(status== STATUSES.LOADING){
        return (
            <Loader/>
        )
    }



    


    return (
        <div>

            <div className={shake ? 'container animate__shakeX' : 'container'}>
                <div className='container-header'>
                    <h1>Reset Password</h1>
                    {/* <h2>Hello {user && user.name.split(' ')[0]}</h2> */}
                </div>
                <div className="inner-container">
                    {/* <div className='inp-div'>

                        <input type="password" name="" id="old" required
                            onChange={(e) => { setOldPassword({ ...oldPassword, oldPassword: e.target.value }) }} />
                        <label className='lebal'>Old Password</label>
                    </div> */}
                    <div className='inp-div'>

                        <input type="password" name="" id="old" required onChange={(e) => { setnewPassword({ ...newPassword, newPassword: e.target.value }) }} />
                        <label className='lebal'>New-Password</label>
                    </div>
                    <div className='inp-div'>

                        <input type="password" name="" id="old" required onChange={(e) => { setconfirmPassword({ ...confirmPassword, confirmPassword: e.target.value }) }} />
                        <label className='lebal'>Confirm-Password</label>
                    </div>


                </div>
                <div>
                    <button className='change-pass-btn' onClick={handleChange}>Update</button>
                </div>

            </div>


        </div>
    )
}

export default ResetPassword;
