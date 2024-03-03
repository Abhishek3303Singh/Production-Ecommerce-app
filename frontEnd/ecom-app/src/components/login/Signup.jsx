import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { BsFillEyeFill } from 'react-icons/bs'
import { register, clearErr } from "../../store/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useAlert } from "react-alert";
import {STATUSES} from '../../store/userSlice'
import Loader from "../layout/loader/Loader";
const Signup = () => {
    const [showPass, setshowPass] = useState(false)
    const [email, setEmail] = useState({ email: "" });
    const [name, setName] = useState({ name: "" });
    const [password, setPassword] = useState({ password: "" });
    const [phone, setPhone] = useState({ phone: "" })
    const [error, setError] = useState({ errorName: "", errorEmail: "", errorGender: "", errorPhone: "", errorPassword: "" })
    const navigate = useNavigate();// redirect to page after success response
    const [avatar, setAvatar] = useState('/profile.png')
    const [avatarPreview, setAvaterPreview] = useState('/profile.png')
    const {user, status, isAuthenticated, resError} = useSelector((state)=>state.user)
    const alert = useAlert()
    
    // console.log('user',user, 'resErr', resError)

    
    /// check if user is authenticated then redirect to other page 
    // we will not allow to same user to signup, if user Authenticated
    // console.log(email, password, name, phone)
  

    const dispatch = useDispatch()
    useEffect(()=>{
        if(resError){
            alert.error(user.message)
            dispatch(clearErr())
        }
        if(isAuthenticated){
            navigate('/products')
        }
    },[isAuthenticated, resError])

    // useEffect(() => {
    //     const userAuth = localStorage.getItem('userData');
    //     if (userAuth) {
    //         navigate('/')
    //     }
    // })
    ////////////////////////////////////////////////////

    useEffect(() => {
        const listener = (event) => {
            if (event.code === "Enter" || event.code === "NumpadEnter") {
                dispatch(register(email, password, name, phone))
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, []);

    const handleSubmit =  () => {
        // const formData = new FormData()
        // const myForm = new FormData();

        // myForm.append("name", name.name);
        // myForm.append("email", email.email);
        // myForm.append("password", password.password);
        // myForm.append("phone", phone.phone);
        // formData.append('email', email)
        // formData.append('name', name.name);
        // formData.append('password', password.password)
        // formData.append('phone', phone.phone)
        // console.log('formDAta=', myForm)
        //  myForm.forEach((val,key)=>{
        //     console.log(val,'==', key)
        // })
     
        
        dispatch(register(email, password, name, phone))
       


        // let response = await fetch('http://localhost:8081/api/v1/signup', {
        //     method: 'Post',
        //     body: JSON.stringify({
        //         name: name.name,
        //         email: email.email,
        //         phone: phone.phone,
        //         password: password.password
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json'
        //     },


        // });
        // response = await response.json()
        // // console.log(response)
        // if (response.status.toLocaleLowerCase() != 'failed') {
        //     localStorage.setItem('userData', JSON.stringify(response))
        // }

        // // Keep the response/Signup Data in LocalStorage
        // //localStorage.setItem('userData', response) // it takes two arguments key and value,
        // // but we can not store the value in json form we can only save the data in string..
        // localStorage.setItem('userData', JSON.stringify(response))
        // /////////////////LOcalStorage/////////////////////////////////////
        // if (localStorage.getItem('userData')) {
        //     navigate('/')
        // }
        // else {
        //     alert(response.message)
        // }
    }
    function handeleAvatar() {
        console.log('Avatar')
    }

    const inpValidator = (type) => {
        // console.log(name.name)
        // {console.log(phone.phone.length)}
        // console.log(type)
        switch (type) {
            case "name":
                const regEx = /^[a-zA-Z]*$/
                if (!regEx.test(name.name)) {
                    setError({ ...error, errorName: "Please enter valid name" })
                } else {
                    setError({ ...error, errorName: "" })
                }
                break;
            case "email":
                const regExEmail = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]*$/
                if (!regExEmail.test(email.email)) {
                    setError({ ...error, errorEmail: "Please enter valid id" })
                } else {
                    setError({ ...error, errorEmail: "" })
                }
                break;
            case "phone":
                const checkPh = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
                if (!checkPh.test(phone.phone)) {
                    setError({ ...error, errorPhone: "Please enter valid Ph. number" })
                } else {
                    setError({ ...error, errorPhone: "" })
                }
                break;
            case "password":
                const checkPassword = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[#?!@$%^&*\-_]).{8,}$/
                if (!checkPassword.test(password.password)) {
                    setError({ ...error, errorPassword: "Please enter valid password" })
                } else {
                    setError({ ...error, errorPassword: "" })
                }
        }
    }
    if(status==STATUSES.LOADING){
        return <Loader />
    }



    return (
        <>

            <div className="inp-container">


                <div className="wlcm">
                    <h2>WELCOME !</h2>
                    <p>signup to continue</p>

                </div>

                <div className="input">
                    <h1 className="login">SignUp</h1>

                    {/* <form action="" method="get"> */}
                    <input type="text" name="" id="username" placeholder="Email" onChange={(e) => { setEmail({ ...email, email: e.target.value }) }} onBlur={() => { inpValidator('email') }} />
                    <span className="input-span"></span>
                    <p className="error">{error.errorEmail}</p>
                    <input type="text" name="" id="name" placeholder="Name" onChange={(e) => { setName({ ...name, name: e.target.value }) }} />
                    <span className="input-span"></span>
                    <p className="error">{error.errorName}</p>
                    <input className="numberinput" type="number" name="" id="" placeholder="Phone No." onChange={(e) => { setPhone({ ...phone, phone: e.target.value }) }} onBlur={() => { inpValidator('phone') }} />
                    <span className="input-span"></span>
                    <p className="error">{error.errorPhone}</p>
                    <div>
                        <input type={`${showPass ? 'text' : 'password'}`} name="" id="password" placeholder="Password" onChange={(e) => { setPassword({ ...password, password: e.target.value }) }} onBlur={() => { inpValidator('password') }} />
                        <button className="showPass" onClick={() => { setshowPass(!showPass) }}><BsFillEyeFill /></button>
                    </div>

                    <span className="input-span"></span>
                    <p className="error">{error.errorPassword}</p>
                    {/* </form> */}
                    {/* <div className="profile-image">
                        <img src={avatarPreview} alt="Avatar" style={{ width: "30px" }} />
                        <input style={{ color:'transparent' }} type="file" name="avatar" accept="image/*" onChange={handeleAvatar} />
                    </div> */}



                    <button className="signup" onClick={handleSubmit} disabled={!(name.name.length && email.email.length && phone.phone.length && password.password.length)}>Signup</button>
                    {/* {console.log(name.name)} */}
                    <p className="redir">have an account <Link to="/login">Login</Link></p>
                </div>

            </div>





        </>
    )
}
export default Signup;