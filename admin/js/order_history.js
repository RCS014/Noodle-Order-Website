const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const closeSidebarBtn = document.getElementById('close-sidebar-btn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        function toggleSidebar() { sidebar.classList.toggle('-translate-x-full'); overlay.classList.toggle('hidden'); }
        mobileMenuBtn.addEventListener('click', toggleSidebar); closeSidebarBtn.addEventListener('click', toggleSidebar); overlay.addEventListener('click', toggleSidebar);

        // ==========================================
        // ระบบประวัติ ลบอัตโนมัติ 1 ชม. และ แบ่งหน้า
        // ==========================================

        const itemsPerPage = 10; 
        let currentPage = 1;
        let allGroupedOrders = [];

        function renderHistory() {
            let orders = JSON.parse(localStorage.getItem("orderHistory")) || [];
            const ONE_HOUR = 60 * 60 * 1000;
            const now = Date.now();

            // 1. คัดกรองเก็บเฉพาะข้อมูลที่อายุ "ไม่เกิน 1 ชั่วโมง"
            let validOrders = orders.filter(o => (now - o.queue) <= ONE_HOUR);
            
            // ถ้ามีการลบข้อมูลเก่าทิ้งไป ให้เซฟทับ LocalStorage ใหม่ทันที
            if(validOrders.length !== orders.length) {
                localStorage.setItem("orderHistory", JSON.stringify(validOrders));
            }

            // 2. อัปเดตป้ายกำกับเวลาด้านบน
            let oneHourAgo = new Date(now - ONE_HOUR);
            let timeText = `แสดงประวัติย้อนหลัง 1 ชั่วโมง (ตั้งแต่เวลา ${String(oneHourAgo.getHours()).padStart(2,'0')}:${String(oneHourAgo.getMinutes()).padStart(2,'0')} น.)`;
            document.getElementById('time-label').innerText = timeText;

            // 3. จัดกลุ่มออเดอร์ตามบิล (เวลาที่สั่งพร้อมกัน)
            let grouped = {};
            validOrders.forEach(o => {
                let key = o.queue;
                if (!grouped[key]) {
                    grouped[key] = { time: o.queue, table: o.table, status: "เสิร์ฟแล้ว", total: 0, items: [] };
                }
                grouped[key].items.push(o);
                grouped[key].total += (o.price * o.qty);
                
                // ถ้ายกเลิกคิว ให้เป็นยกเลิก, ถ้ายังทำอยู่ ให้เป็นยังไม่ได้เสิร์ฟ
                if (o.status === "ยกเลิก") grouped[key].status = "ยกเลิก";
                else if (o.status === "กำลังทำ" && grouped[key].status !== "ยกเลิก") grouped[key].status = "ยังไม่ได้เสิร์ฟ";
            });

            // เรียงบิลจาก ใหม่สุด ไป เก่าสุด
            allGroupedOrders = Object.values(grouped).sort((a, b) => b.time - a.time);

            // โชว์ข้อมูลหน้าแรก และสร้างปุ่ม
            displayItems(currentPage);
            setupPagination();
        }

        function displayItems(page) {
            let container = document.getElementById("historyContainer");
            container.innerHTML = "";

            if (allGroupedOrders.length === 0) {
                container.innerHTML = "<p class='text-center py-8 text-slate-500'>ไม่มีประวัติการสั่งอาหารใน 1 ชั่วโมงที่ผ่านมา</p>";
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

                let statusColor = "text-emerald-500"; // เสิร์ฟแล้ว (สีเขียว)
                if (order.status === "ยังไม่ได้เสิร์ฟ") statusColor = "text-amber-500"; // สีส้ม
                if (order.status === "ยกเลิก") statusColor = "text-rose-500"; // สีแดง

                container.innerHTML += `
                <div class="bg-white rounded-xl shadow-sm p-6 px-8 grid grid-cols-12 gap-4 items-center text-center border">
                    <div class="col-span-3 text-left text-sm text-slate-600">${timeString}</div>
                    <div class="col-span-1 font-bold text-lg">${order.table}</div>
                    <div class="col-span-4 flex justify-center">
                        <div class="flex flex-col w-full max-w-[250px] bg-slate-50 p-3 rounded-lg text-left">
                            ${itemsHTML}
                        </div>
                    </div>
                    <div class="col-span-2 font-bold">${order.total}.-</div>
                    <div class="col-span-2 font-bold ${statusColor}">${order.status}</div>
                </div>`;
            });
        }

        function setupPagination() {
            const paginationContainer = document.getElementById('pagination-container');
            const pageCount = Math.ceil(allGroupedOrders.length / itemsPerPage);
            paginationContainer.innerHTML = '';

            if (pageCount <= 1) return; // ไม่สร้างปุ่มถ้ามีหน้าเดียว

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
                    setupPagination(); // วาดปุ่มใหม่เพื่อเปลี่ยนสี
                });
                paginationContainer.appendChild(btn);
            }
        }

        // รันฟังก์ชันตอนโหลดหน้าเว็บ
        window.onload = function() {
            renderHistory();
            // เช็คและลบข้อมูลอัตโนมัติทุกๆ 1 นาที (60000 ms)
            setInterval(renderHistory, 60000); 
        };