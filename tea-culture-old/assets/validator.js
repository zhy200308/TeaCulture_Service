// validator.js 
const DataValidator = (function() {
    
    // 冲泡参数校验
    function validateBrewParams(params) {
        const errors = [];
        if (!params) {
            errors.push('参数对象不能为空');
            return { isValid: false, errors };
        }
        if (params.amount && !/^\d+g$/.test(params.amount)) {
            errors.push(`投茶量格式错误: ${params.amount}，应为如 "3g" 的格式`);
        }
        if (params.waterTemp && !params.waterTemp.includes('℃') && params.waterTemp !== '常温') {
            errors.push(`水温格式错误: ${params.waterTemp}`);
        }
        return { isValid: errors.length === 0, errors: errors };
    }
    
    // MQTT消息校验
    function validateMqttMessage(message) {
        const errors = [];
        if (!message) errors.push('MQTT消息为空');
        if (message.type && message.type !== 'brew') {
            errors.push(`不支持的消息类型: ${message.type}`);
        }
        return { isValid: errors.length === 0, errors: errors };
    }
    
    // 友好提示
    function showFriendlyMessage(element, type, message) {
        if (!element) return;
        element.innerHTML = `
            <div style="padding: 20px; text-align: center; background: #f9f7f4; border-radius: 8px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 32px; color: #dc3545; margin-bottom: 12px; display: block;"></i>
                <p style="color: #666;">${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 12px; padding: 6px 16px; background: #8b5a2b; color: #fff; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            </div>
        `;
    }
    
    // 图片加载失败处理
    function handleImageError(img) {
        if (!img) return;
        img.onerror = function() {
            this.style.backgroundColor = '#f0e6d8';
            this.style.height = '120px';
            this.style.width = '100%';
            this.style.objectFit = 'contain';
        };
    }
    
    // 数据校验
    function validateTopic(htmlContent, topicKey) {
        const errors = [];
        if (!htmlContent) errors.push(`专题 "${topicKey}" 数据为空`);
        return { isValid: errors.length === 0, errors: errors };
    }
    
   
    function validateTutorial(tutorial, tutorialKey) {
        const errors = [];
        if (!tutorial) errors.push(`教程 "${tutorialKey}" 数据为空`);
        return { isValid: errors.length === 0, errors: errors };
    }
    

    function validateGoods(htmlContent, goodsKey) {
        const errors = [];
        if (!htmlContent) errors.push(`商品 "${goodsKey}" 数据为空`);
        return { isValid: errors.length === 0, errors: errors };
    }
    
    // 批量校验
    function validateAllData(dataSets, dataType) {
        const results = { total: 0, valid: 0, invalid: 0, details: {} };
        for (const [key, data] of Object.entries(dataSets)) {
            results.total++;
            let result;
            if (dataType === 'topic') result = validateTopic(data, key);
            else if (dataType === 'tutorial') result = validateTutorial(data, key);
            else if (dataType === 'goods') result = validateGoods(data, key);
            else result = { isValid: true, errors: [] };
            
            if (result.isValid) results.valid++;
            else {
                results.invalid++;
                results.details[key] = result.errors;
            }
        }
        return results;
    }
    
    // 跨模块检测
    function crossModuleCheck(modules) {
        const issues = [];
        if (modules.scenarioParams && modules.teaFoodParams) {
            const teaTypes = ['绿茶', '红茶', '乌龙茶', '白茶'];
            teaTypes.forEach(tea => {
                const scenarioMatch = Object.values(modules.scenarioParams).find(p => p.teaType === tea);
                const teaFoodMatch = Object.values(modules.teaFoodParams).find(p => p.teaType === tea);
                if (scenarioMatch && teaFoodMatch && scenarioMatch.waterTemp !== teaFoodMatch.waterTemp) {
                    issues.push({
                        type: '参数不一致',
                        module: `${tea}冲泡水温`,
                        detail: `场景教程: ${scenarioMatch.waterTemp}, 茶食搭配: ${teaFoodMatch.waterTemp}`
                    });
                }
            });
        }
        return { isValid: issues.length === 0, issues: issues };
    }
    
    return {
        validateBrewParams,
        validateMqttMessage,
        showFriendlyMessage,
        handleImageError,
        validateTopic,
        validateTutorial,
        validateGoods,
        validateAllData,
        crossModuleCheck
    };
})();

if (typeof window !== 'undefined') {
    window.DataValidator = DataValidator;
    console.log('[数据校验模块] 已加载');
}