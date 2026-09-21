import { Stepper, Step, StepLabel } from '@material-ui/core'
import React from 'react'
import { MdSettings, MdLocalShipping, MdCheckCircle } from 'react-icons/md'
import { RiEBike2Fill } from 'react-icons/ri'
import { BiPackage } from 'react-icons/bi'
import './orderStatus.css'

const OrderStatus = ({ activeStep }) => {
    const orderSteps = [
        { label: 'In Process', icon: <MdSettings /> },
        { label: 'Shipped', icon: <BiPackage /> },
        { label: 'On The Way', icon: <MdLocalShipping /> },
        { label: 'Out For Delivery', icon: <RiEBike2Fill /> },
        { label: 'Delivered', icon: <MdCheckCircle /> },
    ]

    return (
        <Stepper alternativeLabel activeStep={activeStep} className="order-stepper">
            {orderSteps.map((item, index) => {
                const isCompleted = activeStep > index;
                const isCurrent = activeStep === index;
                const stateClass = isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-pending';

                return (
                    <Step key={index} active={isCurrent} completed={isCompleted}>
                        <StepLabel
                            icon={item.icon}
                            className={stateClass}
                        >
                            <span className={stateClass}>{item.label}</span>
                        </StepLabel>
                    </Step>
                )
            })}
        </Stepper>
    )
}

export default OrderStatus