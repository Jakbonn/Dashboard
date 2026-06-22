/// ------------- INVENTORY TABLE -------------- ///

export async function createInventoryTable() {
    const response = await fetch("http://localhost:3000/inventory");
    const assets = await response.json();

    const table = document.getElementById('inventory-table');

    const headers = [
        'asset_tag',
        'brand',
        'model',
        'cpu',
        'ram_gb',
        'storage_gb',
        'machine_status'
    ];
    const headerLabels = {
        asset_tag: 'Tag',
        brand: 'Brand',
        model: 'Model',
        cpu: 'CPU',
        ram_gb: 'Ram',
        storage_gb: 'Storage',
        machine_status: 'Status'
    };

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

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = headerLabels[header] ?? header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    let visibleCount = 10;
    let itemsPerClick = 10;

    function renderRows(data) {
        tbody.innerHTML = '';

        const visibleAssets = data.slice(0, visibleCount);

        visibleAssets.forEach(asset => {
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

            tbody.appendChild(row);
        });

        updateLoadMoreButton(data);
    }

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.textContent = 'Load more';
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.className = 'load-more-btn';

    table.insertAdjacentElement('afterend', loadMoreBtn);

    loadMoreBtn.addEventListener('click', () => {
        visibleCount += itemsPerClick;
        renderRows(assets);
    });

    function updateLoadMoreButton(data) {
        if (visibleCount >= data.length){
            loadMoreBtn.style.display = 'none';
        }else {
            loadMoreBtn.style.display = 'block';
        }
    }

    renderRows(assets);

    let brandAsc = true;
    let siteAsc = true;
    let statusAsc = true;

    document.getElementById('sort-brand').addEventListener('click', () => {
        assets.sort((a, b) =>
            brandAsc
                ? a.brand.localeCompare(b.brand)
                : b.brand.localeCompare(a.brand)
        );

        brandAsc = !brandAsc;
        visibleCount = 10;
        renderRows(assets);
    });

    document.getElementById('sort-site').addEventListener('click', () => {
        assets.sort((a, b) =>
            siteAsc
                ? a.site.localeCompare(b.site)
                : b.site.localeCompare(a.site)
        );

        siteAsc = !siteAsc;
        visibleCount = 10;
        renderRows(assets);
    });

    document.getElementById('sort-status').addEventListener('click', () => {
        assets.sort((a, b) =>
            statusAsc
                ? a.machine_status.localeCompare(b.machine_status)
                : b.machine_status.localeCompare(a.machine_status)
        );

        statusAsc = !statusAsc;
        visibleCount = 10;
        renderRows(assets);
    });
}
