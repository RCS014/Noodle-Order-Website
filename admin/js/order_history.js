const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');
function toggleSidebar() { sidebar.classList.toggle('-translate-x-full'); overlay.classList.toggle('hidden'); }
if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleSidebar); 
if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar); 
if(overlay) overlay.addEventListener('click', toggleSidebar);

const itemsPerPage = 10; 
let currentPage = 1;
let allGroupedOrders = [];

// ==========================================
// เรียกใช้เมื่อมีการเปลี่ยน Dropdown กรองโต๊ะ
// ==========================================
function applyFilter() {
    currentPage = 1;
    renderHistory();
}

function renderHistory() {
    // ดึงวันที่ปัจจุบัน (เช่น 14/03/2569)
    const today = new Date().toLocaleDateString('th-TH'); 
    let historyOrders = JSON.parse(localStorage.getItem("orderHistory")) || [];
    
    // 🌟 ระบบที่ 1: ลบประวัติข้ามวัน (เก็บไว้แสดงผลเฉพาะบิลที่สั่ง "วันนี้" เท่านั้น)
    let validHistory = historyOrders.filter(o => {
        let orderDate = new Date(o.time).toLocaleDateString('th-TH');
        return orderDate === today;
    }); 
    
    // ถ้ามีบิลของเมื่อวานถูกตัดทิ้งไป ให้เซฟอัปเดต LocalStorage ใหม่
    if(validHistory.length !== historyOrders.length) {
        localStorage.setItem("orderHistory", JSON.stringify(validHistory));
    }

    let currentOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
    let allDisplayOrders = validHistory.concat(currentOrders);

    // 🌟 ระบบที่ 2: ตัวกรองโต๊ะ
    let filterTable = document.getElementById("tableFilter") ? document.getElementById("tableFilter").value : "all";
    if(filterTable !== "all") {
        allDisplayOrders = allDisplayOrders.filter(o => String(o.table) === String(filterTable));
    }

    let grouped = {};
    allDisplayOrders.forEach(o => {
        let key = o.time; 
        if (!grouped[key]) {
            grouped[key] = { time: o.time, table: o.table, status: "เสิร์ฟแล้ว", total: 0, items: [] };
        }
        grouped[key].items.push(o);
        grouped[key].total += (o.price * o.qty);
        
        if (o.status === "ยกเลิก") grouped[key].status = "ยกเลิก";
        else if ((o.status === "กำลังทำ" || o.status === "รอคิว") && grouped[key].status !== "ยกเลิก") {
            grouped[key].status = "ยังไม่ได้เสิร์ฟ";
        }
    });

    allGroupedOrders = Object.values(grouped).sort((a, b) => b.time - a.time);

    displayItems(currentPage);
    setupPagination();
}

function displayItems(page) {
    let container = document.getElementById("historyContainer");
    if(!container) return;
    container.innerHTML = "";

    if (allGroupedOrders.length === 0) {
        container.innerHTML = "<p class='text-center py-10 text-slate-500 font-bold text-lg'>ไม่มีประวัติการสั่งอาหาร</p>";
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = allGroupedOrders.slice(start, end);

    itemsToShow.forEach(order => {
        let dateObj = new Date(order.time);
        let timeString = dateObj.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
        
        let itemsHTML = order.items.map(i => `
            <div class="flex gap-4 border-b border-slate-100 pb-1 mb-1 last:border-0">
                <span class="font-black text-primary w-6 text-right">x${i.qty}</span>
                <span class="text-sm text-slate-600">${i.name} ${i.spicy ? '(🌶 '+i.spicy+')' : ''}</span>
            </div>
        `).join('');

        let statusColor = "text-emerald-500"; 
        if (order.status === "ยังไม่ได้เสิร์ฟ") statusColor = "text-amber-500"; 
        if (order.status === "ยกเลิก") statusColor = "text-rose-500"; 

        // แปลงชื่อโต๊ะให้สวยงาม
        let displayTable = order.table === "หน้าเคาน์เตอร์" ? "สั่งกลับบ้าน<br><span class='text-xs font-normal'>(หน้าเคาน์เตอร์)</span>" : "โต๊ะ " + order.table;

        container.innerHTML += `
        <div class="bg-white rounded-xl shadow-sm p-6 px-8 grid grid-cols-12 gap-4 items-center text-center border hover:shadow-md transition-shadow">
            <div class="col-span-3 text-left text-sm font-medium text-slate-500">${timeString}</div>
            <div class="col-span-1 font-bold text-lg text-orange-600 leading-tight">${displayTable}</div>
            <div class="col-span-4 flex justify-center">
                <div class="flex flex-col w-full max-w-[250px] bg-slate-50 p-3 rounded-lg text-left">
                    ${itemsHTML}
                </div>
            </div>
            <div class="col-span-2 font-black text-lg">${order.total}.-</div>
            <div class="col-span-2 font-black ${statusColor} text-lg">${order.status}</div>
        </div>`;
    });
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if(!paginationContainer) return;
    
    const pageCount = Math.ceil(allGroupedOrders.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    if (pageCount <= 1) return; 

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = "w-12 h-12 flex items-center justify-center text-lg rounded-xl transition-all active:scale-95 ";

        if (i === currentPage) {
            btn.className += "bg-primary text-white font-black shadow-lg shadow-primary/30";
        } else {
            btn.className += "bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-50 border border-slate-200";
        }

        btn.addEventListener('click', function() {
            currentPage = i;
            displayItems(currentPage);
            setupPagination(); 
        });
        paginationContainer.appendChild(btn);
    }
}

window.onload = function() {
    renderHistory();
    // รีเฟรชอัตโนมัติทุกๆ 3 วินาที (หากมีการเลือก Filter ค้างไว้ ระบบก็จะจำค่านั้นไว้แล้วกรองให้ตลอด)
    setInterval(renderHistory, 3000); 
};
window.addEventListener("storage", renderHistory);