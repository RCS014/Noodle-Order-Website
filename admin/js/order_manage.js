const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

// เปิด/ปิด sidebar
function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

mobileMenuBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

// ==========================================
// ระบบจัดการวัตถุดิบหมด
// ==========================================

let disabledItems = JSON.parse(localStorage.getItem('disabledMenuItems')) || [];

function updateCardStyle(card, title, statusText, isReady) {

    if (isReady) {

        card.classList.remove('bg-slate-50','opacity-75','grayscale-[50%]');
        card.classList.add('bg-white','shadow-sm');

        title.classList.remove('text-slate-500','line-through');
        title.classList.add('text-slate-900');

        statusText.textContent = "พร้อมเสิร์ฟ";
        statusText.className = "text-xs font-medium text-emerald-500";

    } else {

        card.classList.add('bg-slate-50','opacity-75','grayscale-[50%]');
        card.classList.remove('bg-white','shadow-sm');

        title.classList.add('text-slate-500','line-through');
        title.classList.remove('text-slate-900');

        statusText.textContent = "วัตถุดิบหมด";
        statusText.className = "text-xs font-medium text-rose-500";

    }
}

// ==========================================
// ลบเมนู
// ==========================================

function deleteItem(btn){

    const card = btn.closest(".menu-card");
    card.remove();

    saveMenu();
}

// ==========================================
// บันทึกเมนู
// ==========================================

function saveMenu(){

const items = [];

document.querySelectorAll(".menu-card").forEach(card=>{

const name = card.querySelector("h3").innerText;

const grid = card.parentElement.id;

const ready = card.querySelector("input[type='checkbox']").checked;

items.push({
    name,
    type: grid,
    ready
});

});

localStorage.setItem("menuItems", JSON.stringify(items));

}

// ==========================================
// โหลดเมนู
// ==========================================

function loadMenu(){

const items = JSON.parse(localStorage.getItem("menuItems")) || [];

if(items.length === 0) return; // ถ้าไม่มีเมนูที่บันทึกไว้ ไม่ต้องโหลด

// ลบเมนูเก่าที่อยู่ในหน้า
document.querySelectorAll(".menu-card").forEach(card=>{
    card.remove();
});

items.forEach(item=>{

const container = document.getElementById(item.type);

const card = document.createElement("div");

card.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between menu-card shadow-sm hover:shadow-md transition-all";

card.innerHTML = `
<div>
<h3 class="font-bold text-lg">${item.name}</h3>
<span class="text-xs font-medium text-emerald-500">พร้อมเสิร์ฟ</span>
</div>

<label class="relative inline-flex items-center cursor-pointer">
<input type="checkbox" class="sr-only peer" ${item.ready ? "checked" : ""}>

<div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary
after:content-[''] after:absolute after:top-[2px] after:left-[2px]
after:bg-white after:border after:rounded-full after:h-5 after:w-5
after:transition-all peer-checked:after:translate-x-full"></div>
</label>

<button onclick="deleteItem(this)" class="text-red-500 ml-3">ลบ</button>
`;

container.appendChild(card);



// toggle
const toggle = card.querySelector("input");
const title = card.querySelector("h3");
const statusText = card.querySelector("span");

toggle.addEventListener("change", function(){
updateCardStyle(card,title,statusText,item.ready);

saveMenu();

});

});

}



// ==========================================
// popup
// ==========================================

function openPopup(){
    document.getElementById("addPopup").classList.remove("hidden");
}

function closePopup(){
    document.getElementById("addPopup").classList.add("hidden");
}

// ==========================================
// เพิ่มเมนู
// ==========================================

function addMenuItem(){

const name = document.getElementById("menuName").value.trim();
const type = document.getElementById("menuType").value;

if(!name) return;

const container = document.getElementById(type);

let items = JSON.parse(localStorage.getItem("menuItems")) || [];

items.push({
    name: name,
    type: type,
    ready: true
});

localStorage.setItem("menuItems", JSON.stringify(items));

const card = document.createElement("div");

card.className = "bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm menu-card";

card.innerHTML = `
<div>
<h3 class="font-bold text-lg">${name}</h3>
<span class="text-xs font-medium text-emerald-500">พร้อมเสิร์ฟ</span>
</div>

<label class="relative inline-flex items-center cursor-pointer">
<input type="checkbox" class="sr-only peer" checked>

<div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary
after:content-[''] after:absolute after:top-[2px] after:left-[2px]
after:bg-white after:border after:rounded-full after:h-5 after:w-5
after:transition-all peer-checked:after:translate-x-full"></div>
</label>

<button onclick="deleteItem(this)" class="text-red-500">
ลบ
</button>
</div>
`;

container.appendChild(card);

/* ===== เพิ่ม toggle logic ===== */

const toggle = card.querySelector("input[type='checkbox']");
const title = card.querySelector("h3");
const statusText = card.querySelector("span");

toggle.addEventListener("change", function(){

const isReady = this.checked;

updateCardStyle(card, title, statusText, isReady);

saveMenu();

});

/* ===== save ===== */

saveMenu();

/* ===== reset popup ===== */

document.getElementById("menuName").value="";
closePopup();

}

document.addEventListener("DOMContentLoaded", loadMenu);