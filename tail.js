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

    if (quantity <= 0) {
        alert("Quantity must be greater than 0.");
        return;
    }

    if (productPrice <= 0) {
        alert("Price must be greater than 0.");
        return;
    }

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
            </div>
        </div>
    </div>
    `;

    document.getElementById('productCards').appendChild(productCard);

    attachEditButtonListener(productCard);
}

let selectedProductCard = null;

document.getElementById('editQuantityPrice').addEventListener('click', function () {
    const selectedCards = document.querySelectorAll('#productCards .form-check-input:checked');

    selectedProductCard = selectedCards[0].closest('.col-md-auto')
    const quantityText = selectedProductCard.querySelector('.product-quantity').textContent;
    const priceText = selectedProductCard.querySelector('.product-price').textContent;

    const currentQuantity = parseInt(quantityText.split(": ")[1].trim());
    const currentPrice = parseFloat(priceText.split(": ")[1].trim().substring(1));

    document.getElementById('editQuantity').value = currentQuantity;
    document.getElementById('editPrice').value = currentPrice.toFixed(2);

    const modal = new bootstrap.Modal(document.getElementById('editQuantityPriceModal'));
    modal.show();
});

document.getElementById('editQuantityPrice').addEventListener('click', function () {
    
    const editQuantityPriceModal = document.getElementById('editQuantityPriceModal');
    editQuantityPriceModal.addEventListener('hidden.bs.modal', function () {
        document.getElementById('editQuantityPrice').classList.add('d-none');
        document.getElementById('deleteSelected').classList.add('d-none');
    });

    productModal.addEventListener('hidden.bs.modal', function () {
        document.getElementById('editQuantityPrice').classList.add('d-none');
        document.getElementById('deleteSelected').classList.add('d-none');
    });
});


const productCardsContainer = document.getElementById('productCards');
const editQuantityPriceButton = document.getElementById('editQuantityPrice');

productCardsContainer.addEventListener('change', function (event) {

    if (event.target.classList.contains('form-check-input')) {
        const checkedCheckboxes = productCardsContainer.querySelectorAll('.form-check-input:checked');

        if (checkedCheckboxes.length > 0) {
            editQuantityPriceButton.classList.remove('d-none');
            document.getElementById('deleteSelected').classList.remove('d-none');
        } else {
            editQuantityPriceButton.classList.add('d-none');
            document.getElementById('deleteSelected').classList.add('d-none')
        }
    }
});

editQuantityPriceButton.addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');
    const productEditList = document.getElementById('productEditList');
    productEditList.innerHTML = '';

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

    const modal = new bootstrap.Modal(document.getElementById('editQuantityPriceModal'));
    modal.show();

    modal._element.addEventListener('hidden.bs.modal', function () {
        selectedCards.forEach(checkbox => {
            checkbox.checked = false;
        });
    });
});

document.getElementById('saveEditBtn').addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const priceInputs = document.querySelectorAll('.price-input');

    let noChangesMade = true;
    let negativeInputDetected = false;

    selectedCards.forEach((checkbox, index) => {
        const productCard = checkbox.closest('.col-md-auto');

        const existingQuantity = productCard.querySelector('.product-quantity').textContent.split(": ")[1].trim();
        const existingPrice = productCard.querySelector('.product-price').textContent.split(": ")[1].trim().substring(1);

        const newQuantity = quantityInputs[index].value;
        const newPrice = priceInputs[index].value;

        if (newQuantity < 0) {
            alert("Quantity must be greater than or equal to 0");
            negativeInputDetected = true;
            return;
        }

        if (newPrice < 0) {
            alert("Price must be greater than or equal to 0");
            negativeInputDetected = true;
            return;
        }

        if (newQuantity !== existingQuantity || newPrice !== existingPrice) {
            noChangesMade = false;

            productCard.querySelector('.product-quantity').textContent = `Quantity: ${newQuantity}`;
            productCard.querySelector('.product-price').innerHTML = `Price: <span class="prices">$${parseFloat(newPrice).toFixed(2)}</span>`;
        }

        const productName = productCard.querySelector('.product-name').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1];
        const currentDate = new Date().toLocaleDateString();

        if (!noChangesMade) {
            updateHistory(productName, productDescription, newQuantity, newPrice, productCard.querySelector('.card-img-top').src, 'Quantity and Price Updated', currentDate, productIdNumber);
        }
    });

    if (noChangesMade && !negativeInputDetected) {
        alert("No changes were made to the selected products.");
        return;
    }

    updateTotalCount();

    selectedCards.forEach(checkbox => {
        checkbox.checked = false;
    });

    document.getElementById('editQuantityPrice').classList.add('d-none');

    const modal = bootstrap.Modal.getInstance(document.getElementById('editQuantityPriceModal'));
    if (modal) {
        modal.hide();
    }
});

document.getElementById('deleteSelected').addEventListener('click', function () {
    const selectedCards = productCardsContainer.querySelectorAll('.form-check-input:checked');

    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();

    document.getElementById('confirmDeleteBtn').onclick = function () {
        selectedCards.forEach(checkbox => {
            checkbox.checked = false;
        });

        selectedCards.forEach(checkbox => {
            const productCard = checkbox.closest('.col-md-auto');
            const productName = productCard.querySelector('.product-name').textContent;
            const productDescription = productCard.querySelector('.product-description').textContent;
            const productQuantity = productCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
            const productPrice = productCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
            const productImageUrl = productCard.querySelector('.card-img-top').src;
            const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1];

            const deletionDate = new Date().toLocaleDateString();
            archiveProduct(productCard);
            productCard.remove();
            updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Archived', deletionDate, productIdNumber);
        });

        updateTotalCount();


        editQuantityPriceButton.classList.add('d-none');
        document.getElementById('deleteSelected').classList.add('d-none');

        modal.hide();
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

let productToDelete = null;

document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (productToDelete) {
        const productCard = productToDelete;

        const productName = productCard.querySelector('.product-name').textContent;
        const productDescription = productCard.querySelector('.product-description').textContent;
        const productQuantity = productCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
        const productPrice = productCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
        const productImageUrl = productCard.querySelector('.card-img-top').src;
        const productIdNumber = productCard.querySelector('.product-id').textContent.split(': ')[1];

        const deletionDate = new Date().toLocaleDateString();

        
        if (!archivedProductIds.has(productIdNumber)) {
            archiveProduct(productCard); 
            archivedProductIds.add(productIdNumber); 
        }

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

document.getElementById('confirmationModal').addEventListener('hidden.bs.modal', function () {
    productToDelete = null;  

    document.body.classList.remove('modal-open'); 
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
});

const productModal = document.getElementById('productModal');
productModal.addEventListener('hidden.bs.modal', function () {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
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
    const existingHistoryRows = document.querySelectorAll('tbody tr');
    existingHistoryRows.forEach(row => {
        attachDeleteHistoryButtonListener(row.querySelector('.deleteHistoryBtn'));
    });
});

function attachDeleteHistoryButtonListener(button) {
    button.addEventListener('click', function () {
        const row = button.closest('tr');
        row.remove();
        updateTotalCount();
        renumberHistoryRows();
    });
}

function renumberHistoryRows() {
    const historyTableRows = document.querySelectorAll('tbody tr');
    historyTableRows.forEach((row, index) => {
        const rowNumberCell = row.querySelector('th');
        rowNumberCell.textContent = index + 1;
    });
}

function updateTotalCount() {
    const totalProductElement = document.getElementById('totalProduct');
    const totalPriceElement = document.getElementById('totalPrice');
    const totalQuantityElement = document.getElementById('totalQuantity');

    const productCards = document.querySelectorAll('#productCards .card'); // Select only the cards in the productCards section
    const totalCount = productCards.length; // Get the current number of products
    let totalPrice = 0;
    let totalQuantity = 0;

    // Loop through each product card to calculate the total price and total quantity
    productCards.forEach(card => {
        const quantityText = card.querySelector('.product-quantity').textContent;
        const priceText = card.querySelector('.product-price').textContent;

        const quantity = parseInt(quantityText.split(":")[1].trim());
        const price = parseFloat(priceText.split(":")[1].trim().substring(1));

        totalQuantity += quantity;
        totalPrice += price;
    });

    lotteryEffect(totalProductElement, totalCount);
    lotteryEffect(totalPriceElement, totalPrice);
    lotteryEffect(totalQuantityElement, totalQuantity);
}

document.addEventListener('DOMContentLoaded', function () {
    const existingProductCards = document.querySelectorAll('[id^="product"]'); // Select all product cards
    existingProductCards.forEach(productCard => {
        attachEditButtonListener(productCard);
    });
    updateTotalCount(); 
});

const archivedProductIds = new Set(); 

function archiveProduct(productCard) {
    const archiveSection = document.querySelector('#archive .row');
    if (!archiveSection) {
        return;
    }

    const productId = productCard.querySelector('.product-id').textContent.split(': ')[1];

    
    if (archivedProductIds.has(productId)) {
        return; 
    }

    const archivedCard = productCard.cloneNode(true);

   
    const editButton = archivedCard.querySelector('.editBtn');
    if (editButton) editButton.remove();

    archivedCard.setAttribute('data-archived-id', productId);
    archivedProductIds.add(productId); 

    const restoreButton = document.createElement('button');
    restoreButton.classList.add('btn', 'btn-outline-success', 'restoreBtn');
    restoreButton.textContent = 'Restore';

    const permanentDeleteButton = document.createElement('button');
    permanentDeleteButton.classList.add('btn', 'btn-outline-danger', 'permanentDeleteBtn');
    permanentDeleteButton.textContent = 'Del';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'mt-2');
    buttonContainer.appendChild(restoreButton);
    buttonContainer.appendChild(permanentDeleteButton);
    archivedCard.querySelector('.card-body').appendChild(buttonContainer);

    archivedCard.classList.add('col-md-auto');

    archiveSection.appendChild(archivedCard);

    attachRestoreButtonListener(restoreButton, archivedCard);
    attachPermanentDeleteButtonListener(permanentDeleteButton, archivedCard); // Attach the delete listener to the new card

    updateTotalCount();
}

function attachRestoreButtonListener(restoreButton, archivedCard) {
    restoreButton.addEventListener('click', function () {
        const modal = new bootstrap.Modal(document.getElementById('restoreModal'));
        modal.show();

        document.getElementById('confirmRestore').onclick = function () {
            // Get the product details from the archived card
            const productName = archivedCard.querySelector('.product-name').textContent;
            const productDescription = archivedCard.querySelector('.product-description').textContent.replace("Description: ", ""); 
            const productQuantity = archivedCard.querySelector('.product-quantity').textContent.split(":")[1].trim();
            const productPrice = archivedCard.querySelector('.product-price').textContent.split(":")[1].trim().substring(1);
            const productImageUrl = archivedCard.querySelector('.card-img-top').src;

            // Extract the product ID from the archived card
            const productId = archivedCard.querySelector('.product-id').textContent.split(': ')[1]; // Get the unique ID

            createProductCard(`product${productId}`, productName, productDescription, productQuantity, productPrice, productImageUrl, new Date().toLocaleDateString());

            const restorationDate = new Date().toLocaleDateString();
            updateHistory(productName, productDescription, productQuantity, productPrice, productImageUrl, 'Has Been Restored', restorationDate, productId);

            archivedCard.remove();
            archivedProductIds.delete(productId);

            updateTotalCount();

            modal.hide();
        };
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
    const duration = 400;
    const startTime = performance.now();
    const initialValue = parseFloat(element.textContent) || 0;

    function animate() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const randomValue = Math.floor(Math.random() * (finalValue + 100));
        element.textContent = randomValue.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = finalValue.toFixed(2);
        }
    }

    requestAnimationFrame(animate);
}

$(document).ready(function () {
    $('.nav-link').on('click', function (event) {
        event.preventDefault();

        var target = $(this).attr('href');

        $('html, body').animate({
            scrollTop: $(target).offset().top - 70
        }, {
            duration: 500,
            easing: 'swing'
        });

        $('.nav-link').removeClass('active');
        $(this).addClass('active');
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

$(document).ready(function () {
    $('#search').on('keyup', function () {
        var searchQuery = $(this).val().toLowerCase();

        $('#productCards .col-md-auto').each(function () {
            var productName = $(this).find('.product-name').text().toLowerCase();

            if (productName.indexOf(searchQuery) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});

$(document).ready(function () {
    $('#search-btn').on('click', function () {
        const searchTerm = $('#search').val().toLowerCase();
        const productCards = $('#productCards .col-md-auto');

        productCards.each(function () {
            const productName = $(this).find('.product-name').text().toLowerCase();
            const productId = $(this).find('.product-id').text().toLowerCase();

            if (productName.includes(searchTerm) || productId.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });


    $('#search').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();
        const productCards = $('#productCards .col-md-auto');

        productCards.each(function () {
            const productName = $(this).find('.product-name').text().toLowerCase();
            const productId = $(this).find('.product-id').text().toLowerCase();

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
