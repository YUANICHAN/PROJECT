let editingProductId = null;
let editingProductImageUrl = null;

document.getElementById('add').addEventListener('click', function () {
    resetForm();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
});

document.getElementById('productImage').addEventListener('change', function () {
    const file = this.files[0];
    const preview = document.getElementById('imagePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

document.getElementById('saveProductBtn').addEventListener('click', function () {
    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value;
    const quantity = document.getElementById('quantity').value;
    const productPrice = document.getElementById('productPrice').value;
    const productImage = document.getElementById('productImage').files[0];
    let imageUrl = editingProductImageUrl;

    if (productName.trim() === "" || quantity.trim() === "" || productPrice.trim() === "") {
        alert("Please fill in all fields");
        return;
    }

    const currentDate = new Date().toLocaleDateString();

    if (productImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageUrl = e.target.result;
            saveProduct(productName, productDescription, quantity, productPrice, imageUrl, currentDate);
        };
        reader.readAsDataURL(productImage);
    } else {
        saveProduct(productName, productDescription, quantity, productPrice, imageUrl, currentDate);
    }
});

function generateUniqueProductId() {
    let uniqueId;
    const existingIds = Array.from(document.querySelectorAll('.product-id')).map(el => parseInt(el.textContent.split(': ')[1]));

    do {
        uniqueId = Math.floor(100 + Math.random() * 900);
    } while (existingIds.includes(uniqueId));

    return uniqueId;
}

function saveProduct(productName, productDescription, quantity, productPrice, imageUrl, creationDate) {

    if (!editingProductId) {
        const existingProductNames = Array.from(document.querySelectorAll('.product-name')).map(el => el.textContent.trim().toLowerCase());

        if (existingProductNames.includes(productName.toLowerCase())) {
            alert("A product with this name already exists. Please choose a different name.");
            return;
        }
    }

    const currentDate = new Date().toLocaleDateString();

    if (editingProductId) {

        const productCard = document.getElementById(editingProductId);


        const existingName = productCard.querySelector('.product-name').textContent;
        const existingDescription = productCard.querySelector('.product-description').textContent;
        const existingQuantity = productCard.querySelector('.product-quantity').textContent.split(": ")[1].trim();
        const existingPrice = productCard.querySelector('.product-price').textContent.split(": ")[1].trim().substring(1);

        if (productName === existingName && productDescription === existingDescription && quantity === existingQuantity && productPrice === existingPrice && imageUrl === productCard.querySelector('.card-img-top').src) {
            alert("No changes were made to the product.");
            return;
        }


        productCard.querySelector('.product-name').textContent = productName;
        productCard.querySelector('.product-description').textContent = productDescription;
        productCard.querySelector('.product-quantity').textContent = `Quantity: ${quantity}`;
        productCard.querySelector('.product-price').innerHTML = `Price: <span class="prices">$${parseFloat(productPrice).toFixed(2)}</span>`;
        productCard.querySelector('.date-created').textContent = `${creationDate}`;

        if (imageUrl) {
            productCard.querySelector('.card-img-top').src = imageUrl;
        }

        const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1];
        updateHistory(productName, productDescription, quantity, productPrice, imageUrl, 'Has Been Updated', currentDate, productIdNumber);

    } else {

        const productIdNumber = generateUniqueProductId();
        const productId = `product${productIdNumber}`;
        createProductCard(productId, productName, productDescription, quantity, productPrice, imageUrl, creationDate);

        updateHistory(productName, productDescription, quantity, productPrice, imageUrl, 'Has Been Added', creationDate, productIdNumber);
    }
    updateTotalCount();
    resetForm();
}

function resetForm() {
    document.getElementById('productForm').reset();
    editingProductId = null;
    editingProductImageUrl = null;
    document.getElementById('imagePreview').style.display = 'none';
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (modal) {
        modal.hide();
        document.body.style.overflow = 'auto';
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
}

function createProductCard(productId, productName, productDescription, quantity, productPrice, imageUrl, creationDate) {
    const productCard = document.createElement('div');
    productCard.classList.add('col-md-auto', 'mb-4');
    productCard.id = productId;

    productCard.innerHTML = `
    <div class="card p-2 h-100" style="width: 12rem;">
        <input class="form-check-input inspu my-2" type="checkbox" value="" id="rBut">
        <img src="${imageUrl}" class="card-img-top" style="height: 130px; width: 174px" alt="Product Image">
        <div class="card-body">
            <h5 class="product-name">${productName}</h5>
            <p class="product-description d-flex justify-content-center">Description: ${productDescription}</p>
            <p class="product-id">ID: ${productId.split('product')[1]}</p>
            <p class="date-created">${creationDate}</p>
            <div class="d-flex justify-content-between">
                <p class="product-quantity">Quantity: ${quantity}</p>
                <p class="product-price"> Price: <span class="prices">$${parseFloat(productPrice).toFixed(2)}</span></p>
            </div>
            <div class="d-flex justify-content-between">
                <button class="btn btn-outline-primary editBtn"><i class="fa-solid fa-pen-nib fa-sm"></i></button>
                <button class="btn btn-outline-danger deleteBtn"><i class="fa-solid fa-trash fa-sm"></i></button>
            </div>
        </div>
    </div>
    `;

    document.getElementById('productCards').appendChild(productCard);

    attachDeleteButtonListener(productCard);
    attachEditButtonListener(productCard);
}

let selectedProductCard = null; // Variable to store the selected product card for editing

document.getElementById('editQuantityPrice').addEventListener('click', function () {
    const selectedCards = document.querySelectorAll('#productCards .form-check-input:checked');

    selectedProductCard = selectedCards[0].closest('.col-md-auto'); // Get the parent product card
    const quantityText = selectedProductCard.querySelector('.product-quantity').textContent;
    const priceText = selectedProductCard.querySelector('.product-price').textContent;

    // Extract quantity and price
    const currentQuantity = parseInt(quantityText.split(": ")[1].trim());
    const currentPrice = parseFloat(priceText.split(": ")[1].trim().substring(1));

    // Set the current values in the modal
    document.getElementById('editQuantity').value = currentQuantity;
    document.getElementById('editPrice').value = currentPrice.toFixed(2);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editQuantityPriceModal'));
    modal.show();
});

// Select the parent container of the checkboxes
const productCardsContainer = document.getElementById('productCards');
const editQuantityPriceButton = document.getElementById('editQuantityPrice');

// Add event listener to the parent container
productCardsContainer.addEventListener('change', function (event) {
    // Check if the changed element is a checkbox
    if (event.target.classList.contains('form-check-input')) {
        const checkedCheckboxes = productCardsContainer.querySelectorAll('.form-check-input:checked');

        // Show the button if at least one checkbox is checked, otherwise hide it
        if (checkedCheckboxes.length > 0) {
            editQuantityPriceButton.classList.remove('d-none'); // Show the edit button
            document.getElementById('deleteSelected').classList.remove('d-none'); // Show the delete button
        } else {
            editQuantityPriceButton.classList.add('d-none'); // Hide the edit button
            document.getElementById('deleteSelected').classList.add('d-none'); // Hide the delete button
        }
    }
});

document.getElementById('saveEditBtn').addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const priceInputs = document.querySelectorAll('.price-input');

    let noChangesMade = true; // Flag to check if any changes were made
    let totalQuantity = 0; // Initialize total quantity
    let totalPrice = 0; // Initialize total price

    selectedCards.forEach((checkbox, index) => {
        const productCard = checkbox.closest('.col-md-auto'); // Get the parent product card

        // Retrieve existing values
        const existingQuantity = productCard.querySelector('.product-quantity').textContent.split(": ")[1].trim();
        const existingPrice = productCard.querySelector('.product-price').textContent.split(": ")[1].trim().substring(1); // Remove the dollar sign

        // Update the quantity and price based on user input
        const newQuantity = quantityInputs[index].value;
        const newPrice = priceInputs[index].value;

        // Check if there are changes
        if (newQuantity !== existingQuantity || newPrice !== existingPrice) {
            noChangesMade = false; // Changes were made
            // Update the quantity
            productCard.querySelector('.product-quantity').textContent = `Quantity: ${newQuantity}`;

            // Update the price with the span to retain styles
            productCard.querySelector('.product-price').innerHTML = `Price: <span class="prices">$${parseFloat(newPrice).toFixed(2)}</span>`;
        }

        // Update history for the change
        const productName = productCard.querySelector('.product-name').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID
        const currentDate = new Date().toLocaleDateString();

        // Only update history if changes were made
        if (!noChangesMade) {
            updateHistory(productName, productDescription, newQuantity, newPrice, productCard.querySelector('.card-img-top').src, 'Quantity and Price Updated', currentDate, productIdNumber);
        }

        // Calculate total quantity and total price
        totalQuantity += parseInt(newQuantity); // Add to total quantity
        totalPrice += parseFloat(newPrice); // Add to total price
    });

    // Alert if no changes were made
    if (noChangesMade) {
        alert("No changes were made to the selected products.");
        return; // Exit the function early
    }

    // Update the total quantity and total price in the UI
    document.getElementById('totalQuantity').textContent = `Total Quantity: ${totalQuantity }`;
    document.getElementById('totalPrice').textContent = `Total Price: $${totalPrice.toFixed(2)}`;

    // Apply the lottery effect to the total quantity and total price
    lotteryEffect(document.getElementById('totalQuantity'), totalQuantity);
    lotteryEffect(document.getElementById('totalPrice'), totalPrice);

    // Uncheck all checkboxes
    selectedCards.forEach(checkbox => {
        checkbox.checked = false; // Uncheck the checkbox
    });

    // Hide the edit button
    document.getElementById('editQuantityPrice').classList.add('d-none'); // Hide the button

    // Close the modal after saving changes
    const modal = bootstrap.Modal.getInstance(document.getElementById('editQuantityPriceModal'));
    if (modal) {
        modal.hide(); // This will close the modal
    } 
});

