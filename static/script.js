const listSection = document.querySelector('.list-section');
const listContainer = document.querySelector('.list');
const fileSelector = document.querySelector('.file-selector');
const fileSelectorInput = document.querySelector('.file-selector-input');
const mergeButton = document.querySelector('input[type="submit"]');

let uploadedPDFCount = 0;

function updateMergeButtonState() {
    if (uploadedPDFCount >= 2) {
        mergeButton.disabled = false;
    } else {
        mergeButton.disabled = true;
    }
}

updateMergeButtonState();

function clearUploadedFiles() {
    listContainer.innerHTML = '';
    uploadedPDFCount = 0;
    updateMergeButtonState();
}
function typeValidation(type) {
    if (type == 'application/pdf') { // only allows pdf files
        return true;
    }
}

fileSelector.onclick = () => fileSelectorInput.click();
fileSelectorInput.onchange = () => {
    clearUploadedFiles();
    [...fileSelectorInput.files].forEach((file) => {
        if (typeValidation(file.type)) {
            uploadFile(file);
        }
    });
};

function iconSelector(type) {
    var splitType = (type.split('/')[0] == 'application') ? type.split('/')[1] : type.split('/')[0];
    return splitType + '.png';
}

function uploadFile(file) {
    listSection.style.display = 'block';
    const fileId = 'file_' + uploadedPDFCount;
    var li = document.createElement('li');
    li.classList.add('in-prog');
    li.dataset.fileName = fileId;
    li.innerHTML = `
        <div class="col">
            <img src="/static/icons/${iconSelector(file.type)}" alt="">
        </div>
        <div class="col">
            <div class="file-name">
                <div class="name">${file.name}</div>
                <span>0%</span>
            </div>
            <div class="file-progress">
                <span></span>
            </div>
            <div class="file-size">${(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        </div>
        <div class="col">
        </div>
    `;
    listContainer.append(li);
    uploadedPDFCount++;
    updateMergeButtonState();
    var formData = new FormData();
    formData.append('pdf_files', file);
    formData.append('file_id', fileId);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/', true);
    xhr.upload.onprogress = function (e) {
        var percent_complete = (e.loaded / e.total) * 100;
        li.querySelectorAll('span')[0].innerHTML = Math.round(percent_complete) + '%';
        li.querySelectorAll('span')[1].style.width = percent_complete + '%';
    };
    xhr.onload = function () {
        if (xhr.status === 200) {
            li.classList.add('complete');
            li.classList.remove('in-prog');
        } else {
            alert('An error occurred while uploading the file.');
        }
    };
    xhr.onerror = function () {
        alert('An error occurred while uploading the file.');
    };
    xhr.send(formData);
}

$(document).ready(function () {
    let order = [];

    $("#sortable").sortable({
        update: function (event, ui) {
            order.length = 0;
            $("#sortable li").each(function (index) {
                order.push($(this).attr('data-index'));
                $(this).find('.index').text(index + 1);
            });
            $("#file_order").val(order.join(','));
        }
    });

    function updateIndices() {
        $("#sortable li").each(function (index) {
            $(this).attr('data-index', index);
            $(this).find('.index').text(index + 1);
        });
        $("#sortable").sortable("refresh");
    }

    $("#pdf_files").change(function () {
        let newFiles = this.files;
        let newOrder = [];
        for (let i = 0; i < newFiles.length; i++) {
            newOrder.push(i);
        }
        updateFileInput(newFiles, newOrder);
    });
    

    function updateFileInput(newFiles, newOrder) {
        fileSelectorInput.files = newFiles;
        updateIndices();
        $("#file_order").val(newOrder.join(','));
    }
});