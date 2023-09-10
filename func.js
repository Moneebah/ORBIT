
const slider = document.querySelector(".slider");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const slides = document.querySelectorAll(".slide");
const slideIcons = document.querySelectorAll(".slide-icon");
const numberOfSlides = slides.length;
var slideNumber = 0;

//image slider next button
nextBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });
    slideIcons.forEach((slideIcon) => {
        slideIcon.classList.remove("active");
    });

    slideNumber++;

    if (slideNumber > (numberOfSlides - 1)) {
        slideNumber = 0;
    }

    slides[slideNumber].classList.add("active");
    slideIcons[slideNumber].classList.add("active");
});

//image slider previous button
prevBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });
    slideIcons.forEach((slideIcon) => {
        slideIcon.classList.remove("active");
    });

    slideNumber--;

    if (slideNumber < 0) {
        slideNumber = numberOfSlides - 1;
    }

    slides[slideNumber].classList.add("active");
    slideIcons[slideNumber].classList.add("active");
});

const featureTexts = document.querySelectorAll(".featuretext");

nextBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });
    slideIcons.forEach((slideIcon) => {
        slideIcon.classList.remove("active");
    });
    featureTexts.forEach((featureText) => {
        featureText.style.display = "none";
    });

    slideNumber++;

    if (slideNumber > (numberOfSlides - 1)) {
        slideNumber = 0;
    }

    slides[slideNumber].classList.add("active");
    slideIcons[slideNumber].classList.add("active");
    document.querySelector(`.featuretext[data-slide="${slideNumber}"]`).style.display = "block";
});

prevBtn.addEventListener("click", () => {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });
    slideIcons.forEach((slideIcon) => {
        slideIcon.classList.remove("active");
    });
    featureTexts.forEach((featureText) => {
        featureText.style.display = "none";
    });

    slideNumber--;

    if (slideNumber < 0) {
        slideNumber = numberOfSlides - 1;
    }

    slides[slideNumber].classList.add("active");
    slideIcons[slideNumber].classList.add("active");
    document.querySelector(`.featuretext[data-slide="${slideNumber}"]`).style.display = "block";
});


/*
//image slider autoplay
var playSlider;

var repeater = () => {
    playSlider = setInterval(function () {
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });
        slideIcons.forEach((slideIcon) => {
            slideIcon.classList.remove("active");
        });

        slideNumber++;

        if (slideNumber > (numberOfSlides - 1)) {
            slideNumber = 0;
        }

        slides[slideNumber].classList.add("active");
        slideIcons[slideNumber].classList.add("active");
    }, 4000);
}
repeater();

//stop the image slider autoplay on mouseover
slider.addEventListener("mouseover", () => {
    clearInterval(playSlider);
});

//start the image slider autoplay again on mouseout
slider.addEventListener("mouseout", () => {
    repeater();
}); */


/*


const featureTexts = document.querySelectorAll(".featuretext");

// Hide all feature texts except the first one
featureTexts.forEach((featureText, index) => {
    if (index !== 0) {
        featureText.style.display = "none";
    }
});

// Add event listener to next button
nextBtn.addEventListener("click", () => {
    // Hide current feature text
    featureTexts[slideNumber].style.display = "none";
    // Show next feature text
    slideNumber++;
    if (slideNumber > numberOfSlides - 1) {
        slideNumber = 0;
    }
    featureTexts[slideNumber].style.display = "block";
    featureTexts[slideNumber].classList.add("fade-in");
});

/*explanation of the next portion: hides all the .featuretext elements 
except the first one also adds event listeners to the next and previous 
buttons to show corresponding .featuretext element when the slide changes
adds a fade-in animation to the .featuretext elements when they are displayed */

/*
// Add event listener to previous button
prevBtn.addEventListener("click", () => {
    // Hide current feature text
    featureTexts[slideNumber].style.display = "none";
    // Show previous feature text
    slideNumber--;
    if (slideNumber < 0) {
        slideNumber = numberOfSlides - 1;
    }
    featureTexts[slideNumber].style.display = "block";
    featureTexts[slideNumber].classList.add("fade-in");
});

// Add fade-in animation to CSS
const style = document.createElement('style');
style.innerHTML = `
.fade-in {
  animation: fadeIn ease 1s;
}

@keyframes fadeIn {
  0% {opacity:0;}
  100% {opacity:1;}
}
`;
document.head.appendChild(style);
*/
