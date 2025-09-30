import React from 'react';
import { Link } from 'react-router-dom';

const contactInfo = {
  company: "Bhoomi Enterprises Private Limited",
  email: "office.bhoomigroup@gmail.com",
  phone: "7898986808",
  hours: "Mon-Sat: 9:00 AM - 6:00 PM"
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img 
              src="/bhoomi-logo.png" 
              alt="Bhoomi Enterprises" 
              className="h-12 object-contain mb-4 filter brightness-0 invert"
            />
            <p className="text-gray-300 text-sm mb-4">
              Your trusted partner for quality spare parts and agricultural machinery components.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white">Catalog</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/admin" className="hover:text-white">Admin</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>📧 {contactInfo.email}</p>
              <p>📞 +91 {contactInfo.phone}</p>
              <p>🕒 {contactInfo.hours}</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 {contactInfo.company}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;