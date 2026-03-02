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