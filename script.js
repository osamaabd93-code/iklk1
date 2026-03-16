// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAkQpzDCLuL_IXuyIqZrAl4B__BtvieGmI",
    authDomain: "iook-92aee.firebaseapp.com",
    projectId: "iook-92aee",
    storageBucket: "iook-92aee.firebasestorage.app",
    messagingSenderId: "92508471614",
    appId: "1:92508471614:web:3d2a192bc0182ff436ac6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// البيانات الأساسية فارغة للتعبئة الحقيقية
let appData = {
    drivers: [],
    mandoubs: [],
    buses: [],
    accountants: [],
    expenseTypes: [],
    busExpenseOptions: [],
    users: [],
    savedTrips: [],
    savedTripsInfo: [],
    busFunds: {},
    userExpenses: [],
    userIncomes: [],
    userBusExpenses: [],
    finances: []
};

// دالة التنبيهات المخصصة بدلاً من alert العادية
window.showCustomAlert = (message) => {
    const container = document.getElementById('custom-alert-container');
    if (!container) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    alertDiv.textContent = message;
    container.appendChild(alertDiv);
    setTimeout(() => {
        if (container.contains(alertDiv)) {
            container.removeChild(alertDiv);
        }
    }, 3000);
};

// ضغط الصورة وتحويلها إلى Base64
async function compressImageAndConvertToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // ضغط الصورة 
                resolve(dataUrl);
            };
        };
        reader.onerror = error => reject(error);
    });
}

// حفظ وجلب البيانات من Firebase
async function saveToDB() {
    try {
        await setDoc(doc(db, "system", "data"), appData);
    } catch (e) {
        console.error("خطأ في الحفظ:", e);
    }
}

function listenToDB() {
    onSnapshot(doc(db, "system", "data"), (docSnap) => {
        if (docSnap.exists()) {
            appData = docSnap.data();
            refreshAllUI();
        } else {
            saveToDB();
        }
    });
}

function refreshAllUI() {
    populateUserSelectsForLogin();
    populateSelects();
    generateBusFunds();
    renderLists();
    renderTrips();
    renderTripInfos();
    updateUserDashboard();
}

function populateUserSelectsForLogin() {
    const userSelect = document.getElementById("user-name-select");
    if(userSelect) {
        userSelect.innerHTML = '<option value="">اختر اسمك</option>';
        if(appData.users) {
            appData.users.forEach(u => userSelect.innerHTML += `<option value="${u.name}">${u.name}</option>`);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupLoginSystem();
    setupNavigation();
    setupCalculationsAndInteractions();
    setupSettingsSystem();
    setupTripSystem();
    setupTripInfoSystem();
    setupSaveButtons();
    setupReportsSystem();
    setupImageCompressors();
    setupImageModal();
    listenToDB();
});

function setupImageCompressors() {
    const attachCompressor = (inputId, hiddenId) => {
        const input = document.getElementById(inputId);
        const hidden = document.getElementById(hiddenId);
        if(input && hidden) {
            input.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                const base64 = await compressImageAndConvertToBase64(file);
                hidden.value = base64;
            });
        }
    }
    attachCompressor("trip-file", "trip-file-base64");
    attachCompressor("user-expense-file", "user-expense-file-base64");
    attachCompressor("user-bus-exp-file", "user-bus-exp-file-base64");
}

function setupImageModal() {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const span = document.getElementsByClassName("close-modal")[0];

    window.openImage = (src) => {
        modal.style.display = "block";
        modalImg.src = src;
    }
    if(span) span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    }
}

