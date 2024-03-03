import { useState } from "react"

const ImageSlider = ({slides})=>{  /// slides= [{url:'/imageFolder...'}, {url:'/imageFolder...'}, {url:'/imageFolder...'}, {}]
    const [imageIndex, setImageIndex] = useState(0)
    const sideMainContainer ={
        height:'100%',
        position: "relative",
    }
    const sildeContainer ={
        backgroundImage : `url(${slides[imageIndex].url})`,
        width: '100%',
        height : '100%',
        backgroundPosition :'cover',
        objectFit: 'contain',
        // borderRadius:"10px",
        // borderBottomRightRadius:"125px",
        backgroundSize: "cover",
        
        
        // clipPath: "polygon(0 0, 100% 0%, 100% 78%, 0% 100%)",
        // clipPath: "polygon(0 0, 100% 0%, 75% 100%, 0% 100%)"
    }
    const leftSlide ={
        position: 'absolute',
        top: '40%',
        transform : "translateAliases(0, -50%)",
        left: "32px",
        color : "#fff",
        fontSize : "50px",
        zIndex : 1,
        cursor: "pointer"
    }
    const rightSlide ={
        position: 'absolute',
        top: '40%',
        transform : "translateAliases(0, -50%)",
        right: "32px",
        fontSize : "50px",
        color : "#fff",
        zIndex : 1,
        cursor: "pointer"
    }
    // const dashContainer = {
    //     display: "flex",
    //     justifyContent: "center"
    // }
    // const dash ={
    //     margin:'0 3px',
    //     cursor: "pointer",
    //     fontSize: "20px",
    //     color:"white",
    // }
    
    const leftClick =()=>{
        if(imageIndex ==0){
            setImageIndex(slides.length-1)
        }
        else{
            setImageIndex(imageIndex-1)
        }
    }
    const rightClick =()=>{
       if(imageIndex==slides.length-1){
        setImageIndex(0)
       }else{
        setImageIndex(imageIndex+1)
       }
    }
    // const jumpToImg =(index)=>{
    //     setImageIndex(index)

    // }
    return (
        <>
        <div style={sideMainContainer}>
            <div style={leftSlide} onClick={leftClick}> &lt; </div>
            <div style={rightSlide} onClick={rightClick}>&gt;</div>
            <div style={sildeContainer}>

            </div>
            {/* <div style={dashContainer}>
                {slides.map((slide, index)=>(
                    <div key={index} style={dash} onClick={()=>{jumpToImg(index)}}>&mdash;</div>

                ))}
            </div> */}
        </div>
        </>
    )

}
export default ImageSlider