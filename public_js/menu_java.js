let selectedNoodle=null;
let selectedSoup=null;
let cart=[];
let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

// 1. 👉 ดึงรายการของที่ "หมด" มาจากระบบ (LocalStorage)
let disabledItems = JSON.parse(localStorage.getItem('disabledMenuItems')) || [];

/* ===== ระบบเครื่องเคียงครบ ===== */
const sides=[
{name:"ผักบุ้งลวก",price:10},
{name:"กากหมู",price:20},
{name:"หมูลวก",price:60},
{name:"แคปหมู",price:20},
{name:"เนื้อลวก",price:60},
{name:"ลูกชิ้นลวก",price:20},
{name:"ตับลวก",price:60},
{name:"ข้าวเปล่า",price:10},
{name:"ขนมถ้วย (คู่)",price:12}
];

const sideContainer=document.getElementById("sideMenu");

sides.forEach((item,i)=>{
    // 2. 👉 เช็คว่าเครื่องเคียงชิ้นนี้ "หมด" หรือไม่
    let isOut = disabledItems.includes(item.name);
    
    // 3. 👉 ปรับหน้าตาให้เป็นสีเทาและกดไม่ได้ ถ้าของหมด
    sideContainer.innerHTML+=`
    <div class="border p-4 rounded-xl shadow-sm space-y-3 ${isOut ? 'bg-gray-100 opacity-60 grayscale' : 'bg-white'}">
        <div class="flex items-center gap-2">
            <input type="checkbox" id="side${i}" ${isOut ? 'disabled' : ''}>
            <label for="side${i}" class="font-medium ${isOut ? 'line-through text-gray-500' : ''}">
                ${item.name} (${item.price} บาท) ${isOut ? '<span class="text-red-500 text-sm ml-1">(หมด)</span>' : ''}
            </label>
        </div>
        <div class="flex items-center gap-2 pl-6">
            <button onclick="changeSideQty(${i},-1)" class="bg-gray-200 w-9 h-9 rounded-lg" ${isOut ? 'disabled' : ''}>➖</button>
            <input type="number" id="qty${i}" value="1" min="1" class="w-16 text-center border rounded p-1" ${isOut ? 'disabled' : ''}>
            <button onclick="changeSideQty(${i},1)" class="bg-gray-200 w-9 h-9 rounded-lg" ${isOut ? 'disabled' : ''}>➕</button>
        </div>
    </div>`;
});

function showToast(msg){
    const t=document.getElementById("toast");
    t.innerText=msg;
    t.classList.remove("hidden");
    setTimeout(()=>t.classList.add("hidden"),1500);
}

function switchPage(p){
    document.getElementById("noodlePage").classList.toggle("hidden",p!=="noodle");
    document.getElementById("sidePage").classList.toggle("hidden",p!=="side");
}

function singleSelect(id,cb){
    document.getElementById(id).querySelectorAll("button").forEach(btn=>{
        btn.onclick=()=>{
            // 4. 👉 ป้องกันไม่ให้ลูกค้าคลิกเลือกปุ่มที่ของหมดแล้วได้
            if(btn.hasAttribute('disabled')) return;
            
            document.getElementById(id).querySelectorAll("button").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            cb(btn.dataset.name);
        };
    });
}
singleSelect("noodles",n=>selectedNoodle=n);
singleSelect("soups",s=>selectedSoup=s);

function changeMainQty(x){
    let q=document.getElementById("qty");
    let val=parseInt(q.value)+x;
    if(val<1) val=1;
    q.value=val;
}

function changeSideQty(i,x){
    let q=document.getElementById("qty"+i);
    let val=parseInt(q.value)+x;
    if(val<1) val=1;
    q.value=val;
}

/* ===== addNoodle ตามคำสั่ง ===== */
function addNoodle(){
    if(!selectedNoodle||!selectedSoup){
        showToast("กรุณาเลือกเส้นและน้ำซุป");
        return;
    }

    let meats=[...document.querySelectorAll(".meat:checked")].map(m=>m.value);
    let meatText=meats.length?meats.join(", "):"ไม่เลือกเนื้อ";
    let veg=document.getElementById("vegetable").value;

    let sizeSelect=document.getElementById("size");
    let sizeText=sizeSelect.options[sizeSelect.selectedIndex].text;

    let qty=parseInt(document.getElementById("qty").value);

    let newItem={
        table:document.getElementById("table").value,
        name:selectedNoodle+" "+selectedSoup+" ("+meatText+", "+veg+")",
        spicy:document.getElementById("spicy").value,
        price:parseInt(sizeSelect.value),
        sizeName:sizeText,
        qty:qty,
        status:"รอคิว"
    };

    mergeItem(newItem);
    document.getElementById("qty").value=1;
    // เคลียร์ค่าเนื้อที่ถูกติ๊ก (ยกเว้นอันที่ถูกล็อกพังไว้)
    document.querySelectorAll(".meat:not([disabled])").forEach(m=>m.checked=false);
    showToast("เพิ่มรายการแล้ว");
}

function confirmSides(){
    sides.forEach((item,i)=>{
        let check=document.getElementById("side"+i);
        // 5. 👉 ป้องกันการกดสั่งของที่หมดไปแล้ว
        if(check && check.checked && !check.disabled){
            let qty=parseInt(document.getElementById("qty"+i).value);
            mergeItem({
                table:document.getElementById("table").value,
                name:item.name,
                price:item.price,
                qty:qty,
                status:"รอคิว"
            });
            check.checked=false;
            document.getElementById("qty"+i).value=1;
        }
    });
    showToast("เพิ่มเครื่องเคียงแล้ว");
}

