#!/usr/bin/env bash
# Menyiapkan database HabitTrack di komputer ini:
#   1. membuat database + user MariaDB khusus aplikasi
#   2. membuat / memperbarui backend/.env (DB_* dan JWT_SECRET)
#   3. menjalankan migration dan seeder (lewati dengan --no-migrate)
#
# Pakai (dari folder backend):   bash scripts/setup-db.sh
# Nama bawaan dapat diganti:     DB_NAME=nama_db DB_USER=nama_user bash scripts/setup-db.sh
# Aman dijalankan berulang.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

RUN_MIGRATE=1
[[ "${1:-}" == "--no-migrate" ]] && RUN_MIGRATE=0

DB_NAME="${DB_NAME:-habittrack_db}"
DB_USER="${DB_USER:-habittrack}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

die() { echo "ERROR: $*" >&2; exit 1; }

[[ "$DB_NAME" =~ ^[A-Za-z0-9_]+$ ]] || die "DB_NAME hanya boleh huruf, angka, dan underscore: $DB_NAME"
[[ "$DB_USER" =~ ^[A-Za-z0-9_]+$ ]] || die "DB_USER hanya boleh huruf, angka, dan underscore: $DB_USER"
[[ "$DB_PORT" =~ ^[0-9]+$ ]] || die "DB_PORT harus berupa angka: $DB_PORT"

CLIENT="$(command -v mariadb || command -v mysql || true)"
[[ -n "$CLIENT" ]] || die "Klien MariaDB tidak ditemukan. Pasang MariaDB dulu (lihat README, bagian 1)."

random_hex() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }

get_env() {
  [[ -f .env ]] || return 0
  grep -E "^$1=" .env | head -n1 | cut -d= -f2- || true
}

set_env() {
  if grep -qE "^$1=" .env; then
    sed -i "s|^$1=.*|$1=$2|" .env
  else
    printf '%s=%s\n' "$1" "$2" >> .env
  fi
}

# --- .env -------------------------------------------------------------------
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "• .env dibuat dari .env.example"
fi

# Pakai ulang password lama bila user sama dan formatnya aman; selain itu buat baru
DB_PASSWORD=""
if [[ "$(get_env DB_USER)" == "$DB_USER" ]]; then
  CANDIDATE="$(get_env DB_PASSWORD)"
  [[ "$CANDIDATE" =~ ^[A-Za-z0-9]+$ ]] && DB_PASSWORD="$CANDIDATE"
fi
[[ -n "$DB_PASSWORD" ]] || DB_PASSWORD="$(random_hex 16)"

# --- koneksi admin (root) ---------------------------------------------------
ADMIN=()
if "$CLIENT" -u root -e "SELECT 1" >/dev/null 2>&1; then
  ADMIN=("$CLIENT" -u root)
  echo "• Terhubung sebagai root (tanpa password)"
elif sudo "$CLIENT" -e "SELECT 1" >/dev/null 2>&1; then
  ADMIN=(sudo "$CLIENT")
  echo "• Terhubung sebagai root melalui sudo (unix_socket)"
else
  ADMIN=("$CLIENT" -u root -p)
  echo "• Masukkan password root MariaDB bila diminta"
fi

# --- database + user --------------------------------------------------------
"${ADMIN[@]}" <<SQL || die "Gagal terhubung ke MariaDB. Pastikan server berjalan (sudo systemctl start mariadb) dan kredensial root benar."
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
echo "• Database '${DB_NAME}' dan user '${DB_USER}' siap"

# --- simpan ke .env ---------------------------------------------------------
set_env DB_HOST "$DB_HOST"
set_env DB_PORT "$DB_PORT"
set_env DB_USER "$DB_USER"
set_env DB_PASSWORD "$DB_PASSWORD"
set_env DB_NAME "$DB_NAME"

JWT_NOW="$(get_env JWT_SECRET)"
if [[ -z "$JWT_NOW" || "$JWT_NOW" == "ganti-dengan-secret-acak-yang-panjang" ]]; then
  set_env JWT_SECRET "$(random_hex 32)"
  echo "• JWT_SECRET acak dibuat"
fi
echo "• .env diperbarui"

# --- uji koneksi dengan user aplikasi --------------------------------------
MYSQL_PWD="$DB_PASSWORD" "$CLIENT" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e "SELECT 1" >/dev/null \
  || die "User '${DB_USER}' tidak bisa login lewat ${DB_HOST}:${DB_PORT}. Periksa DB_HOST/DB_PORT dan pengaturan skip-networking MariaDB."
echo "• Koneksi sebagai '${DB_USER}' berhasil"

# --- migration + seeder -----------------------------------------------------
if [[ "$RUN_MIGRATE" -eq 1 ]]; then
  command -v npm >/dev/null 2>&1 || die "npm tidak ditemukan. Pasang Node.js 18+ lalu jalankan ulang."
  [[ -d node_modules ]] || npm install
  npm run db:setup
  echo
  echo "Tabel di ${DB_NAME}:"
  MYSQL_PWD="$DB_PASSWORD" "$CLIENT" -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e "SHOW TABLES"
fi

echo
echo "Selesai. Jalankan backend dengan: npm run dev"