editQuantityPriceButton.addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');
    const productEditList = document.getElementById('productEditList');
    productEditList.innerHTML = ''; // Clear previous entries

    selectedCards.forEach(checkbox => {
        const productCard = checkbox.closest('.col-md-auto'); // Get the parent product card
        const productName = productCard.querySelector('.product-name').textContent;
        const quantityText = productCard.querySelector('.product-quantity').textContent;
        const priceText = productCard.querySelector('.product-price').textContent;

        // Extract current quantity and price
        const currentQuantity = parseInt(quantityText.split(": ")[1].trim());
        const currentPrice = parseFloat(priceText.split(": ")[1].trim().substring(1));

        // Create a new entry for each selected product
        const productEntry = document.createElement('div');
        productEntry.classList.add('mb-3');
        productEntry.innerHTML = `
            <label>${productName}</label>
            <div class="my-3">
                <label for="quantity" class="form-label">Quantity</label>
                <input type="number" class="form-control quantity-input" value="${currentQuantity}" min="0" />
            </div>
            <div class="mb-3">
                <label for="productPrice" class="form-label">Product Price</label>
                <input type="text" class="form-control price-input" value="${currentPrice.toFixed(2)}" />
            </div>
        `;
        productEditList.appendChild(productEntry);
    });

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('editQuantityPriceModal'));
    modal.show();

    // After the modal is closed, uncheck the checkboxes
    modal._element.addEventListener('hidden.bs.modal', function () {
        selectedCards.forEach(checkbox => {
            checkbox.checked = false; // Uncheck the checkbox
        });
    });
});

