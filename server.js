const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'dart-ops-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// In-memory data stores
const defaultPasswordHash = bcrypt.hashSync('dart123', 10);

let users = [
  { id: 'emp1', username: 'jamie', name: 'Jamie', password: defaultPasswordHash, role: 'driver', active: false },
  { id: 'emp2', username: 'avery', name: 'Avery', password: defaultPasswordHash, role: 'driver', active: false },
  { id: 'emp3', username: 'casey', name: 'Casey', password: defaultPasswordHash, role: 'driver', active: false },
  { id: 'emp4', username: 'chris', name: 'Chris', password: defaultPasswordHash, role: 'driver', active: false },
  { id: 'office', username: 'office', name: 'Office', password: defaultPasswordHash, role: 'office', active: true }
];

let shifts = [
  { id: 'shift1', employeeId: 'emp1', dayOfWeek: 0, startTime: '08:00', endTime: '12:00' },
  { id: 'shift2', employeeId: 'emp4', dayOfWeek: 2, startTime: '12:00', endTime: '19:00' }
];

let rideRequests = [];
const riderMissCounts = {};

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.redirect('/login');
  }
  next();
}

function requireOffice(req, res, next) {
  if (!req.session.userId || req.session.role !== 'office') {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ error: 'Office access required' });
    }
    return res.redirect('/login');
  }
  next();
}

// Helpers
function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function isWithinServiceHours(requestedTime) {
  const date = new Date(requestedTime);
  if (isNaN(date.getTime())) return false;
  const day = date.getDay();
  if (day < 1 || day > 5) return false;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes >= 8 * 60 && totalMinutes <= 19 * 60;
}

function updateRideMissCount(email, count) {
  riderMissCounts[email] = count;
}

function getEmployees() {
  return users.filter(u => u.role === 'driver').map(({ password, ...rest }) => rest);
}

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.name = user.name;
  req.session.role = user.role;
  res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    id: req.session.userId,
    username: req.session.username,
    name: req.session.name,
    role: req.session.role
  });
});

// Serve login page (public)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Redirect root based on role
app.get('/', requireAuth, (req, res) => {
  if (req.session.role === 'office') {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/driver');
  }
});

app.get('/office', requireOffice, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/driver', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Employee endpoints
app.get('/api/employees', requireAuth, (req, res) => {
  res.json(getEmployees());
});

app.post('/api/employees/clock-in', requireAuth, (req, res) => {
  const { employeeId } = req.body;
  const emp = users.find((e) => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  emp.active = true;
  const { password, ...safeEmp } = emp;
  res.json(safeEmp);
});

app.post('/api/employees/clock-out', requireAuth, (req, res) => {
  const { employeeId } = req.body;
  const emp = users.find((e) => e.id === employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  emp.active = false;
  const { password, ...safeEmp } = emp;
  res.json(safeEmp);
});

// Shift endpoints
app.get('/api/shifts', requireAuth, (req, res) => {
  res.json(shifts);
});

app.post('/api/shifts', requireOffice, (req, res) => {
  const { employeeId, dayOfWeek, startTime, endTime } = req.body;
  const emp = users.find((e) => e.id === employeeId);
  if (!emp) return res.status(400).json({ error: 'Employee not found' });
  const shift = { id: generateId('shift'), employeeId, dayOfWeek, startTime, endTime };
  shifts.push(shift);
  res.json(shift);
});

app.delete('/api/shifts/:id', requireOffice, (req, res) => {
  const { id } = req.params;
  const index = shifts.findIndex((s) => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Shift not found' });
  const removed = shifts.splice(index, 1)[0];
  res.json(removed);
});

// Ride endpoints
app.get('/api/rides', requireAuth, (req, res) => {
  const { status } = req.query;
  if (status) {
    return res.json(rideRequests.filter((r) => r.status === status));
  }
  res.json(rideRequests);
});

app.post('/api/rides', (req, res) => {
  const { riderName, riderEmail, riderPhone, pickupLocation, dropoffLocation, requestedTime } = req.body;
  const missCount = riderMissCounts[riderEmail] || 0;
  const ride = {
    id: generateId('ride'),
    riderName,
    riderEmail,
    riderPhone,
    pickupLocation,
    dropoffLocation,
    requestedTime,
    status: 'pending',
    assignedDriverId: null,
    graceStartTime: null,
    consecutiveMisses: missCount
  };
  rideRequests.push(ride);
  res.json(ride);
});

app.post('/api/rides/:id/approve', requireOffice, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  if ((riderMissCounts[ride.riderEmail] || ride.consecutiveMisses || 0) >= 5) {
    return res.status(400).json({ error: 'SERVICE TERMINATED: rider has 5 consecutive no-shows' });
  }
  if (!isWithinServiceHours(ride.requestedTime)) {
    return res.status(400).json({ error: 'Requested time outside service hours (8:00-19:00 Mon-Fri)' });
  }
  ride.status = 'approved';
  res.json(ride);
});

app.post('/api/rides/:id/deny', requireOffice, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = 'denied';
  res.json(ride);
});

app.post('/api/rides/:id/claim', requireAuth, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  if (ride.status !== 'approved') return res.status(400).json({ error: 'Only approved rides can be claimed' });
  if (ride.assignedDriverId) return res.status(400).json({ error: 'Ride already assigned' });

  const driverId = req.session.role === 'driver' ? req.session.userId : req.body.driverId;
  const driver = users.find((e) => e.id === driverId && e.role === 'driver');
  if (!driver) return res.status(400).json({ error: 'Driver not found' });
  if (!driver.active) return res.status(400).json({ error: 'Driver must be clocked in to claim rides' });
  ride.assignedDriverId = driverId;
  ride.status = 'scheduled';
  res.json(ride);
});

// Driver action endpoints
app.post('/api/rides/:id/on-the-way', requireAuth, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = 'driver_on_the_way';
  res.json(ride);
});

