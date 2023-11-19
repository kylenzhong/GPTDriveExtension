const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// function getAuthToken() {
//     chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
//         if (chrome.runtime.lastError) {
//             console.error(chrome.runtime.lastError);
//         } else {
//             // Use the token.
//             createPicker(token);
//             // You can now use this token to make requests to Google Drive API
//         }
//     });
// }

// function createPicker(token) {
//     var picker = new google.picker.PickerBuilder()
//         .addView(google.picker.ViewId.DOCS)
//         .setOAuthToken(token)
//         // ... additional configuration ...
//         .setCallback(pickerCallback)
//         .build();
//     picker.setVisible(true);
// }

// function pickerCallback(data) {
//     if (data.action == google.picker.Action.PICKED) {
//         var fileId = data.docs[0].id;
//         // Handle the file ID
//     }
// }


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