function mergeItem(newItem){
    let existing=cart.find(i=>
        i.name===newItem.name &&
        i.price===newItem.price &&
        i.table===newItem.table
    );
    if(existing){
        existing.qty+=newItem.qty;
    }else{
        cart.push(newItem);
    }
    updateCart();
}

function updateCart(){
    let c=0;
    cart.forEach(i=>c+=i.qty);
    document.getElementById("cartCount").innerText=c;
}

function openCart(){
    renderCart();
    document.getElementById("cartModal").classList.remove("hidden");
}

function closeCart(){
    document.getElementById("cartModal").classList.add("hidden");
}

function renderCart(){
    let total=0;
    const box=document.getElementById("cartItems");
    box.innerHTML="";
    cart.forEach((i,idx)=>{
        let sum=i.price*i.qty; total+=sum;
        box.innerHTML+=`
        <div class="border p-2 rounded flex justify-between">
            <div>
            โต๊ะ ${i.table}<br>
            ${i.name}<br>
            ${i.spicy ? "🌶 "+i.spicy+"<br>" : ""}
            ${i.sizeName ? i.sizeName+" * "+i.qty : i.price+" x "+i.qty}<br>
            </div>
            <div>
            ${sum} บาท
            <button onclick="removeItem(${idx})" class="text-red-500 ml-2">ลบ</button>
            </div>
        </div>`;
    });
    document.getElementById("totalPrice").innerText=total+" บาท";
}

function removeItem(i){
    cart.splice(i,1);
    updateCart();
    renderCart();
    showToast("ลบแล้ว");
}

function clearCart(){
    cart=[];
    updateCart();
    renderCart();
    showToast("ลบทั้งหมดแล้ว");
}

function confirmOrder(){

    if(cart.length===0){
        showToast("ยังไม่มีรายการ");
        return;
    }

    let currentOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];

    // หา queue ล่าสุด
    let lastQueue = 0;
    currentOrders.forEach(o=>{
        if(o.queue > lastQueue){
            lastQueue = o.queue;
        }
    });

    // คิวใหม่
    let queueNumber = lastQueue + 1;

    let table = document.getElementById("table").value;

    cart.forEach(i=>{
        i.queue = queueNumber;
        i.table = table;
        i.status = "รอคิว";
        i.time = Date.now();
    });

    currentOrders = currentOrders.concat(cart);

    localStorage.setItem("currentOrders", JSON.stringify(currentOrders));

    localStorage.setItem("currentTable", table);
    localStorage.setItem("selectedStatusTable", table);

    cart=[];
    updateCart();
    closeCart();

    showToast("ส่งออเดอร์เรียบร้อย");

    setTimeout(()=>{
        window.location.href="status.html";
    },800);
}

function checkOldStatus(){
    let table=document.getElementById("table").value;
    localStorage.setItem("selectedStatusTable", table);
    let box=document.getElementById("statusNotice");
    
    // เช็คจากประวัติล่าสุดเสมอ
    let latestOrders = JSON.parse(localStorage.getItem("currentOrders")) || [];
    let oldOrders=latestOrders.filter(o=>o.table===table);

    box.classList.remove("hidden");

    if(oldOrders.length===0){
        box.innerHTML="❌ โต๊ะนี้ยังไม่มีรายการที่สั่ง กรุณาสั่งอาหาร";
    }else{
        box.innerHTML=`
        📋 โต๊ะนี้มีรายการเดิมอยู่
        <button onclick="window.location.href='status.html'" 
        class="ml-2 bg-orange-600 text-white px-3 py-1 rounded-lg text-sm">
        ดูสถานะ
        </button>`;
    }
}

// 6. 👉 ฟังก์ชันไล่ปิดกั้นปุ่มกดและช่องติ๊กถูกของเมนูที่ "วัตถุดิบหมด"
function applyDisabledMenuItems() {
    // ปิดกั้นปุ่ม เส้น และ น้ำซุป
    document.querySelectorAll('#noodles button, #soups button').forEach(btn => {
        let itemName = btn.dataset.name;
        if (disabledItems.includes(itemName)) {
            btn.setAttribute('disabled', 'true');
            // เพิ่มดีไซน์ให้ดูรู้ว่าของหมด (สีเทา ขีดฆ่า)
            btn.classList.add('opacity-50', 'bg-gray-100', 'text-gray-400', 'line-through', 'cursor-not-allowed');
            btn.classList.remove('hover:bg-orange-100');
        }
    });

    // ปิดกั้นช่องติ๊กถูกเลือก เนื้อสัตว์
    document.querySelectorAll('.meat').forEach(checkbox => {
        let itemName = checkbox.value;
        if (disabledItems.includes(itemName)) {
            checkbox.disabled = true;
            let label = checkbox.parentElement;
            // เพิ่มดีไซน์ให้ดูรู้ว่าของหมด (สีเทา ขีดฆ่า)
            label.classList.add('opacity-50', 'text-gray-400', 'line-through', 'cursor-not-allowed');
        }
    });
}

// โหลดฟังก์ชันทั้งหมดเมื่อเปิดหน้าเว็บ
window.onload = function() {
    checkOldStatus();
    applyDisabledMenuItems(); // สั่งรันฟังก์ชันปิดเมนู
};