var observer;

// Function to add your custom button
function addButtonIfElementExists() {
    var targetButton = document.querySelector('button.btn.relative.p-0.text-black.dark\\:text-white[aria-label="Attach files"]');

    if (targetButton && !document.getElementById('custom-kyle-button')) {
        var newButton = document.createElement('button');
        newButton.id = 'custom-kyle-button'; // Replace with your desired ID

        var icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('images/driveIcon.png'); // Replace with the path to your icon image
        icon.alt = 'Google Drive Icon'; // Alt text for the icon
        icon.style.width = '20px'; // Adjust as needed
        icon.style.height = '20px'; // Adjust as needed
        newButton.appendChild(icon);

        newButton.style.marginLeft = '10px';
        // newButton.style.width = '100px'; // Adjust the width as needed
        // newButton.style.height = '30px'; // Adjust the height as needed
        // newButton.style.marginTop = '20px'; // Adds some space above the button

        newButton.addEventListener('click', function() {
            console.log('New button clicked'); // Replace with your desired functionality
        });

        targetButton.insertAdjacentElement('afterend', newButton);

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