app.post('/api/rides/:id/here', requireAuth, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = 'driver_arrived_grace';
  ride.graceStartTime = new Date().toISOString();
  res.json(ride);
});

app.post('/api/rides/:id/complete', requireAuth, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = 'completed';
  ride.consecutiveMisses = 0;
  updateRideMissCount(ride.riderEmail, 0);
  res.json(ride);
});

app.post('/api/rides/:id/no-show', requireAuth, (req, res) => {
  const ride = rideRequests.find((r) => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  ride.status = 'no_show';
  const newCount = (riderMissCounts[ride.riderEmail] || ride.consecutiveMisses || 0) + 1;
  ride.consecutiveMisses = newCount;
  updateRideMissCount(ride.riderEmail, newCount);
  res.json(ride);
});

// Dev endpoint
app.post('/api/dev/seed-rides', (req, res) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const sampleRides = [
    { riderName: 'Alice Student', riderEmail: 'alice@usc.edu', riderPhone: '213-555-0101', pickupLocation: 'Leavey Library', dropoffLocation: 'Doheny Library', hour: 9 },
    { riderName: 'Bob Faculty', riderEmail: 'bob@usc.edu', riderPhone: '213-555-0102', pickupLocation: 'SGM', dropoffLocation: 'VKC', hour: 10 },
    { riderName: 'Carol Staff', riderEmail: 'carol@usc.edu', riderPhone: '213-555-0103', pickupLocation: 'Lyon Center', dropoffLocation: 'RTH', hour: 11 },
    { riderName: 'Dan Grad', riderEmail: 'dan@usc.edu', riderPhone: '213-555-0104', pickupLocation: 'USC Village', dropoffLocation: 'JFF', hour: 14 },
  ];
  sampleRides.forEach((s) => {
    const requestedTime = `${todayStr}T${String(s.hour).padStart(2, '0')}:00`;
    rideRequests.push({
      id: generateId('ride'),
      riderName: s.riderName,
      riderEmail: s.riderEmail,
      riderPhone: s.riderPhone,
      pickupLocation: s.pickupLocation,
      dropoffLocation: s.dropoffLocation,
      requestedTime,
      status: 'approved',
      assignedDriverId: null,
      graceStartTime: null,
      consecutiveMisses: 0
    });
  });
  res.json({ message: `Seeded ${sampleRides.length} sample rides for today`, count: sampleRides.length });
});

app.listen(PORT, () => {
  console.log('USC DART server running from:', __dirname);
  console.log(`DART Ops server running on port ${PORT}`);
  console.log('Login: jamie/avery/casey/chris/office, password: dart123');
});
