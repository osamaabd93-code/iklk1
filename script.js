// البيانات الأساسية
const appData = {
    drivers: ["عمار علوان", "سالم", "ياسر عقيل", "عبدالله", "ياسر ناطق", "مصطفى", "حمودي", "عمر عقوبه", "عمر كداد", "علي محيي"],
    mandoubs: ["ابو الطيب", "عباس فاضل", "عبدالله", "ليث", "علي محسن"],
    buses: ["هيكر ازرق", "هيكر اخضر", "سكانيا رصاصي", "صيني ابيض", "ترافيكو مارسيدس ابيض", "GT طيارة", "GT وردي"],
    accountants: ["علي ثامر", "مهند", "رحمة", "مدقق حسابات"],
    expenseTypes: ["وقود", "حدود", "زيوت", "إطارات", "صيانة", "مصاريف مندوب"],
    busExpenseOptions: ["خيار 1", "خيار 2"],
    users: [
        {name: "عمار علوان", pass: "123"}
    ],
    savedTrips: [],
    savedTripsInfo: [],
    busFunds: {}
};

// تهيئة صناديق الباصات
appData.buses.forEach(bus => {
    appData.busFunds[bus] = { in: 0, out: 0, trans: 0 };
});

// تحديث اليوزرات في قسم الدخول
function populateUserSelectsForLogin() {
    const userSelect = document.getElementById("user-name-select");
    if(userSelect) {
        userSelect.innerHTML = '<option value="">اختر اسمك</option>';
        appData.users.forEach(u => userSelect.innerHTML += `<option value="${u.name}">${u.name}</option>`);
    }
}

// تشغيل الأكواد بمجرد تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    setupLoginSystem();
    setupNavigation();
    populateSelects();
    generateBusFunds();
    setupCalculationsAndInteractions();
    setupSettingsSystem();
    setupTripSystem();
    setupTripInfoSystem();
    setupSaveButtons();
    setupReportsSystem();
});

// 1. نظام تسجيل الدخول والخروج
function setupLoginSystem() {
    const loginScreen = document.getElementById("login-screen");
    const adminApp = document.getElementById("admin-app");
    const userApp = document.getElementById("user-app");
    
    // تحديث قائمة يوزرات الدخول
    populateUserSelectsForLogin();

    document.getElementById("btn-login-admin").addEventListener("click", () => {
        const pass = document.getElementById("admin-pass-input").value;
        if(pass === "1001") {
            loginScreen.classList.add("hidden");
            adminApp.classList.remove("hidden");
            document.getElementById("admin-pass-input").value = "";
        } else {
            alert("كلمة المرور غير صحيحة");
        }
    });

    document.getElementById("btn-login-user").addEventListener("click", () => {
        const name = document.getElementById("user-name-select").value;
        const pass = document.getElementById("user-pass-input").value;
        
        const user = appData.users.find(u => u.name === name && u.pass === pass);
        
        if(user) {
            document.getElementById("logged-in-user-name").textContent = user.name;
            loginScreen.classList.add("hidden");
            userApp.classList.remove("hidden");
            document.getElementById("user-pass-input").value = "";
        } else {
            alert("اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    });

    const logoutButtons = document.querySelectorAll(".btn-logout");
    logoutButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            adminApp.classList.add("hidden");
            userApp.classList.add("hidden");
            loginScreen.classList.remove("hidden");
            
            // تحديث القائمة عند الخروج لتشمل أي يوزر جديد
            populateUserSelectsForLogin();
        });
    });
}

// 2. برمجة شريط التبويبات السفلي
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const role = item.getAttribute("data-role");
            const targetId = item.getAttribute("data-target");

            const parentApp = document.getElementById(`${role}-app`);
            const tabs = parentApp.querySelectorAll(".tab-content");
            const navs = parentApp.querySelectorAll(".nav-item");

            tabs.forEach(tab => tab.classList.remove("active"));
            navs.forEach(nav => nav.classList.remove("active"));

            item.classList.add("active");
            document.getElementById(targetId).classList.add("active");
        });
    });
}

