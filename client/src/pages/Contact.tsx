import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SrichakraText from '@/components/custom/SrichakraText';
import sriYantraLogo from '../assets/images/logo/sri-yantra.png';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setFormSubmitted(true);
    setIsLoading(false);
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    setPhone('');
  };

  return (
    <div className="min-h-screen bg-[#83C5BE]">
      {/* Header with logo and back button */}
      <header className="bg-[#006D77] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Sri Yantra Symbol Image */}
            <div className="h-16 w-16 flex-shrink-0">
              <img 
                src={sriYantraLogo} 
                alt="Sri Yantra Symbol" 
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            
            {/* Srichakra Text */}
            <div className="flex flex-col">
              <SrichakraText size="5xl" color="text-[#800000]" decorative={true} withBorder={true}>Srichakra</SrichakraText>
              <div className="text-xl">The School To identify Your Child's Divine Gift!!</div>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="text-white border-white hover:bg-[#005964] flex items-center gap-1">
              <ChevronLeft size={16} />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-[#006D77]">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-8">
              <p className="text-gray-700 leading-relaxed">
                Have questions about our services or how we can help your child discover their potential? 
                Get in touch with our team of experts today.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="text-[#006D77] mt-1" />
                  <div>
                    <h3 className="font-medium">Visit Us</h3>
                    <p className="text-gray-600">
                      17/18, Srinivasa Padayachi Street<br />
                      Tamil Thai Nagar, Vanarai Pet, Uppalam<br />
                      Pondicherry - 605001<br />
                      India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="text-[#006D77] mt-1" />
                  <div>
                    <h3 className="font-medium">Call Us</h3>
                    <p className="text-gray-600">+91 9843030697</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="text-[#006D77] mt-1" />
                  <div>
                    <h3 className="font-medium">Email Us</h3>
                    <p className="text-gray-600">info@srichakra.edu.in</p>
                    <p className="text-gray-600">support@srichakra.edu.in</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Working Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday: Closed</p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              {formSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <Send className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700">
                    Thank you for reaching out. We'll get back to you shortly.
                  </p>
                  <Button 
                    className="mt-4 bg-[#006D77] hover:bg-[#005964]"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input 
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Your Message</Label>
                    <textarea
                      id="message"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Let us know how we can help..."
                    ></textarea>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#006D77] hover:bg-[#005964]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <footer className="bg-[#1a1a1a] text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">© 2023 Srichakra. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
