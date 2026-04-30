// basic.js 

const detailData = {
    "六大茶类": `
        <h3>六大茶类的风味特点</h3>
        <img src="../images/2.4.jpg" alt="六大茶类">
        <p>中国茶叶按发酵程度分为六大类：</p>
        <p>1. 绿茶（不发酵）：龙井、碧螺春，口感鲜爽，清汤绿叶；</p>
        <p>2. 红茶（全发酵）：祁门红茶、正山小种，口感甜醇，红汤红叶；</p>
        <p>3. 乌龙茶（半发酵）：铁观音、大红袍，香气高扬；</p>
        <p>4. 白茶（微发酵）：白毫银针、白牡丹，口感清甜；</p>
        <p>5. 黄茶（轻发酵）：君山银针，口感温润；</p>
        <p>6. 黑茶（后发酵）：普洱茶、安化黑茶，口感醇厚。</p>
    `,
    "绿茶冲泡": `
        <h3>绿茶的冲泡水温控制</h3>
        <img src="../images/2.5.jpg" alt="绿茶冲泡">
        <p>绿茶冲泡的核心是低温，避免烫熟茶叶：</p>
        <p>• 明前绿茶（龙井、碧螺春）：70-80℃；</p>
        <p>• 雨前绿茶（信阳毛尖）：80-85℃；</p>
        <p>• 冲泡技巧：先注水后投茶，减少茶叶与高温水直接接触。</p>
    `,
    "盖碗使用": `
        <h3>白瓷盖碗使用技巧</h3>
        <img src="../images/2.6.jpg" alt="盖碗使用">
        <p>盖碗是最通用的饮茶器具，使用要点：</p>
        <p>1. 持握：拇指按盖沿，食指中指夹碗身，无名指托碗底；</p>
        <p>2. 注水：注水量不超过碗身2/3，避免溢出；</p>
        <p>3. 出汤：斜盖碗盖，留出缝隙，快速出汤避免闷茶。</p>
    `,
    "饮茶养生": `
        <h3>不同茶类的养生功效</h3>
        <img src="../images/2.7.jpg" alt="饮茶养生">
        <p>茶叶中的营养成分各有侧重：</p>
        <p>• 绿茶：茶多酚含量高，抗氧化、抗辐射；</p>
        <p>• 红茶：性质温和，暖胃护胃，适合肠胃弱的人；</p>
        <p>• 乌龙茶：有助于降脂减肥，适合体重管理；</p>
        <p>• 白茶：黄酮类物质丰富，有消炎杀菌作用；</p>
        <p>• 黑茶：含益生菌，促进肠道消化。</p>
    `,
    "紫砂壶": `
        <h3>紫砂壶使用指南</h3>
        <img src="../images/2.1.jpg" alt="紫砂壶">
        <p>紫砂壶透气性佳，适合冲泡乌龙茶、普洱茶：</p>
        <p>• 新壶开壶：用沸水烫洗去除火气；</p>
        <p>• 日常养护：使用后及时擦干，避免接触油污；</p>
        <p>• 适配茶类：重香型茶叶，不适合绿茶、红茶。</p>
    `,
    "白瓷盖碗": `
        <h3>白瓷盖碗使用指南</h3>
        <img src="../images/2.jpg" alt="白瓷盖碗">
        <p>白瓷盖碗不吸味，适合品鉴各类茶叶本味：</p>
        <p>• 优点：散热快、易清洗、能展现茶叶真实口感；</p>
        <p>• 注意：避免骤冷骤热，防止碗体开裂；</p>
        <p>• 适配茶类：所有茶类，尤其适合绿茶、红茶。</p>
    `,
    "玻璃杯": `
        <h3>玻璃杯使用指南</h3>
        <img src="../images/2.3.png" alt="玻璃杯">
        <p>玻璃杯透明可视，适合冲泡绿茶、花茶：</p>
        <p>• 优点：便于观赏茶叶舒展过程；</p>
        <p>• 注意：冲泡前先用温水预热，避免炸裂；</p>
        <p>• 适配茶类：绿茶、花茶、白茶。</p>
    `,
    "茶史简说": `
        <h3>中国茶文化简史</h3>
        <img src="../images/2.8.png" alt="茶史" onerror="this.style.display='none'">
        <p>• 神农时期（约公元前2700年）：传说神农尝百草，日遇七十二毒，得茶而解之，茶始为药用。</p>
        <p>• 唐代（618-907年）：陆羽著《茶经》，系统总结茶事，煎茶法盛行，茶文化远播。</p>
        <p>• 宋代（960-1279年）：点茶法成为主流，斗茶风靡，茶器精美，茶宴盛行。</p>
        <p>• 明清（1368-1912年）：瀹饮法（散茶冲泡）普及，六大茶类逐渐形成，紫砂壶兴起。</p>
        <p>• 现代：茶文化复兴，融合传统与创新，成为健康生活的重要部分。</p>
    `,
    "叩指礼": `
        <h3>叩指礼的由来</h3>
        <img src="../images/2.9.png" alt="叩指礼" onerror="this.style.display='none'">
        <p>叩指礼源于清代乾隆皇帝微服私访的故事。相传乾隆为下属斟茶，下属不便跪拜，便以食指和中指弯曲轻叩桌面，象征双膝跪地行礼。此后演变为茶桌谢礼。</p>
        <p>现代用法：</p>
        <p>• 晚辈向长辈：五指并拢成拳，拳心向下，五个手指同时敲击桌面三下，相当于五体投地跪拜礼。</p>
        <p>• 平辈之间：食指中指并拢，敲击桌面三下，表示双手抱拳作揖。</p>
        <p>• 长辈对晚辈：食指或中指轻敲桌面一下或两下，表示点头认可。</p>
    `,
    "茶道六君子": `
        <h3>茶道六君子</h3>
        <img src="../images/2.10.png" alt="茶道六君子" onerror="this.style.display='none'">
        <p>茶道六君子是传统茶艺中六种辅助茶具的统称：</p>
        <p>1. 茶筒：盛放其他五件的筒状器皿。</p>
        <p>2. 茶则：用来量取茶叶，确保投茶量准确。</p>
        <p>3. 茶匙：从茶则或茶罐中拨取茶叶。</p>
        <p>4. 茶漏：放置于壶口，防止茶叶外漏。</p>
        <p>5. 茶夹：用于夹取品茗杯，或夹出茶渣。</p>
        <p>6. 茶针：疏通壶嘴，保持出水顺畅。</p>
        <p>它们不仅是实用工具，也体现了茶道的仪式感。</p>
    `
};

