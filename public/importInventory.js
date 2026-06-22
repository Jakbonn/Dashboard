import fs from "fs";
import pg from "pg";

const inventory = JSON.parse(fs.readFileSync("./inventory.json", "utf8"));

const db = new pg.Pool({
  user: "jakub",
  host: "localhost",
  database: "jakub",
  password: "",
  port: 5432
});

for (const machine of inventory) {
  await db.query(
    `
    INSERT INTO machines (
      asset_tag,
      serial_number,
      brand,
      model,
      machine_type,
      form_factor,
      operating_system,
      cpu,
      ram_gb,
      storage_gb,
      storage_type,
      gpu,
      screen,
      purchase_date,
      warranty_expiry,
      department,
      site,
      assigned_to,
      machine_status,
      machine_condition
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
    )
    `,
    [
      machine.asset_tag,
      machine.serial_number,
      machine.brand,
      machine.model,
      machine.type,
      machine.form_factor,
      machine.os,
      machine.cpu,
      machine.ram_gb,
      machine.storage_gb,
      machine.storage_type,
      machine.gpu,
      machine.screen,
      machine.purchase_date,
      machine.warranty_expiry,
      machine.department,
      machine.site,
      machine.assigned_to,
      machine.status,
      machine.condition
    ]
  );
}

console.log("Inventory imported successfully.");

await db.end();
