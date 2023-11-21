var observer;
var pickerApiLoaded = false;

// Function to add your custom button
function addButtonIfElementExists() {
    var targetButton = document.querySelector('button.btn.relative.p-0.text-black.dark\\:text-white[aria-label="Attach files"]');

    if (targetButton && !document.getElementById('custom-kyle-button')) {
        var openDriveButton = document.createElement('button');
        openDriveButton.id = 'custom-kyle-button'; // Replace with your desired ID
        

        var icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('images/driveIcon.png'); // Replace with the path to your icon image
        icon.alt = 'Google Drive Icon'; // Alt text for the icon
        icon.style.width = '20px'; // Adjust as needed
        icon.style.height = '20px'; // Adjust as needed
        openDriveButton.appendChild(icon);

        openDriveButton.style.marginLeft = '10px';
        // openDriveButton.style.width = '100px'; // Adjust the width as needed
        // openDriveButton.style.height = '30px'; // Adjust the height as needed
        // openDriveButton.style.marginTop = '20px'; // Adds some space above the button

        openDriveButton.addEventListener('click', function() {
            chrome.runtime.sendMessage({ action: "checkAuth" }, function(response) {
                if (response.error) {
                    // Handle the error or prompt for authentication
                } else if (response.token) {
                    // Token exists, list files
                    chrome.runtime.sendMessage({ action: "createPopup" }, handleFileListResponse);
    
                } else {
                    // No token, prompt user to authenticate
                    chrome.runtime.sendMessage({ action: "authenticate" }, handleAuthResponse);
                }
            });

            console.log('New button clicked'); // Replace with your desired functionality
        });

        targetButton.insertAdjacentElement('afterend', openDriveButton);

        if (observer) {
            observer.disconnect(); // Stop observing once the button is added
        }

        return true;
    }
    return false;
}

// Function to observe DOM changes
function observeDOMChanges() {
    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (addButtonIfElementExists()) {
                addButtonIfElementExists(observer);
            }
        });
    });

    var config = { childList: true, subtree: true };
    observer.observe(document.body, config); // Observe changes in the body of the page
}

// Start observing or try adding the button immediately if the element might already be there
if (!addButtonIfElementExists()) {
    observeDOMChanges();
}

function getAuthToken() {
    chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            // Use the token.
            createPicker(token);
            // You can now use this token to make requests to Google Drive API
        }
    });
}

//This function along with the one below creates the popup window for account selection
function createPicker(token) {
    var picker = new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        // ... additional configuration ...
        .setCallback(pickerCallback)
        .build();
    picker.setVisible(true);
}

function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
        var fileId = data.docs[0].id;
        // Handle the file ID
    }
}



// Handle authentication response from background script
function handleAuthResponse(response) {
    if (response.error) {
        console.error("Authentication error:", response.error);
        // Display an error message to the user or take other appropriate actions
    } else if (response.token) {
        // Authentication successful
        // Now you can proceed with actions that require authentication
        chrome.runtime.sendMessage({ action: "listFiles" }, handleFileListResponse);
    }
}

//Handls the file list response from background script
function handleFileListResponse(response) {
    if (response.error) {
        console.error('Error listing files:', response.error);
    } else {
        displayFileList(response.files);
    }
}