const categoryBtns = document.querySelectorAll('.category-btn');
const knowledgeCards = document.querySelectorAll('.knowledge-card');

// 分类筛选
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(btn.getAttribute('data-category'));
    });
});

function filterCards(category = 'all') {
    knowledgeCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const categoryMatch = category === 'all' || cardCategory === category;
        card.style.display = categoryMatch ? 'block' : 'none';
    });
}

function showDetail(key) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = detailData[key];
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) {
        closeModal();
    }
});

window.showDetail = showDetail;
window.closeModal = closeModal;

// 异常处理
document.addEventListener('DOMContentLoaded', () => {
    if (window.DataValidator) {
        const result = DataValidator.validateAllData(detailData, 'card');
        if (result.invalid > 0) {
            console.warn('[数据校验] 发现数据异常:', result.details);
        } else {
            console.log(`[数据校验] 基础茶识库校验通过，共 ${result.valid} 个卡片`);
        }
        
        document.querySelectorAll('.teaware-card img, .knowledge-card img').forEach(img => {
            DataValidator.handleImageError(img);
        });
    }
});

// 失友好提示和图片异常处理
const originalShowDetail = window.showDetail;
window.showDetail = function(key) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!detailData[key]) {
        if (window.DataValidator) {
            DataValidator.showFriendlyMessage(modalContent, 'error', '内容加载失败，请稍后重试');
            modal.classList.add('active');
        } else {
            modalContent.innerHTML = '<h3>内容不存在</h3><p>请返回重试</p>';
            modal.classList.add('active');
        }
        return;
    }
    
    modalContent.innerHTML = detailData[key];
    modal.classList.add('active');
    
    setTimeout(() => {
        modalContent.querySelectorAll('img').forEach(img => {
            if (window.DataValidator) DataValidator.handleImageError(img);
        });
    }, 100);
};