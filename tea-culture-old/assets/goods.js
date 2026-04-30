// goods.js 

const goodsDetail = {
    "tea-set-bowl": `
        <h3>手工白瓷盖碗</h3>
        <img src="../images/6.png" alt="白瓷盖碗">
        <p class="goods-info"><strong>规格</strong>：100ml容量，口径9cm，高7cm</p>
        <p class="goods-info"><strong>材质</strong>：高岭土白瓷，1300℃高温烧制，无铅无镉</p>
        <p class="goods-info"><strong>特点</strong>：薄胎透光，手感轻盈，不吸味不串味，能真实展现茶叶本味，适配绿茶、红茶、乌龙茶等所有茶类。</p>
        <p class="goods-info"><strong>使用建议</strong>：首次使用前用沸水烫洗3次；避免骤冷骤热，防止开裂。</p>
        <div class="tips-box"><h4>小贴士</h4><p>新手建议选择100ml容量，易掌握出汤速度；清洗时用软布擦拭，无需用洗洁精。</p></div>
    `,
    "tea-leaf-longjing": `
        <h3>明前龙井新茶</h3>
        <img src="../images/6.1.png" alt="明前龙井">
        <p class="goods-info"><strong>规格</strong>：50g/罐，密封铝罐包装</p>
        <p class="goods-info"><strong>产地</strong>：浙江杭州西湖龙井核心产区</p>
        <p class="goods-info"><strong>特点</strong>：明前采摘，一芽一叶，外形扁平挺直，豆香浓郁，汤色嫩绿明亮，口感鲜爽回甘。</p>
        <p class="goods-info"><strong>冲泡建议</strong>：80℃水温，先注水后投茶，焖泡2分钟即可饮用。</p>
        <div class="tips-box"><h4>小贴士</h4><p>开封后建议冷藏保存，6个月内饮用完毕；适合春季饮用，清热解暑。</p></div>
    `,
    "accessory-towel": `
        <h3>纯棉吸水茶巾</h3>
        <img src="../images/6.2.png" alt="纯棉茶巾">
        <p class="goods-info"><strong>规格</strong>：25*25cm，加厚款（300g/㎡）</p>
        <p class="goods-info"><strong>材质</strong>：100%纯棉，无荧光剂，不掉毛不掉色</p>
        <p class="goods-info"><strong>特点</strong>：吸水性是普通毛巾的3倍，快速吸干茶盘水渍，边缘锁边工艺，耐磨耐用，可机洗。</p>
        <p class="goods-info"><strong>使用建议</strong>：使用后及时清洗晾干，避免长时间潮湿滋生细菌。</p>
        <div class="tips-box"><h4>小贴士</h4><p>建议备2-3条轮换使用；深色茶巾更耐脏，适合日常茶盘擦拭。</p></div>
    `,
    "tea-set-zisha": `
        <h3>宜兴紫砂小壶</h3>
        <img src="../images/6.3.png" alt="紫砂小壶">
        <p class="goods-info"><strong>规格</strong>：120ml容量，原矿紫泥，手工制作</p>
        <p class="goods-info"><strong>产地</strong>：江苏宜兴丁蜀镇</p>
        <p class="goods-info"><strong>特点</strong>：透气性佳，不夺茶香，能提升乌龙茶、普洱茶的口感，使用越久，壶身越温润有光泽。</p>
        <p class="goods-info"><strong>养护建议</strong>：首次使用前用茶叶煮30分钟；日常只用清水清洗，不使用洗洁精。</p>
        <div class="tips-box"><h4>小贴士</h4><p>一把壶建议固定冲泡一种茶，避免串味；养护时用茶汤擦拭壶身，加速包浆。</p></div>
    `,
    "tea-leaf-lapsang": `
        <h3>正山小种红茶</h3>
        <img src="../images/6.5.png" alt="正山小种">
        <p class="goods-info"><strong>规格</strong>：100g/罐，密封铁罐包装</p>
        <p class="goods-info"><strong>产地</strong>：福建武夷山桐木关</p>
        <p class="goods-info"><strong>特点</strong>：传统松烟工艺，干茶乌黑油润，松烟香浓郁，汤色橙红明亮，口感甜醇温润，暖胃效果佳。</p>
        <p class="goods-info"><strong>冲泡建议</strong>：90℃水温，投茶量5g，焖泡3分钟即可饮用，可加牛奶制成奶茶。</p>
        <div class="tips-box"><h4>小贴士</h4><p>适合秋冬季节饮用，尤其适合肠胃偏寒的人群；开封后密封避光保存，保质期2年。</p></div>
    `
};

// 分类筛选
const goodsBtns = document.querySelectorAll('.goods-btn');
const goodsCards = document.querySelectorAll('.goods-card');

goodsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        goodsBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const goodsType = btn.getAttribute('data-goods');
        goodsCards.forEach(card => {
            const cardGoods = card.getAttribute('data-goods');
            card.style.display = (goodsType === 'all' || cardGoods === goodsType) ? 'block' : 'none';
        });
    });
});

function openModal(goodsKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = goodsDetail[goodsKey];
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) closeModal();
});

window.openModal = openModal;
window.closeModal = closeModal;



document.addEventListener('DOMContentLoaded', () => {
    if (window.DataValidator) {
        const result = DataValidator.validateAllData(goodsDetail, 'goods');
        if (result.invalid > 0) {
            console.warn('[数据校验] 发现商品数据异常:', result.details);
        } else {
            console.log(`[数据校验] 好物推荐校验通过，共 ${result.valid} 个商品`);
        }
        
        // 失败处理
        document.querySelectorAll('.goods-card-img img').forEach(img => {
            DataValidator.handleImageError(img);
        });
    }
});

// 友好提示
const originalGoodsOpenModal = window.openModal;
window.openModal = function(goodsKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!goodsDetail[goodsKey]) {
        if (window.DataValidator) {
            DataValidator.showFriendlyMessage(modalContent, 'error', '商品信息加载失败，请稍后重试');
            modal.classList.add('active');
        } else {
            modalContent.innerHTML = '<h3>商品不存在</h3><p>请返回重试</p>';
            modal.classList.add('active');
        }
        return;
    }
    
    modalContent.innerHTML = goodsDetail[goodsKey];
    modal.classList.add('active');
    
    
    setTimeout(() => {
        modalContent.querySelectorAll('img').forEach(img => {
            if (window.DataValidator) DataValidator.handleImageError(img);
        });
    }, 100);
};