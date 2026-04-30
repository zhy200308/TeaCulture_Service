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
            // 调用后端搜索接口
            const result = await API.Search.search(keyword);
            if (result.code === 200 && result.data) {
                const total = (result.data.knowledge?.length || 0)
                    + (result.data.topics?.length || 0)
                    + (result.data.scenarios?.length || 0)
                    + (result.data.foodMatches?.length || 0);
                if (total === 0) {
                    alert('未找到与"' + keyword + '"相关的内容');
                    return;
                }
                // 优先跳转命中最多的板块
                if (result.data.knowledge?.length > 0) {
                    location.href = `pages/basic.html?keyword=${encodeURIComponent(keyword)}`;
                } else if (result.data.topics?.length > 0) {
                    location.href = `pages/advanced.html?keyword=${encodeURIComponent(keyword)}`;
                } else if (result.data.scenarios?.length > 0) {
                    location.href = `pages/scenario.html?keyword=${encodeURIComponent(keyword)}`;
                } else {
                    location.href = `pages/tea-food.html?keyword=${encodeURIComponent(keyword)}`;
                }
            } else {
                alert(result.message || '搜索失败');
            }
        }
    });
}

// ===================== 4. 退出登录 =====================
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('a[href*="login.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await API.Auth.logout();
            TokenManager.clear();
            window.location.href = './pages/login.html';
        });
    }
});
