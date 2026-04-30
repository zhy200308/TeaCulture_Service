/**
 * main.js - 首页逻辑
 * 对接接口：
 *   - GET /api/search （全站搜索）
 *   - POST /api/auth/logout
 */

// ===================== 1. 轮播图 =====================
const wrapper = document.getElementById('carouselWrapper');
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');
const items = document.querySelectorAll('.carousel-item');
const count = items.length;
let index = 0;

function updateCarousel() {
    if (wrapper) wrapper.style.transform = `translateX(-${index * 100}%)`;
}

if (prev) {
    prev.addEventListener('click', () => {
        index = (index - 1 + count) % count;
        updateCarousel();
    });
}
if (next) {
    next.addEventListener('click', () => {
        index = (index + 1) % count;
        updateCarousel();
    });
}
if (count > 0) {
    setInterval(() => {
        index = (index + 1) % count;
        updateCarousel();
    }, 5000);
}

// ===================== 2. 页面跳转 =====================
function jumpPage(url) {
    window.location.href = url;
}
window.jumpPage = jumpPage;

// ===================== 3. 搜索（调用后端接口） =====================
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            if (!keyword) {
                alert('请输入搜索关键词');
                return;
            }
            location.href = `pages/search.html?keyword=${encodeURIComponent(keyword)}`;
        }
    });
}

// ===================== 4. 退出登录 =====================
 