function setupLoginSystem() {
    const loginScreen = document.getElementById("login-screen");
    const adminApp = document.getElementById("admin-app");
    const userApp = document.getElementById("user-app");

    document.getElementById("btn-login-admin").addEventListener("click", () => {
        const pass = document.getElementById("admin-pass-input").value;
        if(pass === "1100") {
            loginScreen.classList.add("hidden");
            adminApp.classList.remove("hidden");
            document.getElementById("admin-pass-input").value = "";
        } else {
            showCustomAlert("كلمة المرور غير صحيحة");
        }
    });

    document.getElementById("btn-login-user").addEventListener("click", () => {
        const name = document.getElementById("user-name-select").value;
        const pass = document.getElementById("user-pass-input").value;
        const user = appData.users.find(u => u.name === name && u.pass === pass);
        
        if(user) {
            window.loggedInUser = user.name;
            document.getElementById("logged-in-user-name").textContent = user.name;
            updateUserDashboard();
            loginScreen.classList.add("hidden");
            userApp.classList.remove("hidden");
            document.getElementById("user-pass-input").value = "";
        } else {
            showCustomAlert("اسم المستخدم أو كلمة المرور غير صحيحة");
        }
    });

    const logoutButtons = document.querySelectorAll(".btn-logout");
    logoutButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            adminApp.classList.add("hidden");
            userApp.classList.add("hidden");
            loginScreen.classList.remove("hidden");
            window.loggedInUser = null;
        });
    });
}

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

function populateSelects() {
    const elements = {
        driverList: document.getElementById("driver-list"),
        mandoubList: document.getElementById("mandoub-list"),
        busSelect: document.getElementById("bus-select"),
        financeBusType: document.getElementById("finance-bus-type"),
        financeDriverName: document.getElementById("finance-driver-name"),
        financeMandoubName: document.getElementById("finance-mandoub-name"),
        userExpType: document.getElementById("user-expense-type-select"),
        userCarType: document.getElementById("user-car-type-select"),
        userBusDriver: document.getElementById("user-bus-driver-select"),
        userBusCar: document.getElementById("user-bus-car-select"),
        userBusOpts: document.getElementById("user-bus-opts-select")
    };

    if(elements.driverList) elements.driverList.innerHTML = (appData.drivers||[]).map(n => `<option value="${n}">`).join('');
    if(elements.mandoubList) elements.mandoubList.innerHTML = (appData.mandoubs||[]).map(n => `<option value="${n}">`).join('');
    
    const busHtml = (appData.buses||[]).map(n => `<option value="${n}">${n}</option>`).join('');
    if(elements.busSelect) elements.busSelect.innerHTML = busHtml;
    if(elements.financeBusType) elements.financeBusType.innerHTML = busHtml;
    if(elements.userCarType) elements.userCarType.innerHTML = busHtml;
    if(elements.userBusCar) elements.userBusCar.innerHTML = busHtml;

    const driverHtml = (appData.drivers||[]).map(n => `<option value="${n}">${n}</option>`).join('');
    if(elements.financeDriverName) elements.financeDriverName.innerHTML = driverHtml;
    if(elements.userBusDriver) elements.userBusDriver.innerHTML = driverHtml;

    const mandoubHtml = (appData.mandoubs||[]).map(n => `<option value="${n}">${n}</option>`).join('');
    if(elements.financeMandoubName) elements.financeMandoubName.innerHTML = mandoubHtml;

    if(elements.userExpType) elements.userExpType.innerHTML = (appData.expenseTypes||[]).map(n => `<option>${n}</option>`).join('');
    if(elements.userBusOpts) elements.userBusOpts.innerHTML = '<option value="">بدون خيار</option>' + (appData.busExpenseOptions||[]).map(n => `<option>${n}</option>`).join('');
}