// 3. تعبئة القوائم المنسدلة
function populateSelects() {
    const elements = {
        driverList: document.getElementById("driver-list"),
        mandoubList: document.getElementById("mandoub-list"),
        busSelect: document.getElementById("bus-select"),
        financeBusType: document.getElementById("finance-bus-type"),
        userExpType: document.getElementById("user-expense-type-select"),
        userCarType: document.getElementById("user-car-type-select"),
        userBusDriver: document.getElementById("user-bus-driver-select"),
        userBusCar: document.getElementById("user-bus-car-select"),
        userBusOpts: document.getElementById("user-bus-opts-select")
    };

    if(elements.driverList) elements.driverList.innerHTML = appData.drivers.map(n => `<option value="${n}">`).join('');
    if(elements.mandoubList) elements.mandoubList.innerHTML = appData.mandoubs.map(n => `<option value="${n}">`).join('');
    if(elements.busSelect) elements.busSelect.innerHTML = appData.buses.map(n => `<option>${n}</option>`).join('');
    if(elements.financeBusType) elements.financeBusType.innerHTML = appData.buses.map(n => `<option value="${n}">${n}</option>`).join('');
    if(elements.userCarType) elements.userCarType.innerHTML = appData.buses.map(n => `<option>${n}</option>`).join('');
    if(elements.userBusDriver) elements.userBusDriver.innerHTML = appData.drivers.map(n => `<option>${n}</option>`).join('');
    if(elements.userBusCar) elements.userBusCar.innerHTML = appData.buses.map(n => `<option>${n}</option>`).join('');

    renderDynamicSelects();
}

function renderDynamicSelects() {
    const userExpType = document.getElementById("user-expense-type-select");
    const userBusOpts = document.getElementById("user-bus-opts-select");
    
    if(userExpType) userExpType.innerHTML = appData.expenseTypes.map(n => `<option>${n}</option>`).join('');
    if(userBusOpts) userBusOpts.innerHTML = '<option value="">بدون خيار</option>' + appData.busExpenseOptions.map(n => `<option>${n}</option>`).join('');
}

// 4. توليد صناديق الباصات بالتصميم الجديد
function generateBusFunds() {
    const grid = document.getElementById("buses-funds-grid");
    if(grid) {
        grid.innerHTML = "";
        appData.buses.forEach(bus => {
            let fund = appData.busFunds[bus] || {in:0, out:0, trans:0};
            grid.innerHTML += `
                <div class="stat-card">
                    <i class="fas fa-bus" style="color: var(--primary-admin); font-size: 1.5rem;"></i>
                    <h4 style="font-size: 0.9rem; margin: 5px 0;">${bus}</h4>
                    <div class="fund-details">
                        <span>و: ${fund.in}</span> | <span>ص: ${fund.out}</span> | <span>ت: ${fund.trans}</span>
                    </div>
                </div>
            `;
        });
    }
}

// 5. العمليات الحسابية التلقائية وإظهار/إخفاء الحقول وتحديث حالة الرحلة
function setupCalculationsAndInteractions() {
    const driverTotal = document.getElementById("driver-total");
    const driverPaid = document.getElementById("driver-paid");
    const driverRem = document.getElementById("driver-rem");
    
    const manTotal = document.getElementById("man-total");
    const manPaid = document.getElementById("man-paid");
    const manRem = document.getElementById("man-rem");

    const tripStatus = document.getElementById("trip-status");

    const updateTripStatus = () => {
        if (driverRem && manRem && tripStatus) {
            if (Number(driverRem.value) === 0 && Number(manRem.value) === 0) {
                tripStatus.textContent = "مكتملة";
                tripStatus.style.color = "green";
            } else {
                tripStatus.textContent = "معلقة";
                tripStatus.style.color = "red";
            }
        }
    };

    const calcDriver = () => {
        if(driverTotal && driverPaid && driverRem) {
            driverRem.value = (Number(driverTotal.value) - Number(driverPaid.value)) || 0;
            updateTripStatus();
        }
    };
    if(driverTotal) driverTotal.addEventListener("input", calcDriver);
    if(driverPaid) driverPaid.addEventListener("input", calcDriver);

    const calcMan = () => {
        if(manTotal && manPaid && manRem) {
            manRem.value = (Number(manTotal.value) - Number(manPaid.value)) || 0;
            updateTripStatus();
        }
    };
    if(manTotal) manTotal.addEventListener("input", calcMan);
    if(manPaid) manPaid.addEventListener("input", calcMan);
}

