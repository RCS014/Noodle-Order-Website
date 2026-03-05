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
            if (!timestamp) return "-";
            const date = new Date(timestamp);
            const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            
            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = (date.getFullYear() + 543).toString().slice(-2); // เอา พ.ศ. 2 ตัวท้าย
            const hours = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            
            return `${day} ${month} ${year} , ${hours}:${mins}`;
        }

        function getOrders(){
            return JSON.parse(localStorage.getItem("orderHistory")) || [];
        }

        function saveOrders(data){
            localStorage.setItem("orderHistory", JSON.stringify(data));
        }

        function groupByTable(orders){
            let grouped={};
            orders.forEach(o=>{
                if(!grouped[o.table]) grouped[o.table]=[];
                grouped[o.table].push(o);
            });
            return grouped;
        }

        function renderAdmin(){
            let container=document.getElementById("orderContainer");
            container.innerHTML="";

            let orders=getOrders();

            if(orders.length===0){
                container.innerHTML="<div class='col-span-full flex justify-center text-center text-gray-500 font-bold text-lg mt-10'>ไม่มีออเดอร์ในขณะนี้</div>";
                return;
            }

            let grouped=groupByTable(orders);

            for(let table in grouped){
                let tableBox=document.createElement("div");
                tableBox.className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col h-full";

                let itemsHTML="";
                grouped[table].forEach((item,index)=>{
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
                                สถานะ: <span class="font-bold ${statusColor}">${item.status}</span>
                            </div>
                        </div>
                    </div>`;
                });

                tableBox.innerHTML=`
                <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h2 class="font-black text-2xl text-slate-900 dark:text-white">โต๊ะ <span class="text-primary">${table}</span></h2>
                </div>

                <div class="flex-grow">
                    ${itemsHTML}
                </div>

                <div class="flex gap-3 mt-4 pt-2">
                    <button onclick="markReady('${table}')"
                    class="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
                        ทำเสร็จแล้ว
                    </button>

                    <button onclick="deleteTable('${table}')"
                    class="flex-none bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center" title="ลบออเดอร์">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
                `;

                container.appendChild(tableBox);
            }
        }

        function markReady(table){
            let orders=getOrders();

            orders.forEach(o=>{
                if(o.table===table){
                    o.status="พร้อมเสิร์ฟ";
                }
            });

            saveOrders(orders);
            renderAdmin();
        }

        function deleteTable(table){
            // ยืนยันก่อนลบ ป้องกันการกดผิด
            if(confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบออเดอร์ของ โต๊ะ ${table} ?`)){
                let orders=getOrders();
                orders=orders.filter(o=>o.table!==table);
                saveOrders(orders);
                renderAdmin();
            }
        }

        renderAdmin();
        // รีเฟรชหน้าจออัตโนมัติทุกๆ 3 วินาที เพื่อเช็คออเดอร์ใหม่
        setInterval(renderAdmin, 3000);