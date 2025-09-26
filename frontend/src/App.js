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
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerCatalog />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

// Customer Catalog Component
const CustomerCatalog = () => {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [parts, setParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

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
        comment: ''
      }]);
    }
    toast.success(`${quantity} x ${part.name} added to cart!`);
  };

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

  const goBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      setParts([]);
    } else if (selectedMachine) {
      setSelectedMachine(null);
      setSubcategories([]);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QuickParts</h1>
                <p className="text-gray-600 text-sm">Spare Parts Ordering System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
                data-testid="cart-button"
                className="relative"
              >
                Cart ({cart.length})
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
              <Link to="/admin">
                <Button variant="ghost" data-testid="admin-login-link">Admin Login</Button>
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
            onClick={() => window.location.reload()} 
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

        {/* Content */}
        {!selectedMachine && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Machine Type</h2>
              <p className="text-gray-600 text-lg">Select a machine to browse available spare parts</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6" data-testid="machines-grid">
              {machines.map((machine) => (
                <Card 
                  key={machine.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => fetchSubcategories(machine.id)}
                  data-testid={`machine-card-${machine.id}`}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{machine.name}</CardTitle>
                    <CardDescription>{machine.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🔧</span>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="subcategories-grid">
              {subcategories.map((subcategory) => (
                <Card 
                  key={subcategory.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => fetchParts(subcategory.id)}
                  data-testid={`subcategory-card-${subcategory.id}`}
                >
                  <CardHeader>
                    <CardTitle>{subcategory.name}</CardTitle>
                    <CardDescription>{subcategory.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">⚙️</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedSubcategory && (
          <div>
            {/* Category Navigation */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
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

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSubcategory.name} - Parts</h2>
                <p className="text-gray-600">{selectedSubcategory.description}</p>
              </div>
              <Button onClick={goBack} variant="outline" data-testid="back-to-subcategories">
                ← Back to Categories
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="parts-grid">
              {parts.map((part) => (
                <PartCard key={part.id} part={part} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Dialog */}
      <CartDialog 
        cart={cart}
        showCart={showCart}
        setShowCart={setShowCart}
        setShowCheckout={setShowCheckout}
        updateCartQuantity={updateCartQuantity}
        updateCartComment={updateCartComment}
        calculateTotal={calculateTotal}
        getGroupedCartItems={getGroupedCartItems}
      />

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

// Part Card Component with Quantity Selector
const PartCard = ({ part, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`part-card-${part.id}`}>
      <CardHeader>
        <CardTitle className="text-lg">{part.name}</CardTitle>
        <CardDescription>Code: {part.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          {part.image_url ? (
            <img src={part.image_url} alt={part.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-gray-400 text-3xl">🔩</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{part.description}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-green-600">₹{part.price.toLocaleString()}</span>
        </div>
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuantityChange(-1)}
              data-testid={`decrease-part-quantity-${part.id}`}
            >
              -
            </Button>
            <Input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center"
              data-testid={`part-quantity-input-${part.id}`}
            />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleQuantityChange(1)}
              data-testid={`increase-part-quantity-${part.id}`}
            >
              +
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => onAddToCart(part, quantity)} 
          className="w-full"
          data-testid={`add-to-cart-${part.id}`}
        >
          Add {quantity} to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

// Cart Dialog Component with Grouped Display
const CartDialog = ({ cart, showCart, setShowCart, setShowCheckout, updateCartQuantity, updateCartComment, calculateTotal, getGroupedCartItems }) => {
  const groupedItems = getGroupedCartItems();

  return (
    <Dialog open={showCart} onOpenChange={setShowCart}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="cart-dialog">
        <DialogHeader>
          <DialogTitle>Shopping Cart</DialogTitle>
          <DialogDescription>
            Review your selected parts and quantities
          </DialogDescription>
        </DialogHeader>
        
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([machineName, categories]) => (
              <div key={machineName} className="border rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{machineName}</h3>
                {Object.entries(categories).map(([categoryName, items]) => (
                  <div key={categoryName} className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">{categoryName}</h4>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.part_id} className="border rounded p-3" data-testid={`cart-item-${item.part_id}`}>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <h5 className="font-semibold">{item.part_name}</h5>
                              <p className="text-sm text-gray-600">{item.part_code}</p>
                            </div>
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
                            <div>
                              <Textarea 
                                placeholder="Add comments..." 
                                value={item.comment}
                                onChange={(e) => updateCartComment(item.part_id, e.target.value)}
                                className="resize-none"
                                rows={2}
                                data-testid={`comment-input-${item.part_id}`}
                              />
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                              <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total: ₹{calculateTotal().toLocaleString()}</span>
                <Button 
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                  data-testid="proceed-to-checkout"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Checkout Dialog Component with Enhanced PDF
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
      
      // Generate PDF with grouped items
      generateGroupedPDF(response.data, getGroupedCartItems());
      
      // Clear cart
      setCart([]);
      setShowCheckout(false);
      
      toast.success('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error(`Failed to submit order: ${error.response?.data?.detail || error.message}`);
    }
  };

  const generateGroupedPDF = (order, groupedItems) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('QuickParts - Order Summary', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Order ID: ${order.id}`, 20, 45);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 55);
    
    // Customer Info
    pdf.setFontSize(14);
    pdf.text('Customer Information:', 20, 75);
    pdf.setFontSize(10);
    pdf.text(`Name: ${order.customer_info.name}`, 20, 85);
    pdf.text(`Phone: ${order.customer_info.phone}`, 20, 95);
    if (order.customer_info.email) pdf.text(`Email: ${order.customer_info.email}`, 20, 105);
    if (order.customer_info.company) pdf.text(`Company: ${order.customer_info.company}`, 20, 115);
    
    let yPosition = 130;
    
    // Grouped Items
    Object.entries(groupedItems).forEach(([machineName, categories]) => {
      // Machine header
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${machineName}:`, 20, yPosition);
      yPosition += 10;
      
      Object.entries(categories).forEach(([categoryName, items]) => {
        // Category header
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text(`  ${categoryName}:`, 25, yPosition);
        yPosition += 8;
        
        // Items in this category
        items.forEach(item => {
          pdf.setFont(undefined, 'normal');
          pdf.text(`    • ${item.part_name} (${item.part_code}) - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`, 30, yPosition);
          yPosition += 6;
          if (item.comment) {
            pdf.text(`      Note: ${item.comment}`, 35, yPosition);
            yPosition += 6;
          }
        });
        yPosition += 4;
      });
      yPosition += 6;
    });
    
    // Total
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(`Grand Total: ₹${order.total_amount.toLocaleString()}`, 20, yPosition);
    
    // Save PDF
    const fileName = `QuickParts-Order-${order.id.slice(0, 8)}.pdf`;
    pdf.save(fileName);
    
    // Generate WhatsApp link
    const whatsappMessage = `Order Summary from QuickParts\n\nOrder ID: ${order.id}\nCustomer: ${order.customer_info.name}\nTotal: ₹${order.total_amount.toLocaleString()}\n\nItems:\n${order.items.map(item => `• ${item.part_name} (${item.quantity}x)`).join('\n')}`;
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
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{calculateTotal().toLocaleString()}</span>
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
  const navigate = useNavigate();

  // Catalog Management States
  const [machines, setMachines] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [parts, setParts] = useState([]);
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
    
    // Header
    pdf.setFontSize(20);
    pdf.text('QuickParts - Order Details', 20, 30);
    
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
      head: [['Part Name', 'Code', 'Machine', 'Category', 'Qty', 'Price', 'Total', 'Comments']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    // Total
    const finalY = pdf.lastAutoTable.finalY + 10;
    pdf.setFontSize(14);
    pdf.text(`Grand Total: ₹${order.total_amount.toLocaleString()}`, 20, finalY);
    
    // Save PDF
    const fileName = `Order-${order.id.slice(0, 8)}-${order.customer_info.name.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SP</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage your spare parts catalog</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" target="_blank">
                <Button variant="outline" data-testid="view-catalog">View Catalog</Button>
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
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders, fetchOrders, downloadOrderPDF }) => {
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadOrderPDF(order)}
                      data-testid={`download-pdf-${order.id}`}
                    >
                      Download PDF
                    </Button>
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

// Catalog Tab Component
const CatalogTab = ({ machines, subcategories, parts, fetchCatalogData }) => {
  const [showAddMachine, setShowAddMachine] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  
  const [newMachine, setNewMachine] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ machine_id: '', name: '', description: '' });
  const [newPart, setNewPart] = useState({ 
    machine_id: '', 
    subcategory_id: '', 
    name: '', 
    code: '', 
    description: '', 
    price: 0 
  });

  const handleAddMachine = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API}/admin/machines`, newMachine, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewMachine({ name: '', description: '' });
      setShowAddMachine(false);
      fetchCatalogData();
      toast.success('Machine added successfully!');
    } catch (error) {
      console.error('Error adding machine:', error);
      toast.error('Failed to add machine');
    }
  };

  const handleAddSubcategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${API}/admin/subcategories`, newSubcategory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewSubcategory({ machine_id: '', name: '', description: '' });
      setShowAddSubcategory(false);
      fetchCatalogData();
      toast.success('Subcategory added successfully!');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
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
        machine_id: '', 
        subcategory_id: '', 
        name: '', 
        code: '', 
        description: '', 
        price: 0 
      });
      setShowAddPart(false);
      fetchCatalogData();
      toast.success('Part added successfully!');
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    }
  };

  return (
    <div data-testid="catalog-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Catalog Management</h2>
        <div className="space-x-2">
          <Button onClick={() => setShowAddMachine(true)} data-testid="add-machine-btn">
            Add Machine
          </Button>
          <Button onClick={() => setShowAddSubcategory(true)} variant="outline" data-testid="add-subcategory-btn">
            Add Category
          </Button>
          <Button onClick={() => setShowAddPart(true)} variant="outline" data-testid="add-part-btn">
            Add Part
          </Button>
        </div>
      </div>

      {/* Machines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Machines ({machines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="border rounded p-4">
                <h4 className="font-semibold">{machine.name}</h4>
                <p className="text-sm text-gray-600">{machine.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Categories ({subcategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {subcategories.map((subcategory) => {
              const machine = machines.find(m => m.id === subcategory.machine_id);
              return (
                <div key={subcategory.id} className="border rounded p-4">
                  <h4 className="font-semibold">{subcategory.name}</h4>
                  <p className="text-sm text-gray-600">{subcategory.description}</p>
                  <p className="text-xs text-gray-500">Machine: {machine?.name}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Parts */}
      <Card>
        <CardHeader>
          <CardTitle>Parts ({parts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {parts.map((part) => {
              const machine = machines.find(m => m.id === part.machine_id);
              const subcategory = subcategories.find(s => s.id === part.subcategory_id);
              return (
                <div key={part.id} className="border rounded p-4">
                  <h4 className="font-semibold">{part.name}</h4>
                  <p className="text-sm text-gray-600">Code: {part.code}</p>
                  <p className="text-sm text-gray-600">{part.description}</p>
                  <p className="text-sm font-semibold text-green-600">₹{part.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {machine?.name} → {subcategory?.name}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Machine Dialog */}
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

      {/* Add Subcategory Dialog */}
      <Dialog open={showAddSubcategory} onOpenChange={setShowAddSubcategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Machine</Label>
              <Select value={newSubcategory.machine_id} onValueChange={(value) => setNewSubcategory({...newSubcategory, machine_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>{machine.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Add Part Dialog */}
      <Dialog open={showAddPart} onOpenChange={setShowAddPart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Machine</Label>
                <Select value={newPart.machine_id} onValueChange={(value) => setNewPart({...newPart, machine_id: value, subcategory_id: ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>{machine.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Category</Label>
                <Select 
                  value={newPart.subcategory_id} 
                  onValueChange={(value) => setNewPart({...newPart, subcategory_id: value})}
                  disabled={!newPart.machine_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories
                      .filter(sub => sub.machine_id === newPart.machine_id)
                      .map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                placeholder="0"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddPart(false)}>Cancel</Button>
              <Button onClick={handleAddPart}>Add Part</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;