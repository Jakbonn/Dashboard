IT Dashboard
A web-based IT asset management dashboard created during my internship. The project helps manage and monitor computer inventory, hardware specifications, warranty status, and machine condition in one place.


Overview
The IT Dashboard was built to make IT equipment tracking easier and more organized. It displays information about company devices such as laptops, desktops, MacBooks, workstations, and other assets.
The dashboard includes asset details, status information, hardware specifications, warranty dates, and visual indicators for machines that may need attention.


Features
	•	View a list of IT assets in a structured table
	•	Display hardware information such as CPU, RAM, storage, GPU, and operating system
	•	Track machine status and condition
	•	Monitor warranty expiry dates
	•	Show alerts for devices that may require upgrade, replacement, or review
	•	Sort inventory data by selected columns
	•	Add new machines through a form
	•	Fetch inventory data from a backend API
	•	Store machine data in a PostgreSQL database
	•	Responsive layout for different screen sizes


Technologies Used
	•	HTML
	•	CSS
	•	JavaScript
	•	Node.js
	•	Express.js
	•	PostgreSQL
	•	Git / GitHub


Project Structure
IT-Dashboard/
│
├── protected/
│   ├── fillSelects.js
│   ├── machineManager.html
│   ├── machineManager.js
│   ├── machineTable.html
│   ├── machineTable.js
│   ├── table2.js
│   └── uploadToTable.js
│
├── public/
│   ├── alerts.js
│   ├── animations.js
│   ├── app.js
│   ├── charts.js
│   ├── importInventory.js
│   ├── index.html
│   ├── loginSystem.js
│   ├── style.css
│   ├── summarycards.js
│   └── table.js
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── LICENSE


Database
The project uses PostgreSQL to store machine inventory data.
Example machine data includes:
	•	Asset tag
	•	Serial number
	•	Brand
	•	Model
	•	Machine type
	•	Form factor
	•	Operating system
	•	CPU
	•	RAM
	•	Storage
	•	GPU
	•	Purchase date
	•	Warranty expiry date
	•	Department
	•	Site
	•	Assigned user
	•	Machine status
	•	Machine condition


API Endpoints
Get all inventory items
GET /inventory
Returns all machines from the database.
Add a new machine
POST /inventory
Adds a new machine to the inventory database.


Get form options
GET /options
Returns available options for select fields such as brands, models, statuses, departments, CPUs, and operating systems.


Installation
	1.	Clone the repository:
git clone https://github.com/Jakbonn/it-dashboard.git
	1.	Open the project folder:
cd it-dashboard
	1.	Install dependencies:
npm install
	1.	Start the server:
node server.js
	1.	Open the project in your browser:
http://localhost:3000


Purpose of the Project
This project was created as part of my internship to practice real-world IT and programming skills. It allowed me to work with frontend development, backend development, database integration, API requests, and inventory management logic.


What I Learned
During this project, I improved my skills in:
	•	Building dynamic websites with JavaScript
	•	Working with DOM manipulation
	•	Creating backend routes with Express.js
	•	Connecting a Node.js application to PostgreSQL
	•	Designing database tables
	•	Handling API requests using fetch
	•	Organizing project files
	•	Debugging frontend and backend errors
	•	Creating a more professional user interface


Important Note
This repository uses demo data only. Any real company data, serial numbers, employee names, asset tags, or internal information should be removed before publishing the project publicly.


License
This project is licensed under the Apache License 2.0.
