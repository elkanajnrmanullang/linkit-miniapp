// Inisialisasi Modul
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Konfigurasi Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms'));

// Variabel Simulasi Monitoring
let errorCount = 0;

// Middleware Autentikasi
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Akses ditolak' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' });
    req.user = user;
    next();
  });
};

// Rute Monitoring dan Health
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Rute Inisialisasi Data Eksternal
app.post('/api/seed', async (req, res) => {
  try {
    const response = await axios.get('https://api.sampleapis.com/coffee/hot');
    const coffees = response.data;

    for (let coffee of coffees) {
      await prisma.coffee.create({
        data: {
          title: coffee.title,
          description: coffee.description,
          ingredients: coffee.ingredients || [],
          image: coffee.image,
        }
      });
    }
    res.status(201).json({ message: 'Data kopi berhasil disinkronisasi' });
  } catch (error) {
    errorCount++;
    res.status(500).json({ error: 'Gagal mengambil data eksternal' });
  }
});

// Rute Autentikasi
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword }
    });
    res.status(201).json({ message: 'Registrasi berhasil', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Registrasi gagal' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Password salah' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Kesalahan server' });
  }
});

// Rute Master Data
app.get('/api/coffees', authenticateToken, async (req, res) => {
  try {
    const coffees = await prisma.coffee.findMany();
    res.status(200).json(coffees);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data kopi' });
  }
});

// Rute Transaksional
app.post('/api/orders', authenticateToken, async (req, res) => {
  const start = Date.now();
  try {
    const { coffeeId, quantity } = req.body;
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        coffeeId,
        quantity,
        totalPrice: quantity * 25000 
      }
    });
    const duration = Date.now() - start;
    
    // Simulasi Alert Slow Response
    if (duration > 1000) console.log(`[ALERT] Respon lambat terdeteksi: ${duration}ms`);
    
    console.log(`[TRANSACTION LOG] Order dibuat ID: ${order.id}`);
    res.status(201).json(order);
  } catch (error) {
    errorCount++;
    console.error(`[ERROR LOG] Pembuatan order gagal: ${error.message}`);
    
    // Simulasi Alert Error melebihi 3x
    if (errorCount > 3) console.log('[ALERT] Error melebihi ambang batas (>3x)');
    
    res.status(500).json({ error: 'Gagal membuat order' });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { coffee: true } });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data order' });
  }
});

app.put('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { quantity, totalPrice: quantity * 25000 }
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Gagal memperbarui order' });
  }
});

app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: 'Order berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ error: 'Gagal menghapus order' });
  }
});

// Menjalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});