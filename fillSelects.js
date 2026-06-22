function fillSelect(id, values, placeholder) {
  const select = document.getElementById(id);
  if (!select) return;
  if (!values?.length) return;

  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function fillSelectObjects(id, objects, placeholder, valueKey, textKey) {
  const select = document.getElementById(id);
  if (!select) return;
  if (!objects?.length) return; 

  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  objects.forEach((obj) => {
    const option = document.createElement("option");
    option.value = obj[valueKey];
    option.textContent = obj[textKey];
    select.appendChild(option);
  });
}

export async function loadSelectOptions() {
  const response = await fetch("http://localhost:3000/options");

  if (!response.ok) {
    throw new Error("Failed to load select options");
  }

  const options = await response.json();

  fillSelect("brand", options.brands, "Select brand");
  fillSelect("model", options.models, "Select model");
  fillSelect("type", options.types, "Select type");
  fillSelect("form-factor", options.formFactors, "Select form factor");
  fillSelect("os", options.operatingSystems, "Select operating system");
  fillSelect("cpu", options.cpus, "Select CPU");
  fillSelect("ram", options.ram, "Select RAM");
  fillSelect("storage", options.storage, "Select storage");
  fillSelect("storage-type", options.storageTypes, "Select storage type");
  fillSelect("gpu", options.gpus, "Select GPU");
  fillSelect("screen", options.screens, "Select screen");
  fillSelect("department", options.departments, "Select department");
  fillSelect("site", options.sites, "Select site");
  fillSelectObjects("assigned-to", options.assignments, "Select employee", "name", "name");
  fillSelect("status", options.statuses, "Select status");
  fillSelect("condition", options.conditions, "Select condition");
}
