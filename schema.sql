CREATE TABLE IF NOT EXISTS enquiries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  organisation TEXT NOT NULL,
  interest     TEXT,
  volume       TEXT,
  message      TEXT NOT NULL,
  consent      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
