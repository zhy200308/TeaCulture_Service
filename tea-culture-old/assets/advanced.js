// advanced.js 

const topicDetail = {
    "process-puer": `
        <h3>普洱茶熟茶发酵工艺</h3>
        <img src="../images/3.png" alt="普洱茶发酵工艺">
        <div class="topic-section">
            <h4>工艺核心</h4>
            <p>普洱茶熟茶的核心是人工渥堆发酵，将晒青毛茶堆成高1.5-2米的茶堆，通过洒水增湿、控制温度（55-65℃），让茶叶微生物发酵。</p>
        </div>
        <div class="topic-section">
            <h4>关键步骤</h4>
            <p>1. 备料：选用云南大叶种晒青毛茶，含水率控制在10%左右；</p>
            <p>2. 渥堆：堆茶洒水，覆盖湿布保温，温度超过65℃时翻堆降温；</p>
            <p>3. 翻堆：每隔7-10天翻堆一次，共翻堆5-8次；</p>
            <p>4. 出堆：发酵40-60天后出堆，摊晾至含水率12%以下；</p>
            <p>5. 陈化：出堆后陈放3-6个月，稳定口感。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>发酵温度过高会导致熟茶有“渥堆味”；优质熟茶发酵后需陈化1年以上再饮用，口感更醇厚。</p>
        </div>
    `,
    "region-longjing": `
        <h3>西湖龙井核心产区划分</h3>
        <img src="../images/3.1.png" alt="龙井核心产区">
        <div class="topic-section">
            <h4>五大核心产区</h4>
            <p>1. 狮峰产区：龙井村、狮峰山一带，茶叶香气高锐，口感醇厚；</p>
            <p>2. 龙井产区：翁家山、杨梅岭一带，茶叶色泽翠绿，口感鲜爽；</p>
            <p>3. 云栖产区：云栖竹径周边，茶叶滋味清甜，回甘明显；</p>
            <p>4. 虎跑产区：虎跑泉周边，茶叶嫩香持久，汤感顺滑；</p>
            <p>5. 梅家坞产区：梅家坞村，茶叶外形扁平，香气清鲜。</p>
        </div>
        <div class="topic-section">
            <h4>产区差异原因</h4>
            <p>不同产区的土壤（酸性红壤）、海拔、光照、降水不同，导致茶叶内含物质比例差异，最终形成不同风味。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>狮峰龙井价格最高，梅家坞龙井产量最大；购买时认准“西湖龙井地理标志”，避免买到浙江龙井仿品。</p>
        </div>
    `,
    "taste-oolong": `
        <h3>乌龙茶香气品鉴技巧</h3>
        <img src="../images/3.2.png" alt="乌龙茶品鉴">
        <div class="topic-section">
            <h4>品鉴三步法</h4>
            <p>1. 干茶香：取3-5g干茶，轻摇茶荷，闻干茶的香型（清香型/浓香型/陈香型）；</p>
            <p>2. 湿茶香：洗茶后，盖碗盖焖10秒，开盖闻盖香，这是乌龙茶香气最浓郁的阶段；</p>
            <p>3. 茶汤香：品饮茶汤时，感受口腔中的香气，以及吞咽后鼻腔的回香。</p>
        </div>
        <div class="topic-section">
            <h4>不同香型品鉴重点</h4>
            <p>• 清香型（铁观音）：闻兰花香、栀子香，清新雅致；</p>
            <p>• 浓香型（大红袍）：闻岩韵香、焦糖香，醇厚持久；</p>
            <p>• 陈香型（老乌龙）：闻陈香、药香，沉稳内敛。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>品鉴时用白瓷盖碗，更易凸显香气；品鉴前避免吃辛辣/重味食物，防止掩盖茶香。</p>
        </div>
    `,
    "process-white": `
        <h3>白茶自然萎凋工艺</h3>
        <img src="../images/3.3.png" alt="白茶萎凋工艺">
        <div class="topic-section">
            <h4>工艺核心</h4>
            <p>白茶是六大茶类中工艺最简单的，不炒不揉，核心是“自然萎凋”，通过缓慢失水让茶叶轻微发酵（发酵度5-10%）。</p>
        </div>
        <div class="topic-section">
            <h4>关键步骤</h4>
            <p>1. 采摘：采一芽一叶/一芽二叶的鲜叶，带白毫为佳；</p>
            <p>2. 摊晾：将鲜叶均匀摊在竹匾上，厚度2-3cm；</p>
            <p>3. 萎凋：在20-25℃、湿度60-70%的环境下，自然萎凋48-72小时；</p>
            <p>4. 干燥：萎凋后用60℃低温烘干，含水率控制在8%以下。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>萎凋环境湿度太高易发霉，太低易导致茶叶失水过快；优质白茶萎凋时需每天轻翻1-2次，保证受热均匀。</p>
        </div>
    `,
    "health-chenpi": `
        <h3>陈皮普洱·茶疗养生</h3>
        <img src="../images/3.4.jpg" alt="陈皮普洱">
        <div class="topic-section">
            <h4>茶疗原理</h4>
            <p>陈皮性温，理气健脾；普洱熟茶暖胃降脂。二者结合，可缓解消化不良、痰多咳嗽，尤其适合秋冬调理。</p>
        </div>
        <div class="classic-text">
            <h4>典籍选读 · 《本草纲目》</h4>
            <p>“陈皮，苦能泄能燥，辛能散，温能和……同补药则补，同泻药则泻，同升药则升，同降药则降。” —— 李时珍</p>
        </div>
        <div class="audio-player">
            <audio id="healthAudio" controls src="../images/3.5.m4a"></audio>
            <p style="font-size: 14px; color: #999; margin-top: 5px;"></p>
        </div>
        <div class="topic-section" id="textContainer">
            <h4></h4>
            <p id="sentence1" class="sentence">1. 陈皮普洱兼具药食同源之性，是茶疗典范。</p>
            <p id="sentence2" class="sentence">2. 陈皮理气，普洱暖胃，二者相得益彰。</p>
            <p id="sentence3" class="sentence">3. 每日一杯，可助消化、祛湿气，温和调养。</p>
            <p id="sentence4" class="sentence">4. 冲泡时建议用100℃沸水，焖泡5分钟。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>建议使用5年以上的新会陈皮与3年熟普搭配，口感更醇。</p>
        </div>
    `,
    "tang-song-teaware": `
        <h3>唐宋茶器形制演变与文化意蕴</h3>
        <img src="../images/3.6.png" alt="唐宋茶器">
        <div class="topic-section">
            <h4>唐代茶器：越窑青瓷与煮茶风尚</h4>
            <p>唐代盛行煮茶法，茶器以越窑青瓷为代表，陆羽《茶经》中推崇“越州上”，认为青瓷茶瓯“类玉”“类冰”，与茶汤色泽相得益彰。典型器物包括茶鍑、茶铛、茶瓯、茶盏托等，形制古朴大气，釉色温润如玉。</p>
        </div>
        <div class="topic-section">
            <h4>宋代茶器：建窑黑釉与点茶美学</h4>
            <p>宋代点茶尚白，推崇“盏色贵青黑”，建窑黑釉盏因此盛行。兔毫、油滴、曜变等釉色变幻莫测，与白色茶沫形成鲜明对比。茶器形制趋于精巧，茶盏多为敞口、深腹、小足，便于击拂茶汤。</p>
        </div>
        <div class="topic-section">
            <h4>形制演变背后的文化意蕴</h4>
            <p>从唐代的青瓷温润到宋代的黑釉沉静，茶器形制与釉色变化，折射出饮茶方式从煮茶到点茶的转变，也映射出唐宋两代不同的审美取向——唐尚丰腴华美，宋尚简约内敛。茶器不仅是实用器物，更是文人精神追求的载体。</p>
        </div>
        <div class="tips-box">
            <h4>小贴士</h4>
            <p>鉴赏唐宋茶器，可关注釉色、胎体、器型比例三大要素；当代茶器收藏中，宋代建盏残片仍具较高研究价值。</p>
        </div>
    `
};

