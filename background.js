const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let popupWindowId = null;


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkAuth") {
        chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
            if (token) {
                sendResponse({ token: token });
            } else {
                sendResponse({ error: "User not authenticated" });
            }
        });
        return true;
    } else if (request.action === "authenticate") {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ token: token });
            }
        });
        return true; // Indicates response will be sent asynchronously
    } else if (request.action === "createPopup") {
        console.log("createPopup");
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (token) {
                if(popupWindowId == null) {
                    const popupUrl = chrome.runtime.getURL('googleDriveSelectorPopup.html');
                    const windowOptions = {
                        url: popupUrl,
                        type: 'popup',
                        width: 400,
                        height: 600
                    };
                    chrome.windows.create(windowOptions, function(win) {
                        // Handle the newly created window
                        // Save the window ID if you need to use it later
                        popupWindowId = win.id;
                    });
                } else {
                    // Focus the new window, to be brought to the foreground
                    chrome.windows.update(win.id, { focused: true });
                }
            } else {
                sendResponse({ error: "Unable to get token" });
            }
        });
        return true;
    } else if (request.action === "retrieveDriveFiles") { //when popup is opened, this function is called
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                listDriveFiles(token, sendResponse); //it will populate the files from drive
            }
        });
        return true; // Indicates response will be sent asynchronously
    } else if (request.action === "getFileContent") { //file selection in popup
        getFileContent(request.fileId, function(content) {
            // You can then send this content to `content.js` or handle it as needed
            downloadFile(content, 'downloadedfile.txt');
        });
        return true; // Indicates asynchronous response
    }

});

// Listen for when a window is removed (closed)
chrome.windows.onRemoved.addListener(function(windowId) {
    if (windowId === popupWindowId) {
        popupWindowId = null; // Reset the variable when the popup is closed
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
    fetch('https://www.googleapis.com/drive/v3/files', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => callback({ error: error.message }));
}

// Function to get a specific file from Google Drive given its ID
function getFileContent(fileId, callback) {
    console.log("getFileContent");
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        if (token) {
            fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
                method: 'GET',
                headers: new Headers({
                    'Authorization': 'Bearer ' + token
                })
            })
            .then(response => response.text()) // Or response.blob() if it's a binary file
            .then(content => callback(content))
            .catch(error => console.error('Error fetching file:', error));
        } else {
            console.error("Token fetch failed");
        }
    });
}

function downloadFile(content, filename) {
    // Convert the content to a data URL
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    
    // Trigger the download
    chrome.downloads.download({ url: dataUrl, filename: filename });
}