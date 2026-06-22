import express from "express";
import cors from "cors";
import pg from "pg";
import path from "path";
import session from 'express-session';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
const protectedDir = path.join(__dirname, "protected");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

const db = new pg.Pool({
  user: "jakub",
  host: "localhost",
  database: "jakub",
  password: "",
  port: 5432,
});

app.use(session({
  secret: process.env.SESSION_SECRET || "it-dashboard-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  next();
}

// –– GET / employee –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

async function getEmployeeIdByName(fullName) {
  const name = fullName?.trim();

  if (!name) return null;

  const existing = await db.query(
    "SELECT employee_id FROM employees WHERE LOWER(full_name) = LOWER($1) LIMIT 1",
    [name]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0].employee_id;
  }

  return undefined;
}

async function getOrCreateEmployeeIdByName(fullName) {
  const name = fullName?.trim();

  if (!name) return null;

  const employeeId = await getEmployeeIdByName(name);

  if (employeeId !== undefined) return employeeId;

  const created = await db.query(
    `INSERT INTO employees (full_name)
     VALUES ($1)
     RETURNING employee_id`,
    [name]
  );

  return created.rows[0].employee_id;
}

async function getMachineByAssetTag(assetTag) {
  const result = await db.query(
    `SELECT m.*, e.full_name AS assigned_to
     FROM machines m
     LEFT JOIN employees e ON e.employee_id = m.employee_id
     WHERE m.asset_tag = $1`,
    [assetTag]
  );

  return result.rows[0];
}

// –– GET /users –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– 
app.get("/users", async (req, res) => {
  try {
    const result = await db.query(`SELECT user_id, username FROM users ORDER BY user_id`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await db.query(
      `SELECT user_id, username
       FROM users
       WHERE username = $1 AND password = $2
       LIMIT 1`,
      [username, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid login or password" });
    }

    const user = result.rows[0];
    req.session.user = {
      id: user.user_id,
      username: user.username
    };

    res.json({ user: req.session.user });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("POST /logout error:", err);
      return res.status(500).json({ error: "Could not log out" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

app.get("/session", (req, res) => {
  res.json({
    authenticated: Boolean(req.session.user),
    user: req.session.user ?? null
  });
});

app.get(["/machineManager.html", "/machineTable.html"], requireAuth, (req, res) => {
  res.sendFile(path.join(protectedDir, path.basename(req.path)));
});

app.get([
  "/machineManager.js",
  "/machineTable.js",
  "/uploadToTable.js",
  "/fillSelects.js",
  "/table2.js"
], requireAuth, (req, res) => {
  res.sendFile(path.join(protectedDir, path.basename(req.path)));
});

// ── GET /inventory ───────────────────────────────────────────────────────────–
app.get("/inventory", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, e.full_name AS assigned_to
       FROM machines m
       LEFT JOIN employees e ON e.employee_id = m.employee_id
       ORDER BY m.asset_tag`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /inventory error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /options ──────────────────────────────────────────────────────────────
app.get("/options", async (req, res) => {
  try {
    const queries = {
      brands:           "SELECT DISTINCT brand FROM machines WHERE brand IS NOT NULL ORDER BY brand",
      models:           "SELECT DISTINCT model FROM machines WHERE model IS NOT NULL ORDER BY model",
      types:            "SELECT DISTINCT machine_type FROM machines WHERE machine_type IS NOT NULL ORDER BY machine_type",
      formFactors:      "SELECT DISTINCT form_factor FROM machines WHERE form_factor IS NOT NULL ORDER BY form_factor",
      operatingSystems: "SELECT DISTINCT operating_system FROM machines WHERE operating_system IS NOT NULL ORDER BY operating_system",
      cpus:             "SELECT DISTINCT cpu FROM machines WHERE cpu IS NOT NULL ORDER BY cpu",
      ram:              "SELECT DISTINCT ram_gb FROM machines WHERE ram_gb IS NOT NULL ORDER BY ram_gb",
      storage:          "SELECT DISTINCT storage_gb FROM machines WHERE storage_gb IS NOT NULL ORDER BY storage_gb",
      storageTypes:     "SELECT DISTINCT storage_type FROM machines WHERE storage_type IS NOT NULL ORDER BY storage_type",
      gpus:             "SELECT DISTINCT gpu FROM machines WHERE gpu IS NOT NULL ORDER BY gpu",
      screens:          "SELECT DISTINCT screen FROM machines WHERE screen IS NOT NULL ORDER BY screen",
      departments:      "SELECT DISTINCT department FROM machines WHERE department IS NOT NULL ORDER BY department",
      sites:            "SELECT DISTINCT site FROM machines WHERE site IS NOT NULL ORDER BY site",
      assignments:      "SELECT employee_id, full_name FROM employees ORDER BY full_name;",
      statuses:         "SELECT DISTINCT machine_status FROM machines WHERE machine_status IS NOT NULL ORDER BY machine_status",
      conditions:       "SELECT DISTINCT machine_condition FROM machines WHERE machine_condition IS NOT NULL ORDER BY machine_condition",
    };

    const options = {};

    for (const [key, query] of Object.entries(queries)) {
      const result = await db.query(query);

      if (key === "assignments") {
        options[key] = result.rows.map(row => ({
          id:   row.employee_id,
          name: row.full_name
        }));
      } else {
        options[key] = result.rows.map(row => Object.values(row)[0]);
      }
    }

    res.json(options);
  } catch (err) {
    console.error("GET /options error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /inventory ───────────────────────────────────────────────────────────
app.post("/inventory", requireAuth, async (req, res) => {
  try {
    const machine = req.body;

    if (!machine.asset_tag || !machine.brand) {
      return res.status(400).json({ error: "asset_tag and brand are required" });
    }

    const employeeId = await getOrCreateEmployeeIdByName(machine.assigned_to);

    await db.query(
      `INSERT INTO machines (
        asset_tag, serial_number, brand, model, machine_type,
        form_factor, operating_system, cpu, ram_gb, storage_gb,
        storage_type, gpu, screen, purchase_date, warranty_expiry,
        department, site, employee_id, machine_status, machine_condition
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
      )`,
      [
        machine.asset_tag,
        machine.serial_number,
        machine.brand,
        machine.model,
        machine.machine_type,
        machine.form_factor,
        machine.operating_system,
        machine.cpu,
        machine.ram_gb,
        machine.storage_gb,
        machine.storage_type,
        machine.gpu,
        machine.screen,
        machine.purchase_date    || null,
        machine.warranty_expiry  || null,
        machine.department,
        machine.site,
        employeeId,
        machine.machine_status,
        machine.machine_condition,
      ]
    );

    res.status(201).json({ message: "Machine added successfully" });
  } catch (err) {
    console.error("POST /inventory error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /inventory/:asset_tag ───────────────────────────────────────────────
app.patch("/inventory/:asset_tag", requireAuth, async (req, res) => {
  try {
    const assetTag = req.params.asset_tag?.trim();
    const editableColumns = {
      ram_gb: "ram_gb",
      storage_gb: "storage_gb",
      storage_type: "storage_type",
      gpu: "gpu",
      cpu: "cpu",
      warranty_expiry: "warranty_expiry",
      department: "department",
      site: "site",
      assigned_to: "employee_id",
      machine_status: "machine_status",
      machine_condition: "machine_condition",
      operating_system: "operating_system",
    };

    if (!assetTag || assetTag === "undefined") {
      return res.status(400).json({ error: "A valid asset tag is required" });
    }

    const updates = Object.entries(req.body);

    if (updates.length !== 1) {
      return res.status(400).json({ error: "Update exactly one field at a time" });
    }

    const [field, rawValue] = updates[0];
    const column = editableColumns[field];

    if (!column) {
      return res.status(400).json({ error: `${field} cannot be changed` });
    }

    let value = rawValue;

    if (field === "ram_gb" || field === "storage_gb") {
      value = Number(rawValue);

      if (!Number.isFinite(value) || value < 0) {
        return res.status(400).json({ error: `${field} must be a valid number` });
      }
    } else if (field === "warranty_expiry") {
      value = rawValue || null;

      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return res.status(400).json({ error: "warranty_expiry must be a valid date" });
      }
    } else if (field === "assigned_to") {
      value = await getEmployeeIdByName(rawValue);

      if (value === undefined) {
        return res.status(400).json({ error: "assigned_to must be an existing employee" });
      }
    } else if (typeof rawValue !== "string" || !rawValue.trim()) {
      return res.status(400).json({ error: `${field} is required` });
    } else {
      value = rawValue.trim();
    }

    const result = await db.query(
      `UPDATE machines
       SET ${column} = $1
       WHERE asset_tag = $2
       RETURNING asset_tag`,
      [value, assetTag]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Machine ${assetTag} was not found` });
    }

    res.json(await getMachineByAssetTag(assetTag));
  } catch (err) {
    console.error("PATCH /inventory error:", err);
    res.status(500).json({ error: err.message });
  }
});

// –– Delete ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

app.delete("/inventory/:asset_tag", requireAuth, async (req, res) => {
  try {
    const assetTag = req.params.asset_tag?.trim();

    if (!assetTag || assetTag === "undefined") {
      return res.status(400).json({ error: "A valid asset tag is required" });
    }

    const result = await db.query(
      "DELETE FROM machines WHERE asset_tag = $1 RETURNING asset_tag",
      [assetTag]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Machine ${assetTag} was not found` });
    }

    res.json({ message: "Deleted successfully", asset_tag: assetTag });
  } catch (err) {
    console.error("DELETE /inventory error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
