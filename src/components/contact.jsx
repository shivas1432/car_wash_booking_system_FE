import React, { useState } from 'react';
import axios from 'axios';  // Import Axios
import { Link } from 'react-router-dom';
import '../css/contact.css';
import imgSrc1 from '../images/3.jpg';

const ContactHelp = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      type: 'ai',
      text: "Hi, I'm shiva's assistant! How can I help you today with your vehicle cleaning needs?",
      time: '11:30 AM',
    },
  ]);

  // Function to send a message and get AI response
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatLog((prev) => [...prev, userMessage]);

    try {
      // Send the user message to the server for AI response using Axios
      const res = await axios.post('http://localhost:5000/api/ai', {
        userId: localStorage.getItem('userId') || 'guest',
        message: input,
      });

      // Handle the AI response
      const aiReply = {
        type: 'ai',
        text: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatLog((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('AI error:', err);

      if (err.response) {
        alert(`Error: ${err.response.status} - ${err.response.data.error || 'Something went wrong with the server. Please try again later.'}`);
      } else if (err.request) {
        alert('Error: No response from server. Please try again later.');
      } else {
        alert('Error: Something went wrong while sending your message.');
      }
    }

    setInput('');
  };

  return (
    <div className="contact-help-container">
      {/* Top Section - Banner Image */}
      <div className="top-section">
        <div className="banner-content">
          <h1>Your Support</h1>
          <p>We're here to help with all your carwash needs, providing service-oriented solutions. You can also try our AI assistant for quick assistance with any inquiries, offering tailored solutions to ensure the best experience for your vehicle.</p>

        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs">
        <button 
          className={activeTab === 'contact' ? 'active' : ''} 
          onClick={() => setActiveTab('contact')}
        >
          Contact
        </button>
        <button 
          className={activeTab === 'help' ? 'active' : ''} 
          onClick={() => setActiveTab('help')}
        >
         ShineAssist AI
        </button>
      </div>

      {/* Contact Section */}
      {activeTab === 'contact' && (
        <div className="contact-section">
          <div className="contact-card">
            <div className="contact-info">
              <h2>Customer Support</h2>
              <p>Reach us anytime</p>
              <div className="contact-methods">
                {/* Methods for Contact */}
              {/* Phone */}
<div className="method">
  <div className="method-icon">
    <img src={imgSrc1} alt="Phone icon" />
  </div>
  <div className="method-details">
    <h3>Hotline</h3>
    <p>Available 24/7: 1-800-CARWASH</p>
  </div>
  <div className="expand-icon">
    <a href="tel:+447867034729" target="_blank" rel="noopener noreferrer">Call Now</a>
  </div>
</div>

{/* Email */}
<div className="method">
  <div className="method-icon">
    <img src={imgSrc1} alt="Email icon" />
  </div>
  <div className="method-details">
    <h3>Email Support</h3>
    <p>Get a reply within 24 hours</p>
  </div>
  <div className="expand-icon">
    <a href="mailto:shiva@gmail.com" target="_blank" rel="noopener noreferrer">Email Us</a>
  </div>
</div>

{/* WhatsApp */}
<div className="method">
  <div className="method-icon">
    <img src={imgSrc1} alt="Chat icon" />
  </div>
  <div className="method-details">
    <h3>Live Chat</h3>
    <p>Instant help for quick questions</p>
  </div>
  <div className="expand-icon">
    <a href="https://wa.me/447867034729" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">WhatsApp</a>
    <a href="https://m.me/your-facebook-username" target="_blank" rel="noopener noreferrer" className="messenger-btn">Messenger</a>
  </div>
</div>

{/* Google Maps */}
<div className="method">
  <div className="method-icon">
    <img src={imgSrc1} alt="Location icon" />
  </div>
  <div className="method-details">
    <h3>Find Location</h3>
    <p>Visit our store</p>
  </div>
  <div className="expand-icon">
    <a href="https://www.google.com/maps?q=CF116AH+44C+Tuderstreet" target="_blank" rel="noopener noreferrer">Find on Google Maps</a>
  </div>
</div>

              </div>

              <div className="footer-help">
                <h3>Other ways to get help</h3><br/>
                <div className="wealth-options">
                  <Link to="/book-appointment" className="btn-outline">
                    Book Appointment
                    <span className="dropdown-icon">▼</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help/AI Assistant Section */}
      {activeTab === 'help' && (
        <div className="help-section">
          <div className="ai-card">
            <h2>AI Assistant</h2>
            <p>Get instant help with our AI</p>

            <div className="ai-chat">
              {chatLog.map((msg, index) => (
                <div className={`ai-message ${msg.type}`} key={index}>
                  <div className="ai-icon">
                    <img src={imgSrc1} alt={`${msg.type} icon`} />
                  </div>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area and send button fixed */}
            <div className="input-area">
              <input
                type="text"
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3>Frequently Asked Questions</h3>
            <div className="faq-item">
              <div className="faq-question">
                <span className="number">1</span>
                <p>How soon can I get an appointment?</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <span className="number">2</span>
                <p>Do you offer mobile services?</p>
              </div>
            </div>
            <div className="faq-item">
              <div className="faq-question">
                <span className="number">3</span>
                <p>What payment methods do you accept?</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactHelp;
