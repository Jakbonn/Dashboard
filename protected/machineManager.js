import { insertIntoTable } from "./uploadToTable.js";
import { loadSelectOptions } from "./fillSelects.js";


document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadSelectOptions();
  } catch (err) {
    console.error("Could not load select options:", err);
  }

  const form = document.querySelector(".machine-form");

  if (!form) {
    console.error("Machine form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await insertIntoTable();
  });
});
