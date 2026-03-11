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
// ฟังก์ชันล้างประวัติ (ที่กดจากปุ่มสีแดง)
// ==========================================
function clearHistory() {
    if(confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการ 'ล้างประวัติทั้งหมด'?\n(เฉพาะรายการที่เสิร์ฟแล้วและยกเลิก คิวที่กำลังทำอยู่จะไม่หาย)")) {
        localStorage.removeItem("orderHistory"); // ลบเฉพาะประวัติ
        currentPage = 1;
        renderHistory(); // รีเฟรชหน้าจอ
        alert("ล้างประวัติเรียบร้อยแล้ว!");
    }
}

// ==========================================
// ระบบดึงประวัติ
// ==========================================
function renderHistory() {
    let historyOrders = JSON.parse(localStorage.getItem("orderHistory")) || [];
    let currentOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
    
    // รวมบิลทั้งหมด (ทั้งคิวปัจจุบัน และประวัติที่เสร็จ/ยกเลิกแล้ว)
    let allDisplayOrders = historyOrders.concat(currentOrders);

    // ซ่อนข้อความแจ้ง 1 ชม. ถ้ามี
    let labelEl = document.getElementById('time-label');
    if(labelEl) labelEl.style.display = 'none';

    let grouped = {};
    allDisplayOrders.forEach(o => {
        // 🔴 ยันต์กันบั๊ก 1 ม.ค. 13: ถ้าเวลาพัง หรือเป็นเลขน้อยๆ ให้บังคับใช้วันนี้เวลานี้เลย!
        let orderTime = o.time;
        if (!orderTime || orderTime < 1000000000000) {
            orderTime = Date.now(); 
        }

        let key = orderTime; // ใช้เวลาที่แก้แล้วเป็นรหัสบิล
        
        if (!grouped[key]) {
            grouped[key] = { 
                time: orderTime, 
                queue: o.queue || "-", 
                table: o.table, 
                status: "เสิร์ฟแล้ว", 
                total: 0, 
                items: [] 
            };
        }
        grouped[key].items.push(o);
        grouped[key].total += (o.price * o.qty);
        
        // เช็คสถานะ
        if (o.status === "ยกเลิก") grouped[key].status = "ยกเลิก";
        else if ((o.status === "กำลังทำ" || o.status === "รอคิว") && grouped[key].status !== "ยกเลิก") {
            grouped[key].status = "ยังไม่ได้เสิร์ฟ";
        }
    });

    // เรียงจากสั่งใหม่สุด (เวลาล่าสุด) ไป เก่าสุด
    allGroupedOrders = Object.values(grouped).sort((a, b) => b.time - a.time);

    displayItems(currentPage);
    setupPagination();
}

function displayItems(page) {
    let container = document.getElementById("historyContainer");
    if(!container) return;
    container.innerHTML = "";

    if (allGroupedOrders.length === 0) {
        container.innerHTML = "<p class='text-center py-8 text-slate-500 font-medium'>ไม่มีประวัติการสั่งอาหาร</p>";
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = allGroupedOrders.slice(start, end);

    itemsToShow.forEach(order => {
        let dateObj = new Date(order.time);
        
        // แสดงวันที่และเวลาให้ชัดเจน (เช่น 12 มี.ค. 69, 14:30 น.)
        let timeString = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) + 
                         " , " + 
                         dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + " น.";
        
        let itemsHTML = order.items.map(i => `
            <div class="flex gap-4 border-b border-slate-100 pb-1 mb-1 last:border-0 items-start">
                <span class="font-black text-primary w-6 text-right shrink-0">x${i.qty}</span>
                <span class="text-sm text-slate-700 leading-tight">
                    ${i.name} 
                    ${i.spicy && i.spicy !== "ไม่เผ็ด" ? '<br><span class="text-xs text-rose-500">(🌶 '+i.spicy+')</span>' : ''}
                </span>
            </div>
        `).join('');

        let statusColor = "text-emerald-500"; 
        if (order.status === "ยังไม่ได้เสิร์ฟ") statusColor = "text-amber-500"; 
        if (order.status === "ยกเลิก") statusColor = "text-rose-500"; 

        container.innerHTML += `
        <div class="bg-white rounded-xl shadow-sm p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-center border border-slate-200 hover:shadow-md transition-shadow mb-4">
            
            <div class="col-span-1 md:col-span-3 text-left flex flex-col items-center md:items-start border-b md:border-b-0 pb-3 md:pb-0">
                <span class="font-black text-slate-800 text-lg">คิวที่ ${order.queue}</span>
                <span class="text-xs text-slate-500 mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> ${timeString}</span>
            </div>
            
            <div class="col-span-1 md:col-span-2">
                <div class="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-lg font-bold text-lg">โต๊ะ ${order.table}</div>
            </div>
            
            <div class="col-span-1 md:col-span-4 flex justify-center">
                <div class="flex flex-col w-full max-w-sm bg-slate-50 p-3 rounded-lg text-left border border-slate-100">
                    ${itemsHTML}
                </div>
            </div>
            
            <div class="col-span-1 md:col-span-1 font-black text-xl text-slate-800">${order.total}.-</div>
            
            <div class="col-span-1 md:col-span-2 font-bold ${statusColor} text-lg md:text-base">${order.status}</div>
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
        btn.className = "w-10 h-10 flex items-center justify-center text-base rounded-xl transition-all active:scale-95 mx-1 ";

        if (i === currentPage) {
            btn.className += "bg-primary text-white font-black shadow-md shadow-primary/30";
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
    // รีเฟรชแบบเงียบๆ ทุกๆ 3 วินาที เพื่อดูออเดอร์เข้าใหม่แบบ Real-time
    setInterval(renderHistory, 3000); 
};
window.addEventListener("storage", renderHistory);