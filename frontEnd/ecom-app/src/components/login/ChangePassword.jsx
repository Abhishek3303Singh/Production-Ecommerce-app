import React, { useEffect } from 'react'
import './style/changePass.css'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { resetPassword } from "../../store/userSlice";
import { useAlert } from 'react-alert'
import { setError } from '../../store/userSlice'
import { clearErr } from '../../store/userSlice'
const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState({ oldPassword: '' })
    const [newPassword, setnewPassword] = useState({ newPassword: '' })
    const [confirmPassword, setconfirmPassword] = useState({ confirmPassword: '' })
    const { user, isAuthenticated, status, resError } = useSelector((state) => state.user)
    const dispatch = useDispatch()
    const alert = useAlert()

    const handleChange = () => {
        if (newPassword === confirmPassword) {

            dispatch(resetPassword(oldPassword, newPassword, confirmPassword))
        } else {
            alert.show("New password and confirm password  don't match")
        }


    }
    useEffect(() => {
        if (isAuthenticated) {
            alert.success('Password change Successfully!')
        }
        if (resError) {
            alert.error(user.message)
            dispatch(clearErr())
        }

    }, [isAuthenticated, resError, dispatch])

    useEffect(() => {
        const listener = (event) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                if (newPassword === confirmPassword) {

                    dispatch(resetPassword(oldPassword, newPassword, confirmPassword))
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

    return (
        <div>

            <div className="container">
                <div className='container-header'>
                    <h1>Update Password</h1>
                    <h2>Hello {user && user.name.split(' ')[0]}</h2>
                </div>
                <div className="inner-container">
                    <div className='inp-div'>

                        <input type="password" name="" id="old" required
                            onChange={(e) => { setOldPassword({ ...oldPassword, oldPassword: e.target.value }) }} />
                        <label className='lebal'>Old Password</label>
                    </div>
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
                    <button className='change-pass-btn' onClick={handleChange}>Change</button>
                </div>

            </div>


        </div>
    )
}

export default ChangePassword
