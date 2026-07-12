const BASE_URL = 'https://zeeshanbalti.pythonanywhere.com/api';

async function run() {
  try {
    console.log("Fetching teachers...");
    const res = await fetch(`${BASE_URL}/teachers/`);
    console.log("Status:", res.status);
    if (res.ok) {
      const teachers = await res.json();
      console.log(`Found ${teachers.length} teachers:`);
      teachers.forEach(t => {
        console.log(`- ${t.name} (${t.email}), Dept: ${t.departmentId || t.departmentName}, Emp ID: ${t.employeeId}`);
      });
    } else {
      console.error("Failed to fetch teachers:", await res.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
