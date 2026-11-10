-- ============================================================================
-- HabitTrack - skema database MariaDB
-- Setara dengan migration Sequelize di src/migrations + seeder kategori bawaan.
--
-- Gunakan file ini bila ingin membuat tabel TANPA sequelize-cli:
--     mariadb -u root -p < database/schema.sql
-- (atau impor lewat DBeaver / HeidiSQL / phpMyAdmin)
--
-- Aman dijalankan berulang. Migration dicatat di tabel SequelizeMeta, sehingga
-- "npm run db:migrate" sesudahnya tidak mencoba membuat ulang tabel.
-- Jangan memakai file ini bersamaan dengan migration pada database yang sama
-- bila skemanya sudah berbeda.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS habittrack_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE habittrack_db;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  password    VARCHAR(255) NOT NULL,              -- hash bcrypt, bukan teks asli
  created_at  DATETIME     NOT NULL,
  updated_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- categories (user_id NULL = kategori bawaan sistem)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NULL,
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20)  NULL,
  created_at  DATETIME     NOT NULL,
  updated_at  DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_categories_user (user_id),
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL,
  category_id    BIGINT       NULL,
  name           VARCHAR(150) NOT NULL,
  description    TEXT         NULL,
  icon           VARCHAR(50)  NULL,
  frequency      ENUM('DAILY','WEEKLY') NOT NULL DEFAULT 'DAILY',
  target_count   INT          NOT NULL DEFAULT 1,
  reminder_time  TIME         NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     DATETIME     NOT NULL,
  updated_at     DATETIME     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_habits_user_active (user_id, is_active),
  KEY fk_habits_category (category_id),
  CONSTRAINT fk_habits_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_habits_category FOREIGN KEY (category_id)
    REFERENCES categories (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- habit_schedules (day_of_week: 1 = Senin ... 7 = Minggu)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_schedules (
  id           BIGINT     NOT NULL AUTO_INCREMENT,
  habit_id     BIGINT     NOT NULL,
  day_of_week  TINYINT    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_habit_schedules_habit_day (habit_id, day_of_week),
  CONSTRAINT fk_habit_schedules_habit FOREIGN KEY (habit_id)
    REFERENCES habits (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- habit_logs (satu catatan per kebiasaan per tanggal)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_logs (
  id            BIGINT     NOT NULL AUTO_INCREMENT,
  habit_id      BIGINT     NOT NULL,
  user_id       BIGINT     NOT NULL,
  log_date      DATE       NOT NULL,
  completed     TINYINT(1) NOT NULL DEFAULT 1,
  completed_at  DATETIME   NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_habit_logs_habit_date (habit_id, log_date),
  KEY idx_habit_logs_user_date (user_id, log_date),
  CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id)
    REFERENCES habits (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_habit_logs_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reminders (
  id             BIGINT     NOT NULL AUTO_INCREMENT,
  habit_id       BIGINT     NOT NULL,
  reminder_time  TIME       NOT NULL,
  is_enabled     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_reminders_habit (habit_id),
  CONSTRAINT fk_reminders_habit FOREIGN KEY (habit_id)
    REFERENCES habits (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Kategori bawaan (sama dengan src/seeders)
-- ---------------------------------------------------------------------------
INSERT INTO categories (user_id, name, color, created_at, updated_at)
SELECT NULL, 'Education', '#8B5CF6', UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id IS NULL AND name = 'Education');

INSERT INTO categories (user_id, name, color, created_at, updated_at)
SELECT NULL, 'Health', '#22C55E', UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id IS NULL AND name = 'Health');

INSERT INTO categories (user_id, name, color, created_at, updated_at)
SELECT NULL, 'Lifestyle', '#F59E0B', UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id IS NULL AND name = 'Lifestyle');

INSERT INTO categories (user_id, name, color, created_at, updated_at)
SELECT NULL, 'Productivity', '#38BDF8', UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id IS NULL AND name = 'Productivity');

-- ---------------------------------------------------------------------------
-- Catatan migration untuk sequelize-cli
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SequelizeMeta (
  name VARCHAR(255) NOT NULL,
  PRIMARY KEY (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO SequelizeMeta (name) VALUES
  ('20261104000001-create-users.js'),
  ('20261104000002-create-categories.js'),
  ('20261104000003-create-habits.js'),
  ('20261104000004-create-habit-schedules.js'),
  ('20261104000005-create-habit-logs.js'),
  ('20261104000006-create-reminders.js');
