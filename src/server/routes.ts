import { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    cb(null, `jurnal-${Date.now()}.pdf`)
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}${ext}`)
  }
})

const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Image files (JPEG, PNG, WEBP) are allowed'));
    }
  }
});

// Server-side cache
let publicationsCache: any = null;

// Middleware for auth
const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export function setupRoutes(app: Express) {
  // --- Auth ---
  app.post('/api/auth/login', (req, res) => {
    try {
      const { username, password } = req.body;
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/change-password', authenticate, (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user.id;
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(400).json({ error: 'Invalid current password' });
      }
      const hash = bcrypt.hashSync(newPassword, 10);
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  // --- Profile ---
  app.get('/api/profile', (req, res) => {
    try {
      const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
      res.json(profile);
    } catch (err) {
      console.error('Fetch profile error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/profile', authenticate, uploadImage.fields([{ name: 'photo', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), (req, res) => {
    try {
      const { name, title, bio, email, scholar_url, researchgate_url, scopus_url, orcid_url, research_interests } = req.body;
      let photo_url = req.body.photo_url;
      let logo_url = req.body.logo_url;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.photo?.[0]) {
        photo_url = `/uploads/${files.photo[0].filename}`;
      }
      if (files?.logo?.[0]) {
        logo_url = `/uploads/${files.logo[0].filename}`;
      }

      db.prepare(`
        UPDATE profile 
        SET name = ?, title = ?, bio = ?, email = ?, scholar_url = ?, photo_url = ?, researchgate_url = ?, scopus_url = ?, orcid_url = ?, research_interests = ?, logo_url = ?
        WHERE id = 1
      `).run(name, title, bio, email, scholar_url, photo_url, researchgate_url || null, scopus_url || null, orcid_url || null, research_interests || null, logo_url || null);
      res.json({ success: true, photo_url, logo_url });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // --- Teaching ---
  app.get('/api/teaching', (req, res) => {
    try {
      const courses = db.prepare('SELECT * FROM teaching ORDER BY year DESC, id DESC').all();
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch teaching courses' });
    }
  });

  app.post('/api/teaching', authenticate, (req, res) => {
    try {
      const { course_name, program, year } = req.body;
      const result = db.prepare(`
        INSERT INTO teaching (course_name, program, year)
        VALUES (?, ?, ?)
      `).run(course_name, program, year);
      res.json({ id: result.lastInsertRowid });
    } catch(err) {
      res.status(500).json({ error: 'Failed to create course' });
    }
  });

  app.delete('/api/teaching/:id', authenticate, (req, res) => {
    try {
      db.prepare('DELETE FROM teaching WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed to delete course' });
    }
  });

  // --- Publications ---
  app.get('/api/publications', (req, res) => {
    const type = req.query.type;
    
    // Use Cache if available and no specific type requested
    if (publicationsCache && !type) {
      return res.json(publicationsCache);
    }

    try {
      let pubs;
      if (type) {
        pubs = db.prepare('SELECT * FROM publications WHERE type = ? ORDER BY year DESC').all(type);
      } else {
        pubs = db.prepare('SELECT * FROM publications ORDER BY year DESC').all();
        publicationsCache = pubs; // Store in cache
      }
      res.json(pubs);
    } catch (err) {
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  app.post('/api/publications/sync-scholar', authenticate, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Scholar URL is required' });
      }

      const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      const publications = await page.evaluate(() => {
        const rows = document.querySelectorAll('#gsc_a_b .gsc_a_tr');
        const results: any[] = [];
        rows.forEach(row => {
          const titleEl = row.querySelector('.gsc_a_at');
          const authorsEl = row.querySelector('.gs_gray');
          const venueEl = row.querySelectorAll('.gs_gray')[1];
          const yearEl = row.querySelector('.gsc_a_y .gsc_a_h');
          
          if (titleEl) {
            results.push({
              title: titleEl.textContent?.trim() || '',
              url: titleEl.hasAttribute('href') ? 'https://scholar.google.com' + titleEl.getAttribute('href') : '',
              authors: authorsEl?.textContent?.trim() || '',
              journal: venueEl?.textContent?.trim() || '',
              year: yearEl?.textContent?.trim() ? parseInt(yearEl.textContent!.trim()) : null,
              type: 'journal'
            });
          }
        });
        return results;
      });
      
      const insertStmt = db.prepare(`
        INSERT INTO publications (title, authors, journal, year, url, type, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      let inserted = 0;
      for (const pub of publications) {
        const existing = db.prepare('SELECT id FROM publications WHERE title = ?').get(pub.title);
        if (!existing) {
          insertStmt.run(pub.title, pub.authors, pub.journal, pub.year, pub.url, pub.type, null);
          inserted++;
        }
      }
      
      publicationsCache = null; // Invalidate cache
      
      await browser.close();
      
      res.json({ message: `Successfully synced ${inserted} new publications`, inserted });
    } catch (error) {
      console.error('Error syncing scholar:', error);
      res.status(500).json({ error: 'Failed to sync with Google Scholar' });
    }
  });

  app.post('/api/publications', authenticate, upload.single('file'), (req, res) => {
    try {
      const { title, authors, journal, year, url, type } = req.body;
      const file_path = req.file ? `/uploads/${req.file.filename}` : null;
      
      const result = db.prepare(`
        INSERT INTO publications (title, authors, journal, year, url, type, file_path)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(title, authors, journal, year || null, url || null, type || 'journal', file_path);
      
      publicationsCache = null; // Invalidate cache
      
      res.json({ id: result.lastInsertRowid, file_path });
    } catch (err) {
       res.status(500).json({ error: 'Failed to create publication' });
    }
  });

  app.put('/api/publications/:id', authenticate, upload.single('file'), (req, res) => {
    try {
      const { title, authors, journal, year, url, type } = req.body;
      let updateQuery = `
        UPDATE publications 
        SET title = ?, authors = ?, journal = ?, year = ?, url = ?, type = ?
      `;
      const params: any[] = [title, authors, journal, year || null, url || null, type];
      
      if (req.file) {
        updateQuery += `, file_path = ?`;
        params.push(`/uploads/${req.file.filename}`);
      }
      
      updateQuery += ` WHERE id = ?`;
      params.push(req.params.id);

      db.prepare(updateQuery).run(...params);
      
      publicationsCache = null; // Invalidate cache
      
      res.json({ success: true });
    } catch (err) {
       res.status(500).json({ error: 'Failed to update publication' });
    }
  });

  app.delete('/api/publications/:id', authenticate, (req, res) => {
    try {
      db.prepare('DELETE FROM publications WHERE id = ?').run(req.params.id);
      publicationsCache = null; // Invalidate cache
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed to delete publication' });
    }
  });

  // Gallery Routes
  app.get('/api/gallery', (req, res) => {
    try {
      const images = db.prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
      res.json(images);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.post('/api/gallery', authenticate, uploadImage.single('image'), (req, res) => {
    try {
      const { caption } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      if (!imageUrl) return res.status(400).json({ error: 'Image is required' });

      db.prepare('INSERT INTO gallery (image_url, caption) VALUES (?, ?)').run(imageUrl, caption || '');
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload image' });
    }
  });

  app.delete('/api/gallery/:id', authenticate, (req, res) => {
    try {
      db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed to delete image' });
    }
  });

  app.put('/api/gallery/:id', authenticate, (req, res) => {
    try {
      const { caption } = req.body;
      db.prepare('UPDATE gallery SET caption = ? WHERE id = ?').run(caption || '', req.params.id);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed to update image' });
    }
  });
}