function generateBusFunds() {
    const grid = document.getElementById("buses-funds-grid");
    if(grid) {
        grid.innerHTML = "";
        (appData.buses||[]).forEach(bus => {
            if(!appData.busFunds) appData.busFunds = {};
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

function setupCalculationsAndInteractions() {
    const driverTotal = document.getElementById("driver-total");
    const driverPaid = document.getElementById("driver-paid");
    const driverRem = document.getElementById("driver-rem");
    
    const manTotal = document.getElementById("man-total");
    const manPaid = document.getElementById("man-paid");
    const manRem = document.getElementById("man-rem");

    const calcDriver = () => {
        if(driverTotal && driverPaid && driverRem) {
            driverRem.value = (Number(driverTotal.value) - Number(driverPaid.value)) || 0;
        }
    };
    if(driverTotal) driverTotal.addEventListener("input", calcDriver);
    if(driverPaid) driverPaid.addEventListener("input", calcDriver);

    const calcMan = () => {
        if(manTotal && manPaid && manRem) {
            manRem.value = (Number(manTotal.value) - Number(manPaid.value)) || 0;
        }
    };
    if(manTotal) manTotal.addEventListener("input", calcMan);
    if(manPaid) manPaid.addEventListener("input", calcMan);
}

function setupSettingsSystem() {
    window.renderLists = () => {
        const expList = document.getElementById("exp-types-list");
        const busOptsList = document.getElementById("bus-opts-list");
        const usersList = document.getElementById("users-list");
        const driversList = document.getElementById("drivers-settings-list");
        const mandoubsList = document.getElementById("mandoubs-settings-list");
        const busList = document.getElementById("bus-settings-list");
        
        const createListItem = (text, idx, editFunc, delFunc) => `
            <li style="justify-content: space-between;">${text}
                <div>
                    <button onclick="${editFunc}(${idx})" class="btn-primary" style="padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">تعديل</button>
                    <button onclick="${delFunc}(${idx})" style="background:red; padding:2px 8px; font-size:12px; border:none; border-radius:4px; color:white; cursor:pointer;">حذف</button>
                </div>
            </li>`;

        if(expList) expList.innerHTML = (appData.expenseTypes||[]).map((t, i) => createListItem(t, i, 'editExp', 'delExp')).join('');
        if(busOptsList) busOptsList.innerHTML = (appData.busExpenseOptions||[]).map((t, i) => createListItem(t, i, 'editBusOpt', 'delBusOpt')).join('');
        if(usersList) usersList.innerHTML = (appData.users||[]).map((u, i) => createListItem(`${u.name} - ${u.pass}`, i, 'editUser', 'delUser')).join('');
        if(driversList) driversList.innerHTML = (appData.drivers||[]).map((d, i) => createListItem(d, i, 'editDriver', 'delDriver')).join('');
        if(mandoubsList) mandoubsList.innerHTML = (appData.mandoubs||[]).map((m, i) => createListItem(m, i, 'editMandoub', 'delMandoub')).join('');
        if(busList) busList.innerHTML = (appData.buses||[]).map((b, i) => createListItem(b, i, 'editBus', 'delBus')).join('');
    };

    const addSetting = (inputId, arrayName) => {
        const val = document.getElementById(inputId).value;
        if(val) { 
            if(!appData[arrayName]) appData[arrayName] = [];
            appData[arrayName].push(val); 
            document.getElementById(inputId).value = ""; 
            saveToDB(); 
        }
    };

    document.getElementById("btn-add-exp-type").addEventListener("click", () => addSetting("new-exp-type-input", "expenseTypes"));
    document.getElementById("btn-add-bus-opt").addEventListener("click", () => addSetting("new-bus-opt-input", "busExpenseOptions"));
    document.getElementById("btn-add-driver").addEventListener("click", () => addSetting("new-driver-name-input", "drivers"));
    document.getElementById("btn-add-mandoub").addEventListener("click", () => addSetting("new-mandoub-name-input", "mandoubs"));
    document.getElementById("btn-add-bus").addEventListener("click", () => addSetting("new-bus-input", "buses"));

    document.getElementById("btn-save-new-user").addEventListener("click", () => {
        const name = document.getElementById("new-user-name").value;
        const pass = document.getElementById("new-user-pass").value;
        if(name && pass) {
            if(!appData.users) appData.users = [];
            appData.users.push({name, pass});
            document.getElementById("new-user-name").value = "";
            document.getElementById("new-user-pass").value = "";
            saveToDB();
            showCustomAlert("تم حفظ المستخدم بنجاح");
        }
    });

    const createEditDel = (arrayName) => {
        return {
            del: (i) => { appData[arrayName].splice(i, 1); saveToDB(); },
            edit: (i) => { const n = prompt("تعديل", appData[arrayName][i]); if(n) { appData[arrayName][i] = n; saveToDB(); } }
        }
    };

    const expActions = createEditDel("expenseTypes");
    window.delExp = expActions.del; window.editExp = expActions.edit;

    const busOptActions = createEditDel("busExpenseOptions");
    window.delBusOpt = busOptActions.del; window.editBusOpt = busOptActions.edit;

    const driverActions = createEditDel("drivers");
    window.delDriver = driverActions.del; window.editDriver = driverActions.edit;

    const mandoubActions = createEditDel("mandoubs");
    window.delMandoub = mandoubActions.del; window.editMandoub = mandoubActions.edit;

    const busActions = createEditDel("buses");
    window.delBus = busActions.del; window.editBus = busActions.edit;

    window.delUser = (i) => { appData.users.splice(i, 1); saveToDB(); };
    window.editUser = (i) => { 
        const newName = prompt("تعديل الاسم", appData.users[i].name); 
        const newPass = prompt("تعديل كلمة السر", appData.users[i].pass); 
        if(newName && newPass) { 
            appData.users[i].name = newName; 
            appData.users[i].pass = newPass; 
            saveToDB(); 
        } 
    };
}

function setupTripSystem() {
    const list = document.getElementById("saved-trips-list");
    window.renderTrips = () => {
        if(!list) return;
        list.innerHTML = (appData.savedTrips||[]).map((trip, i) => `
            <li style="justify-content: space-between; flex-wrap: wrap;">
                <span>${trip.name || '-'} | المندوب: ${trip.mandoub || '-'} | السائق: ${trip.driver || '-'}</span>
                <div>
                    ${trip.imgBase64 ? `<img src="${trip.imgBase64}" class="clickable-image" onclick="openImage('${trip.imgBase64}')" style="margin-left: 10px;">` : ''}
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
                notes: document.getElementById("trip-notes") ? document.getElementById("trip-notes").value : "",
                imgBase64: document.getElementById("trip-file-base64") ? document.getElementById("trip-file-base64").value : "",
                status: "معلقة"
            };
            
            if(!appData.savedTrips) appData.savedTrips = [];

            if (window.editTripIndex !== undefined && window.editTripIndex !== null) {
                appData.savedTrips[window.editTripIndex] = trip;
                window.editTripIndex = null;
                btnSaveTrip.textContent = "حفظ وإنشاء الرحلة";
            } else {
                appData.savedTrips.push(trip);
            }
            
            const form = document.getElementById("trip-form");
            if(form) form.reset();
            document.getElementById("trip-file-base64").value = "";
            saveToDB();
            showCustomAlert("تم حفظ الرحلة بنجاح");
        });
    }

    window.deleteTrip = (i) => { appData.savedTrips.splice(i, 1); saveToDB(); };

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
}

function setupTripInfoSystem() {
    const list = document.getElementById("saved-trip-infos-list");
    window.renderTripInfos = () => {
        if(!list) return;
        list.innerHTML = (appData.savedTripsInfo||[]).map((info, i) => `
            <li style="justify-content: space-between; flex-wrap: wrap;">
                <span>معاملة ${i+1} | المورد: ${info.val15 || '-'} | الانطلاقية: ${info.val16 || '-'}</span>
                <div>
                    <button onclick="editTripInfo(${i})" class="btn-primary" style="padding:5px 10px; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">تعديل</button>
                    <button onclick="deleteTripInfo(${i})" style="background:red; padding:5px 10px; color:white; border:none; border-radius:4px; cursor:pointer; margin-right:5px;">حذف</button>
                </div>
            </li>
        `).join('');
    };

    document.getElementById("btn-save-trip-info").addEventListener("click", () => {
        const info = {
            currency: document.getElementById("ti-currency").value,
            val1: document.getElementById("ti-1").value,
            valnew1: document.getElementById("ti-new1").value,
            val2: document.getElementById("ti-2").value,
            val3: document.getElementById("ti-3").value,
            val4: document.getElementById("ti-4").value,
            val5: document.getElementById("ti-5").value,
            val6: document.getElementById("ti-6").value,
            val7: document.getElementById("ti-7").value,
            val8: document.getElementById("ti-8").value,
            val9: document.getElementById("ti-9").value,
            val10: document.getElementById("ti-10").value,
            val11: document.getElementById("ti-11").value,
            val12: document.getElementById("ti-12").value,
            val13: document.getElementById("ti-13").value,
            val14: document.getElementById("ti-14").value,
            val15: document.getElementById("ti-15").value,
            val16: document.getElementById("ti-16").value,
            val17: document.getElementById("ti-17").value,
            val18: document.getElementById("ti-18").value,
            val19: document.getElementById("ti-19").value,
            val20: document.getElementById("ti-20").value,
            val21: document.getElementById("ti-21").value,
            val22: document.getElementById("ti-22").value,
            valnew2: document.getElementById("ti-new2").value,
            val23: document.getElementById("ti-23").value,
            val24: document.getElementById("ti-24").value,
            val25: document.getElementById("ti-25").value,
            val26: document.getElementById("ti-26").value,
            val27: document.getElementById("ti-27").value
        };
        if(!appData.savedTripsInfo) appData.savedTripsInfo = [];
        
        if (window.editTripInfoIndex !== undefined && window.editTripInfoIndex !== null) {
            appData.savedTripsInfo[window.editTripInfoIndex] = info;
            window.editTripInfoIndex = null;
            document.getElementById("btn-save-trip-info").textContent = "حفظ المعلومات";
        } else {
            appData.savedTripsInfo.push(info);
        }

        document.getElementById("trip-info-form").reset();
        saveToDB();
        showCustomAlert("تم حفظ المعلومات بنجاح");
    });

    window.deleteTripInfo = (i) => {
        appData.savedTripsInfo.splice(i, 1);
        saveToDB();
    };

    window.editTripInfo = (i) => {
        const info = appData.savedTripsInfo[i];
        if(document.getElementById("ti-currency")) document.getElementById("ti-currency").value = info.currency;
        if(document.getElementById("ti-1")) document.getElementById("ti-1").value = info.val1;
        if(document.getElementById("ti-new1")) document.getElementById("ti-new1").value = info.valnew1;
        if(document.getElementById("ti-2")) document.getElementById("ti-2").value = info.val2;
        if(document.getElementById("ti-3")) document.getElementById("ti-3").value = info.val3;
        if(document.getElementById("ti-4")) document.getElementById("ti-4").value = info.val4;
        if(document.getElementById("ti-5")) document.getElementById("ti-5").value = info.val5;
        if(document.getElementById("ti-6")) document.getElementById("ti-6").value = info.val6;
        if(document.getElementById("ti-7")) document.getElementById("ti-7").value = info.val7;
        if(document.getElementById("ti-8")) document.getElementById("ti-8").value = info.val8;
        if(document.getElementById("ti-9")) document.getElementById("ti-9").value = info.val9;
        if(document.getElementById("ti-10")) document.getElementById("ti-10").value = info.val10;
        if(document.getElementById("ti-11")) document.getElementById("ti-11").value = info.val11;
        if(document.getElementById("ti-12")) document.getElementById("ti-12").value = info.val12;
        if(document.getElementById("ti-13")) document.getElementById("ti-13").value = info.val13;
        if(document.getElementById("ti-14")) document.getElementById("ti-14").value = info.val14;
        if(document.getElementById("ti-15")) document.getElementById("ti-15").value = info.val15;
        if(document.getElementById("ti-16")) document.getElementById("ti-16").value = info.val16;
        if(document.getElementById("ti-17")) document.getElementById("ti-17").value = info.val17;
        if(document.getElementById("ti-18")) document.getElementById("ti-18").value = info.val18;
        if(document.getElementById("ti-19")) document.getElementById("ti-19").value = info.val19;
        if(document.getElementById("ti-20")) document.getElementById("ti-20").value = info.val20;
        if(document.getElementById("ti-21")) document.getElementById("ti-21").value = info.val21;
        if(document.getElementById("ti-22")) document.getElementById("ti-22").value = info.val22;
        if(document.getElementById("ti-new2")) document.getElementById("ti-new2").value = info.valnew2;
        if(document.getElementById("ti-23")) document.getElementById("ti-23").value = info.val23;
        if(document.getElementById("ti-24")) document.getElementById("ti-24").value = info.val24;
        if(document.getElementById("ti-25")) document.getElementById("ti-25").value = info.val25;
        if(document.getElementById("ti-26")) document.getElementById("ti-26").value = info.val26;
        if(document.getElementById("ti-27")) document.getElementById("ti-27").value = info.val27;
        
        window.editTripInfoIndex = i;
        const btnSaveTripInfo = document.getElementById("btn-save-trip-info");
        if(btnSaveTripInfo) btnSaveTripInfo.textContent = "تحديث المعلومات";
    };
}

function setupSaveButtons() {
    document.getElementById("btn-save-user-expense").addEventListener("click", () => {
        const exp = {
            user: window.loggedInUser,
            currency: document.getElementById("user-expense-currency").value,
            amount: document.getElementById("user-expense-amount").value,
            type: document.getElementById("user-expense-type-select").value,
            liters: document.getElementById("user-expense-liters").value,
            carType: document.getElementById("user-car-type-select").value,
            notes: document.getElementById("user-expense-notes").value,
            imgBase64: document.getElementById("user-expense-file-base64").value,
            date: new Date().toISOString()
        };
        if(!appData.userExpenses) appData.userExpenses = [];
        appData.userExpenses.push(exp);
        document.getElementById("user-expense-form").reset();
        document.getElementById("user-expense-file-base64").value = "";
        saveToDB();
        showCustomAlert("تم تسجيل المصروف بنجاح");
    });

    document.getElementById("btn-save-user-income").addEventListener("click", () => {
        const inc = {
            user: window.loggedInUser,
            currency: document.getElementById("user-income-currency").value,
            type: document.getElementById("user-income-type").value,
            amount: document.getElementById("user-income-amount").value,
            date: new Date().toISOString()
        };
        if(!appData.userIncomes) appData.userIncomes = [];
        appData.userIncomes.push(inc);
        document.getElementById("user-income-form").reset();
        saveToDB();
        showCustomAlert("تم تسجيل الإيراد بنجاح");
    });

    document.getElementById("btn-save-user-bus-exp").addEventListener("click", () => {
        const busExp = {
            user: window.loggedInUser,
            currency: document.getElementById("user-bus-exp-currency").value,
            amount: document.getElementById("user-bus-exp-amount").value,
            date: document.getElementById("user-bus-exp-date").value,
            opts: document.getElementById("user-bus-opts-select").value,
            driver: document.getElementById("user-bus-driver-select").value,
            car: document.getElementById("user-bus-car-select").value,
            imgBase64: document.getElementById("user-bus-exp-file-base64").value
        };
        if(!appData.userBusExpenses) appData.userBusExpenses = [];
        appData.userBusExpenses.push(busExp);
        document.getElementById("user-bus-expense-form").reset();
        document.getElementById("user-bus-exp-file-base64").value = "";
        saveToDB();
        showCustomAlert("تم حفظ مصاريف الباص بنجاح");
    });

    document.getElementById("btn-save-finance").addEventListener("click", () => {
        const busType = document.getElementById("finance-bus-type").value;
        const busFare = Number(document.getElementById("finance-bus-fare").value) || 0;
        if(busType && busFare > 0) {
            if(!appData.busFunds) appData.busFunds = {};
            if(!appData.busFunds[busType]) appData.busFunds[busType] = {in:0, out:0, trans:0};
            appData.busFunds[busType].in += busFare;
        }

        const financeData = {
            currency: document.getElementById("finance-currency").value,
            busType: busType,
            busFare: busFare,
            driverName: document.getElementById("finance-driver-name").value,
            driverDebt: document.getElementById("finance-driver-debt").value,
            driverAdvance: document.getElementById("finance-driver-advance").value,
            driverTotal: document.getElementById("driver-total").value,
            driverPaid: document.getElementById("driver-paid").value,
            driverRem: document.getElementById("driver-rem").value,
            driverEval: document.getElementById("finance-driver-eval").value,
            mandoubName: document.getElementById("finance-mandoub-name").value,
            mandoubAdvance: document.getElementById("finance-mandoub-advance").value,
            manTotal: document.getElementById("man-total").value,
            manPaid: document.getElementById("man-paid").value,
            manRem: document.getElementById("man-rem").value,
            mandoubBonus: document.getElementById("finance-mandoub-bonus").value,
            mandoubEval: document.getElementById("mandoub-eval-select").value,
            mandoubEvalReason: document.getElementById("mandoub-eval-reason").value,
            date: new Date().toISOString()
        };

        if(!appData.finances) appData.finances = [];
        appData.finances.push(financeData);

        // Update trip status if related
        let driverRem = Number(financeData.driverRem) || 0;
        let manRem = Number(financeData.manRem) || 0;
        if (driverRem === 0 && manRem === 0) {
            // Find active trip and mark complete
            if(appData.savedTrips) {
                let activeTrip = appData.savedTrips.find(t => t.driver === financeData.driverName || t.mandoub === financeData.mandoubName);
                if(activeTrip) activeTrip.status = "مكتملة";
            }
        }

        document.getElementById("finance-form").reset();
        saveToDB();
        showCustomAlert("تم حفظ المالية بنجاح");
    });
}

function updateUserDashboard() {
    if(!window.loggedInUser) return;
    
    let pendingTrips = 0;
    let totalTrips = 0;
    let totalDays = 0;
    let currentTripHtml = '<p>لا توجد رحلة حالية معلقة.</p>';

    if(appData.savedTrips) {
        appData.savedTrips.forEach(trip => {
            if(trip.driver === window.loggedInUser || trip.mandoub === window.loggedInUser) {
                totalTrips++;
                totalDays += Number(trip.days) || 0;
                if(trip.status !== "مكتملة") {
                    pendingTrips++;
                    currentTripHtml = `
                        <h3>${trip.name}</h3>
                        <p><strong>التاريخ:</strong> ${trip.date} | <strong>عدد الأيام:</strong> ${trip.days}</p>
                        <p><strong>حالة الرحلة:</strong> <span style="font-weight: bold; color: red;">${trip.status}</span></p>
                    `;
                }
            }
        });
    }

    const statPending = document.getElementById("user-stat-pending");
    const statTotal = document.getElementById("user-stat-total");
    const statDays = document.getElementById("user-stat-days");
    const tripInfo = document.getElementById("user-current-trip-info");

    if(statPending) statPending.textContent = pendingTrips;
    if(statTotal) statTotal.textContent = totalTrips;
    if(statDays) statDays.textContent = totalDays;
    if(tripInfo) tripInfo.innerHTML = currentTripHtml;
}

function setupReportsSystem() {
    window.showReport = (title) => {
        document.getElementById('reports-main-list').classList.add('hidden');
        const viewer = document.getElementById('report-viewer');
        if (viewer) {
            viewer.classList.remove('hidden');
            document.getElementById('report-title').textContent = title;
            
            const tbody = document.getElementById('report-table-body');
            const thead = document.getElementById('report-table-head');
            tbody.innerHTML = '';
            
            if (title === 'تقرير مصرف الرحلة') {
                thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">المستخدم</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">المبلغ</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">النوع</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">التفاصيل</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الصورة</th>`;
                (appData.userExpenses||[]).forEach(e => {
                    tbody.innerHTML += `<tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.user||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.amount||''} ${e.currency||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.type||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.notes||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.imgBase64 ? `<img src="${e.imgBase64}" class="clickable-image" onclick="openImage('${e.imgBase64}')">` : 'لا يوجد'}</td>
                    </tr>`;
                });
            } else if (title === 'تقرير رحلات الباص الواحد') {
                thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">الباص</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">اسم الرحلة</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">التاريخ</th>`;
                (appData.savedTrips||[]).forEach(t => {
                    tbody.innerHTML += `<tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.bus||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.name||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.date||''}</td>
                    </tr>`;
                });
            } else if (title === 'تقرير أعطال الصيانة') {
                thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">المستخدم</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الباص</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">المبلغ</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الخيار</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">التاريخ</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الصورة</th>`;
                (appData.userBusExpenses||[]).forEach(e => {
                    tbody.innerHTML += `<tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.user||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.car||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.amount||''} ${e.currency||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.opts||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.date||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${e.imgBase64 ? `<img src="${e.imgBase64}" class="clickable-image" onclick="openImage('${e.imgBase64}')">` : 'لا يوجد'}</td>
                    </tr>`;
                });
            } else if (title === 'تقرير الوارد الكلي للسائق' || title === 'تقرير الوارد الكلي للمندوب') {
                let isDriver = title === 'تقرير الوارد الكلي للسائق';
                thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">الاسم</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الواصل</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">المتبقي</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">التقييم</th>`;
                (appData.finances||[]).forEach(f => {
                    if((isDriver && f.driverName) || (!isDriver && f.mandoubName)) {
                        tbody.innerHTML += `<tr>
                            <td style="padding: 12px; border: 1px solid #ddd;">${isDriver ? f.driverName : f.mandoubName}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${isDriver ? f.driverPaid : f.manPaid}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${isDriver ? f.driverRem : f.manRem}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${isDriver ? f.driverEval : f.mandoubEval}</td>
                        </tr>`;
                    }
                });
            } else if (title === 'تقرير عدد السفرات الكلي') {
                 thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">اسم الرحلة</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">التاريخ</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">الحالة</th>`;
                (appData.savedTrips||[]).forEach(t => {
                    tbody.innerHTML += `<tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.name||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.date||''}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${t.status||''}</td>
                    </tr>`;
                });
            } else if (title === 'تقرير عدد الرحلات للسائق مع مدة الأيام' || title === 'تقرير عدد الرحلات للمندوب مع مدة الأيام') {
                let isDriver = title === 'تقرير عدد الرحلات للسائق مع مدة الأيام';
                thead.innerHTML = `<th style="padding: 12px; border: 1px solid #ddd;">الاسم</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">اسم الرحلة</th>
                                   <th style="padding: 12px; border: 1px solid #ddd;">عدد الأيام</th>`;
                (appData.savedTrips||[]).forEach(t => {
                    if((isDriver && t.driver) || (!isDriver && t.mandoub)) {
                        tbody.innerHTML += `<tr>
                            <td style="padding: 12px; border: 1px solid #ddd;">${isDriver ? t.driver : t.mandoub}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${t.name||''}</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${t.days||''}</td>
                        </tr>`;
                    }
                });
            }
            
            if(tbody.innerHTML === '') {
                tbody.innerHTML = `<tr><td colspan="10" style="padding: 12px; text-align: center; border: 1px solid #ddd;">لا توجد بيانات</td></tr>`;
            }
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
            for (let j = 0; j < cols.length; j++) {
                let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, "").replace(/,/g, "");
                row.push(data);
            }
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
