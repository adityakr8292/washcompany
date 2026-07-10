const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;

const users = [
  {
    id: 'admin-1',
    name: 'Sarah Chen',
    email: 'sarah@thewash.co',
    role: 'admin',
    company: 'The Wash Company',
    phone: '(555) 010-1000',
  },
  {
    id: 'client-1',
    name: 'Marcus Rivera',
    email: 'marcus@grandhotel.com',
    role: 'client',
    company: 'Grand Hotel Group',
    phone: '(555) 010-2001',
  },
  {
    id: 'client-2',
    name: 'Elena Park',
    email: 'elena@seasideresort.com',
    role: 'client',
    company: 'Seaside Resort',
    phone: '(555) 010-2002',
  },
  {
    id: 'delivery-1',
    name: 'James Okafor',
    email: 'james@thewash.co',
    role: 'delivery',
    company: 'The Wash Company',
    phone: '(555) 010-3001',
  },
];

const orders = [
  {
    id: 'ord-001',
    orderNumber: 'WO-2025-7841',
    clientId: 'client-1',
    clientName: 'Marcus Rivera',
    clientCompany: 'Grand Hotel Group',
    items: [
      { id: 'i1', name: 'King Fitted Sheet', category: 'Bed Linen', quantity: 45, unitPrice: 4.5 },
      { id: 'i2', name: 'Bath Towel', category: 'Towels', quantity: 120, unitPrice: 2.25 },
    ],
    status: 'processing',
    stage: 'washing',
    total: 517.5,
    weight: 185.4,
    pickupDate: '2025-07-09',
    deliveryDate: '2025-07-11',
    deliveryAddress: '1200 Market St, Suite 400',
    notes: 'Use hypoallergenic detergent',
    createdAt: '2025-07-09T08:30:00Z',
    updatedAt: '2025-07-10T06:15:00Z',
    assignedDriverId: 'delivery-1',
    invoiceId: 'inv-001',
  },
  {
    id: 'ord-002',
    orderNumber: 'WO-2025-7842',
    clientId: 'client-2',
    clientName: 'Elena Park',
    clientCompany: 'Seaside Resort',
    items: [
      { id: 'i4', name: 'Pool Towel', category: 'Towels', quantity: 80, unitPrice: 2.75 },
      { id: 'i5', name: 'Queen Duvet Cover', category: 'Bed Linen', quantity: 30, unitPrice: 7.5 },
    ],
    status: 'out_for_delivery',
    stage: 'out_for_delivery',
    total: 445.0,
    weight: 142.0,
    pickupDate: '2025-07-08',
    deliveryDate: '2025-07-10',
    deliveryAddress: '4500 Coastal Hwy',
    notes: 'Deliver to loading dock B',
    createdAt: '2025-07-08T09:00:00Z',
    updatedAt: '2025-07-10T07:00:00Z',
    assignedDriverId: 'delivery-1',
    invoiceId: 'inv-002',
  },
];

const invoices = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-1001',
    clientId: 'client-1',
    clientName: 'Marcus Rivera',
    orderId: 'ord-001',
    orderNumber: 'WO-2025-7841',
    amount: 500,
    tax: 17.5,
    total: 517.5,
    status: 'pending',
    issueDate: '2025-07-09',
    dueDate: '2025-07-16',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-1002',
    clientId: 'client-2',
    clientName: 'Elena Park',
    orderId: 'ord-002',
    orderNumber: 'WO-2025-7842',
    amount: 420,
    tax: 25,
    total: 445,
    status: 'paid',
    issueDate: '2025-07-08',
    dueDate: '2025-07-15',
    paidDate: '2025-07-10',
  },
];

const notifications = [
  { id: 'n1', userId: 'client-1', role: 'client', title: 'Pickup confirmed', message: 'Your pickup window is confirmed for tomorrow morning.', type: 'info', read: false, createdAt: '2025-07-10T06:30:00Z' },
  { id: 'n2', userId: 'admin-1', role: 'admin', title: 'Inventory low', message: 'Bath towels are below the reorder threshold.', type: 'warning', read: false, createdAt: '2025-07-10T07:00:00Z' },
  { id: 'n3', userId: 'delivery-1', role: 'delivery', title: 'Route updated', message: 'Your delivery route has been updated with 2 new stops.', type: 'info', read: false, createdAt: '2025-07-10T08:00:00Z' },
];