// 专题筛选
const topicBtns = document.querySelectorAll('.topic-btn');
const topicCards = document.querySelectorAll('.topic-card');

topicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        topicBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const topicType = btn.getAttribute('data-topic');
        topicCards.forEach(card => {
            const cardTopic = card.getAttribute('data-topic');
            card.style.display = (topicType === 'all' || cardTopic === topicType) ? 'block' : 'none';
        });
    });
});

// 详情框
function openModal(topicKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = topicDetail[topicKey];
    modal.classList.add('active');

    // 音频
    if (topicKey === 'health-chenpi') {
        initHealthAudio();
    }
}



function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('detailModal')) {
        closeModal();
    }
});

window.openModal = openModal;
window.closeModal = closeModal;


document.addEventListener('DOMContentLoaded', () => {
    if (window.DataValidator) {
        const result = DataValidator.validateAllData(topicDetail, 'topic');
        if (result.invalid > 0) {
            console.warn('[数据校验] 发现专题数据异常:', result.details);
        } else {
            console.log(`[数据校验] 进阶专题馆校验通过，共 ${result.valid} 个专题`);
        }
        
        // 添加加载失败处理
        document.querySelectorAll('.topic-card-img img').forEach(img => {
            DataValidator.handleImageError(img);
        });
    }
});

// 友好提示
const originalOpenModal = window.openModal;
window.openModal = function(topicKey) {
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!topicDetail[topicKey]) {
        if (window.DataValidator) {
            DataValidator.showFriendlyMessage(modalContent, 'error', '专题内容加载失败，请稍后重试');
            modal.classList.add('active');
        } else {
            modalContent.innerHTML = '<h3>内容不存在</h3><p>请返回重试</p>';
            modal.classList.add('active');
        }
        return;
    }
    
    modalContent.innerHTML = topicDetail[topicKey];
    modal.classList.add('active');
    

    setTimeout(() => {
        modalContent.querySelectorAll('img').forEach(img => {
            if (window.DataValidator) DataValidator.handleImageError(img);
        });
    }, 100);
    

    if (topicKey === 'health-chenpi') {
        setTimeout(() => { initHealthAudio(); }, 100);
    }
};