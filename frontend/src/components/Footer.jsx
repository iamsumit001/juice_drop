import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div>
        <h3>JuiceDrop</h3>
        <p>Fresh Juice. Delivered Fresh.</p>
      </div>
      <div>
        <h4>Company</h4>
        <p><Link to="/shop">Shop juices</Link></p>
        <p><Link to="/build-a-box">Build a Juice Box</Link></p>
        <p><Link to="/stores">Our Stores</Link></p>
      </div>
      <div>
        <h4>Support</h4>
        <p><Link to="/delivery">Check delivery</Link></p>
        <p><Link to="/orders">Track Order</Link></p>
      </div>
      <div>
        <h4>Get in touch</h4>
        <p><a href="mailto:hello@juicedrop.com">hello@juicedrop.com</a></p>
        <p><a href="tel:+919876543210">+91 98765 43210</a></p>
      </div>
    </div>
    <p className="footer-bottom">© {new Date().getFullYear()} JuiceDrop. Built for a hackathon with MERN.</p>
  </footer>
);

export default Footer;
