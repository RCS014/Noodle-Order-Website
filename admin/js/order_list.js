const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

mobileMenuBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', toggleSidebar);

function formatThaiDate(timestamp) {
    if (!timestamp) return "-";
    
    let ts = Number(timestamp);
    
    // 👉 ตัวดักจับบั๊ก: ถ้าค่าน้อยกว่าปีปัจจุบัน แสดงว่าเป็นเลขคิวพังๆ จากบั๊กเก่า
    if (ts < 1000000000000) {
        return '<span class="text-rose-500 font-bold">ข้อมูลบั๊ก (ให้ลบทิ้ง)</span>';
    }

    const date = new Date(ts);
    const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = (date.getFullYear() + 543).toString().slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} , ${hours}:${mins}`;
}

// โหลดข้อมูลกระดานคิว
function getOrders(){
    return JSON.parse(localStorage.getItem("currentOrders")) || [];
}

// เซฟข้อมูลกระดานคิว
function saveOrders(data){
    localStorage.setItem("currentOrders", JSON.stringify(data));
}

// จับกลุ่มออเดอร์ตามเวลาที่สั่ง (queue)
function groupByQueue(orders){
    let grouped={};
    orders.forEach(o=>{
        if(!grouped[o.queue]) grouped[o.queue]=[];
        grouped[o.queue].push(o);
    });
    return grouped;
}

function renderAdmin(){
    let waitingBox = document.getElementById("queueWaiting");
    let cookingBox = document.getElementById("queueCooking");
    let doneBox = document.getElementById("queueDone");

    if(!waitingBox || !cookingBox || !doneBox) return; 

    waitingBox.innerHTML="";
    cookingBox.innerHTML="";
    doneBox.innerHTML="";

    let orders=getOrders();

    if(orders.length===0){
        waitingBox.innerHTML="<div class='text-gray-500 font-bold text-center'>ไม่มีคิว</div>";
        return;
    }

    let grouped = groupByQueue(orders);
    let sortedQueues = Object.keys(grouped).sort((a,b) => Number(a) - Number(b)); 
    let queueNumberDisplay = 1; 

    sortedQueues.forEach(queue => {
        let table = grouped[queue][0].table;
        let tableBox=document.createElement("div");
        tableBox.className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-full mb-4";

        let itemsHTML="";
        
        grouped[queue].forEach((item,index)=>{
            // 🔴 แก้ตรงนี้: เปลี่ยนจาก item.queue เป็น item.time 
            let timeString = formatThaiDate(item.time); 
            let sizeStr = item.sizeName ? `${item.sizeName}<br>` : "";
            let spicyStr = item.spicy ? `🌶 ${item.spicy}<br>` : "";
            let statusColor = item.status === "พร้อมเสิร์ฟ" ? "text-emerald-500" : "text-rose-500";

            itemsHTML+=`
            <div class="border border-slate-100 dark:border-slate-700 p-4 rounded-xl mb-3 bg-slate-50 dark:bg-slate-800/50 relative">
                <div class="text-[11px] text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1 font-medium">
                    <span class="material-symbols-outlined text-[13px]">schedule</span>
                    สั่งเมื่อ: ${timeString}
                </div>
                <div class="text-slate-700 dark:text-slate-200">
                    <span class="font-bold text-primary text-lg">${item.name}</span> 
                    <span class="font-black text-slate-900 dark:text-white ml-1">x ${item.qty}</span><br>
                    <span class="text-sm text-slate-500 dark:text-slate-400">
                        ${sizeStr}
                        ${spicyStr}
                    </span>
                    <div class="mt-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center">
                        <div>สถานะ: <span class="font-bold ${statusColor}">${item.status}</span></div>
                        ${item.status==="กำลังทำ" ? `
                        <button onclick="finishItem(${index},'${queue}')" class="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded shadow-sm">
                            ทำเสร็จแล้ว
                        </button>
                        ` : ``}
                    </div>
                </div>
            </div>`;
        });

        let mainStatus = "พร้อมเสิร์ฟ";
        if(grouped[queue].some(i => i.status === "รอคิว")) mainStatus = "รอคิว";
        else if(grouped[queue].some(i => i.status === "กำลังทำ")) mainStatus = "กำลังทำ";

        tableBox.innerHTML=`
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 class="font-black text-2xl text-slate-900 dark:text-white">คิว <span class="text-primary">${queueNumberDisplay++}</span>
            <span class="ml-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm">
            โต๊ะ ${table}
            </span></h2>
        </div>
        <div class="flex-grow">${itemsHTML}</div>
        <div class="flex gap-3 mt-4 pt-2">

        ${mainStatus==="รอคิว" ? `
        <button onclick="receiveQueue('${queue}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md">
            รับคิว
        </button>` : ``}

        ${mainStatus==="กำลังทำ" ? `
        <button onclick="markReady('${queue}')" class="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-md">
            พร้อมเสิร์ฟ
        </button>` : ``}

        ${mainStatus==="พร้อมเสิร์ฟ" ? `
        <button onclick="finishTable('${queue}')" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md">
            จบออเดอร์
        </button>` : ``}

        ${mainStatus !== "พร้อมเสิร์ฟ" ? `
        <button onclick="openDeleteModal('${table}', '${queue}')" class="flex-none bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold px-4 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined">delete</span>
        </button>
        ` : ``}

        </div>`;

        if(mainStatus === "รอคิว") waitingBox.appendChild(tableBox);
        else if(mainStatus === "กำลังทำ") cookingBox.appendChild(tableBox);
        else doneBox.appendChild(tableBox);
    });
}

function finishItem(index, queueId){
    let orders = getOrders();
    let itemsInQueue = orders.filter(o => String(o.queue) === String(queueId));
    if(itemsInQueue[index]) {
        itemsInQueue[index].status = "พร้อมเสิร์ฟ"; 
    }
    saveOrders(orders);
    renderAdmin();
}

function receiveQueue(queueId){
    let orders = getOrders();
    orders.forEach(o=>{ if(String(o.queue) === String(queueId)) o.status = "กำลังทำ"; });
    saveOrders(orders);
    renderAdmin();
}

function markReady(queueId){
    let orders = getOrders();
    orders.forEach(o=>{ if(String(o.queue) === String(queueId)) o.status = "พร้อมเสิร์ฟ"; });
    saveOrders(orders);
    renderAdmin();
}

// จบออเดอร์ (โต๊ะกินเสร็จ/จ่ายเงิน) - ย้ายไป History เป็นสถานะ "เสิร์ฟแล้ว"
function finishTable(queueId){
    if(confirm(`ยืนยันการจบออเดอร์ (ลูกค้าจ่ายเงินแล้ว)?`)){
        let orders = getOrders();
        let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
        
        let tableOrders = orders.filter(o => String(o.queue) === String(queueId));
        tableOrders.forEach(o => o.status = "เสิร์ฟแล้ว");
        
        history = history.concat(tableOrders);
        localStorage.setItem("orderHistory", JSON.stringify(history));
        
        orders = orders.filter(o => String(o.queue) !== String(queueId));
        saveOrders(orders);
        renderAdmin();
    }
}


// ==========================================
// ระบบ Modal ลบออเดอร์ / ยกเลิก
// ==========================================
let queueToDelete = null; 

function openDeleteModal(table, queueId) {
    queueToDelete = queueId; 
    let modal = document.getElementById('delete-modal');
    
    if (modal) {
        document.getElementById('delete-table-number').innerText = `โต๊ะ ${table}`;
        modal.classList.remove('hidden');
    } else {
        if(confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ยกเลิก ออเดอร์ของ โต๊ะ ${table} ?`)){
            confirmDeleteAction();
        }
    }
}

