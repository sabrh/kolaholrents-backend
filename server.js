require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Kolahol_user:v16hb23MSHGVpPOL@cluster0.lcrd7ak.mongodb.net/kolaholRents?appName=Cluster0";

// Schemas
const tenantSchema = new mongoose.Schema({
  floor: { type: String, required: true },
  name: { type: String, required: true },
  people: { type: Number, required: true },
  phone: { type: String, required: true },
  rent: { type: Number, required: true },
  moveInDate: { type: String, required: true },
  lastEditedBy: String,
  lastEditedAt: String
});

const billSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  floorData: { type: Array, required: true },
  fifthFloorMeter: { type: Object, required: true },
  processedBy: { type: String, required: true },
  createdAt: { type: String, required: true }
});

const Tenant = mongoose.model('Tenant', tenantSchema);
const Bill = mongoose.model('Bill', billSchema);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.warn('Auth Middleware: No Authorization header');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// API Routes
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ floor: 1 });
    res.json(tenants);
  } catch (err) {
    console.error('Fetch Tenants Error:', err);
    res.status(500).json({ error: 'Failed to fetch tenants', details: err.message });
  }
});

app.post('/api/tenants/seed', authMiddleware, async (req, res) => {
  try {
    const count = await Tenant.countDocuments();
    if (count > 0) return res.status(400).json({ error: 'Tenants already exist' });

    const initialTenants = [
      { floor: '1st Floor', name: 'Shapna Pandey', people: 5, phone: '+8801720168161', rent: 20000, moveInDate: new Date('2023-01-01').toISOString() },
      { floor: '2nd Floor', name: 'Nasrin Akter Binu', people: 7, phone: '+8801710239973', rent: 25000, moveInDate: new Date('2023-01-01').toISOString() },
      { floor: '3rd Floor', name: 'Mehedi Hasan Rony', people: 3, phone: '+8801712401071', rent: 23000, moveInDate: new Date('2023-01-01').toISOString() },
      { floor: '4th Floor', name: 'Najmul Haque', people: 6, phone: '+8801913455517', rent: 0, moveInDate: new Date('2023-01-01').toISOString() },
      { floor: '5th Floor', name: 'Oli Ullah', people: 6, phone: '+8801961323840', rent: 13000, moveInDate: new Date('2023-01-01').toISOString() }
    ];
    await Tenant.insertMany(initialTenants);
    res.json({ message: 'Tenants seeded successfully' });
  } catch (err) {
    console.error('Seed Tenants Error:', err);
    res.status(500).json({ error: 'Failed to seed tenants', details: err.message });
  }
});

app.put('/api/tenants/:id', authMiddleware, async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.post('/api/bills', authMiddleware, async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save bill' });
  }
});

// Start server
async function startServer() {
  try {
    const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('Connecting to MongoDB:', maskedUri);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();