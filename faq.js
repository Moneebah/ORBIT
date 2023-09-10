(function () {

    const headers = document.getElementsByClassName("header"),
        contents = document.getElementsByClassName("content"),
        icons = document.getElementsByClassName("icon");

    for (let i = 0; i < headers.length; i++) {
        headers[i].addEventListener("click", () => {

            for (let j = 0; j < contents.length; j++) {
                if (i == j) {
                    icons[j].innerHTML = contents[j].getBoundingClientRect().height === 0 ? "-" : "+";
                    contents[j].classList.toggle("content-transition");
                } else {
                    icons[j].innerHTML = "+";
                    contents[j].classList.remove("content-transition");
                }
            }

        });
    }

})()

const buttons = document.querySelector('.buttons');
const panels = document.querySelectorAll('.panel');

buttons.addEventListener('click', handleClick);

function handleClick(e) {

    if (e.target.matches('button')) {
        const openContent = document.querySelector('.content-transition');
        if (openContent) {
            openContent.classList.remove('content-transition');
            openContent.previousElementSibling.querySelector('.icon').innerHTML = '+';
        }

        panels.forEach(panel => panel.classList.remove('show'));

        const { id } = e.target.dataset;

        const selector = `.panel[id="${id}"]`;

        document.querySelector(selector).classList.add('show');
    }
}

document.querySelector('.panel[id="myorders"]').classList.add('show');
