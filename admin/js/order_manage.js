    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    // เปิด/ปิด แถบด้านข้าง
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
            card.classList.remove('bg-slate-50', 'dark:bg-slate-800/50', 'opacity-75', 'grayscale-[50%]');
            card.classList.add('bg-white', 'dark:bg-slate-900', 'shadow-sm', 'hover:shadow-md');
            title.classList.remove('text-slate-500', 'dark:text-slate-400', 'line-through');
            title.classList.add('text-slate-900', 'dark:text-white');
            statusText.textContent = "พร้อมเสิร์ฟ";
            statusText.className = "text-xs font-medium text-emerald-500";
        } else {
            card.classList.add('bg-slate-50', 'dark:bg-slate-800/50', 'opacity-75', 'grayscale-[50%]');
            card.classList.remove('bg-white', 'dark:bg-slate-900', 'shadow-sm', 'hover:shadow-md');
            title.classList.add('text-slate-500', 'dark:text-slate-400', 'line-through');
            title.classList.remove('text-slate-900', 'dark:text-white');
            statusText.textContent = "วัตถุดิบหมด";
            statusText.className = "text-xs font-medium text-rose-500";
        }
    }

    document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
        const card = toggle.closest('div.rounded-2xl');
        const title = card.querySelector('h3');
        const statusText = card.querySelector('span.text-xs');
        
        // ดึงชื่อ ตัดช่องว่างทิ้ง และแปลงชื่อขนมถ้วยให้ตรงกับหน้าเมนู
        let itemName = title.innerText.trim();
        if (itemName === "ขนมถ้วย") itemName = "ขนมถ้วย (คู่)";

        // โหลดสถานะตอนเริ่มต้น
        if (disabledItems.includes(itemName)) {
            toggle.checked = false;
            updateCardStyle(card, title, statusText, false);
        }

        // เมื่อกดสวิตช์
        toggle.addEventListener('change', function() {
            updateCardStyle(card, title, statusText, this.checked);

            if (this.checked) {
                // ลบออกจากรายการหมด
                disabledItems = disabledItems.filter(item => item !== itemName);
            } else {
                // เพิ่มเข้ารายการหมด
                if (!disabledItems.includes(itemName)) {
                    disabledItems.push(itemName);
                }
            }
            // บันทึกคำสั่งลง LocalStorage
            localStorage.setItem('disabledMenuItems', JSON.stringify(disabledItems));
        });
    });