function confirmDeleteAction() {
    if (queueToDelete !== null) {
        let orders = getOrders();
        let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
        
        let tableOrders = orders.filter(o => String(o.queue) === String(queueToDelete));
        
        // 🔴 สำคัญ: ต้องเปลี่ยนสถานะเป็น "ยกเลิก" ก่อนย้ายไป History 
        // ไม่งั้น History จะมองไม่เห็น หรือดึงไปแสดงผิดสี
        tableOrders.forEach(o => o.status = "ยกเลิก"); 
        
        history = history.concat(tableOrders);
        localStorage.setItem("orderHistory", JSON.stringify(history));
        
        orders = orders.filter(o => String(o.queue) !== String(queueToDelete));
        saveOrders(orders);
        
        renderAdmin(); 
        queueToDelete = null; 
    }
}

// ผูกคำสั่งกับปุ่มใน Modal
document.addEventListener('DOMContentLoaded', () => {
    let confirmBtn = document.getElementById('confirm-delete-btn');
    let cancelBtn = document.getElementById('cancel-delete-btn');
    let modal = document.getElementById('delete-modal');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            confirmDeleteAction(); 
            modal.classList.add('hidden'); 
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden'); 
            queueToDelete = null; 
        });
    }
});

// เริ่มการทำงาน
renderAdmin();
setInterval(renderAdmin, 3000);
window.addEventListener("storage",renderAdmin);