// 6. نظام الإعدادات (أنواع المصاريف، خيارات الباص، اليوزرات، السائقين)
function setupSettingsSystem() {
    const renderLists = () => {
        const expList = document.getElementById("exp-types-list");
        const busOptsList = document.getElementById("bus-opts-list");
        const usersList = document.getElementById("users-list");
        const driversList = document.getElementById("drivers-settings-list");
        
        if(expList) {
            expList.innerHTML = appData.expenseTypes.map((t, i) => `
                <li style="justify-content: space-between;">${t}
                    <div>
                        <button onclick="editExp(${i})" class="btn-primary" style="padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">تعديل</button>
                        <button onclick="delExp(${i})" style="background:red; padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">حذف</button>
                    </div>
                </li>`).join('');
        }
        
        if(busOptsList) {
            busOptsList.innerHTML = appData.busExpenseOptions.map((t, i) => `
                <li style="justify-content: space-between;">${t}
                    <div>
                        <button onclick="editBusOpt(${i})" class="btn-primary" style="padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">تعديل</button>
                        <button onclick="delBusOpt(${i})" style="background:red; padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">حذف</button>
                    </div>
                </li>`).join('');
        }

        if(usersList) {
            usersList.innerHTML = appData.users.map((u, i) => `
                <li style="justify-content: space-between;">${u.name} - ${u.pass}
                    <div>
                        <button onclick="editUser(${i})" class="btn-primary" style="padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">تعديل</button>
                        <button onclick="delUser(${i})" style="background:red; padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">حذف</button>
                    </div>
                </li>`).join('');
        }

        if(driversList) {
            driversList.innerHTML = appData.drivers.map((d, i) => `
                <li style="justify-content: space-between;">${d}
                    <div>
                        <button onclick="editDriver(${i})" class="btn-primary" style="padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">تعديل</button>
                        <button onclick="delDriver(${i})" style="background:red; padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">حذف</button>
                    </div>
                </li>`).join('');
        }
        
        renderDynamicSelects();
    };

    document.getElementById("btn-add-exp-type").addEventListener("click", () => {
        const val = document.getElementById("new-exp-type-input").value;
        if(val) { appData.expenseTypes.push(val); document.getElementById("new-exp-type-input").value = ""; renderLists(); }
    });

    document.getElementById("btn-add-bus-opt").addEventListener("click", () => {
        const val = document.getElementById("new-bus-opt-input").value;
        if(val) { appData.busExpenseOptions.push(val); document.getElementById("new-bus-opt-input").value = ""; renderLists(); }
    });

    document.getElementById("btn-save-new-user").addEventListener("click", () => {
        const name = document.getElementById("new-user-name").value;
        const pass = document.getElementById("new-user-pass").value;
        if(name && pass) {
            appData.users.push({name, pass});
            document.getElementById("new-user-name").value = "";
            document.getElementById("new-user-pass").value = "";
            renderLists();
            populateUserSelectsForLogin();
            alert("تم حفظ المستخدم بنجاح");
        }
    });

    const btnAddDriver = document.getElementById("btn-add-driver");
    if(btnAddDriver){
        btnAddDriver.addEventListener("click", () => {
            const val = document.getElementById("new-driver-name-input").value;
            if(val) { 
                appData.drivers.push(val); 
                document.getElementById("new-driver-name-input").value = ""; 
                renderLists(); 
                populateSelects(); 
            }
        });
    }

    window.delExp = (i) => { appData.expenseTypes.splice(i, 1); renderLists(); };
    window.editExp = (i) => { const n = prompt("تعديل", appData.expenseTypes[i]); if(n) { appData.expenseTypes[i] = n; renderLists(); } };
    window.delBusOpt = (i) => { appData.busExpenseOptions.splice(i, 1); renderLists(); };
    window.editBusOpt = (i) => { const n = prompt("تعديل", appData.busExpenseOptions[i]); if(n) { appData.busExpenseOptions[i] = n; renderLists(); } };
    
    window.delUser = (i) => { appData.users.splice(i, 1); renderLists(); populateUserSelectsForLogin(); };
    window.editUser = (i) => { 
        const newName = prompt("تعديل الاسم", appData.users[i].name); 
        const newPass = prompt("تعديل كلمة السر", appData.users[i].pass); 
        if(newName && newPass) { 
            appData.users[i].name = newName; 
            appData.users[i].pass = newPass; 
            renderLists(); 
            populateUserSelectsForLogin(); 
        } 
    };

    window.delDriver = (i) => { appData.drivers.splice(i, 1); renderLists(); populateSelects(); };
    window.editDriver = (i) => { const n = prompt("تعديل اسم السائق", appData.drivers[i]); if(n) { appData.drivers[i] = n; renderLists(); populateSelects(); } };

    renderLists();
}

