import React from "react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h3>JIABELLE</h3>
          <p>
            Premium handbags crafted for modern women who love elegance,
            functionality, and timeless style.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li>Handbags</li>
            <li>Tote Bags</li>
            <li>Clutches</li>
            <li>Backpacks</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Support</h4>
          <ul>
            <li>Shipping Info</li>
            <li>Returns & Refunds</li>
            <li>Order Tracking</li>
            <li>FAQs</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>

          <p>
            <a href="mailto:support@jiabelle.com">
              support@jiabelle.com
            </a>
          </p>

          <p>
            <a href="tel:+919876543210">
              +91 9876543210
            </a>
          </p>

          <p>Gujarat, India</p>
        </div>
      </div>

      <div className="footer-middle">
        <div className="trust">
          <span>🔒 Secure Payments</span>
          <span>🚚 Free Shipping</span>
          <span>🔄 Easy Returns</span>
        </div>

        <div className="social">
          <span>Follow us:</span>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Jiabelle. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;