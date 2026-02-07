import { Typography, Stepper, Step, StepLabel } from '@material-ui/core'
import React from 'react'
import {MdLocalShipping} from 'react-icons/md'
import {AiFillCheckSquare} from 'react-icons/ai'
import {MdOutlineAccountBalance} from 'react-icons/md'
import './checkout.css'


const ChecktOut = ({activeStep}) => {
   const orderSteps = [
        {
            label:<p>Shipping Details</p>,
            icon:<MdLocalShipping/>
        },
        {
            label:<p>Confirm Order</p>,
            icon:<AiFillCheckSquare/>
        },
        {
            label:<p>Payment</p>,
            icon:<MdOutlineAccountBalance/>
        }
    ]
  return (
    <>
    <Stepper alternativeLabel activeStep={activeStep} style={{boxSizing:'border-box'}}>
        {orderSteps.map((item ,index)=>(
            <Step key={index} active={activeStep===index ? true:false}
            completed={activeStep>=index?true:false}>
                <StepLabel icon={item.icon} className={activeStep>=index ? 'activeIcon1' : 'inActiveIcon1'}>
                    <span className={activeStep>=index ? 'activeIcon' : 'inActiveIcon'}>{item.label}</span>
                </StepLabel>
            </Step>
        ))}
    </Stepper>
    </>
  )
}

export default ChecktOut