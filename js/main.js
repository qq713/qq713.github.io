// 获取所有必需的DOM元素
const compressButton = document.getElementById('compressButton');
const convertButton = document.getElementById('convertButton');
const convertModal = document.getElementById('convertModal');
const fileInput = document.getElementById('fileInput');
const selectFolder = document.getElementById('selectFolder');
const selectFile = document.getElementById('selectFile');
const formatSelect = document.getElementById('formatSelect');
const compressSizeInput = document.getElementById('compressSize');
const compressModal = document.getElementById('compressModal');
const startCompress = document.getElementById('startCompress');

// 图片压缩按钮点击事件
compressButton.onclick = function() {
    console.log('压缩按钮被点击');
    compressModal.style.display = 'block';
}

// 格式转换按钮点击事件
convertButton.onclick = function() {
    console.log('转换按钮被点击');
    convertModal.style.display = 'block';
}

// 选择文件夹按钮点击事件
selectFolder.onclick = function() {
    console.log('选择文件夹按钮被点击');
    fileInput.setAttribute('webkitdirectory', '');
    fileInput.setAttribute('directory', '');
    fileInput.value = '';
    fileInput.click();
    convertModal.style.display = 'none';
}

// 选择单文件按钮点击事件
selectFile.onclick = function() {
    console.log('选择单文件按钮被点击');
    fileInput.removeAttribute('webkitdirectory');
    fileInput.removeAttribute('directory');
    fileInput.value = '';
    fileInput.click();
    convertModal.style.display = 'none';
}

// 文件选择变化事件
fileInput.onchange = function(e) {
    console.log('文件选择发生变化');
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const targetSizeKB = parseInt(compressSizeInput.value, 10);
    handleCompress(files[0], targetSizeKB);
}

// 处理单个文件
async function handleFileSelect(file, format) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        await convertImage(file, format);
        alert('转换完成！');
    } catch (error) {
        alert('转换失败：' + error.message);
    }
}

// 处理文件夹
async function handleFolderSelect(files, format) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
        alert('所选文件夹中没有图片文件！');
        return;
    }
    
    let processed = 0;
    for (const file of imageFiles) {
        try {
            await convertImage(file, format);
            processed++;
        } catch (error) {
            console.error(`处理 ${file.name} 失败:`, error);
        }
    }
    
    alert(`处理完成！\n成功转换 ${processed} 个文件`);
}

// 转换图片
async function convertImage(file, format) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('转换失败'));
                    return;
                }
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = file.name.replace(/\.[^/.]+$/, '.' + format.split('/')[1]);
                link.click();
                resolve();
            }, format);
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        reader.readAsDataURL(file);
    });
}

// 处理图片压缩
async function handleCompress(file, targetSizeKB) {
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        const compressedBlob = await compressImage(file, targetSizeKB);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = file.name;
        link.click();
        alert('压缩完成！');
    } catch (error) {
        alert('压缩失败：' + error.message);
    }
}

// 压缩图片
async function compressImage(file, targetSizeKB) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            let quality = 0.9; // 初始质量
            const step = 0.05; // 质量调整步长
            
            function tryCompress() {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('压缩失败'));
                        return;
                    }
                    
                    const sizeKB = blob.size / 1024;
                    if (sizeKB <= targetSizeKB || quality <= 0.1) {
                        resolve(blob);
                    } else {
                        quality -= step;
                        tryCompress();
                    }
                }, 'image/jpeg', quality);
            }
            
            tryCompress();
        };
        
        img.onerror = () => reject(new Error('图片加载失败'));
        reader.readAsDataURL(file);
    });
}

// 添加开始压缩按钮事件
startCompress.onclick = function() {
    const targetSizeKB = parseInt(compressSizeInput.value, 10);
    if (isNaN(targetSizeKB) || targetSizeKB <= 0) {
        alert('请输入有效的目标大小');
        return;
    }
    fileInput.click();
    compressModal.style.display = 'none';
}

// 在页面加载完成后执行检查
window.onload = function() {
    // 检查所有必需的元素
    const elements = {
        compressButton: document.getElementById('compressButton'),
        convertButton: document.getElementById('convertButton'),
        convertModal: document.getElementById('convertModal'),
        fileInput: document.getElementById('fileInput'),
        selectFolder: document.getElementById('selectFolder'),
        selectFile: document.getElementById('selectFile'),
        formatSelect: document.getElementById('formatSelect')
    };

    // 检查每个元素是否存在
    for (let [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`错误：找不到 ID 为 "${name}" 的元素`);
        } else {
            console.log(`成功：找到 ID 为 "${name}" 的元素`);
        }
    }
} 