function setupTripSystem() {
    const list = document.getElementById("saved-trips-list");
    
    window.renderTrips = () => {
        if(!list) return;
        list.innerHTML = appData.savedTrips.map((trip, i) => `
            <li style="justify-content: space-between; flex-wrap: wrap;">
                <span>${trip.name || '-'} | المندوب: ${trip.mandoub || '-'} | السائق: ${trip.driver || '-'}</span>
                <div>
                    <button onclick="editTrip(${i})" class="btn-primary" style="padding:5px 10px; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">تعديل</button>
                    <button onclick="deleteTrip(${i})" style="background:red; padding:5px 10px; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">حذف</button>
                </div>
            </li>
        `).join('');
    };

    const btnSaveTrip = document.getElementById("btn-save-trip");
    if(btnSaveTrip) {
        btnSaveTrip.addEventListener("click", () => {
            const trip = {
                name: document.getElementById("trip-name") ? document.getElementById("trip-name").value : "",
                date: document.getElementById("trip-date") ? document.getElementById("trip-date").value : "",
                days: document.getElementById("trip-days") ? document.getElementById("trip-days").value : "",
                mandoub: document.getElementById("mandoub-select") ? document.getElementById("mandoub-select").value : "",
                driver: document.getElementById("driver-select") ? document.getElementById("driver-select").value : "",
                driver2: document.getElementById("driver2-select") ? document.getElementById("driver2-select").value : "",
                bus: document.getElementById("bus-select") ? document.getElementById("bus-select").value : "",
                busCount: document.getElementById("bus-count") ? document.getElementById("bus-count").value : "",
                notes: document.getElementById("trip-notes") ? document.getElementById("trip-notes").value : ""
            };
            
            if (window.editTripIndex !== undefined && window.editTripIndex !== null) {
                appData.savedTrips[window.editTripIndex] = trip;
                window.editTripIndex = null;
                btnSaveTrip.textContent = "حفظ وإنشاء الرحلة";
            } else {
                appData.savedTrips.push(trip);
            }
            
            const form = document.getElementById("trip-form");
            if(form) form.reset();
            renderTrips();
            alert("تم حفظ الرحلة بنجاح");
        });
    }

    window.deleteTrip = (i) => {
        appData.savedTrips.splice(i, 1);
        renderTrips();
    };

    window.editTrip = (i) => {
        const trip = appData.savedTrips[i];
        if(document.getElementById("trip-name")) document.getElementById("trip-name").value = trip.name;
        if(document.getElementById("trip-date")) document.getElementById("trip-date").value = trip.date;
        if(document.getElementById("trip-days")) document.getElementById("trip-days").value = trip.days;
        if(document.getElementById("mandoub-select")) document.getElementById("mandoub-select").value = trip.mandoub;
        if(document.getElementById("driver-select")) document.getElementById("driver-select").value = trip.driver;
        if(document.getElementById("driver2-select")) document.getElementById("driver2-select").value = trip.driver2;
        if(document.getElementById("bus-select")) document.getElementById("bus-select").value = trip.bus;
        if(document.getElementById("bus-count")) document.getElementById("bus-count").value = trip.busCount;
        if(document.getElementById("trip-notes")) document.getElementById("trip-notes").value = trip.notes;
        
        window.editTripIndex = i;
        const btnSaveTrip = document.getElementById("btn-save-trip");
        if(btnSaveTrip) btnSaveTrip.textContent = "تحديث الرحلة";
    };
    
    renderTrips();
}

