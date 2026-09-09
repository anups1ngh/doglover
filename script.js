/// <reference path="typings/globals/jquery/index.d.ts" />

var select_breed = $('#breed');
var select_sub_breed = $('#sub-breed');
var button_get_images = $('#get-images-button');
var div_container2 = $('#container2');
var status_text = $('#status');
var recieved_dom_data = {};

select_sub_breed.hide();

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
        var figure = $('<figure class="dog-card"></figure>').css('--delay', (index % 12) * 35 + 'ms');
        figure.append($(document.createElement('img')).attr('src', link).attr('alt', 'Dog image'));
        div_container2.append(figure);
    });

    status_text.text('Showing ' + images.length + ' images.');
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
