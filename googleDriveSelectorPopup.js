document.addEventListener('DOMContentLoaded', function() {
    const fileList = document.getElementById('googleDriveSelectorPopup-window');
    const selectButton = document.getElementById('select-button');

    // Message background to get files
    chrome.runtime.sendMessage({ action: "retrieveDriveFiles" }, function(response) {
        if (response.error) {
            console.error('Error listing files:', response.error);
        } else {
            displayFileList(response.files);
        }
    });

    // Add event listener for select button
    selectButton.addEventListener('click', function() {
        const selectedFiles = fileList.querySelectorAll('.selected');
        // Process selected files
    });

    // Implement selection logic...
});

//Displays the file list in popup
function displayFileList(files) {
    const fileListContainer = document.getElementById('googleDriveSelectorPopup-window');
    fileListContainer.innerHTML = ''; // Clear existing list
  
    files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        
        fileElement.textContent = `(${file.mimeType}): ${file.name} `; // Display the MIME type
        fileElement.setAttribute('data-file-id', file.id); // Store the file ID

        fileElement.addEventListener('click', function() {
            // Remove 'selected' class from all file items
            const allFileItems = document.querySelectorAll('.file-item');
            allFileItems.forEach(item => item.classList.remove('selected'));

            this.classList.toggle('selected');
        // Optionally, handle other actions on click, like previewing the file
      });
  
      fileListContainer.appendChild(fileElement);
    });
  }

  document.getElementById('select-button').addEventListener('click', function() {
    const selectedFileElement = document.querySelector('.file-item.selected');
    if (selectedFileElement) {
        const fileId = selectedFileElement.getAttribute('data-file-id');
        chrome.runtime.sendMessage({ action: "getFileContent", fileId: fileId });
    }
});