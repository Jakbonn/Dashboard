export async function countMachines() {
    const response = await fetch("http://localhost:3000/inventory");
    const inventory = await response.json();

    const uniqueCount = new Set(
        inventory.map(i => i.serial_number)
    ).size;

    const sparesCount = new Set(
        inventory
            .filter(i => i.machine_status === "In stock")
            .map(i => i.serial_number)
    ).size;

    const totalRam = inventory.reduce(
    (sum, machine) => sum + Number(machine.ram_gb || 0),
    0
    );

    const avgRam = totalRam / inventory.length;

    document.getElementById("machines-counter").innerHTML = uniqueCount;
    document.getElementById("live-info").innerHTML =`${uniqueCount} machines - updated today`;
    document.getElementById("spares-counter").innerHTML = sparesCount;
    document.getElementById("ram-counter").innerHTML = Math.round(avgRam);
}
