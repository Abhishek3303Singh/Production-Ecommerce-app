import React from 'react'
import { useState, useEffect } from 'react'
import MetaData from '../routes/MetaData';
import { useDispatch, useSelector } from 'react-redux'
import PinDropIcon from '@material-ui/icons/PinDrop'
import HomeIcon from '@material-ui/icons/Home'
import LocatinCityIcon from '@material-ui/icons/LocationCity'
import PublicIcon from '@material-ui/icons/Public'
import PhoneIcon from '@material-ui/icons/Phone'
import {FaLandmark,FaUserTie} from 'react-icons/fa'
import TransferWithinAStation  from '@material-ui/icons/TransferWithinAStationOutlined'
import { Country, State, City }  from 'country-state-city';
import './shipping.css'
import ChecktOut from './ChecktOut';
import {useAlert} from 'react-alert';
import { shippingDetails } from '../../store/cartSlice';
import { useNavigate } from 'react-router-dom';

const Shipping = () => {
    const dispatch= useDispatch()
    const {shippingInfo} = useSelector((state)=>state.cart)
    const[address, setAddress] = useState(shippingInfo?.address)
    const[city, setCity] = useState(shippingInfo?.city)
    const[instate, setInState] = useState(shippingInfo?.state)
    const[pincode, setPincode] = useState(shippingInfo?.pincode)
    const[landmark, setLandmark] = useState(shippingInfo?.landmark)
    const[country, setCountry] = useState("IN")
    const [phoneNo, setPhoneNo] = useState(shippingInfo?.phoneNo)
    const [name, setName] = useState(shippingInfo?.name)
    // console.log('state', instate)
    const alert = useAlert()
    const navigate = useNavigate()
    const handleShippingSubmit=(e)=>{
        e.preventDefault()
        if(phoneNo.length < 10 || phoneNo.length > 10){
            alert.error('Phone Number is Not Valid')
            return
        }
        dispatch(shippingDetails({name,address,city,instate,pincode,landmark,country,phoneNo}))
        navigate('/order/confirm');
    }
  return (
    <>
    <MetaData title='Shipping-Details'></MetaData>
    
    <header className='shipping-Heading'>
    Shipping Information
    </header>
    <ChecktOut activeStep={0} />
        <div className="shippingMainContainer">
            <div className="shippingContainer">
                
                <form action="" className='shipping-form' encType='multipart/form-data' onSubmit={handleShippingSubmit}>
                <div>
                        <FaUserTie/>
                        <input type="text"  placeholder='Name' value={name} onChange={(e)=>{setName(e.target.value)}} required />
                    </div>
                    <div>
                        <HomeIcon/>
                        <input type="text" required placeholder='Address' value={address} onChange={(e)=>{setAddress(e.target.value)}} />
                    </div>
                    {/* <div>
                        <LocatinCityIcon/>
                        <input type="text" placeholder='city' value={city} onChange={(e)=>{setCity(e.target.value)}} />
                    </div> */}
                    <div>
                        <PinDropIcon/>
                        <input type="number" required placeholder='Pincode' value={pincode} onChange={(e)=>{setPincode(e.target.value)}} />
                    </div>
                    <div>
                        <PhoneIcon/>
                        <input type="number" required placeholder='Phone No..' value={phoneNo} onChange={(e)=>{setPhoneNo(e.target.value)}} />
                    </div>
                    <div>
                        <FaLandmark/>
                        <input type="text" required placeholder='Landmark' value={landmark} onChange={(e)=>{setLandmark(e.target.value)}} />
                    </div>
                    <div>
                        <PublicIcon/>
                        <select name="" id="" value={country} onChange={(e)=>setCountry(e.target.value)}>
                            <option value={country}>India</option>
                            {/* {
                                Country&&Country.getAllCountries().map((item)=>(
                                    <option value={item.isoCode} key={item.isoCode}>{item.name}
                                    </option>
                                ))
                            } */}
                        </select>
                    </div>
                    {country&&(
                        <div>
                            <TransferWithinAStation/>
                            <select name="" id="" value={instate} onChange={(e)=>setInState(e.target.value)}>
                                <option value="">
                                    State
                                </option>
                                {State&& State.getStatesOfCountry(country).map((item)=>(
                                  
                                        <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                            
                                ))}
                            </select>
                        </div>
                    )}

                        {instate&&(
                        <div>
                            <LocatinCityIcon/>
                            <select name="" id="" value={city} onChange={(e)=>setCity(e.target.value)}>
                                <option value="">
                                    City
                                </option>
                                {City&& City.getCitiesOfState(country, instate).map((item)=>(
                                    <option key={item.isoCode} value={item.isoCode}>{item.name}</option>
                                  
                                ))}
                            </select>
                        </div>
                    )}

                    
                    <input type="submit" value='Continue' className='shipBtn' disabled={city?false:true}/>

                </form>
            </div>
        </div>
    </>
  )
}

export default Shipping