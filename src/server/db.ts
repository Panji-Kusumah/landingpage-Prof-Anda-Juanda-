import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      authors TEXT,
      journal TEXT,
      year INTEGER,
      url TEXT,
      file_path TEXT,
      type TEXT DEFAULT 'journal' -- 'journal' or 'book'
    );

    CREATE TABLE IF NOT EXISTS teaching (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_name TEXT NOT NULL,
      program TEXT,
      year TEXT
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      name TEXT,
      title TEXT,
      bio TEXT,
      email TEXT,
      scholar_url TEXT,
      photo_url TEXT,
      researchgate_url TEXT,
      scopus_url TEXT,
      orcid_url TEXT,
      research_interests TEXT
    );
  `);

  // Migrations for existing database
  try { db.exec('ALTER TABLE publications ADD COLUMN file_path TEXT'); } catch (err) {}
  try { db.exec('ALTER TABLE profile ADD COLUMN researchgate_url TEXT'); } catch (err) {}
  try { db.exec('ALTER TABLE profile ADD COLUMN scopus_url TEXT'); } catch (err) {}
  try { db.exec('ALTER TABLE profile ADD COLUMN orcid_url TEXT'); } catch (err) {}
  try { db.exec('ALTER TABLE profile ADD COLUMN research_interests TEXT'); } catch (err) {}
  try { db.exec('ALTER TABLE profile ADD COLUMN logo_url TEXT'); } catch (err) {}

  // Seed default admin and profile if not exists
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!user) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hash);
  }

  const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
  if (!profile) {
    db.prepare(`
      INSERT INTO profile (id, name, title, bio, email, scholar_url, photo_url, research_interests)
      VALUES (1, 'Prof. Dr. H. Anda Juanda, M.Pd.', 'Professor of Education & Curriculum Development', 'Prof. Dr. H. Anda Juanda, M.Pd. is a Professor at UIN Syekh Nurjati Cirebon. He has contributed significantly to the fields of Curriculum Development, Educational Philosophy, and Science Education. His comprehensive work includes extensive publications such as "Aliran-aliran Filsafat Landasan Kurikulum dan Pembelajaran", reflecting his deep expertise in philosophy ranging from Ancient Greek to Postmodern eras.\n\nHe is highly recognized for his educational innovation research, shaping character and education through local wisdom and scientific integration.', 'anda.juanda@syekhnurjati.ac.id', 'https://scholar.google.com/', 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80', 'Curriculum Development, Educational Philosophy, Science Education, Local Wisdom, Integration of Science')
    `).run();
  }
}