const deliveryJobs = [
  {
    id: 'job-1',
    orderId: 'ord-001',
    orderNumber: 'WO-2025-7841',
    type: 'delivery',
    status: 'assigned',
    clientName: 'Marcus Rivera',
    clientCompany: 'Grand Hotel Group',
    address: '1200 Market St, Suite 400',
    contactPhone: '(555) 010-2001',
    scheduledTime: '2025-07-10T10:00:00Z',
    driverId: 'delivery-1',
  },
  {
    id: 'job-2',
    orderId: 'ord-002',
    orderNumber: 'WO-2025-7842',
    type: 'pickup',
    status: 'completed',
    clientName: 'Elena Park',
    clientCompany: 'Seaside Resort',
    address: '4500 Coastal Hwy',
    contactPhone: '(555) 010-2002',
    scheduledTime: '2025-07-10T09:00:00Z',
    completedTime: '2025-07-10T09:40:00Z',
    driverId: 'delivery-1',
  },
];

const stageCounts = [
  { key: 'received', label: 'Received', count: 1 },
  { key: 'washing', label: 'Washing', count: 1 },
  { key: 'pressing', label: 'Pressing', count: 0 },
  { key: 'packing', label: 'Packing', count: 0 },
  { key: 'out_for_delivery', label: 'Out for Delivery', count: 1 },
  { key: 'delivered', label: 'Delivered', count: 0 },
];

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/api/health') {
    sendJson(res, 200, { ok: true, service: 'thewash-backend' });
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const role = body.role || requestUrl.searchParams.get('role') || 'client';
      const userId = body.userId || requestUrl.searchParams.get('userId');
      const selectedUser = users.find((user) => (userId ? user.id === userId : user.role === role));
      if (!selectedUser) {
        sendJson(res, 404, { error: `No user found for role ${role}` });
        return;
      }
      sendJson(res, 200, selectedUser);
    } catch (error) {
      sendJson(res, 400, { error: 'Invalid auth payload' });
    }
    return;
  }

  if (pathname === '/api/orders' && req.method === 'GET') {
    sendJson(res, 200, orders);
    return;
  }

  if (pathname.startsWith('/api/orders/')) {
    const orderId = pathname.split('/').pop();
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
      sendJson(res, 404, { error: 'Order not found' });
      return;
    }
    sendJson(res, 200, order);
    return;
  }

  if (pathname === '/api/dashboard' && req.method === 'GET') {
    const role = requestUrl.searchParams.get('role') || 'admin';
    const filteredNotifications = notifications.filter((n) => n.role === role || !n.role);
    sendJson(res, 200, {
      role,
      totalOrders: orders.length,
      activeOrders: orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled').length,
      revenue: invoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
      outstanding: invoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
      stageCounts,
      notifications: filteredNotifications,
    });
    return;
  }

  if (pathname === '/api/home' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId');
    if (!userId) {
      sendJson(res, 400, { error: 'userId is required' });
      return;
    }
    const clientOrders = orders.filter((order) => order.clientId === userId);
    const clientInvoices = invoices.filter((invoice) => invoice.clientId === userId);
    sendJson(res, 200, {
      orders: clientOrders,
      invoices: clientInvoices,
      outstandingBalance: clientInvoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.total, 0),
      notifications: notifications.filter((notification) => notification.userId === userId && !notification.read),
    });
    return;
  }

  if (pathname === '/api/delivery-jobs' && req.method === 'GET') {
    const driverId = requestUrl.searchParams.get('driverId');
    if (!driverId) {
      sendJson(res, 400, { error: 'driverId is required' });
      return;
    }
    sendJson(res, 200, deliveryJobs.filter((job) => job.driverId === driverId));
    return;
  }

  if (pathname === '/api/invoices' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId');
    if (!userId) {
      sendJson(res, 400, { error: 'userId is required' });
      return;
    }
    sendJson(res, 200, invoices.filter((invoice) => invoice.clientId === userId));
    return;
  }

  if (pathname === '/api/notifications' && req.method === 'GET') {
    const userId = requestUrl.searchParams.get('userId');
    const role = requestUrl.searchParams.get('role');
    const filtered = notifications.filter((notification) => {
      if (userId && notification.userId && notification.userId !== userId) {
        return false;
      }
      if (role && notification.role && notification.role !== role) {
        return false;
      }
      return true;
    });
    sendJson(res, 200, filtered);
    return;
  }

  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`The Wash backend listening on port ${PORT}`);
});