// 7. نظام معلومات الرحلة الشاملة
function setupTripInfoSystem() {
    const list = document.getElementById("saved-trip-infos-list");
    
    window.renderTripInfos = () => {
        list.innerHTML = appData.savedTripsInfo.map((info, i) => `
            <li style="justify-content: space-between; flex-wrap: wrap;">
                <span>معاملة ${i+1} | المورد: ${info.val15 || '-'} | الانطلاقية: ${info.val16 || '-'}</span>
                <div>
                    <button onclick="deleteTripInfo(${i})" style="background:red; padding:5px 10px; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">حذف</button>
                </div>
            </li>
        `).join('');
    };

    document.getElementById("btn-save-trip-info").addEventListener("click", () => {
        const info = {
            val15: document.getElementById("ti-15").value,
            val16: document.getElementById("ti-16").value
        };
        appData.savedTripsInfo.push(info);
        document.getElementById("trip-info-form").reset();
        renderTripInfos();
        alert("تم حفظ المعلومات بنجاح");
    });

    window.deleteTripInfo = (i) => {
        appData.savedTripsInfo.splice(i, 1);
        renderTripInfos();
    };
}

// 8. أزرار الحفظ العامة وإضافة رصيد الباص
function setupSaveButtons() {
    document.getElementById("btn-save-user-expense").addEventListener("click", () => alert("تم تسجيل المصروف بنجاح"));
    document.getElementById("btn-save-user-income").addEventListener("click", () => alert("تم تسجيل الإيراد بنجاح"));
    document.getElementById("btn-save-user-bus-exp").addEventListener("click", () => alert("تم حفظ مصاريف الباص بنجاح"));

    document.getElementById("btn-save-finance").addEventListener("click", () => {
        // إضافة رصيد للباص
        const busType = document.getElementById("finance-bus-type").value;
        const busFare = Number(document.getElementById("finance-bus-fare").value) || 0;
        if(busType && busFare > 0) {
            appData.busFunds[busType].in += busFare;
            generateBusFunds(); // تحديث الواجهة
        }

        // نقل سبب تقييم المندوب للمندوب
        const reason = document.getElementById("mandoub-eval-reason").value;
        document.getElementById("display-eval-reason").textContent = reason || "لا يوجد";

        alert("تم حفظ المالية بنجاح");
    });
}

// 9. نظام التقارير
function setupReportsSystem() {
    window.showReport = (title) => {
        document.getElementById('reports-main-list').classList.add('hidden');
        const viewer = document.getElementById('report-viewer');
        if (viewer) {
            viewer.classList.remove('hidden');
            document.getElementById('report-title').textContent = title;
            
            const tbody = document.getElementById('report-table-body');
            tbody.innerHTML = `
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">معلومة تجريبية لـ ${title}</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">التفاصيل 1</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border: 1px solid #ddd;">قيمة أخرى</td>
                    <td style="padding: 12px; border: 1px solid #ddd;">التفاصيل 2</td>
                </tr>
            `;
        }
    };

    window.hideReport = () => {
        document.getElementById('reports-main-list').classList.remove('hidden');
        document.getElementById('report-viewer').classList.add('hidden');
    };

    window.searchReport = () => {
        const query = document.getElementById('report-search-input').value.toLowerCase();
        const rows = document.querySelectorAll('#report-table-body tr');
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    };

    window.exportReportExcel = () => {
        let table = document.getElementById("report-table");
        let rows = table.querySelectorAll("tr");
        let csv = [];
        for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll("td, th");
            for (let j = 0; j < cols.length; j++) 
                row.push(cols[j].innerText);
            csv.push(row.join(","));
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csv.join("\n");
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", document.getElementById('report-title').textContent + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}
