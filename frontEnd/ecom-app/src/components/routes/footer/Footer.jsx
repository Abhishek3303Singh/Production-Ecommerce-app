import './footer.css'
import facbook from '../../../images/socialicon/facebook.png'
import insta from '../../../images/socialicon/insta.png'
import linkedin from '../../../images/socialicon/in.png'
import twitter from '../../../images/socialicon/twitter.png'
import whatsapp from '../../../images/socialicon/whatsapp.png'


const Footer = () => {
    return (
        <>
            <footer>
                <div className="row">
                    <div className="col">
                        <h2 className="logo-footer">FunHub</h2>
                        <p>
                        Hello, Welcome to Funhub Funhub is the top leading startup of our country. 
                        Here you can get better experience than you think. Funhub has a wide range 
                        of gaming, musical instruments and fitness products at attractive prices.
                        </p>
                    </div>
                    <div className="col">
                        <h3>Office <div className="underline"><span></span></div> </h3>
                        <p>Boring Road,</p>
                        <p>Grx Complex Patna, PIN 800001</p>
                        <p>Bihar, India.</p>
                        <p className='email-id'>funnnhub@gmail.com</p>
                        <h4>+91 8877667789</h4>
                    </div>
                    <div className="col">
                        <h3>Links <div className="underline"><span></span></div></h3>
                        <ul>
                            <li><a href="">Home</a></li>
                            <li><a href="">Contacts</a></li>
                            <li><a href="">Featurs</a></li>
                            <li><a href="">About Us</a></li>
                        </ul>
                    </div>
                    <div className="col">
                        <h3>Our Social Media handles <div className="underline"><span></span></div></h3>
                        <div className="social-icon">
                            <p><img src={facbook} alt="" /></p>
                            <p><img src={insta} alt="" /></p>
                            <p><img src={twitter} alt="" /></p>
                            <p><img src={linkedin} alt="" /></p>
                            <p><img src={whatsapp} alt="" /></p>
                        </div>
                    </div>
                </div>
                <hr />
                <h4 className='copyright'>Copyright &#169; 2023 fun-hub.All Rights Reserved</h4>
            </footer>
        </>
    )
}
export default Footer;