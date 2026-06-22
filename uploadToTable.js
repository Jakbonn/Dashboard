export async function insertIntoTable() {
  const val = (id) => document.getElementById(id).value || null;
  const num = (id) => Number(document.getElementById(id).value);
  const assignedTo = val('new-assigned-to') || val('assigned-to');
 
  const machine = {
    asset_tag:        val('asset-tag'),
    serial_number:    val('serial-number'),
    brand:            val('brand'),
    model:            val('model'),
    machine_type:     val('type'),
    form_factor:      val('form-factor'),
    operating_system: val('os'),
    cpu:              val('cpu'),
    ram_gb:           num('ram'),
    storage_gb:       num('storage'),
    storage_type:     val('storage-type'),
    gpu:              val('gpu'),
    screen:           val('screen'),
    purchase_date:    val('purchase-date'),
    warranty_expiry:  val('warranty-expiry'),
    department:       val('department'),
    site:             val('site'),
    assigned_to:      assignedTo,
    machine_status:   val('status'),
    machine_condition: val('condition'),
  };
 
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
 
  try {
    const response = await fetch("http://localhost:3000/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(machine),
    });
 
    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Server response:", data);
 
    if (!response.ok) {
      alert(data.error);
      return;
    }
 
    alert(data.message);
  } catch (err) {
    console.error("Fetch failed:", err);
    alert("Could not connect to the server. Is it running?");
  } finally {
    btn.disabled = false;
  }
}
