import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';
import facbook from '../../../images/socialicon/facebook.png';
import insta from '../../../images/socialicon/insta.png';
import linkedin from '../../../images/socialicon/in.png';
import twitter from '../../../images/socialicon/twitter.png';
import whatsapp from '../../../images/socialicon/whatsapp.png';

const Footer = () => {
    

    const quickLinks = [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Return Policy', path: '/returns' },
        { name: 'FAQs', path: '/faqs' },
    ];

    const categories = [
        { name: 'Electronics', path: '/products?category=Electronics' },
        { name: 'Fashion', path: '/products?category=Fashion' },
        { name: 'Home & Furniture', path: '/products?category=Home & Furniture' },
        { name: 'Sports & Fitness', path: '/products?category=Sports & Fitness' },
        { name: 'Beauty', path: '/products?category=Beauty' },
        { name: 'Toys & Baby', path: '/products?category=Toys & Baby' },
    ];

    const socialLinks = [
        { icon: facbook, name: 'Facebook', url: 'https://facebook.com/funnhub' },
        { icon: insta, name: 'Instagram', url: 'https://instagram.com/funnhub' },
        { icon: twitter, name: 'Twitter', url: 'https://twitter.com/funnhub' },
        { icon: linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/funnhub' },
        { icon: whatsapp, name: 'WhatsApp', url: 'https://wa.me/918877667789' },
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
               
                <div className="footer-main">
                   
                    <div className="footer-section company-info">
                        <h2 className="footer-logo">FunHub</h2>
                        <p className="company-description">
                            Hello, Welcome to Funhub! India's leading e-commerce platform for gaming, 
                            musical instruments, and fitness products. Experience shopping like never before 
                            with the best deals and premium quality products.
                        </p>
                        <div className="contact-details">
                            <p>
                                <span className="contact-icon">📍</span>
                                Grx Complex, Boring Road, Patna - 800001, Bihar, India
                            </p>
                            <p>
                                <span className="contact-icon">📞</span>
                                +91 8521343533 (Mon-Sat, 10AM-7PM)
                            </p>
                            <p>
                                <span className="contact-icon">✉️</span>
                                funnhub@gmail.com
                            </p>
                        </div>
                    </div>

                    
                    <div className="footer-section">
                        <h3 className="footer-title">Quick Links</h3>
                        <ul className="footer-links">
                            {quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.path}>{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    
                    <div className="footer-section">
                        <h3 className="footer-title">Shop by Category</h3>
                        <ul className="footer-links">
                            {categories.map((category, index) => (
                                <li key={index}>
                                    <Link to={category.path}>{category.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                   
                    <div className="footer-section newsletter-section">
                        <h3 className="footer-title">Stay Connected</h3>
                        <p className="newsletter-text">
                            Subscribe to get updates on new arrivals and exclusive offers
                        </p>
                        <div className="newsletter-form">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="newsletter-input"
                            />
                            <button className="newsletter-btn">Subscribe</button>
                        </div>

                        <div className="social-section">
                            <h4 className="social-title">Follow Us</h4>
                            <div className="social-icons">
                                {socialLinks.map((social, index) => (
                                    <a 
                                        key={index}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-icon"
                                        aria-label={social.name}
                                    >
                                        <img src={social.icon} alt={social.name} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="app-banner">
                    <div className="app-content">
                        <div className="app-text">
                            <span className="app-icon">📱</span>
                            <div>
                                <h4>Download the FunHub App</h4>
                                <p>Get exclusive app-only offers and faster shopping</p>
                            </div>
                        </div>
                        <div className="app-buttons">
                            <button className="app-btn play-store">Google Play</button>
                            <button className="app-btn app-store">App Store</button>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="payment-methods">
                    <h4 className="payment-title">We Accept</h4>
                    <div className="payment-icons">
                        <span className="payment-icon visa">VISA</span>
                        <span className="payment-icon mastercard">Mastercard</span>
                        <span className="payment-icon rupay">RuPay</span>
                        <span className="payment-icon upi">UPI</span>
                        <span className="payment-icon paytm">Paytm</span>
                        <span className="payment-icon cod">COD</span>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            © 2023 FunHub. All Rights Reserved.
                        </p>
                        <div className="footer-bottom-links">
                            <Link to="/privacy">Privacy</Link>
                            <Link to="/terms">Terms</Link>
                            <Link to="/sitemap">Sitemap</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;