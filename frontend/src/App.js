import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
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

// Footer Component
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

// Contact Page Component
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
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cart Context for persistence across pages
const CartContext = React.createContext();

// Main App Component with Cart Persistence
function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('bhoomicart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('bhoomicart', JSON.stringify(cart));
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CustomerCatalog />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bulk-add" element={<BulkAddParts />} />
          </Routes>
          <Footer />
        </BrowserRouter>
        <Toaster />
      </div>
    </CartContext.Provider>
  );
}

// Customer Catalog Component
const CustomerCatalog = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [parts, setParts] = useState([]);
  const { cart, setCart } = React.useContext(CartContext);

  useEffect(() => {
    fetchMachines();
    initializeSampleData();
  }, []);

  const initializeSampleData = async () => {
    try {
      await axios.post(`${API}/admin/init-sample-data`);
    } catch (error) {
      console.log('Sample data already exists or error initializing');
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API}/machines`);
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const fetchSubcategories = async (machineId) => {
    try {
      const response = await axios.get(`${API}/machines/${machineId}/subcategories`);
      setSubcategories(response.data);
      setSelectedMachine(machines.find(m => m.id === machineId));
      setSelectedSubcategory(null);
      setParts([]);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchParts = async (subcategoryId) => {
    try {
      const response = await axios.get(`${API}/subcategories/${subcategoryId}/parts`);
      setParts(response.data);
      setSelectedSubcategory(subcategories.find(s => s.id === subcategoryId));
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  const addToCart = (part, quantity = 1) => {
    const existingItem = cart.find(item => item.part_id === part.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.part_id === part.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        part_id: part.id,
        part_name: part.name,
        part_code: part.code,
        machine_name: selectedMachine.name,
        subcategory_name: selectedSubcategory.name,
        quantity,
        price: part.price,
        image_url: part.image_url,
        comment: ''
      }]);
    }
    toast.success(`${quantity} x ${part.name} added to cart!`);
  };

  const goBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      setParts([]);
    } else if (selectedMachine) {
      setSelectedMachine(null);
      setSubcategories([]);
    }
  };

  const switchMachine = (machineId) => {
    fetchSubcategories(machineId);
  };

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
              <Link to="/cart">
                <Button
                  variant="outline"
                  data-testid="cart-button"
                  className="relative text-xs sm:text-sm px-2 sm:px-4"
                  size="sm"
                >
                  <span className="hidden sm:inline">Cart</span>
                  <span className="sm:hidden">🛒</span>
                  <span className="hidden sm:inline ml-1">({cart.length})</span>
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 min-w-[1.2rem] h-5">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">Contact</span>
                  <span className="sm:hidden">📞</span>
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4" data-testid="admin-login-link">
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sm:hidden">⚙️</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => {
              setSelectedMachine(null);
              setSelectedSubcategory(null);
              setSubcategories([]);
              setParts([]);
            }} 
            className="hover:text-blue-600 transition-colors"
            data-testid="home-breadcrumb"
          >
            Home
          </button>
          {selectedMachine && (
            <>
              <span>/</span>
              <button 
                onClick={goBack}
                className="hover:text-blue-600 transition-colors"
                data-testid="machine-breadcrumb"
              >
                {selectedMachine.name}
              </button>
            </>
          )}
          {selectedSubcategory && (
            <>
              <span>/</span>
              <span className="text-gray-900 font-medium" data-testid="subcategory-breadcrumb">
                {selectedSubcategory.name}
              </span>
            </>
          )}
        </div>

        {/* Machine Switcher (when viewing parts) */}
        {selectedSubcategory && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <p className="text-sm text-gray-600 mb-3">Switch Machine Type:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {machines.map((machine) => (
                <Button
                  key={machine.id}
                  variant={machine.id === selectedMachine.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchMachine(machine.id)}
                  data-testid={`switch-machine-${machine.id}`}
                >
                  {machine.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-3">Switch Category:</p>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((subcat) => (
                <Button
                  key={subcat.id}
                  variant={subcat.id === selectedSubcategory.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => fetchParts(subcat.id)}
                  data-testid={`switch-category-${subcat.id}`}
                >
                  {subcat.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {!selectedMachine && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Spare Parts Ordering System</h2>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Choose Your Machine Type</h3>
              <p className="text-gray-600 text-base sm:text-lg">Select a machine to browse available spare parts</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6" data-testid="machines-grid">
              {machines.map((machine) => (
                <Card 
                  key={machine.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => fetchSubcategories(machine.id)}
                  data-testid={`machine-card-${machine.id}`}
                >
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-xl text-center">{machine.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-center">{machine.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="w-full h-20 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      {machine.image_url ? (
                        <img src={machine.image_url} alt={machine.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-2xl sm:text-4xl">🔧</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedMachine && !selectedSubcategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMachine.name} - Categories</h2>
                <p className="text-gray-600">{selectedMachine.description}</p>
              </div>
              <Button onClick={goBack} variant="outline" data-testid="back-to-machines">
                ← Back to Machines
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="subcategories-grid">
              {subcategories.map((subcategory) => (
                <Card 
                  key={subcategory.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => fetchParts(subcategory.id)}
                  data-testid={`subcategory-card-${subcategory.id}`}
                >
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg text-center">{subcategory.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-center">{subcategory.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="w-full h-16 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xl sm:text-2xl">⚙️</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedSubcategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSubcategory.name} - Parts</h2>
                <p className="text-gray-600">{selectedSubcategory.description}</p>
              </div>
              <Button onClick={goBack} variant="outline" data-testid="back-to-subcategories">
                ← Back to Categories
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" data-testid="parts-grid">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Part Card Component with Quantity Selector
const PartCard = ({ part, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`part-card-${part.id}`}>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg text-center">{part.name}</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center">Code: {part.code}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="w-full h-20 sm:h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          {part.image_url ? (
            <img src={part.image_url} alt={part.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-gray-400 text-xl sm:text-3xl">🔩</span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">{part.description}</p>
        <div className="flex items-center justify-center mb-4">
          <span className="text-sm sm:text-lg font-bold text-green-600">₹{part.price.toLocaleString()}</span>
        </div>
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs sm:text-sm font-medium">Qty:</span>
          <div className="flex items-center space-x-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuantityChange(-1)}
              data-testid={`decrease-part-quantity-${part.id}`}
              className="h-6 w-6 p-0 text-xs"
            >
              -
            </Button>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 sm:w-16 text-center h-6 text-xs"
              data-testid={`part-quantity-input-${part.id}`}
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuantityChange(1)}
              data-testid={`increase-part-quantity-${part.id}`}
              className="h-6 w-6 p-0 text-xs"
            >
              +
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => onAddToCart(part, quantity)} 
          className="w-full text-xs sm:text-sm"
          size="sm"
          data-testid={`add-to-cart-${part.id}`}
        >
          Add {quantity} to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

// Cart Page Component
const CartPage = () => {
  const { cart, setCart } = React.useContext(CartContext);
  const [showCheckout, setShowCheckout] = useState(false);

  const updateCartQuantity = (partId, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.part_id !== partId));
    } else {
      setCart(cart.map(item => 
        item.part_id === partId ? { ...item, quantity } : item
      ));
    }
  };

  const updateCartComment = (partId, comment) => {
    setCart(cart.map(item => 
      item.part_id === partId ? { ...item, comment } : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Group cart items by category and subcategory
  const getGroupedCartItems = () => {
    const grouped = {};
    cart.forEach(item => {
      if (!grouped[item.machine_name]) {
        grouped[item.machine_name] = {};
      }
      if (!grouped[item.machine_name][item.subcategory_name]) {
        grouped[item.machine_name][item.subcategory_name] = [];
      }
      grouped[item.machine_name][item.subcategory_name].push(item);
    });
    return grouped;
  };

  const groupedItems = getGroupedCartItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/bhoomi-logo.png" 
                alt="Bhoomi Enterprises" 
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bhoomi Enterprises</h1>
                <p className="text-gray-600 text-sm">Shopping Cart</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline">← Continue Shopping</Button>
              </Link>
              <Link to="/admin">
                <Button variant="ghost">Admin Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Your Cart</h2>
          <div className="text-lg text-gray-600">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">Your cart is empty</h3>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupedItems).map(([machineName, categories]) => (
                <div key={machineName} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{machineName}</h3>
                  {Object.entries(categories).map(([categoryName, items]) => (
                    <div key={categoryName} className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">{categoryName}</h4>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.part_id} className="flex items-center space-x-4 p-4 border rounded-lg" data-testid={`cart-item-${item.part_id}`}>
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.part_name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <span className="text-gray-400 text-2xl">🔩</span>
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-grow">
                              <h5 className="font-semibold">{item.part_name}</h5>
                              <p className="text-sm text-gray-600">{item.part_code}</p>
                              <p className="text-sm font-semibold text-green-600">₹{item.price.toLocaleString()}</p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateCartQuantity(item.part_id, item.quantity - 1)}
                                data-testid={`decrease-quantity-${item.part_id}`}
                              >
                                -
                              </Button>
                              <Input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => updateCartQuantity(item.part_id, parseInt(e.target.value) || 0)}
                                className="w-16 text-center"
                                data-testid={`quantity-input-${item.part_id}`}
                              />
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateCartQuantity(item.part_id, item.quantity + 1)}
                                data-testid={`increase-quantity-${item.part_id}`}
                              >
                                +
                              </Button>
                            </div>
                            
                            {/* Total Price */}
                            <div className="text-right font-semibold">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                        
                        {/* Specifications Section */}
                        <div className="mt-4">
                          <Label className="text-sm font-medium text-gray-700">Please Mention Specifications, If any:</Label>
                          {items.map((item) => (
                            <Textarea 
                              key={`comment-${item.part_id}`}
                              placeholder={`Specifications for ${item.part_name}...`}
                              value={item.comment}
                              onChange={(e) => updateCartComment(item.part_id, e.target.value)}
                              className="mt-2 resize-none"
                              rows={2}
                              data-testid={`comment-input-${item.part_id}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * GST and Packaging & Forwarding charges will be added extra
                  </p>
                </div>
                
                <Button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full"
                  data-testid="proceed-to-checkout"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog 
        cart={cart}
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        setCart={setCart}
        calculateTotal={calculateTotal}
        getGroupedCartItems={getGroupedCartItems}
      />
    </div>
  );
};

