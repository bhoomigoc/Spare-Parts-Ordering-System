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

  const addToCart = (part) => {
    const existingItem = cart.find(item => item.part_id === part.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.part_id === part.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        part_id: part.id,
        part_name: part.name,
        part_code: part.code,
        machine_name: selectedMachine.name,
        subcategory_name: selectedSubcategory.name,
        quantity: 1,
        price: part.price,
        comment: ''
      }]);
    }
    toast.success('Part added to cart!');
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
                <Card key={part.id} className="hover:shadow-lg transition-shadow" data-testid={`part-card-${part.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{part.name}</CardTitle>
                    <CardDescription>Code: {part.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-400 text-3xl">🔩</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{part.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">₹{part.price.toLocaleString()}</span>
                      <Button 
                        onClick={() => addToCart(part)} 
                        size="sm"
                        data-testid={`add-to-cart-${part.id}`}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
      />

      {/* Checkout Dialog */}
      <CheckoutDialog 
        cart={cart}
        showCheckout={showCheckout}
        setShowCheckout={setShowCheckout}
        setCart={setCart}
        calculateTotal={calculateTotal}
      />
    </div>
  );
};

// Cart Dialog Component
const CartDialog = ({ cart, showCart, setShowCart, setShowCheckout, updateCartQuantity, updateCartComment, calculateTotal }) => {
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
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.part_id} className="border rounded-lg p-4" data-testid={`cart-item-${item.part_id}`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <h4 className="font-semibold">{item.part_name}</h4>
                    <p className="text-sm text-gray-600">{item.part_code}</p>
                    <p className="text-xs text-gray-500">{item.machine_name} → {item.subcategory_name}</p>
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

// Checkout Dialog Component
const CheckoutDialog = ({ cart, showCheckout, setShowCheckout, setCart, calculateTotal }) => {
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

      const response = await axios.post(`${API}/orders`, orderData);
      
      // Generate PDF
      generatePDF(response.data);
      
      // Clear cart
      setCart([]);
      setShowCheckout(false);
      
      toast.success('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit order');
    }
  };

  const generatePDF = (order) => {
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
      startY: 130,
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

  return (
    <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
      <DialogContent className="max-w-2xl" data-testid="checkout-dialog">
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
          <h4 className="font-semibold mb-2">Order Summary:</h4>
          <div className="space-y-1 text-sm">
            {cart.map((item) => (
              <div key={item.part_id} className="flex justify-between">
                <span>{item.part_name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
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

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    if (activeTab === 'orders') {
      fetchOrders();
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'catalog' && (
          <div data-testid="catalog-section">
            <div className="text-center py-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Catalog Management</h2>
              <p className="text-gray-600 mb-6">
                Catalog management features (CRUD operations for machines, subcategories, and parts) will be implemented in the next phase.
              </p>
              <p className="text-sm text-gray-500">
                For now, you can view and manage orders. The catalog is populated with sample data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;