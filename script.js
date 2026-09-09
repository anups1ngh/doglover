/// <reference path="typings/globals/jquery/index.d.ts" />

var select_breed = $('#breed');
var select_sub_breed = $('#sub-breed');
var button_get_images = $('#get-images-button');
var div_container2 = $('#container2');
var status_text = $('#status');
var preview_modal = $('#preview-modal');
var preview_image = $('#preview-image');
var zoom_level = $('#zoom-level');
var recieved_dom_data = {};
var current_zoom = 1;

var MIN_ZOOM = 1;
var MAX_ZOOM = 3;
var ZOOM_STEP = 0.2;

select_sub_breed.hide();

function clampZoom(value) {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function updateZoomDisplay() {
    preview_image.css('transform', 'scale(' + current_zoom + ')');
    zoom_level.text(Math.round(current_zoom * 100) + '%');
}

function setZoom(nextZoom) {
    current_zoom = clampZoom(nextZoom);
    updateZoomDisplay();
}

function openPreview(src, altText) {
    preview_image.attr('src', src);
    preview_image.attr('alt', altText || 'Dog preview image');
    setZoom(1);
    preview_modal.addClass('is-open').attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
}

function closePreview() {
    preview_modal.removeClass('is-open').attr('aria-hidden', 'true');
    preview_image.attr('src', '');
    $('body').css('overflow', '');
}

function renderSubBreeds() {
    var breed = select_breed.val();

    if (!breed || !recieved_dom_data[breed] || recieved_dom_data[breed].length === 0) {
        select_sub_breed.hide();
        return;
    }

    $('#sub-breed option').remove();
    for (let current_sub_breed of recieved_dom_data[breed]) {
        select_sub_breed.append($('<option value="' + current_sub_breed + '">' + current_sub_breed + '</option>'));
    }

    select_sub_breed.show();
}

function renderImages(images) {
    div_container2.empty();

    if (!images || images.length === 0) {
        status_text.text('No images found for this selection.');
        return;
    }

    images.forEach(function (link, index) {
        var figure = $('<figure class="dog-card"></figure>').css('--delay', (index % 12) * 45 + 'ms');
        var button = $('<button type="button" class="preview-trigger" aria-label="Open dog image preview"></button>');
        var img = $(document.createElement('img')).attr('src', link).attr('alt', 'Dog image ' + (index + 1));

        button.append(img);
        button.data('image-link', link);
        figure.append(button);
        div_container2.append(figure);
    });

    status_text.text('Showing ' + images.length + ' images. Click any photo to zoom preview.');
}

function fetchImages(url) {
    status_text.text('Loading images...');

    $.ajax({
        method: 'get',
        url: url,
        success: function (response) {
            renderImages(response.message);
        },
        error: function () {
            div_container2.empty();
            status_text.text('Could not load images. Please try again.');
        }
    });
}

(function () {
    $.ajax({
        method: 'get',
        url: 'https://dog.ceo/api/breeds/list/all',
        success: function (response) {
            recieved_dom_data = response.message || {};

            for (let current_breed in recieved_dom_data) {
                select_breed.append($('<option value="' + current_breed + '">' + current_breed + '</option>'));
            }

            renderSubBreeds();
            status_text.text('Pick a breed and load your gallery.');
        },
        error: function () {
            status_text.text('Could not load breeds. Refresh and try again.');
        }
    });
})();

select_breed.on('change', renderSubBreeds);

button_get_images.click(function () {
    if (!select_breed.val()) {
        status_text.text('Please select a breed first.');
        return;
    }

    if (select_sub_breed.is(':visible') && select_sub_breed.val()) {
        fetchImages('https://dog.ceo/api/breed/' + select_breed.val() + '/' + select_sub_breed.val() + '/images');
        return;
    }

    fetchImages('https://dog.ceo/api/breed/' + select_breed.val() + '/images');
});

div_container2.on('click', '.preview-trigger', function () {
    var src = $(this).data('image-link');
    openPreview(src, 'Dog preview image');
});

$('#preview-close').on('click', closePreview);
$('#zoom-in').on('click', function () { setZoom(current_zoom + ZOOM_STEP); });
$('#zoom-out').on('click', function () { setZoom(current_zoom - ZOOM_STEP); });
$('#zoom-reset').on('click', function () { setZoom(1); });

preview_modal.on('click', function (event) {
    if (event.target === this) {
        closePreview();
    }
});

$('.preview-stage').on('wheel', function (event) {
    if (!preview_modal.hasClass('is-open')) {
        return;
    }

    event.preventDefault();
    var originalEvent = event.originalEvent;
    var direction = originalEvent.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom(current_zoom + direction);
});

$(document).on('keydown', function (event) {
    if (!preview_modal.hasClass('is-open')) {
        return;
    }

    if (event.key === 'Escape') {
        closePreview();
    } else if (event.key === '+' || event.key === '=') {
        setZoom(current_zoom + ZOOM_STEP);
    } else if (event.key === '-') {
        setZoom(current_zoom - ZOOM_STEP);
    } else if (event.key === '0') {
        setZoom(1);
    }
});
