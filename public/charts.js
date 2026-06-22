/// -------------- RAM CHART --------------- ///

export async function createRamChart() {
    const response = await fetch("http://localhost:3000/inventory");
    const assets = await response.json();

    const ramBuckets = {
        "≤8 GB": 0,
        "16 GB": 0,
        "24-36": 0,
        "48-64": 0,
        "96+": 0
    };

    assets.forEach(device => {
        const ram = Number(device.ram_gb);

        if (ram <= 8) ramBuckets["≤8 GB"]++;
        else if (ram === 16) ramBuckets["16 GB"]++;
        else if (ram >= 24 && ram <= 36) ramBuckets["24-36"]++;
        else if (ram >= 48 && ram <= 64) ramBuckets["48-64"]++;
        else if (ram >= 96) ramBuckets["96+"]++;

        
    });

    const ctx = document.getElementById("ram-chart");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(ramBuckets),
            datasets: [{
                data: Object.values(ramBuckets),
                backgroundColor: "#2f64e1",
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/// ------------- SYSTEM CHART --------------- ///

export async function createSystemChart() {
    const response = await fetch("http://localhost:3000/inventory");
    const assets = await response.json();

    const osCounts = {};

    function getOsFamily(operating_system) {
        const value = operating_system.toLowerCase();

        if (value.includes("windows")) return "Windows";
        if (value.includes("ubuntu")) return "Ubuntu";
        if (value.includes("macos")) return "macOS";

        return "Other";
    }

    assets.forEach(asset => {
        const operating_system = getOsFamily(asset.operating_system);
        osCounts[operating_system] = (osCounts[operating_system] || 0) + 1;
    });

    const sorted = Object.entries(osCounts)
        .sort((a, b) => b[1] - a[1]);

    const categories = sorted.map(([operating_system]) => operating_system);
    const values = sorted.map(([, count]) => count);

    new Chart(document.getElementById('system-chart'), {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Devices',
                backgroundColor: '#2f64e1',
                data: values,
                borderRadius: 10
            }]
        },
        options: {
            indexAxis: 'y', 

            responsive: true,
            maintainAspectRatio: false,


            plugins: {
                legend: {
                    display: false
                },
                
            },

            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}