document.getElementById('deleteSelected').addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');

    if (selectedCards.length === 0) {
        alert("No items selected for deletion.");
        return;
    }

    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();

    // Handle confirmation of deletion
    document.getElementById('confirmDeleteBtn').onclick = function () {
        // Uncheck the checkboxes before deletion
        selectedCards.forEach(checkbox => {
            checkbox.checked = false; // Uncheck the checkbox
        });

        selectedCards.forEach(checkbox => {
            const productCard = checkbox.closest('.col-md-auto'); // Get the parent product card
            const productName = productCard.querySelector('.product-name').textContent;
            const productDescription = productCard.querySelector('.product-description').textContent;
            const productQuantity = productCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
            const productPrice = productCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
            const productImageUrl = productCard.querySelector('.card-img-top').src;
            const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID

            const deletionDate = new Date().toLocaleDateString();
            archiveProduct(productCard);
            productCard.remove();
            updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Archived', deletionDate, productIdNumber);
        });

        updateTotalCount(); // Update the total count after deletion

        // Hide the edit and delete buttons after deletion
        editQuantityPriceButton.classList.add('d-none'); // Hide the edit button
        document.getElementById('deleteSelected').classList.add('d-none'); // Hide the delete button

        modal.hide(); // Close the confirmation modal
    };
});

