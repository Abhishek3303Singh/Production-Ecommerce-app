import { Typography, Stepper, Step, StepLabel } from '@material-ui/core'
import React from 'react'
import { MdLocalShipping } from 'react-icons/md'
import { AiFillCheckSquare } from 'react-icons/ai'
import { FcSettings } from 'react-icons/fc'
import { MdOutlineAccountBalance } from 'react-icons/md'
import {GrSettingsOption} from 'react-icons/gr'
import {FcShipped} from 'react-icons/fc'
import {RiEBike2Fill,RiSettings5Fill} from 'react-icons/ri'
// import {TbSettingsCog} from 'react-icons/tb'
import {BiPackage} from 'react-icons/bi'
import './orderStatus.css'


const OrderStatus = ({ activeStep }) => {
    const orderSteps = [
        {
            label: <p>In Process</p>,
            // icon: <GrSettingsOption />
            icon:<RiSettings5Fill/>
        },
        {
            label: <p>Shipped</p>,
            icon: <BiPackage />
        },

        {
            label: <p>On The Way</p>,
            icon: <MdLocalShipping />
        },
        {
            label: <p>Out For Delivery</p>,
            icon: <RiEBike2Fill />
        },
        {
            label: <p>Delivered</p>,
            icon: <AiFillCheckSquare />
        }
    ]
    return (
        <>
            <Stepper alternativeLabel activeStep={activeStep} style={{ boxSizing: 'border-box' }}>
                {orderSteps.map((item, index) => (
                    <Step key={index} active={activeStep === index ? true : false}
                        completed={activeStep >= index ? true : false}>
                        <StepLabel icon={item.icon} className={activeStep >= index ? 'activeIcon1' : 'inActiveIcon1'}>
                            <span className={activeStep >= index ? 'activeIcon' : 'inActiveIcon'}>{item.label}</span>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </>
    )
}

export default OrderStatus