// Enhanced Checkout Dialog Component
const CheckoutDialog = ({ cart, showCheckout, setShowCheckout, setCart, calculateTotal, getGroupedCartItems }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in required fields (Name and Phone)');
      return;
    }

    try {
      const orderData = {
        customer_info: customerInfo,
        items: cart,
        total_amount: calculateTotal()
      };

      console.log('Submitting order:', orderData);
      const response = await axios.post(`${API}/orders`, orderData);
      console.log('Order response:', response.data);
      
      // Generate professional PDF with images
      generateProfessionalPDF(response.data, getGroupedCartItems());
      
      // Clear cart
      setCart([]);
      setShowCheckout(false);
      
      toast.success('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(`Failed to submit order: ${error.response?.data?.detail || error.message}`);
    }
  };

  const generateProfessionalPDF = (order, groupedItems) => {
    const pdf = new jsPDF();
    
    // Company Header with Logo
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('Bhoomi Enterprises', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text('Spare Parts Order Invoice', 20, 45);
    
    // Order Information
    pdf.setFontSize(10);
    pdf.text(`Order ID: ${order.id}`, 120, 45);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 120, 55);
    
    // Customer Information Box
    pdf.rect(15, 65, 180, 40);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Customer Information', 20, 75);
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Name: ${order.customer_info.name}`, 20, 85);
    pdf.text(`Phone: ${order.customer_info.phone}`, 20, 92);
    if (order.customer_info.email) pdf.text(`Email: ${order.customer_info.email}`, 20, 99);
    if (order.customer_info.company) pdf.text(`Company: ${order.customer_info.company}`, 120, 85);
    
    let yPosition = 120;
    
    // Professional Table Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(15, yPosition, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.text('Item Details', 20, yPosition + 5);
    pdf.text('Code', 80, yPosition + 5);
    pdf.text('Qty', 110, yPosition + 5);
    pdf.text('Rate (₹)', 130, yPosition + 5);
    pdf.text('Amount (₹)', 160, yPosition + 5);
    
    yPosition += 12;
    pdf.setTextColor(0, 0, 0);
    
    // Grouped Items with Professional Formatting
    Object.entries(groupedItems).forEach(([machineName, categories]) => {
      // Machine header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, yPosition, 180, 6, 'F');
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text(machineName, 20, yPosition + 4);
      yPosition += 10;
      
      Object.entries(categories).forEach(([categoryName, items]) => {
        // Category subheader
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'italic');
        pdf.text(`  ${categoryName}`, 25, yPosition);
        yPosition += 6;
        
        // Items
        items.forEach(item => {
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(8);
          
          // Item name (with text wrapping)
          const itemText = `    ${item.part_name}`;
          pdf.text(itemText.length > 35 ? itemText.substring(0, 35) + '...' : itemText, 20, yPosition);
          pdf.text(item.part_code, 80, yPosition);
          pdf.text(item.quantity.toString(), 115, yPosition);
          pdf.text(item.price.toLocaleString(), 135, yPosition);
          pdf.text((item.price * item.quantity).toLocaleString(), 165, yPosition);
          
          yPosition += 5;
          
          // Add specifications if provided
          if (item.comment) {
            pdf.setFontSize(7);
            pdf.setFont(undefined, 'italic');
            pdf.text(`      Spec: ${item.comment.substring(0, 60)}`, 20, yPosition);
            yPosition += 4;
          }
        });
        yPosition += 3;
      });
      yPosition += 5;
    });
    
    // Summary Section
    yPosition += 10;
    pdf.line(120, yPosition, 195, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text('Subtotal:', 135, yPosition);
    pdf.text(`₹${order.total_amount.toLocaleString()}`, 165, yPosition);
    
    yPosition += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('Total Amount:', 135, yPosition);
    pdf.text(`₹${order.total_amount.toLocaleString()}`, 165, yPosition);
    
    // Terms and Conditions
    yPosition += 20;
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.text('Terms & Conditions:', 20, yPosition);
    yPosition += 5;
    pdf.text('• GST and Packaging & Forwarding charges will be added extra', 20, yPosition);
    yPosition += 4;
    pdf.text('• Prices are subject to change without prior notice', 20, yPosition);
    yPosition += 4;
    pdf.text('• Payment terms as per company policy', 20, yPosition);
    
    // Footer
    yPosition += 15;
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'italic');
    pdf.text('Thank you for your business!', 20, yPosition);
    pdf.text('Bhoomi Enterprises', 140, yPosition);
    
    // Save PDF
    const fileName = `Bhoomi-Order-${order.id.slice(0, 8)}-${order.customer_info.name.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
    
    // Generate WhatsApp link
    const whatsappMessage = `Order Summary from Bhoomi Enterprises\n\nOrder ID: ${order.id}\nCustomer: ${order.customer_info.name}\nTotal: ₹${order.total_amount.toLocaleString()}\n\nItems:\n${order.items.map(item => `• ${item.part_name} (${item.quantity}x)`).join('\n')}\n\n*GST and P&F charges will be added extra`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    
    setTimeout(() => {
      const shareChoice = window.confirm('Order PDF downloaded! Would you like to share via WhatsApp?');
      if (shareChoice) {
        window.open(whatsappUrl, '_blank');
      }
    }, 1000);
  };

  const groupedItems = getGroupedCartItems();

  return (
    <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="checkout-dialog">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Enter your details to complete the order
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              placeholder="Enter your name"
              data-testid="customer-name-input"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input 
              id="phone"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
              placeholder="Enter your phone number"
              data-testid="customer-phone-input"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
              placeholder="Enter your email"
              data-testid="customer-email-input"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company"
              value={customerInfo.company}
              onChange={(e) => setCustomerInfo({...customerInfo, company: e.target.value})}
              placeholder="Enter company name"
              data-testid="customer-company-input"
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-4">Order Summary:</h4>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(groupedItems).map(([machineName, categories]) => (
              <div key={machineName} className="mb-4">
                <h5 className="font-semibold text-gray-800">{machineName}</h5>
                {Object.entries(categories).map(([categoryName, items]) => (
                  <div key={categoryName} className="ml-4 mb-2">
                    <h6 className="font-medium text-gray-700">{categoryName}</h6>
                    <div className="ml-4 space-y-1 text-sm">
                      {items.map((item) => (
                        <div key={item.part_id} className="flex justify-between">
                          <span>{item.part_name} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t mt-2 pt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              * GST and Packaging & Forwarding charges will be added extra
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowCheckout(false)} data-testid="cancel-checkout">
            Cancel
          </Button>
          <Button onClick={handleSubmitOrder} data-testid="submit-order">
            Submit Order & Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Admin Login Component
const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/admin/login`, credentials);
      localStorage.setItem('adminToken', response.data.access_token);
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/bhoomi-logo.png" 
              alt="Bhoomi Enterprises" 
              className="h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                placeholder="Enter username"
                data-testid="admin-username-input"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="Enter password"
                data-testid="admin-password-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="admin-login-submit">
              Login
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:underline text-sm">
              ← Back to Catalog
            </Link>
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p className="font-semibold">Demo Credentials:</p>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderView, setShowOrderView] = useState(false);
  const navigate = useNavigate();

  // Catalog Management States
  const [machines, setMachines] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'catalog') {
      fetchCatalogData();
    }
  }, [activeTab, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      }
    }
  };

  const fetchCatalogData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [machinesRes, subcategoriesRes, partsRes] = await Promise.all([
        axios.get(`${API}/machines`),
        axios.get(`${API}/subcategories`, { headers }),
        axios.get(`${API}/parts`, { headers })
      ]);
      
      setMachines(machinesRes.data);
      setSubcategories(subcategoriesRes.data || []);
      setParts(partsRes.data || []);
    } catch (error) {
      console.error('Error fetching catalog data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const downloadOrderPDF = (order) => {
    const pdf = new jsPDF();
    
    // Professional PDF generation (same as customer PDF but with admin formatting)
    pdf.setFontSize(20);
    pdf.text('Bhoomi Enterprises - Admin Order View', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Order ID: ${order.id}`, 20, 45);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 55);
    pdf.text(`Status: ${order.status}`, 20, 65);
    
    // Customer Info
    pdf.setFontSize(14);
    pdf.text('Customer Information:', 20, 85);
    pdf.setFontSize(10);
    pdf.text(`Name: ${order.customer_info.name}`, 20, 95);
    pdf.text(`Phone: ${order.customer_info.phone}`, 20, 105);
    if (order.customer_info.email) pdf.text(`Email: ${order.customer_info.email}`, 20, 115);
    if (order.customer_info.company) pdf.text(`Company: ${order.customer_info.company}`, 20, 125);
    
    // Items Table
    const tableData = order.items.map(item => [
      item.part_name,
      item.part_code,
      item.machine_name,
      item.subcategory_name,
      item.quantity.toString(),
      `₹${item.price.toLocaleString()}`,
      `₹${(item.price * item.quantity).toLocaleString()}`,
      item.comment || '-'
    ]);
    
    pdf.autoTable({
      startY: 140,
      head: [['Part Name', 'Code', 'Machine', 'Category', 'Qty', 'Price', 'Total', 'Specifications']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Total
    const finalY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(14);
    pdf.text(`Grand Total: ₹${order.total_amount.toLocaleString()}`, 20, finalY);
    pdf.setFontSize(8);
    pdf.text('* GST and Packaging & Forwarding charges will be added extra', 20, finalY + 10);
    
    // Save PDF
    const fileName = `Admin-Order-${order.id.slice(0, 8)}-${order.customer_info.name.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderView(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/bhoomi-logo.png" 
                alt="Bhoomi Enterprises" 
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Bhoomi Enterprises Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" target="_blank">
                <Button variant="outline" data-testid="view-catalog">View Catalog</Button>
              </Link>
              <Link to="/admin/bulk-add">
                <Button variant="outline">Bulk Add Parts</Button>
              </Link>
              <Button onClick={handleLogout} variant="ghost" data-testid="admin-logout">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              data-testid="orders-tab"
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'catalog'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              data-testid="catalog-tab"
            >
              Manage Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} 
            fetchOrders={fetchOrders} 
            downloadOrderPDF={downloadOrderPDF}
            viewOrder={viewOrder}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogTab 
            machines={machines}
            subcategories={subcategories}
            parts={parts}
            fetchCatalogData={fetchCatalogData}
          />
        )}
      </div>

      {/* Order View Dialog */}
      <Dialog open={showOrderView} onOpenChange={setShowOrderView}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <OrderViewDialog order={selectedOrder} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Order View Dialog Component
const OrderViewDialog = ({ order }) => {
  // Group items by machine and category
  const groupedItems = {};
  order.items.forEach(item => {
    if (!groupedItems[item.machine_name]) {
      groupedItems[item.machine_name] = {};
    }
    if (!groupedItems[item.machine_name][item.subcategory_name]) {
      groupedItems[item.machine_name][item.subcategory_name] = [];
    }
    groupedItems[item.machine_name][item.subcategory_name].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700">Order Information</h4>
            <p className="text-sm">ID: {order.id}</p>
            <p className="text-sm">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="text-sm">Status: <Badge>{order.status}</Badge></p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Customer Information</h4>
            <p className="text-sm">{order.customer_info.name}</p>
            <p className="text-sm">{order.customer_info.phone}</p>
            {order.customer_info.email && <p className="text-sm">{order.customer_info.email}</p>}
            {order.customer_info.company && <p className="text-sm">{order.customer_info.company}</p>}
          </div>
        </div>
      </div>

      {/* Grouped Items */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Order Items</h4>
        {Object.entries(groupedItems).map(([machineName, categories]) => (
          <div key={machineName} className="border rounded-lg p-4">
            <h5 className="font-semibold text-blue-600 mb-3">{machineName}</h5>
            {Object.entries(categories).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-4">
                <h6 className="font-medium text-gray-700 mb-2">{categoryName}</h6>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-grow">
                        <p className="font-medium">{item.part_name}</p>
                        <p className="text-sm text-gray-600">Code: {item.part_code}</p>
                        {item.comment && (
                          <p className="text-sm text-blue-600">Specs: {item.comment}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total Amount:</span>
          <span>₹{order.total_amount.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          * GST and Packaging & Forwarding charges will be added extra
        </p>
      </div>
    </div>
  );
};

// Enhanced Orders Tab Component
const OrdersTab = ({ orders, fetchOrders, downloadOrderPDF, viewOrder }) => {
  return (
    <div data-testid="orders-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customer Orders</h2>
        <Button onClick={fetchOrders} variant="outline" data-testid="refresh-orders">
          Refresh
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_info.name}</div>
                      {order.customer_info.company && (
                        <div className="text-sm text-gray-600">{order.customer_info.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{order.customer_info.phone}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell className="font-semibold">₹{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewOrder(order)}
                        data-testid={`view-order-${order.id}`}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadOrderPDF(order)}
                        data-testid={`download-pdf-${order.id}`}
                      >
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

// Enhanced Catalog Tab Component with No Categories, Multiple Machine Support, and Inline Price Edit
const CatalogTab = ({ machines, parts, fetchCatalogData }) => {
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState('');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('all');
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  
  const [newMachine, setNewMachine] = useState({ name: '', description: '', image_url: '' });
  const [newPart, setNewPart] = useState({ 
    machine_ids: [],
    name: '', 
    code: '', 
    description: '', 
    price: 0,
    image_url: ''
  });

  // Filter parts based on selected machine
  const filteredParts = selectedMachineFilter === 'all' 
    ? parts 
    : parts.filter(part => 
        part.machine_ids?.includes(selectedMachineFilter) || 
        part.machine_id === selectedMachineFilter
      );

  // Image upload handler
  const handleImageUpload = async (file, type, id = null) => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const imageUrl = response.data.image_url;
      
      if (type === 'machine' && !id) {
        setNewMachine({...newMachine, image_url: imageUrl});
      } else if (type === 'machine' && id) {
        setEditingItem({...editingItem, image_url: imageUrl});
      } else if (type === 'part' && !id) {
        setNewPart({...newPart, image_url: imageUrl});
      } else if (type === 'part' && id) {
        setEditingItem({...editingItem, image_url: imageUrl});
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  // Inline price edit handlers
  const startPriceEdit = (part) => {
    setEditingPrice(part.id);
    setNewPrice(part.price.toString());
  };

  const savePriceEdit = async (partId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/admin/parts/${partId}/price?price=${parseFloat(newPrice)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingPrice(null);
      setNewPrice('');
      fetchCatalogData();
      toast.success('Price updated successfully!');
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  const cancelPriceEdit = () => {
    setEditingPrice(null);
    setNewPrice('');
  };

  const handleAddMachine = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API}/admin/machines`, newMachine, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewMachine({ name: '', description: '', image_url: '' });
      setShowAddMachine(false);
      fetchCatalogData();
      toast.success('Machine added successfully!');
    } catch (error) {
      console.error('Error adding machine:', error);
      toast.error('Failed to add machine');
    }
  };

  const handleEditMachine = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/admin/machines/${editingItem.id}`, {
        name: editingItem.name,
        description: editingItem.description,
        image_url: editingItem.image_url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingItem(null);
      setEditType('');
      fetchCatalogData();
      toast.success('Machine updated successfully!');
    } catch (error) {
      console.error('Error updating machine:', error);
      toast.error('Failed to update machine');
    }
  };

  const handleDeleteMachine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this machine? This will also delete all related parts.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/admin/machines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchCatalogData();
      toast.success('Machine deleted successfully!');
    } catch (error) {
      console.error('Error deleting machine:', error);
      toast.error('Failed to delete machine');
    }
  };

  const handleAddPart = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API}/admin/parts`, {
        ...newPart,
        price: parseFloat(newPart.price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewPart({ 
        machine_ids: [],
        name: '', 
        code: '', 
        description: '', 
        price: 0,
        image_url: ''
      });
      setShowAddPart(false);
      fetchCatalogData();
      toast.success('Part added successfully!');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  const handleEditPart = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/admin/parts/${editingItem.id}`, {
        machine_ids: editingItem.machine_ids,
        name: editingItem.name,
        code: editingItem.code,
        description: editingItem.description,
        price: parseFloat(editingItem.price),
        image_url: editingItem.image_url
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingItem(null);
      setEditType('');
      fetchCatalogData();
      toast.success('Part updated successfully!');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    }
  };

  const handleDeletePart = async (id) => {
    if (!window.confirm('Are you sure you want to delete this part?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${API}/admin/parts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchCatalogData();
      toast.success('Part deleted successfully!');
    } catch (error) {
      console.error('Error deleting part:', error);
      toast.error('Failed to delete part');
    }
  };

  const getMachineNames = (machineIds) => {
    if (!machineIds || machineIds.length === 0) return 'No machines assigned';
    return machineIds.map(id => {
      const machine = machines.find(m => m.id === id);
      return machine ? machine.name : 'Unknown';
    }).join(', ');
  };

  return (
    <div data-testid="catalog-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Catalog Management</h2>
        <div className="space-x-2">
          <Button onClick={() => setShowAddMachine(true)} data-testid="add-machine-btn">
            Add Machine
          </Button>
          <Button onClick={() => setShowAddPart(true)} variant="outline" data-testid="add-part-btn">
            Add Part
          </Button>
        </div>
      </div>

      {/* Machines Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Machines ({machines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="border rounded p-4">
                <div className="w-full h-24 bg-gray-100 rounded mb-3 flex items-center justify-center">
                  {machine.image_url ? (
                    <img src={machine.image_url} alt={machine.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-2xl">🔧</span>
                  )}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-grow">
                    <h4 className="font-semibold">{machine.name}</h4>
                    <p className="text-sm text-gray-600">{machine.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {parts.filter(part => part.machine_ids?.includes(machine.id) || part.machine_id === machine.id).length} parts
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setEditingItem(machine);
                        setEditType('machine');
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteMachine(machine.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parts Section with Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Parts ({filteredParts.length})</span>
            <div className="flex items-center space-x-2">
              <Label>Filter by Machine:</Label>
              <select 
                className="border rounded px-3 py-1"
                value={selectedMachineFilter}
                onChange={(e) => setSelectedMachineFilter(e.target.value)}
              >
                <option value="all">All Machines</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.name}</option>
                ))}
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredParts.map((part) => (
              <div key={part.id} className="border rounded p-4">
                <div className="flex space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {part.image_url ? (
                      <img src={part.image_url} alt={part.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-xl">🔩</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{part.name}</h4>
                        <p className="text-sm text-gray-600">Code: {part.code}</p>
                        <p className="text-sm text-gray-600">{part.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {editingPrice === part.id ? (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm">₹</span>
                              <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-20 px-1 py-0 text-sm border rounded"
                                step="0.01"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') savePriceEdit(part.id);
                                  if (e.key === 'Escape') cancelPriceEdit();
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={() => savePriceEdit(part.id)}>✓</Button>
                              <Button size="sm" variant="ghost" onClick={cancelPriceEdit}>✕</Button>
                            </div>
                          ) : (
                            <p 
                              className="text-sm font-semibold text-green-600 cursor-pointer hover:bg-green-50 px-1 rounded"
                              onClick={() => startPriceEdit(part)}
                              title="Click to edit price"
                            >
                              ₹{part.price?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Machines: {getMachineNames(part.machine_ids || [part.machine_id])}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setEditingItem({
                              ...part, 
                              machine_ids: part.machine_ids || [part.machine_id]
                            });
                            setEditType('part');
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600"
                          onClick={() => handleDeletePart(part.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialogs */}
      <Dialog open={showAddMachine} onOpenChange={setShowAddMachine}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Machine Name</Label>
              <Input 
                value={newMachine.name}
                onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                placeholder="e.g., Tractor"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={newMachine.description}
                onChange={(e) => setNewMachine({...newMachine, description: e.target.value})}
                placeholder="Machine description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddMachine(false)}>Cancel</Button>
              <Button onClick={handleAddMachine}>Add Machine</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Machine Dialog */}
      <Dialog open={editType === 'machine'} onOpenChange={() => {setEditType(''); setEditingItem(null);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Machine</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Machine Name</Label>
                <Input 
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {setEditType(''); setEditingItem(null);}}>Cancel</Button>
                <Button onClick={handleEditMachine}>Update Machine</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={showAddSubcategory} onOpenChange={setShowAddSubcategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Machine *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newSubcategory.machine_id}
                onChange={(e) => setNewSubcategory({...newSubcategory, machine_id: e.target.value})}
              >
                <option value="">Select Machine</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Category Name</Label>
              <Input 
                value={newSubcategory.name}
                onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
                placeholder="e.g., Engine"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={newSubcategory.description}
                onChange={(e) => setNewSubcategory({...newSubcategory, description: e.target.value})}
                placeholder="Category description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddSubcategory(false)}>Cancel</Button>
              <Button onClick={handleAddSubcategory}>Add Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={editType === 'subcategory'} onOpenChange={() => {setEditType(''); setEditingItem(null);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Machine *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingItem.machine_id}
                  onChange={(e) => setEditingItem({...editingItem, machine_id: e.target.value})}
                >
                  <option value="">Select Machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Category Name</Label>
                <Input 
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {setEditType(''); setEditingItem(null);}}>Cancel</Button>
                <Button onClick={handleEditSubcategory}>Update Category</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showAddPart} onOpenChange={setShowAddPart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Machine *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newPart.machine_id}
                onChange={(e) => {
                  setNewPart({...newPart, machine_id: e.target.value, subcategory_id: ''});
                }}
              >
                <option value="">Select Machine</option>
                {machines.map(machine => (
                  <option key={machine.id} value={machine.id}>{machine.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Category *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={newPart.subcategory_id}
                onChange={(e) => setNewPart({...newPart, subcategory_id: e.target.value})}
                disabled={!newPart.machine_id}
              >
                <option value="">Select Category</option>
                {subcategories
                  .filter(sub => sub.machine_id === newPart.machine_id)
                  .map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <Label>Part Name</Label>
              <Input 
                value={newPart.name}
                onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                placeholder="e.g., Piston Ring Set"
              />
            </div>
            <div>
              <Label>Part Code</Label>
              <Input 
                value={newPart.code}
                onChange={(e) => setNewPart({...newPart, code: e.target.value})}
                placeholder="e.g., TR-ENG-001"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={newPart.description}
                onChange={(e) => setNewPart({...newPart, description: e.target.value})}
                placeholder="Part description"
              />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input 
                type="number"
                value={newPart.price}
                onChange={(e) => setNewPart({...newPart, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddPart(false)}>Cancel</Button>
              <Button onClick={handleAddPart}>Add Part</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={editType === 'part'} onOpenChange={() => {setEditType(''); setEditingItem(null);}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Part</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Machine *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingItem.machine_id}
                  onChange={(e) => {
                    setEditingItem({...editingItem, machine_id: e.target.value, subcategory_id: ''});
                  }}
                >
                  <option value="">Select Machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>{machine.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Category *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={editingItem.subcategory_id}
                  onChange={(e) => setEditingItem({...editingItem, subcategory_id: e.target.value})}
                  disabled={!editingItem.machine_id}
                >
                  <option value="">Select Category</option>
                  {subcategories
                    .filter(sub => sub.machine_id === editingItem.machine_id)
                    .map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                    ))
                  }
                </select>
              </div>
              <div>
                <Label>Part Name</Label>
                <Input 
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Part Code</Label>
                <Input 
                  value={editingItem.code}
                  onChange={(e) => setEditingItem({...editingItem, code: e.target.value})}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                />
              </div>
              <div>
                <Label>Price (₹)</Label>
                <Input 
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {setEditType(''); setEditingItem(null);}}>Cancel</Button>
                <Button onClick={handleEditPart}>Update Part</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Bulk Add Parts Component
const BulkAddParts = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [parts, setParts] = useState([{ 
    machine_id: '', 
    subcategory_id: '', 
    name: '', 
    code: '', 
    description: '', 
    price: '', 
    image: null 
  }]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [machinesRes, subcategoriesRes] = await Promise.all([
        axios.get(`${API}/machines`),
        axios.get(`${API}/subcategories`, { headers })
      ]);
      
      setMachines(machinesRes.data);
      setSubcategories(subcategoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addRow = () => {
    setParts([...parts, { 
      machine_id: '', 
      subcategory_id: '', 
      name: '', 
      code: '', 
      description: '', 
      price: '', 
      image: null 
    }]);
  };

  const removeRow = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index, field, value) => {
    const updatedParts = [...parts];
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    setParts(updatedParts);
  };

  const handleImageUpload = async (index, file) => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updatePart(index, 'image_url', response.data.image_url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const submitAllParts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      for (const part of parts) {
        if (!part.name || !part.code || !part.machine_id || !part.subcategory_id) {
          toast.error('Please fill all required fields for each part');
          return;
        }
        
        await axios.post(`${API}/admin/parts`, {
          ...part,
          price: parseFloat(part.price)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      toast.success(`${parts.length} parts added successfully!`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error adding parts:', error);
      toast.error('Failed to add parts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/bhoomi-logo.png" 
                alt="Bhoomi Enterprises" 
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Add Parts</h1>
                <p className="text-gray-600 text-sm">Add multiple parts at once</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/dashboard">
                <Button variant="outline">← Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Multiple Parts</CardTitle>
            <CardDescription>
              Fill in the details for each part you want to add
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {parts.map((part, index) => (
                <div key={index} className="border rounded-lg p-6 relative">
                  <div className="absolute top-2 right-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => removeRow(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <h4 className="font-semibold mb-4">Part #{index + 1}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Machine *</Label>
                      <Select 
                        value={part.machine_id} 
                        onValueChange={(value) => {
                          updatePart(index, 'machine_id', value);
                          updatePart(index, 'subcategory_id', '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select machine" />
                        </SelectTrigger>
                        <SelectContent>
                          {machines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id}>{machine.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Category *</Label>
                      <Select 
                        value={part.subcategory_id} 
                        onValueChange={(value) => updatePart(index, 'subcategory_id', value)}
                        disabled={!part.machine_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories
                            .filter(sub => sub.machine_id === part.machine_id)
                            .map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Part Name *</Label>
                      <Input 
                        value={part.name}
                        onChange={(e) => updatePart(index, 'name', e.target.value)}
                        placeholder="Enter part name"
                      />
                    </div>
                    
                    <div>
                      <Label>Part Code *</Label>
                      <Input 
                        value={part.code}
                        onChange={(e) => updatePart(index, 'code', e.target.value)}
                        placeholder="Enter part code"
                      />
                    </div>
                    
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input 
                        type="number"
                        value={part.price}
                        onChange={(e) => updatePart(index, 'price', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label>Part Image</Label>
                      <Input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(index, e.target.files[0]);
                          }
                        }}
                      />
                      {part.image_url && (
                        <div className="mt-2">
                          <img src={part.image_url} alt="Part" className="h-16 w-16 object-contain border rounded" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label>Description</Label>
                    <Textarea 
                      value={part.description}
                      onChange={(e) => updatePart(index, 'description', e.target.value)}
                      placeholder="Enter part description"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between">
                <Button onClick={addRow} variant="outline">
                  Add Another Part
                </Button>
                <Button onClick={submitAllParts} className="bg-blue-600">
                  Submit All Parts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// End of components

export default App;