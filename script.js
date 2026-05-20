function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

// Open/Close Modal
function openAuth() {
    // close donor form if open
    document.getElementById("donorBox").classList.add("hidden");

    document.getElementById("authBox").classList.remove("hidden");
}

function closeAuth() {
    document.getElementById("authBox").classList.add("hidden");
}

// Switch Forms
function showRegister() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerForm").classList.add("hidden");
    document.getElementById("loginForm").classList.remove("hidden");
}

// REGISTER
function register() {
    const username = document.getElementById("regUser").value;
    const password = document.getElementById("regPass").value;

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        showLogin();
    });
}

// LOGIN
function login() {
    const username = document.getElementById("loginUser").value;
    const password = document.getElementById("loginPass").value;

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(data => {
        if (data === "Success") {
            alert("Login Successful!");

            // Save login state
            localStorage.setItem("isLoggedIn", "true");

            updateAuthButton();
            closeAuth();
        } else {
            alert("You don't have an account. Register to continue.");
        }
    });
}

function searchDonor() {
    const blood = document.getElementById("bloodGroup").value;
    const city = document.getElementById("cityInput").value;
    const results = document.getElementById("results");

    results.innerHTML = "";

    fetch("http://localhost:5000/getDonors", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ blood, city })
    })
    .then(res => res.json())
    .then(data => {

        if (data.length === 0) {
            results.innerHTML = "<p>No donors found</p>";
            return;
        }

        data.forEach(d => {
            const card = document.createElement("div");
            card.className = "card";
            card.id = d._id;

            card.innerHTML = `
                <h3>${d.name}</h3>
                <p><b>Blood:</b> ${d.blood}</p>
                <p><b>City:</b> ${d.city}</p>
                <p><b>Phone:</b> ${d.phone}</p>

                <button onclick="deleteDonor('${d._id}')">Delete</button>
                <button onclick="handleEdit('${d._id}', '${d.name}', '${d.phone}', '${d.city}', '${d.blood}', '${d.gender}')">Edit</button>            `;

            results.appendChild(card);
        });

    })
    .catch(() => {
        results.innerHTML = "<p>Error fetching data</p>";
    });
}

function updateAuthButton() {
    const btn = document.getElementById("authBtn");

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        btn.innerText = "Logout";
        btn.onclick = logout;
    } else {
        btn.innerText = "Login / Register";
        btn.onclick = openAuth;
    }
}

function logout() {
    localStorage.removeItem("isLoggedIn");

    alert("Logged out successfully!");

    updateAuthButton();
}

window.onload = function () {
    updateAuthButton();
};

function openDonorForm() {
    document.getElementById("authBox").classList.add("hidden");
    document.getElementById("donorBox").classList.remove("hidden");

    // reset form
    document.getElementById("donorName").value = "";
    document.getElementById("donorPhone").value = "";
    document.getElementById("donorCity").value = "";

    const btn = document.getElementById("donorSubmitBtn");

    btn.innerText = "Submit";
    btn.onclick = saveDonor; // default behavior
}

function closeDonorForm() {
    document.getElementById("donorBox").classList.add("hidden");
}

function saveDonor() {
    const name = document.getElementById("donorName").value;
    const phone = document.getElementById("donorPhone").value;
    const city = document.getElementById("donorCity").value;
    const blood = document.getElementById("donorBlood").value;
    const gender = document.getElementById("donorGender").value;

    if (!name || !phone || !city || blood === "Select Blood Group" || gender === "Select Gender") {
        alert("Fill all fields properly!");
        return;
    }

    fetch("http://localhost:5000/addDonor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            phone,
            city,
            blood,
            gender
        })
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        closeDonorForm();
    });
}

function editDonor(id, name, phone, city, blood, gender) {
    openDonorForm();

    document.getElementById("donorName").value = name;
    document.getElementById("donorPhone").value = phone;
    document.getElementById("donorCity").value = city;
    document.getElementById("donorBlood").value = blood;
    document.getElementById("donorGender").value = gender;

    const btn = document.getElementById("donorSubmitBtn");

    btn.innerText = "Update";

    btn.onclick = function () {
        updateDonor(id);
    };
}

async function deleteDonor(id) {

    if (!isLoggedIn()) {
        alert("Login to continue");
        openAuth();
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    await fetch(`http://localhost:5000/deleteDonor/${id}`, {
        method: "DELETE"
    });

    alert("Deleted Successfully!");
    searchDonor();
}

async function updateDonor(id) {

    if (!isLoggedIn()) {
        alert("Login to continue");
        openAuth();
        return;
    }

    const confirmUpdate = confirm("Are you sure you want to update?");
    if (!confirmUpdate) return;

    const updatedData = {
        name: document.getElementById("donorName").value,
        phone: document.getElementById("donorPhone").value,
        city: document.getElementById("donorCity").value,
        blood: document.getElementById("donorBlood").value,
        gender: document.getElementById("donorGender").value
    };

    await fetch(`http://localhost:5000/updateDonor/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });

    alert("Updated Successfully!");
    closeDonorForm();
    searchDonor();
}

function handleSearch() {
    if (!isLoggedIn()) {
        alert("Please login to continue");
        openAuth();
        return;
    }

    searchDonor();
}

function handleDonate() {
    if (!isLoggedIn()) {
        alert("Please login to continue");
        openAuth();
        return;
    }

    openDonorForm();
}

function handleEdit(id, name, phone, city, blood, gender) {
    if (!isLoggedIn()) {
        alert("Login to continue");
        openAuth();
        return;
    }

    editDonor(id, name, phone, city, blood, gender);
}

function openAbout() {
    document.getElementById("aboutBox").classList.remove("hidden");
}

function closeAbout() {
    document.getElementById("aboutBox").classList.add("hidden");
}