// Fetch file list event listener
document.getElementById('fetch').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'fetchFiles'});
});

// Populate file list dropdown
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fileList') {
        let fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        request.files.forEach(file => {
            let option = document.createElement('option');
            option.value = file.id;
            option.textContent = file.name;
            fileList.appendChild(option);
        });
    }
});

// Upload to ChatGPT event listener
document.getElementById('upload').addEventListener('click', function() {
    let fileId = document.getElementById('file-list').value;
    chrome.runtime.sendMessage({action: 'fetchFileContent', fileId: fileId});
});