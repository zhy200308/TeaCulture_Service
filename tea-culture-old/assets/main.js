// 1. 轮播图
const wrapper = document.getElementById('carouselWrapper');
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');
const items = document.querySelectorAll('.carousel-item');
const count = items.length;
let index = 0;

function updateCarousel() {
    wrapper.style.transform = `translateX(-${index * 100}%)`;
}

prev.addEventListener('click', () => {
    index = (index - 1 + count) % count;
    updateCarousel();
});

next.addEventListener('click', () => {
    index = (index + 1) % count;
    updateCarousel();
});

setInterval(() => {
    index = (index + 1) % count;
    updateCarousel();
}, 5000);

// 2. 页面跳转
function jumpPage(url) {
    window.location.href = url;
}

const mask = document.getElementById('mask');
const userPopup = document.getElementById('userPopup');
const regPopup = document.getElementById('regPopup');

document.getElementById('openUser').onclick = () => {
    userPopup.style.display = 'block';
    mask.style.display = 'block';
};

// 关闭所有弹窗
document.getElementById('closeUser').onclick = closeAll;
document.getElementById('closeReg').onclick = closeAll;
mask.onclick = closeAll;


function closeAll() {
    userPopup.style.display = 'none';
    regPopup.style.display = 'none';
    mask.style.display = 'none';
}


// 用户登录 
function userLogin() {
    const username = userPopup.querySelectorAll('input')[0].value.trim();
    const pwd = userPopup.querySelectorAll('input')[1].value.trim();

    if (username === 'aaa' && pwd === '123456') {
        closeAll();
     
        location.href = "./pages/user.html";
    } else {
        alert('账号或密码错误！');
    }
}

// 注册功能

document.getElementById('openReg').onclick = function(){
    userPopup.style.display = 'none';
    regPopup.style.display = 'block';
    mask.style.display = 'block';
};

document.getElementById('backLogin').onclick = function(){
    regPopup.style.display = 'none';
    userPopup.style.display = 'block';
};

function userReg(){
    let user = regPopup.querySelectorAll('input')[0].value.trim();
    let pwd1 = regPopup.querySelectorAll('input')[1].value.trim();
    let pwd2 = regPopup.querySelectorAll('input')[2].value.trim();

    if(!user || !pwd1 || !pwd2){
        alert('请完善注册信息');
        return;
    }
    if(pwd1 !== pwd2){
        alert('两次密码不一致');
        return;
    }
    alert('注册成功！请前往登录');
    regPopup.style.display = 'none';
    userPopup.style.display = 'block';
}
// 搜索功能
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let keyword = searchInput.value.trim();
        if (!keyword) {
            alert('请输入搜索关键词');
            return;
        }

        switch(keyword){
            case "基础茶识":
            case "茶叶":
                location.href = "./pages/basic.html";
                break;
            case "进阶专题":
            case "非遗":
                location.href = "./pages/advanced.html";
                break;
            case "场景教程":
            case "冲泡":
                location.href = "./pages/scenario.html";
                break;
            case "茶食搭配":
                location.href = "./pages/tea-food.html";
                break;
            case "好物推荐":
            case "茶器":
                location.href = "./pages/goods.html";
                break;
            default:
                location.href = `pages/basic.html?keyword=${encodeURIComponent(keyword)}`;
        }
    }
});