        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const closeSidebarBtn = document.getElementById('close-sidebar-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        function toggleSidebar() {
            // สลับคลาส translate-x-full เพื่อเลื่อนเข้า/ออก
            sidebar.classList.toggle('-translate-x-full');
            // สลับการแสดงผล Overlay
            overlay.classList.toggle('hidden');
        }

        // ผูก Event Click กับปุ่มและ Overlay
        mobileMenuBtn.addEventListener('click', toggleSidebar);
        closeSidebarBtn.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);

        // =====================================
        // ฟังก์ชันแปลงเวลาเป็นรูปแบบไทย
        // =====================================
        function formatThaiDate(timestamp) {
            let ts = Number(timestamp);
    
            // 🛡️ ยันต์กันบั๊ก 1 ม.ค. 13: ถ้าเลขเวลาน้อยผิดปกติ (เช่น เลข 1,2,3) ให้บังคับใช้เวลา ณ ปัจจุบันเลย
            if (!ts || ts < 1000000000000) {
                ts = Date.now(); 
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

        function getOrders(){
            return JSON.parse(localStorage.getItem("currentOrders")) || [];
        }

        function reorderQueue(){

            let orders = JSON.parse(localStorage.getItem("currentOrders")) || [];

            // sort ตาม queue
            orders.sort((a,b)=>a.queue-b.queue);

            let queueMap={};
            let newQueue=1;

            orders.forEach(o=>{
                if(!queueMap[o.queue]){
                    queueMap[o.queue]=newQueue++;
                }
                o.queue=queueMap[o.queue];
            });

            localStorage.setItem("currentOrders",JSON.stringify(orders));
        }

        function saveOrders(data){
            localStorage.setItem("orderHistory", JSON.stringify(data));
        }

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

            waitingBox.innerHTML="";
            cookingBox.innerHTML="";
            doneBox.innerHTML="";

            let orders=getOrders();

            if(orders.length===0){
                waitingBox.innerHTML="<div class='text-gray-500 font-bold'>ไม่มีคิว</div>";
                cookingBox.innerHTML="";
                doneBox.innerHTML="";
                return;
            }

            let grouped=groupByQueue(orders);

            for(let queue in grouped){
                let table = grouped[queue][0].table;
                let tableBox=document.createElement("div");
                tableBox.className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-full";

                let itemsHTML="";
                
                grouped[queue].forEach((item,index)=>{
                    // แปลงเวลาจาก queue (timestamp) มาเป็นข้อความ
                    let timeString = formatThaiDate(item.queue);

                    // ตรวจสอบว่ามีข้อมูล sizeName และ spicy ไหม ป้องกันการแสดงคำว่า undefined
                    let sizeStr = item.sizeName ? `${item.sizeName}<br>` : "";
                    let spicyStr = item.spicy ? `🌶 ${item.spicy}<br>` : "";
                    
                    // เปลี่ยนสีสถานะให้ดูง่ายขึ้น
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
                            <div class="mt-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-2">
                            สถานะ: <span class="font-bold ${statusColor}">
                            ${item.status}

                            ${item.status==="กำลังทำ" ? `
                            <button onclick="finishItem(${index},'${table}')"
                            class="text-xs bg-green-500 text-white px-2 py-1 rounded ml-2">
                            ทำเสร็จแล้ว
                            </button>
                            ` : ``}

                            </span>
                            </div>
                        </div>
                    </div>`;
                });

                tableBox.innerHTML=`
                <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h2 class="font-black text-2xl text-slate-900 dark:text-white">คิว <span class="text-primary">${queue}</span>
                    <span class="ml-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm">
                    โต๊ะ ${grouped[queue][0].table}
                    </span></h2>
                </div>

                <div class="flex-grow">
                    ${itemsHTML}
                </div>

                <div class="flex gap-3 mt-4 pt-2">

                ${grouped[queue][0].status==="รอคิว" ? `
                <button onclick="receiveQueue('${table}')"
                class="flex-1 bg-blue-500 text-white font-bold py-3 rounded-xl">
                รับคิว
                </button>
                ` : ``}

                ${grouped[queue][0].status==="กำลังทำ" ? `
                <button onclick="markReady('${table}')"
                class="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl">
                พร้อมเสิร์ฟ
                </button>
                ` : ``}

                <button onclick="deleteTable('${table}')"
                class="flex-none bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold px-4 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined">delete</span>
                </button>

                </div>
                `;

                let status = grouped[queue][0].status;

                if(status === "รอคิว"){
                    waitingBox.appendChild(tableBox);
                }
                else if(status === "กำลังทำ"){
                    cookingBox.appendChild(tableBox);
                }
                else if(status === "พร้อมเสิร์ฟ"){
                    doneBox.appendChild(tableBox);
                }
            }
        }

        function receiveQueue(table){

            let orders = JSON.parse(localStorage.getItem("currentOrders")) || [];

            orders.forEach(o=>{
            if(String(o.table) === String(table)){
            o.status = "กำลังทำ";
            }
            });

            localStorage.setItem("currentOrders", JSON.stringify(orders));

            renderAdmin();

        }

        function markReady(table){

            let orders = JSON.parse(localStorage.getItem("currentOrders")) || [];

            orders.forEach(o=>{
                if(String(o.table) === String(table)){
                    o.status = "พร้อมเสิร์ฟ";
                }
            });

    localStorage.setItem("currentOrders", JSON.stringify(orders));

    renderAdmin();

}

        function deleteTable(table){

            if(confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์ของ โต๊ะ ${table} ?`)){
                let orders = JSON.parse(localStorage.getItem("currentOrders")) || [];
                let history = JSON.parse(localStorage.getItem("orderHistory")) || [];
                table = String(table);
                let tableOrders = orders.filter(o => String(o.table) === table);
                history = history.concat(tableOrders);
                localStorage.setItem("orderHistory", JSON.stringify(history));
                orders = orders.filter(o => String(o.table) !== table);
                localStorage.setItem("currentOrders", JSON.stringify(orders));

                reorderQueue(); // จัดคิวใหม่

                renderAdmin();
            }
        }

        renderAdmin();
        // รีเฟรชหน้าจออัตโนมัติทุกๆ 3 วินาที เพื่อเช็คออเดอร์ใหม่
        setInterval(renderAdmin, 3000);

        function finishItem(index,table){

            let orders = JSON.parse(localStorage.getItem("currentOrders")) || [];

            let count=0;

            orders.forEach(o=>{

            if(String(o.table)===String(table)){

            if(count===index){
            o.status="กำลังทำ";
            }

            count++;

            }

            });

            localStorage.setItem("currentOrders",JSON.stringify(orders));

            renderAdmin();

            }

            function init(){
    renderAdmin();
    setInterval(renderAdmin,2000);
}

init();

            renderAdmin();
            setInterval(renderAdmin,2000);

            window.addEventListener("storage",renderAdmin);