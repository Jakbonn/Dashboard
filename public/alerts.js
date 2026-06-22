/// ----------------- ALERTS ------------------ ///

export async function createAlerts() {
    const response = await fetch("http://localhost:3000/inventory");
    const assets = await response.json();

    const alertCounter = document.getElementById('alerts-counter');
    const actionCounter = document.getElementById('action-counter');
    const alertsDisplay = document.getElementById('alerts-display');

    let alertCount = 0;

    alertsDisplay.innerHTML = "";

    assets
    .sort((a, b) => {
        const alertA = getWorstAlert(a);
        const alertB = getWorstAlert(b);

        const weightA = alertA ? alertA.weight : 0;
        const weightB = alertB ? alertB.weight : 0;

        return weightB - weightA;
    })
    .forEach(asset => {
        const worstAlert = getWorstAlert(asset);

        if (worstAlert) {
            alertCount++;

            const error = document.createElement("p");
            
            if(worstAlert.weight === 1){
                error.style.backgroundColor = "#5189e960";
                error.style.borderWidth = "0px 0px 0px 3px "
                error.style.borderStyle = "solid solid solid solid";
                error.style.borderColor = "#005eff"
                error.style.borderRadius = "5px";
                error.style.padding = "8px";
                error.innerHTML = `
                    <span style="
                        background-color: #005eff;
                        color: white;
                        padding: 4px 11px;
                        border-radius: 6px;
                        display: inline-block;
                        margin-right: 5px;
                    ">
                        UPGRADE
                    </span>

                    ${asset.asset_tag} - ${worstAlert.name}
                `;
            } else if(worstAlert.weight === 2){
                error.style.backgroundColor = "#e9a25160";
                error.style.borderWidth = "0px 0px 0px 3px "
                error.style.borderStyle = "solid solid solid solid";
                error.style.borderColor = "#ff9d00"
                error.style.borderRadius = "5px";
                error.style.padding = "8px";
                error.innerHTML = `
                    <span style="
                        background-color: #ff9d00;
                        color: white;
                        padding: 4px 11px;
                        border-radius: 6px;
                        display: inline-block;
                        margin-right: 5px;

                    ">
                        REPLACE
                    </span>

                    ${asset.asset_tag} - ${worstAlert.name}
                `;
            } else if(worstAlert.weight === 3){
                error.style.backgroundColor = "#e9a25160";
                error.style.borderWidth = "0px 0px 0px 3px "
                error.style.borderStyle = "solid solid solid solid";
                error.style.borderRadius = "5px";
                error.style.borderColor = " #ff9d00"
                error.style.padding = "8px";
                error.innerHTML = `
                    <span style="
                        background-color: #ff9d00;
                        color: white;
                        padding: 4px 11px;
                        border-radius: 6px;
                        display: inline-block;
                        margin-right: 5px;
                    ">
                        WARNING
                    </span>

                    ${asset.asset_tag} - ${worstAlert.name}
                `;           
            } else if(worstAlert.weight === 4){
                error.style.backgroundColor = "#e9a25160";
                error.style.borderWidth = "0px 0px 0px 3px "
                error.style.borderStyle = "solid solid solid solid";
                error.style.borderRadius = "5px";
                error.style.borderColor = " #ff9d00"
                error.style.padding = "8px";
                error.innerHTML = `
                    <span style="
                        background-color: #ff9d00;
                        color: white;
                        padding: 4px 11px;
                        border-radius: 6px;
                        display: inline-block;
                        margin-right: 5px;
                    ">
                        WARNING
                    </span>

                    ${asset.asset_tag} - ${worstAlert.name}
                `;           
            } else if(worstAlert.weight === 5){
                error.style.backgroundColor = "#e9515160";
                error.style.borderWidth = "0px 0px 0px 3px "
                error.style.borderStyle = "solid solid solid solid";
                error.style.borderRadius = "5px";
                error.style.borderColor = " #ff0000"
                error.style.padding = "8px";
                error.innerHTML = `
                    <span style="
                        background-color: #ff0000;
                        color: white;
                        padding: 4px 11px;
                        border-radius: 6px;
                        display: inline-block;
                        margin-right: 5px;
                    ">
                        CRITICAL
                    </span>

                    ${asset.asset_tag} - ${worstAlert.name}
                `;           
            }

            alertsDisplay.appendChild(error);
        }
    });

    alertCounter.textContent = `⚠ ${alertCount} alerts`;
    actionCounter.textContent = alertCount;

    if (alertCount < 5) {
        actionCounter.style.color = "#d4a000";
    } else if (alertCount < 10) {
        actionCounter.style.color = "#d47f00";
    } else {
        actionCounter.style.color = "#d40000";
    }
}

function getWorstAlert(asset) {
    const alerts = [];

    const daysToWarrantyEnd =
        (new Date(asset.warranty_expiry) - new Date()) /
        (1000 * 60 * 60 * 24);

    const ageInYears =
        (new Date() - new Date(asset.purchase_date)) /
        (1000 * 60 * 60 * 24 * 365.25);

    const daysAfterWarranty = Math.abs(daysToWarrantyEnd);    

    if (daysToWarrantyEnd < 0) {
        alerts.push({
            name: `Expired ${Math.round(daysAfterWarranty)} days ago`,
            weight: 5
        });
    } else if (daysToWarrantyEnd < 14) {
        alerts.push({
            name: "Warranty expiring soon",
            weight: 4
        });
    } else if (asset.machine_status === "In repair" || asset.machine_condition === "Needs attention") {
        alerts.push({
            name: "Needs repair or attention",
            weight: 3
        });
    } else if (ageInYears > 4) {
        alerts.push({
            name: "Device older than 4 years",
            weight: 2
        });
    } else if (asset.ram_gb < 16) {
        alerts.push({
            name: "RAM needs upgrade",
            weight: 1
        });
    } else if (alerts.length === 0) {
        return null;
    }

    return alerts.sort((a, b) => b.weight - a.weight)[0];
}