// Add event listener to all checkboxes
const checkboxes = document.querySelectorAll('#productCards .form-check-input');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('click', function () {
        const checkboxState = this.checked;
        const editQuantityPriceButton = document.getElementById('editQuantityPrice');

        if (checkboxState) {
            editQuantityPriceButton.classList.remove('d-none');
        } else {
            const checkedCheckboxes = document.querySelectorAll('#productCards .form-check-input:checked');
            if (checkedCheckboxes.length === 0) {
                editQuantityPriceButton.classList.add('d-none');
            }
        }
    });
});

// Add event listener to the "Edit Quantity & Price" button
document.getElementById('editQuantityPrice').addEventListener('click', function () {
    // Your existing code for handling the "Edit Quantity & Price" button click event
});

function attachEditButtonListener(productElement) {
    const editButton = productElement.querySelector('.editBtn');
    editButton.addEventListener('click', function () {
        const productName = productElement.querySelector('.product-name').textContent;
        const productDescription = productElement.querySelector('.product-description').textContent;
        const productQuantity = productElement.querySelector('.product-quantity').textContent.split(":")[1].trim();
        const productPrice = productElement.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
        const productImageUrl = productElement.querySelector('.card-img-top').src;


        document.getElementById('productName').value = productName;
        document.getElementById('productDescription').value = productDescription;
        document.getElementById('quantity').value = productQuantity;
        document.getElementById('productPrice').value = productPrice;
        document.getElementById('imagePreview').src = productImageUrl;
        document.getElementById('imagePreview').style.display = 'block';


        editingProductId = productElement.id;
        editingProductImageUrl = productImageUrl;

        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    });
}

let productToDelete = null; // Variable to store the product element to delete

// Attach listener to the delete button
function attachDeleteButtonListener(productElement) {
    const deleteButton = productElement.querySelector('.deleteBtn');

    // Attach the delete button click handler for this specific product card
    deleteButton.addEventListener('click', function () {
        // Set the product to be deleted to the current productElement (this product card)
        productToDelete = productElement;

        // Show the confirmation modal
        const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        modal.show();
    });
}

document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (productToDelete) {
        const productCard = productToDelete;  // The product to delete

        // Gather product details
        const productName = productCard.querySelector('.product-name').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productQuantity = productCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
        const productPrice = productCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
        const productImageUrl = productCard.querySelector('.card-img-top').src;
        const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID

        const deletionDate = new Date().toLocaleDateString();
        archiveProduct(productCard);
        productCard.remove();
        updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Archived', deletionDate, productIdNumber);
        updateTotalCount();
        productToDelete = null;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    if (modal) {
        modal.hide();
    }
});

// Handle "Yes, Delete" button click in confirmation modal
document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (productToDelete) {
        const productCard = productToDelete;  // The product to delete

        // Gather product details
        const productName = productCard.querySelector('.product-name').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productQuantity = productCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
        const productPrice = productCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
        const productImageUrl = productCard.querySelector('.card-img-top').src;

        // Capture the current date for deletion
        const deletionDate = new Date().toLocaleDateString();

        // Archive the product first (move it to the archive section)
        archiveProduct(productCard);

        // Remove the product card from the DOM
        productCard.remove();

        // Update the history table with the deletion action
        updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Archived', deletionDate);

        // Update the total count of products
        updateTotalCount();

        // Reset the `productToDelete` variable
        productToDelete = null;
    }

    // Close the confirmation modal after the deletion
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
    if (modal) {
        modal.hide();
    }
});

