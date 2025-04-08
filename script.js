document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Script Loaded!");

    const dateInput = document.querySelector("#attendanceDate");
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const today = new Date();
    const formattedDate = formatDate(today);

    dateInput.value = formattedDate;
    dateInput.style.fontWeight = "bold";

    const isoDate = today.toISOString().split('T')[0];
    dateInput.dataset.realDate = isoDate;

    dateInput.addEventListener("input", function () {
        this.value = formattedDate; 
    });

    const addButton = document.querySelector("#addStudentBtn");
    const tableBody = document.querySelector("#addedStudentTable tbody");
    const saveButton = document.querySelector("#saveStudentBtn");

    function createStatusIndicator(status) {
        return status === "Present"
            ? `<span class="status-indicator present" data-status="Present">🟢 Present</span>`
            : `<span class="status-indicator absent" data-status="Absent">🔴 Absent</span>`;
    }

    addButton.addEventListener("click", function () {
        const nameInput = document.querySelector("#studentName");
        const branchInput = document.querySelector("#studentBranch");
        const rollNoInput = document.querySelector("#studentRollNo");
        const registrationNoInput = document.querySelector("#studentRegistrationNo");

        if (!nameInput.value.trim() || !rollNoInput.value.trim() || !registrationNoInput.value.trim()) {
            alert("❌ Please enter Student Name, Roll No, and Registration No.");
            return;
        }

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${nameInput.value}</td>
            <td>${branchInput.value}</td>
            <td>${rollNoInput.value}</td>
            <td>${registrationNoInput.value}</td>
            <td class="status-cell">
                ${createStatusIndicator("Absent")}
            </td>
            <td><button class="delete-btn">❌</button></td>
        `;

        tableBody.appendChild(newRow);

        const statusIndicator = newRow.querySelector(".status-indicator");

        statusIndicator.addEventListener("click", function () {
            toggleStatus(statusIndicator);
        });

        newRow.querySelector(".delete-btn").addEventListener("click", function () {
            newRow.remove();
        });

        nameInput.value = "";
        rollNoInput.value = "";
        registrationNoInput.value = "";
        branchInput.selectedIndex = 0;
    });

    function toggleStatus(statusElement) {
        if (statusElement.dataset.status === "Present") {
            statusElement.dataset.status = "Absent";
            statusElement.innerHTML = "🔴 Absent";
            statusElement.classList.remove("present");
            statusElement.classList.add("absent");
        } else {
            statusElement.dataset.status = "Present";
            statusElement.innerHTML = "🟢 Present";
            statusElement.classList.remove("absent");
            statusElement.classList.add("present");
        }
    }

    saveButton.addEventListener("click", function () {
        const tableRows = document.querySelectorAll("#addedStudentTable tbody tr");
        let studentData = [];

        tableRows.forEach(row => {
            const columns = row.querySelectorAll("td");
            const statusElement = row.querySelector(".status-indicator");

            if (columns.length >= 5) {
                studentData.push({
                    Name: columns[0].textContent.trim(),
                    Branch: columns[1].textContent.trim(),
                    RollNo: columns[2].textContent.trim(),
                    RegistrationNo: columns[3].textContent.trim(),
                    Status: statusElement.dataset.status
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(studentData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

        XLSX.writeFile(workbook, "AttendanceSheet.xlsx");

        alert("✅ Attendance Saved and Excel File Downloaded!");
    });

    function loadAttendanceData() {
        let students = JSON.parse(localStorage.getItem("attendanceData")) || [];

        if (students.length === 0) return;

        let studentList = students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.branch}</td>
                <td>${student.rollNo}</td>
                <td>${student.registrationNo}</td>
                <td class="status-cell">
                    ${createStatusIndicator(student.status)}
                </td>
                <td><button class="delete-btn">❌</button></td>
            </tr>
        `).join("");

        tableBody.innerHTML = studentList;

        document.querySelectorAll(".status-indicator").forEach(statusElement => {
            statusElement.addEventListener("click", function () {
                toggleStatus(statusElement);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                button.closest("tr").remove();
            });
        });
    }

    loadAttendanceData();
});