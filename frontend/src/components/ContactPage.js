import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

// Contact Information
const contactInfo = {
  company: "Bhoomi Enterprises Private Limited",
  branches: [
    {
      name: "Madhya Pradesh Branch",
      address: "Gram Berkhedi Birsa, Sanchi road, Vidisha (M.P.)",
      phone: "7898986808"
    },
    {
      name: "Maharashtra Branch", 
      address: "Aurangabad",
      phone: "8888507011"
    },
    {
      name: "Chattisgarh Branch",
      address: "Bilaspur",
      phone: "7898986808"
    }
  ],
  email: "office.bhoomigroup@gmail.com",
  hours: "Mon-Sat: 9:00 AM - 6:00 PM"
};

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/bhoomi-logo.png" 
                alt="Bhoomi Enterprises" 
                className="h-10 sm:h-12 object-contain"
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">← Back to Catalog</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600">Get in touch with our team for all your spare parts needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactInfo.branches.map((branch, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">{branch.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">📍 Address</p>
                    <p className="font-medium">{branch.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📞 Phone</p>
                    <p className="font-medium">
                      <a href={`tel:+91${branch.phone}`} className="text-blue-600 hover:underline">
                        +91 {branch.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">💬 WhatsApp</p>
                    <p className="font-medium">
                      <a 
                        href={`https://wa.me/91${branch.phone}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        Chat with us
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">📧 Email</p>
                <p className="font-medium">
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">
                    {contactInfo.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">🕒 Business Hours</p>
                <p className="font-medium">{contactInfo.hours}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">🏢 Company</p>
                <p className="font-medium">{contactInfo.company}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Your phone number" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={4} placeholder="Your message" />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;