// Reset the productToDelete variable when the confirmation modal is closed (cancelled)
document.getElementById('confirmationModal').addEventListener('hidden.bs.modal', function () {
    productToDelete = null;  // Clear the variable in case the modal is closed without deleting
    // Ensure the backdrop is removed
    document.body.classList.remove('modal-open'); // Remove modal-open class
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
});

// Attach event listener to modal hidden event for product modal
const productModal = document.getElementById('productModal');
productModal.addEventListener('hidden.bs.modal', function () {
    // Remove modal-open class and reset overflow
    document.body.classList.remove('modal-open'); // Remove modal-open class
    document.body.style.overflow = ''; // Reset the overflow style to allow scrolling again
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove(); // Remove modal backdrop
    }
});

function updateHistory(productName, productDescription, quantity, productPrice, imageUrl, status, date, productId) {
    const historyTable = document.querySelector('tbody');

    const row = document.createElement('tr');
    row.classList.add('text-center');
    row.innerHTML = `
        <th scope="row">${historyTable.rows.length + 1}</th>
        <td>${productName}</td>
        <td>${productDescription}</td>
        <td>${productId}</td>
        <td>${date}</td> 
        <td>${quantity}</td>
        <td><img src="${imageUrl}" alt="Product Image" style="height: 40px; width: 50px"></td>
        <td>$${parseFloat(productPrice).toFixed(2)}</td>
        <td>${status}</td>
        <td>
            <button class="btn btn-outline-danger deleteHistoryBtn"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;

    historyTable.appendChild(row);

    attachDeleteHistoryButtonListener(row.querySelector('.deleteHistoryBtn'));
}

document.addEventListener('DOMContentLoaded', function () {
    // Attach delete listeners to existing history rows
    const existingHistoryRows = document.querySelectorAll('tbody tr');
    existingHistoryRows.forEach(row => {
        attachDeleteHistoryButtonListener(row.querySelector('.deleteHistoryBtn'));
    });
});

function attachDeleteHistoryButtonListener(button) {
    button.addEventListener('click', function () {
        console.log("Delete button clicked"); // Log when the button is clicked
        const row = button.closest('tr'); // Get the closest row
        row.remove(); // Remove the row from the table
        updateTotalCount(); // Update the total count if necessary
        renumberHistoryRows(); // Renumber the rows after deletion
    });
}

function renumberHistoryRows() {
    const historyTableRows = document.querySelectorAll('tbody tr'); // Select all rows in the tbody
    historyTableRows.forEach((row, index) => {
        const rowNumberCell = row.querySelector('th'); // Get the first cell (row number)
        rowNumberCell.textContent = index + 1; // Update the row number (index + 1)
    });
}

function updateTotalCount() {
    const totalProductElement = document.getElementById('totalProduct');
    const totalPriceElement = document.getElementById('totalPrice');
    const totalQuantityElement = document.getElementById('totalQuantity');

    // Get all remaining product cards in the inventory section
    const productCards = document.querySelectorAll('#productCards .card'); // Select only the cards in the productCards section
    const totalCount = productCards.length; // Get the current number of products
    let totalPrice = 0;
    let totalQuantity = 0;

    // Loop through each product card to calculate the total price and total quantity
    for (let card of productCards) {
        const quantityText = card.querySelector('.product-quantity').textContent;
        const priceText = card.querySelector('.product-price').textContent;

        const quantity = parseInt(quantityText.split(":")[1].trim());
        const price = parseFloat(priceText.split(":")[1].trim().substring(1));

        totalQuantity += quantity;
        totalPrice += price;
    }

    // Update the total product count, price, and quantity display with lottery effect
    lotteryEffect(totalProductElement, totalCount);
    lotteryEffect(totalPriceElement, totalPrice);
    lotteryEffect(totalQuantityElement, totalQuantity);  // Total quantity of all products
}

// Attach listeners to all existing product cards
document.addEventListener('DOMContentLoaded', function () {
    const existingProductCards = document.querySelectorAll('[id^="product"]'); // Select all product cards
    existingProductCards.forEach(productCard => {
        attachDeleteButtonListener(productCard);
        attachEditButtonListener(productCard);
    });
    updateTotalCount(); // Initialize totals on page load
});

function archiveProduct(productCard) {
    const archiveSection = document.querySelector('#archive .row'); // Select the archive section

    // Ensure the archive section exists
    if (!archiveSection) {
        return;
    }

    // Clone the product card to keep the original in the history
    const archivedCard = productCard.cloneNode(true);

    // Remove the delete and edit buttons from the archived product card
    const deleteButton = archivedCard.querySelector('.deleteBtn');
    const editButton = archivedCard.querySelector('.editBtn');
    if (deleteButton) deleteButton.remove();
    if (editButton) editButton.remove();

    const productName = archivedCard.querySelector('.product-name').textContent;
    archivedCard.setAttribute('data-name', productName); // Set the data-name attribute

    // Create restore and delete buttons
    const restoreButton = document.createElement('button');
    restoreButton.classList.add('btn', 'btn-outline-success', 'restoreBtn');
    restoreButton.textContent = 'Restore';

    const permanentDeleteButton = document.createElement('button');
    permanentDeleteButton.classList.add('btn', 'btn-outline-danger', 'permanentDeleteBtn');
    permanentDeleteButton.textContent = 'Del';

    // Append the new buttons to the archived card
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'mt-2');
    buttonContainer.appendChild(restoreButton);
    buttonContainer.appendChild(permanentDeleteButton);
    archivedCard.querySelector('.card-body').appendChild(buttonContainer);

    archivedCard.classList.add('col-md-auto');

    archiveSection.appendChild(archivedCard);

    // Attach listeners to the new buttons
    attachRestoreButtonListener(restoreButton, archivedCard);
    attachPermanentDeleteButtonListener(permanentDeleteButton, archivedCard); // Attach the delete listener to the new card

    // Recalculate totals after archiving the product
    updateTotalCount();
}

function attachRestoreButtonListener(restoreButton, archivedCard) {
    restoreButton.addEventListener('click', function () {
        // Get the product details from the archived card
        const productName = archivedCard.querySelector('.product-name').textContent;
        const productDescription = archivedCard.querySelector('.product-description').textContent;
        const productQuantity = archivedCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
        const productPrice = archivedCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
        const productImageUrl = archivedCard.querySelector('.card-img-top').src;

        // Extract the product ID from the archived card
        const productId = archivedCard.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID

        // Restore the product card to the inventory using the original product ID
        createProductCard(`product${productId}`, productName, productDescription, productQuantity, productPrice, productImageUrl, new Date().toLocaleDateString());

        // Update the history with the restoration, including the original product ID
        const restorationDate = new Date().toLocaleDateString(); // Get the current date for restoration
        updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Restored', restorationDate, productId);

        // Remove the archived card from the archive section
        archivedCard.remove();

        // Update the total count
        updateTotalCount();
    });
}

function attachPermanentDeleteButtonListener(permanentDeleteButton, archivedCard) {
    permanentDeleteButton.addEventListener('click', function () {

        const modal = new bootstrap.Modal(document.getElementById('permanentDeleteModal'));
        modal.show();

        const cardToDelete = archivedCard;

        document.getElementById('confirmPermanentDeleteBtn').onclick = function () {

            const productName = cardToDelete.querySelector('.product-name').textContent;
            const productDescription = cardToDelete.querySelector('.product-description').textContent;
            const productQuantity = cardToDelete.querySelector('.product-quantity').textContent.split(":")[1].trim();
            const productPrice = cardToDelete.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
            const productImageUrl = cardToDelete.querySelector('.card-img-top').src;

            const productId = cardToDelete.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID

            const deletionDate = new Date().toLocaleDateString();

            updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Permanently Deleted', deletionDate, productId);

            cardToDelete.remove();

            updateTotalCount();

            modal.hide();
        };
    });
}

function lotteryEffect(element, finalValue) {
    const duration = 400; // Duration of the effect in milliseconds
    const startTime = performance.now();
    const initialValue = parseFloat(element.textContent) || 0; // Get the current value or 0 if not set

    function animate() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1); // Normalize progress to [0, 1]

        // Generate a random number to display
        const randomValue = Math.floor(Math.random() * (finalValue + 100)); // Random number up to finalValue + 100
        element.textContent = randomValue.toFixed(2); // Update the element with the random value

        if (progress < 1) {
            requestAnimationFrame(animate); // Continue the animation
        } else {
            element.textContent = finalValue.toFixed(2); // Set the final value
        }
    }

    requestAnimationFrame(animate); // Start the animation
}

$(document).ready(function () {
    // Smooth scrolling for navigation links
    $('.nav-link').on('click', function (event) {
        event.preventDefault();

        // Get the target section
        var target = $(this).attr('href');

        // Animate the scroll
        $('html, body').animate({
            scrollTop: $(target).offset().top - 70 // Adjust for the margin
        }, {
            duration: 500, // Duration of the scroll
            easing: 'swing' // Easing effect
        });

        // Highlight the active link
        $('.nav-link').removeClass('active'); // Remove active class from all links
        $(this).addClass('active'); // Add active class to the clicked link
    });

    // Highlight the active link on scroll
    $(window).on('scroll', function () {
        var scrollPos = $(document).scrollTop();
        $('.nav-link').each(function () {
            var currLink = $(this);
            var refElement = $(currLink.attr("href"));
            if (refElement.position().top <= scrollPos + 70 && refElement.position().top + refElement.height() > scrollPos + 70) {
                $('.nav-link').removeClass("active");
                currLink.addClass("active");
            } else {
                currLink.removeClass("active");
            }
        });
    });
});

// Wait for the document to be ready
$(document).ready(function () {
    // Handle search input
    $('#search').on('keyup', function () {
        var searchQuery = $(this).val().toLowerCase();  // Get search query and convert it to lowercase

        // Loop through each product card
        $('#productCards .col-md-auto').each(function () {
            var productName = $(this).find('.product-name').text().toLowerCase(); // Get product name and convert it to lowercase

            // If the product name matches the search query (case-insensitive), show the product, otherwise hide it
            if (productName.indexOf(searchQuery) > -1) {
                $(this).show(); // Show matching product card
            } else {
                $(this).hide(); // Hide non-matching product card
            }
        });
    });
});

$(document).ready(function () {
    $('#search-btn').on('click', function () {
        const searchTerm = $('#search').val().toLowerCase(); // Get the search term and convert to lowercase
        const productCards = $('#productCards .col-md-auto'); // Select all product cards

        productCards.each(function () {
            const productName = $(this).find('.product-name').text().toLowerCase(); // Get product name
            const productId = $(this).find('.product-id').text().toLowerCase(); // Get product ID

            // Check if the search term matches either the product name or the product ID
            if (productName.includes(searchTerm) || productId.includes(searchTerm)) {
                $(this).show(); // Show the card if it matches
            } else {
                $(this).hide(); // Hide the card if it doesn't match
            }
        });
    });

    // Optional: Add keyup event for real-time search
    $('#search').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase(); // Get the search term and convert to lowercase
        const productCards = $('#productCards .col-md-auto'); // Select all product cards

        productCards.each(function () {
            const productName = $(this).find('.product-name').text().toLowerCase(); // Get product name
            const productId = $(this).find('.product-id').text().toLowerCase(); // Get product ID

            if (productName.includes(searchTerm) || productId.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $('#search-btn-history').on('click', function () {
        const query = $('#search-history').val().toLowerCase();


        $('#historyTableBody tr').each(function () {
            const productName = $(this).find('td:nth-child(2)').text().toLowerCase();
            const productId = $(this).find('td:nth-child(4)').text().toLowerCase();


            if (productName.includes(query) || productId.includes(query)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });


    $('#search-history').on('keyup', function () {
        const query = $(this).val().toLowerCase();


        $('#historyTableBody tr').each(function () {
            const productName = $(this).find('td:nth-child(2)').text().toLowerCase();
            const productId = $(this).find('td:nth-child(4)').text().toLowerCase();

            if (productName.includes(query) || productId.includes(query)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});

document.querySelectorAll('.box1, .box2, .box3').forEach(box => {
    box.addEventListener('mouseenter', () => {
    });
});
