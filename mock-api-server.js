/**
 * Excellence Portfolio - Mock API Server
 * For testing and development purposes
 * Run with: node mock-api-server.js
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// In-memory database (replace with real database in production)
const db = {
  users: [
    {
      id: 'user-1',
      name: 'أحمد محمد',
      email: 'teacher@school.edu.sa',
      password: 'password123', // In production, use bcrypt
      role: 'teacher',
      schoolId: 'school-1'
    },
    {
      id: 'user-2',
      name: 'فاطمة علي',
      email: 'coordinator@school.edu.sa',
      password: 'password123',
      role: 'coordinator',
      schoolId: 'school-1'
    }
  ],
  domains: [
    {
      id: 'domain-1',
      name: 'القيادة والحوكمة',
      standards: [
        {
          id: 'standard-1',
          name: 'الرؤية والرسالة',
          indicators: [
            {
              id: 'indicator-1',
              name: 'وضوح الرؤية والرسالة',
              level: 2,
              target: 4
            },
            {
              id: 'indicator-2',
              name: 'توافق الرؤية مع الواقع',
              level: 2,
              target: 4
            }
          ]
        },
        {
          id: 'standard-2',
          name: 'التخطيط الاستراتيجي',
          indicators: [
            {
              id: 'indicator-3',
              name: 'جودة الخطة الاستراتيجية',
              level: 2,
              target: 4
            }
          ]
        }
      ]
    },
    {
      id: 'domain-2',
      name: 'المناهج والتدريس',
      standards: [
        {
          id: 'standard-3',
          name: 'تطوير المناهج',
          indicators: [
            {
              id: 'indicator-4',
              name: 'مواءمة المناهج مع المعايير',
              level: 3,
              target: 4
            }
          ]
        }
      ]
    }
  ],
  evidence: [],
  tasks: [],
  exportJobs: []
};

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  res.json({ token, user: userWithoutPassword });
});

app.get('/api/me', verifyToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Domains, Standards, Indicators
app.get('/api/domains', verifyToken, (req, res) => {
  const include = req.query.include?.split(',') || [];
  
  let domains = db.domains;

  if (!include.includes('standards')) {
    domains = domains.map(d => {
      const { standards, ...rest } = d;
      return rest;
    });
  } else if (!include.includes('indicators')) {
    domains = domains.map(d => ({
      ...d,
      standards: d.standards.map(s => {
        const { indicators, ...rest } = s;
        return rest;
      })
    }));
  }

  res.json({ domains });
});

app.get('/api/indicators', verifyToken, (req, res) => {
  const { domainId, standardId } = req.query;
  let indicators = [];

  db.domains.forEach(domain => {
    if (domainId && domain.id !== domainId) return;

    domain.standards.forEach(standard => {
      if (standardId && standard.id !== standardId) return;

      indicators = indicators.concat(
        standard.indicators.map(ind => ({
          ...ind,
          domainId: domain.id,
          domainName: domain.name,
          standardId: standard.id,
          standardName: standard.name
        }))
      );
    });
  });

  res.json({ indicators });
});

// Evidence
app.post('/api/evidence', verifyToken, upload.single('file'), (req, res) => {
  const { indicatorId, type, description, metadata } = req.body;

  const evidence = {
    id: `evidence-${Date.now()}`,
    userId: req.user.id,
    indicatorId,
    type,
    description,
    metadata: JSON.parse(metadata || '{}'),
    fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditLog: [
      {
        action: 'created',
        userId: req.user.id,
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.evidence.push(evidence);
  res.status(201).json(evidence);
});

app.get('/api/evidence', verifyToken, (req, res) => {
  const { indicatorId, status, weekOnly } = req.query;
  let evidence = db.evidence.filter(e => e.userId === req.user.id);

  if (indicatorId) {
    evidence = evidence.filter(e => e.indicatorId === indicatorId);
  }

  if (status) {
    evidence = evidence.filter(e => e.status === status);
  }

  if (weekOnly === 'true') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    evidence = evidence.filter(e => new Date(e.createdAt) > oneWeekAgo);
  }

  res.json({ evidence });
});

app.patch('/api/evidence/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const evidence = db.evidence.find(e => e.id === id && e.userId === req.user.id);

  if (!evidence) {
    return res.status(404).json({ error: 'Evidence not found' });
  }

  evidence.status = status;
  evidence.updatedAt = new Date().toISOString();
  evidence.auditLog.push({
    action: 'status_changed',
    userId: req.user.id,
    newStatus: status,
    timestamp: new Date().toISOString()
  });

  res.json(evidence);
});

// Tasks
app.post('/api/tasks', verifyToken, (req, res) => {
  const { title, description, indicatorId, dueDate, assignee, priority } = req.body;

  const task = {
    id: `task-${Date.now()}`,
    userId: req.user.id,
    title,
    description,
    indicatorId,
    dueDate,
    assignee,
    priority: priority || 'medium',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.tasks.push(task);
  res.status(201).json(task);
});

app.get('/api/tasks', verifyToken, (req, res) => {
  const { status, overdue } = req.query;
  let tasks = db.tasks.filter(t => t.userId === req.user.id);

  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  if (overdue === 'true') {
    const now = new Date();
    tasks = tasks.filter(t => new Date(t.dueDate) < now && t.status !== 'completed');
  }

  res.json({ tasks });
});

// Export
app.post('/api/export/pdf', verifyToken, (req, res) => {
  const { scope, domainId, indicatorId } = req.body;

  const exportJob = {
    id: `export-${Date.now()}`,
    userId: req.user.id,
    type: 'pdf',
    scope,
    domainId,
    indicatorId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    url: null
  };

  db.exportJobs.push(exportJob);

  // Simulate processing
  setTimeout(() => {
    const job = db.exportJobs.find(j => j.id === exportJob.id);
    if (job) {
      job.status = 'completed';
      job.url = `/exports/${exportJob.id}.pdf`;
    }
  }, 2000);

  res.status(202).json(exportJob);
});

app.post('/api/export/improvement-plan-docx', verifyToken, (req, res) => {
  const { scope, domainId } = req.body;

  const exportJob = {
    id: `export-${Date.now()}`,
    userId: req.user.id,
    type: 'docx',
    scope,
    domainId,
    status: 'processing',
    createdAt: new Date().toISOString(),
    url: null
  };

  db.exportJobs.push(exportJob);

  // Simulate processing
  setTimeout(() => {
    const job = db.exportJobs.find(j => j.id === exportJob.id);
    if (job) {
      job.status = 'completed';
      job.url = `/exports/${exportJob.id}.docx`;
    }
  }, 2000);

  res.status(202).json(exportJob);
});

app.get('/api/export/:jobId', verifyToken, (req, res) => {
  const { jobId } = req.params;
  const job = db.exportJobs.find(j => j.id === jobId && j.userId === req.user.id);

  if (!job) {
    return res.status(404).json({ error: 'Export job not found' });
  }

  res.json(job);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Excellence Portfolio Mock API Server running on http://localhost:${PORT}`);
  console.log(`\n📚 Test Credentials:`);
  console.log(`   Email: teacher@school.edu.sa`);
  console.log(`   Password: password123`);
  console.log(`\n📖 API Documentation:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/me`);
  console.log(`   GET    /api/domains?include=standards,indicators`);
  console.log(`   GET    /api/indicators`);
  console.log(`   POST   /api/evidence`);
  console.log(`   GET    /api/evidence`);
  console.log(`   PATCH  /api/evidence/:id`);
  console.log(`   POST   /api/tasks`);
  console.log(`   GET    /api/tasks`);
  console.log(`   POST   /api/export/pdf`);
  console.log(`   POST   /api/export/improvement-plan-docx`);
  console.log(`   GET    /api/export/:jobId\n`);
});

module.exports = app;
