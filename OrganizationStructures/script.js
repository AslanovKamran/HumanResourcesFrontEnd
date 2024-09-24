// URL of your API endpoint
const apiUrl = 'https://localhost:44338/api/OrganizationStructures';

const modal = document.getElementById('updateModal');
const span = document.getElementsByClassName('close')[0];
const updateButton = document.getElementById('updateButton');
const structureForm = document.getElementById('structureForm');

const updateForm = document.getElementById('updateForm');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelButton');

// Function to fetch the hierarchical data from the API
async function fetchHierarchy(includeCanceled) {
    try {
        const response = await fetch(`${apiUrl}?includeCanceled=${includeCanceled}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.error('Error fetching hierarchy:', error);
    }
}

// Recursive function to render the hierarchy as nested <ul> and <li> elements
// Function to render the hierarchy and attach toggle functionality
function renderHierarchy(hierarchy, parentElement) {
    parentElement.innerHTML = ''; // Clear previous content

    hierarchy.forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = item.name;

        link.href = `https://localhost:44338/api/OrganizationStructures/${item.id}`;

        if (item.canceled) {
            li.classList.add('canceled');
        }

        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default behavior of anchor tags

            updateButton.disabled = false;



            // Set the ID on the button
            updateButton.setAttribute('data-organization-id', link.href);

            const inputField = document.getElementById('structureIdInput'); // Get the input field
            inputField.value = `${item.name}`;  // Set the value to the clicked structure ID
            inputField.setAttribute("data-parentId", item.id);
        });

        // Add the toggle button for expandable/collapsible functionality
        if (item.children && item.children.length > 0) {
            const toggleBtn = document.createElement('span');
            toggleBtn.textContent = "+";
            toggleBtn.classList.add('toggle-btn');
            li.appendChild(toggleBtn);

            const ul = document.createElement('ul');
            ul.classList.add('children');  // Initially hidden
            li.appendChild(link);  // Add the link after the toggle button
            li.appendChild(ul);  // Append the children <ul> to the current <li>

            // Recursively render children
            renderHierarchy(item.children, ul);

            // Toggle the visibility of the children on button click with smooth animation
            // Toggle the visibility of the children on button click with smooth animation
            toggleBtn.addEventListener('click', () => {
                const ulChildren = li.querySelector('ul.children');

                if (!li.classList.contains('expanded')) {
                    // Expand: Set the max-height to the actual height of the children <ul>
                    ulChildren.style.maxHeight = `${ulChildren.scrollHeight}px`;

                    // After the transition ends, remove the max-height to allow content to grow dynamically
                    ulChildren.addEventListener('transitionend', function removeMaxHeight() {
                        ulChildren.style.maxHeight = 'none';  // Remove max-height after animation completes
                        ulChildren.removeEventListener('transitionend', removeMaxHeight);  // Clean up the event listener
                    });

                    li.classList.add('expanded');
                    toggleBtn.textContent = "-";
                } else {
                    // Collapse: First reset max-height to the current scrollHeight to allow a smooth transition
                    ulChildren.style.maxHeight = `${ulChildren.scrollHeight}px`;

                    // Force a reflow to ensure the height is set before collapsing (this step is essential for smooth collapsing)
                    ulChildren.offsetHeight;  // This triggers a reflow to apply the current max-height

                    // Collapse: Set the max-height to 0 to collapse the <ul>
                    ulChildren.style.maxHeight = '0';

                    li.classList.remove('expanded');
                    toggleBtn.textContent = "+";
                }
            });

        } else {
            li.appendChild(link);  // No children, so just append the link
        }

        parentElement.appendChild(li);
    });
}

// Main function to fetch the hierarchy and render it
async function displayHierarchy(includeCanceled) {
    const hierarchy = await fetchHierarchy(includeCanceled);  // Fetch the data with includeCanceled
    const folderHierarchyElement = document.getElementById('folderHierarchy');  // Get the root <ul> element
    renderHierarchy(hierarchy, folderHierarchyElement);  // Render the hierarchy
}

// Add event listener to the checkbox
document.getElementById('showCanceled').addEventListener('change', (event) => {
    const showCanceled = event.target.checked;  // Get the checkbox state
    displayHierarchy(showCanceled);  // Re-render the hierarchy based on the checkbox state
});

// Initial rendering (with the checkbox unchecked by default)
displayHierarchy(false);


// Handle the expand/collapse of the container
const structureHeader = document.getElementById('structureHeader');
const structureInputsContainer = document.getElementById('structureInputsContainer');

// Initially collapse the content
structureInputsContainer.style.maxHeight = '0';
structureInputsContainer.style.padding = '0'; // Ensure no padding when collapsed
structureInputsContainer.style.overflow = 'hidden';

// Get the padding value (20px) as a number
const paddingValue = 20; // Assuming 20px padding

// Toggle the collapse/expand when clicking on the header
structureHeader.addEventListener('click', () => {
    if (structureInputsContainer.style.maxHeight === '0px' || structureInputsContainer.style.maxHeight === '') {
        // Expand: Set max-height to the actual scrollHeight plus padding
        structureInputsContainer.style.maxHeight = `${structureInputsContainer.scrollHeight + paddingValue * 2}px`;
        structureInputsContainer.style.padding = '20px'; // Restore padding when expanded
    } else {
        // Collapse: Set max-height to 0 and padding to 0
        structureInputsContainer.style.maxHeight = '0';
        structureInputsContainer.style.padding = '0'; // Remove padding when collapsed
    }
});

// Get the Erase button and add an event listener to it
const eraseButton = document.getElementById('eraseButton');

