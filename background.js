const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "authenticate") {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ token: token });
            }
        });
        return true; // Indicates response will be sent asynchronously
    }
    if (request.action === "listFiles") {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (token) {
                listDriveFiles(token, sendResponse);
            } else {
                sendResponse({ error: "Unable to get token" });
            }
        });
        return true;
    }

});

// // Listen for a specific message from popup.js or content scripts
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === 'authenticate') {
//         getAuthToken();
//     }
// });

function fetchFiles(token) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/drive/v3/files');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = () => {
        // Send file list to popup
        chrome.runtime.sendMessage({action: 'fileList', files: JSON.parse(xhr.responseText).files});
    };
    xhr.onerror = () => {
        console.error('Error fetching files');
    };
    xhr.send();
}

function fetchFileContent(token, fileId, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = () => callback(xhr.responseText);
    xhr.onerror = () => console.error('Error fetching file content');
    xhr.send();
}

// When token is obtained, fetch files
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'fetchFiles') {
        getAuthToken(function(token) {
            fetchFiles(token);
        });
    }
});

//Utilizing Google Drive API to get files
function listDriveFiles(token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.googleapis.com/drive/v3/files');
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.onload = function() {
        callback(JSON.parse(xhr.responseText));
    };
    xhr.onerror = function() {
        callback(xhr.statusText);
    };
    xhr.send();
}