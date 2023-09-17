document.addEventListener('DOMContentLoaded', function () {
    // JavaScript to toggle the details section when an item is clicked
    const itemContainers = document.querySelectorAll('.item-container');
    const arrows = document.querySelectorAll('.arrow');
    const details = document.querySelectorAll('.details');

    itemContainers.forEach((container, index) => {
        const itemHeader = container.querySelector('.item-header');
        itemHeader.addEventListener('click', () => {
            // Toggle the details section for the clicked item
            details[index].classList.toggle('open');
            arrows[index].classList.toggle('rotate');
            arrows[index].textContent = arrows[index].classList.contains('rotate') ? '▲' : '▼';
        });
    });
});
