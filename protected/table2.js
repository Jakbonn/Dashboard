export async function createMachineTable() {
    const response = await fetch("http://localhost:3000/inventory");

    if (!response.ok) {
        throw new Error(`Failed to load inventory: ${response.status}`);
    }

    const assets = await response.json();

    if (!Array.isArray(assets)) {
        throw new Error("Inventory response must be an array");
    }

    const optionsResponse = await fetch("http://localhost:3000/options");

    if (!optionsResponse.ok) {
        throw new Error(`Failed to load edit options: ${optionsResponse.status}`);
    }

    const options = await optionsResponse.json();
    const table = document.getElementById('machine-table');
    const detailsDialog = document.getElementById('machine-details-dialog');
    const detailsTitle = document.getElementById('machine-details-title');
    const detailsList = document.getElementById('machine-details-list');
    const closeDetailsButton = document.getElementById('close-machine-details');
    const editableFields = {
        ram_gb: { optionsKey: 'ram' },
        storage_gb: { optionsKey: 'storage' },
        storage_type: { optionsKey: 'storageTypes' },
        gpu: { optionsKey: 'gpus' },
        cpu: { optionsKey: 'cpus' },
        warranty_expiry: { type: 'date' },
        department: { optionsKey: 'departments' },
        site: { optionsKey: 'sites' },
        assigned_to: { optionsKey: 'assignments', labelKey: 'name', valueKey: 'name', allowEmpty: true },
        machine_status: { optionsKey: 'statuses' },
        machine_condition: { optionsKey: 'conditions' },
        operating_system: { optionsKey: 'operatingSystems' }
    };

    const headers = [
        'asset_tag',
        'serial_number',
        'brand',
        'model',
        'assigned_to',
        'ram_gb',
        'storage_gb',
        'machine_status'
    ];
    const headerLabels = {
        asset_tag: 'Tag',
        serial_number: 'Serial Number',
        brand: 'Brand',
        model: 'Model',
        assigned_to: 'Assignment',
        ram_gb: 'Ram',
        storage_gb: 'Storage',
        machine_status: 'Status'
    };
    const actionHeaders = ['Action'];

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    [...headers, ...actionHeaders].forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] ?? header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    function displayValue(key, value) {
        if (value === null || value === undefined || value === '') return 'Not set';
        if (key === 'warranty_expiry') return String(value).slice(0, 10);
        return String(value);
    }

    function compareText(a, b, key, ascending) {
        const first = String(a[key] ?? '');
        const second = String(b[key] ?? '');
        return ascending
            ? first.localeCompare(second)
            : second.localeCompare(first);
    }

    function createFieldEditor(key, currentValue) {
        const config = editableFields[key];

        if (config.type === 'date' || config.type === 'text') {
            const input = document.createElement('input');
            input.className = 'machine-detail-input';
            input.type = config.type;
            input.value = config.type === 'date'
                ? String(currentValue ?? '').slice(0, 10)
                : currentValue ?? '';
            return input;
        }

        const select = document.createElement('select');
        select.className = 'machine-detail-input';
        const values = [...(options[config.optionsKey] ?? [])];
        const normalizedCurrentValue = String(currentValue ?? '');

        const getOptionValue = value => config.valueKey ? value?.[config.valueKey] : value;
        const getOptionLabel = value => config.labelKey ? value?.[config.labelKey] : value;

        if (config.allowEmpty) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Unassigned';
            option.selected = normalizedCurrentValue === '';
            select.appendChild(option);
        }

        if (!values.some(value => String(getOptionValue(value)) === normalizedCurrentValue) && normalizedCurrentValue) {
            values.unshift(currentValue);
        }

        values
            .filter(value => value !== null && value !== undefined && value !== '')
            .forEach(value => {
                const option = document.createElement('option');
                const optionValue = getOptionValue(value);

                option.value = optionValue;
                option.textContent = getOptionLabel(value);
                option.selected = String(optionValue) === normalizedCurrentValue;
                select.appendChild(option);
            });

        return select;
    }

    function createStatusBadge(status) {
        const badge = document.createElement('span');
        const normalizedStatus = String(status ?? '').toLowerCase();

        badge.className = 'status-badge';
        badge.textContent = status ?? '';

        if (normalizedStatus === 'in use') {
            badge.classList.add('status-badge-in-use');
        }else if (normalizedStatus === 'in stock') {
            badge.classList.add('status-badge-in-stock');
        }else if (normalizedStatus === 'in repair') {
            badge.classList.add('status-badge-in-repair');
        }else if (normalizedStatus === 'retired') {
            badge.classList.add('status-badge-retired')
        }

        return badge;
    }

    function createIconSvg(paths) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');

        paths.forEach(pathData => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', pathData.type || 'path');

            Object.entries(pathData.attributes).forEach(([name, value]) => {
                path.setAttribute(name, value);
            });

            svg.appendChild(path);
        });

        return svg;
    }

    function createEyeIcon() {
        return createIconSvg([
            { attributes: { d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' } },
            { type: 'circle', attributes: { cx: '12', cy: '12', r: '3' } }
        ]);
    }

    function createTrashIcon() {
        return createIconSvg([
            { attributes: { d: 'M3 6h18' } },
            { attributes: { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' } },
            { attributes: { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' } },
            { attributes: { d: 'M10 11v6' } },
            { attributes: { d: 'M14 11v6' } }
        ]);
    }

    function createPencilIcon() {
        return createIconSvg([
            { attributes: { d: 'M12 20h9' } },
            { attributes: { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z' } }
        ]);
    }

    function createCheckIcon() {
        return createIconSvg([
            { attributes: { d: 'M20 6 9 17l-5-5' } }
        ]);
    }

    function renderMachineDetails(asset) {
        detailsTitle.textContent = `Machine ${asset.asset_tag ?? ''}`;
        detailsList.innerHTML = '';

        Object.entries(asset).forEach(([key, value]) => {
            const row = document.createElement('tr');
            const labelCell = document.createElement('th');
            const valueCell = document.createElement('td');
            const actionCell = document.createElement('td');

            labelCell.scope = 'row';
            labelCell.textContent = key.replaceAll('_', ' ');
            valueCell.textContent = displayValue(key, value);

            if (editableFields[key]) {
                const changeButton = document.createElement('button');
                let editor = null;
                let isEditing = false;

                changeButton.className = 'table-action-button inspect-button';
                changeButton.type = 'button';
                changeButton.title = `Change ${key.replaceAll('_', ' ')}`;
                changeButton.setAttribute('aria-label', `Change ${key.replaceAll('_', ' ')}`);
                changeButton.appendChild(createPencilIcon());
                changeButton.addEventListener('click', async () => {
                    if (!isEditing) {
                        editor = createFieldEditor(key, asset[key]);
                        valueCell.replaceChildren(editor);
                        changeButton.replaceChildren(createCheckIcon());
                        changeButton.title = `Save ${key.replaceAll('_', ' ')}`;
                        changeButton.setAttribute('aria-label', `Save ${key.replaceAll('_', ' ')}`);
                        isEditing = true;
                        editor.focus();
                        return;
                    }

                    try {
                        changeButton.disabled = true;

                        const rawValue = editor?.value;
                        const newValue = key === 'ram_gb' || key === 'storage_gb'
                            ? Number(rawValue)
                            : rawValue;
                        const updateResponse = await fetch(
                            `http://localhost:3000/inventory/${encodeURIComponent(asset.asset_tag)}`,
                            {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ [key]: newValue })
                            }
                        );
                        const result = await updateResponse.json().catch(() => ({}));

                        if (!updateResponse.ok) {
                            throw new Error(result.error || `Update failed: ${updateResponse.status}`);
                        }

                        Object.assign(asset, result);
                        renderRows(assets);
                        renderMachineDetails(asset);
                    } catch (error) {
                        console.error("Failed to update machine:", error);
                        alert(
                            error instanceof TypeError
                                ? "Could not connect to the inventory server on port 3000."
                                : error.message
                        );
                        changeButton.disabled = false;
                    }
                });

                actionCell.appendChild(changeButton);
            }

            row.append(labelCell, valueCell, actionCell);
            detailsList.appendChild(row);
        });
    }

    function renderRows(data) {
        tbody.innerHTML = '';

        data.forEach(asset => {
            const row = document.createElement('tr');

            headers.forEach(header => {
                const td = document.createElement('td');

                if (header === 'machine_status') {
                    td.appendChild(createStatusBadge(asset[header]));
                } else {
                    td.textContent = asset[header] ?? '';
                }

                row.appendChild(td);
            });

            const actionCell = document.createElement('td');
            actionCell.className = 'table-actions-cell';

            const inspectButton = document.createElement('button');
            inspectButton.className = 'table-action-button inspect-button';
            inspectButton.type = 'button';
            inspectButton.title = 'Inspect';
            inspectButton.setAttribute('aria-label', `Inspect ${asset.asset_tag ?? 'machine'}`);
            inspectButton.appendChild(createEyeIcon());
            inspectButton.addEventListener('click', () => {
                renderMachineDetails(asset);
                detailsDialog.showModal();
            });

            const btn = document.createElement('button');
            btn.className = 'table-action-button delete-button';
            btn.type = 'button';
            btn.title = 'Delete';
            btn.setAttribute('aria-label', `Delete ${asset.asset_tag ?? 'machine'}`);
            btn.appendChild(createTrashIcon());
            btn.addEventListener('click', async () => {
                const assetTag = asset.asset_tag;

                if (typeof assetTag !== 'string' || !assetTag.trim()) {
                    console.error("Cannot delete machine without an asset tag:", asset);
                    alert("This machine cannot be deleted because its asset tag is missing.");
                    return;
                }

                if (!confirm(`Delete ${assetTag}?`)) return;

                try {
                    btn.disabled = true;

                    const deleteResponse = await fetch(
                        `http://localhost:3000/inventory/${encodeURIComponent(assetTag)}`,
                        { method: 'DELETE' }
                    );

                    if (!deleteResponse.ok) {
                        const result = await deleteResponse.json().catch(() => ({}));
                        throw new Error(result.error || `Delete failed: ${deleteResponse.status}`);
                    }

                    const index = assets.indexOf(asset);
                    if (index !== -1) assets.splice(index, 1);
                    renderRows(assets);
                } catch (error) {
                    console.error("Failed to delete machine:", error);
                    alert(error.message);
                    btn.disabled = false;
                }
            });

            actionCell.append(inspectButton, btn);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    }

    closeDetailsButton.addEventListener('click', () => {
        detailsDialog.close();
    });

    detailsDialog.addEventListener('click', event => {
        if (event.target === detailsDialog) detailsDialog.close();
    });

    renderRows(assets);

    let tagAsc = true;
    let brandAsc = true;
    let siteAsc = true;
    let statusAsc = true;

    document.getElementById('sort-tag-2').addEventListener('click', () => {
        assets.sort((a, b) =>
            compareText(a, b, 'asset_tag', tagAsc)
        );
        tagAsc = !tagAsc;
        renderRows(assets);
    });

    document.getElementById('sort-brand-2').addEventListener('click', () => {
        assets.sort((a, b) =>
            compareText(a, b, 'brand', brandAsc)
        );
        brandAsc = !brandAsc;
        renderRows(assets);
    });

    document.getElementById('sort-site-2').addEventListener('click', () => {
        assets.sort((a, b) =>
            compareText(a, b, 'site', siteAsc)
        );
        siteAsc = !siteAsc;
        renderRows(assets);
    });

    document.getElementById('sort-status-2').addEventListener('click', () => {
        assets.sort((a, b) =>
            compareText(a, b, 'machine_status', statusAsc)
        );
        statusAsc = !statusAsc;
        renderRows(assets);
    });
}