// Add click event listener to erase all input fields
eraseButton.addEventListener('click', () => {
    console.log(document.getElementById('beginningHistoryInput').value);
    // Clear all input fields
    document.getElementById('structureCodeInput').value = '';
    document.getElementById('structureNameInput').value = '';
    document.getElementById('beginningHistoryInput').value = '';
    document.getElementById('telephone1Input').value = '';
    document.getElementById('telephone2Input').value = '';
    document.getElementById('structureIdInput').value = '';

    // Clear the data-parentId attribute (set to empty or null)
    document.getElementById('structureIdInput').setAttribute('data-parentId', "");

});




//Submitting the form 
structureForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();

    formData.append('Code', document.getElementById('structureCodeInput').value);
    formData.append('Name', document.getElementById('structureNameInput').value);
    formData.append('BeginningHistory', document.getElementById('beginningHistoryInput').value);
    formData.append('ParentId', document.getElementById('structureIdInput').getAttribute("data-parentId"));
    formData.append('FirstNumber', document.getElementById('telephone1Input').value);
    formData.append('SecondNumber', document.getElementById('telephone2Input').value);


    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {

        //Send POST request to the server and attach formData
        const response = await fetch(apiUrl,
            {
                method: 'POST',
                body: formData
            });

        if (response.ok) {
            const result = await response.json();  // Parse the response body as JSON
            console.log('Form successfully submitted:', result);

            // SweetAlert2 Success Alert
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Organization successfully added!',
                showConfirmButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    // Reload the page when the user presses "OK"
                    window.location.reload();
                }
            });

        }

        else {
            console.error('Error submitting the form:', response.status, response.statusText);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to submit form: ${response.statusText}`,
                showConfirmButton: true
            });
        }

    } catch (error) {
        console.error('Error in POST request:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `An error occurred while submitting the form.`,
            footer: `<strong>Error Details:</strong> ${error.message || error}`,  // Show full error
            showConfirmButton: true
        });
    }
});



//Open up the modal window on Update button click 
updateButton.addEventListener('click', async function () {
    const organizationUrl = updateButton.getAttribute('data-organization-id');
    if (!organizationUrl) {
        console.error("No organization ID found");
        return;
    }

    // Show the modal
    modal.style.display = "block";
    document.body.style.overflow = 'hidden';

    // Fetch the organization data
    try {
        const response = await fetch(organizationUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Organization Data:', data);  // Console log the data

        document.getElementById('orgId').value = data.id || '';
        document.getElementById('orgCode').value = data.code || '';
        document.getElementById('orgName').value = data.name || '';
        document.getElementById('orgBeginningHistory').value = data.beginningHistory ? new Date(data.beginningHistory).toISOString().split('T')[0] : ''; // Date formatting YYYY-MM-DD
        document.getElementById('orgCanceled').checked = data.canceled || false;
        document.getElementById('orgTelephone1').value = data.firstNumber || '';
        document.getElementById('orgTelephone2').value = data.secondNumber || '';
        document.getElementById('orgIsSeaCoef').checked = data.isSeaCoef || false;

        if (data.tabelOrganizationId) {
            document.getElementById('tabelOrganizations').value = data.tabelOrganizationId;
        } else {
            document.getElementById('tabelOrganizations').value = ''; // Default to "Nothing" option
        }

        document.getElementById('orgTabelPriority').value = data.tabelPriority || '';
        document.getElementById('orgHeadName').value = data.headName || '';
        document.getElementById('orgHeadPosition').value = data.headPosition || '';


        // You can now populate the modal with the data or do further processing
        document.getElementById('modalMessage').textContent = `Məlumat uğurla yükləndi`;

    } catch (error) {
        console.error('Error in POST request:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `An error occurred while trying to update the organization.`,
            footer: `<strong>Error Details:</strong> ${error.message || error}`,  // Show full error
            showConfirmButton: true
        });
    }
});

// Close the modal when the user clicks on <span> (x)
span.onclick = function () {
    closeModal();
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}


cancelButton.addEventListener('click', function () {
    closeModal();
    updateForm.reset();
    document.body.style.overflow = '';
});

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = '';
    updateButton.disabled = true;
}


updateForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Gather the form data

    const formData = new FormData()


    // Manually append key-value pairs to formData
    formData.append('id', document.getElementById('orgId').value);
    formData.append('code', document.getElementById('orgCode').value);
    formData.append('name', document.getElementById('orgName').value);
    formData.append('beginningHistory', document.getElementById('orgBeginningHistory').value);
    formData.append('firstNumber', document.getElementById('orgTelephone1').value || '');
    formData.append('secondNumber', document.getElementById('orgTelephone2').value || '');
    formData.append('tabelOrganizationId', document.getElementById('tabelOrganizations').value || '');
    formData.append('tabelPriority', document.getElementById('orgTabelPriority').value || '');
    formData.append('canceled', document.getElementById('orgCanceled').checked);
    formData.append('headName', document.getElementById('orgHeadName').value || '');
    formData.append('headPosition', document.getElementById('orgHeadPosition').value || '');
    formData.append('isSeaCoef', document.getElementById('orgIsSeaCoef').checked);

    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }
    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            body: formData
        });
    
        // Check if the request was successful
        if (response.ok) {
            // Success alert
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The organization structure has been updated successfully!',
                showConfirmButton: true
            });
            closeModal();
        } else {
            // If not ok, log and display the full response
            const errorData = await response.text(); // Capture the response body as text or JSON
    
            // Error alert showing the response status and error details
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: `Failed to update the organization structure. Status: ${response.status}\nDetails: ${errorData}`,
                showConfirmButton: true
            });
    
            // Log the full error details in the console for debugging
            console.error('Error details:', errorData);
        }
    } catch (error) {
        // Catch and display any network errors or other issues
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `An error occurred: ${error.message}`,
            showConfirmButton: true
        });
    }

});