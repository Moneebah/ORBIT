const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const professionalOption = document.querySelector('.option.professional');
const noviceOption = document.querySelector('.option.novice');

professionalOption.addEventListener('click', () => {
    const errorMessage = document.querySelector('.error-message.user-type');
    if (errorMessage) {
        errorMessage.remove();
    }
    if (!professionalOption.classList.contains('selected')) {
        professionalOption.classList.add('selected');
        noviceOption.classList.remove('selected');
    }
});

noviceOption.addEventListener('click', () => {
    const errorMessage = document.querySelector('.error-message.user-type');
    if (errorMessage) {
        errorMessage.remove();
    }
    if (!noviceOption.classList.contains('selected')) {
        noviceOption.classList.add('selected');
        professionalOption.classList.remove('selected');
    }
});

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
}

function showErrorMessage(element, message) {
    const errorElement = document.createElement('div');
    errorElement.classList.add('error-message');
    errorElement.textContent = message;
  
    // Position the error message below the input field
    const inputRect = element.getBoundingClientRect();
    const errorPosition = {
        top: inputRect.bottom + window.pageYOffset + 4,
        left: inputRect.left + window.pageXOffset
    };
  
    errorElement.style.top = errorPosition.top + 'px';
    errorElement.style.left = errorPosition.left + 'px';
  
    // Append the error message to the body
    document.body.appendChild(errorElement);
}
  
function removeErrorMessage() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach((errorMessage) => {
        errorMessage.remove();
    });
}

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    removeErrorMessage();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let isValid = true;

    if (!professionalOption.classList.contains('selected') && !noviceOption.classList.contains('selected')) {
        isValid = false;
        showErrorMessage(professionalOption, 'Select a user type.', 'user-type');
    } else {
        const userTypeErrorMessage = document.querySelector('.error-message.user-type');
        if (userTypeErrorMessage) {
            userTypeErrorMessage.remove();
        }
    }

    if (username === '') {
        isValid = false;
        showErrorMessage(document.getElementById('username'), 'Enter username.');
    }

    if (email === '') {
        isValid = false;
        showErrorMessage(document.getElementById('email'), 'Enter email.');
    } else if (!validateEmail(email)) {
        isValid = false;
        showErrorMessage(document.getElementById('email'), 'Invalid email.');
    }

    if (password === '') {
        isValid = false;
        showErrorMessage(document.getElementById('password'), 'Enter password.');
    } else if (!validatePassword(password)) {
        isValid = false;
        showErrorMessage(
            document.getElementById('password'),
            'Password should be at least 8 characters long, alphanumeric, with at least one capital letter and special character.'
        );
    }

    if (isValid) {
        // Perform further actions, such as form submission or API call
        console.log('Form submitted successfully');
    }
});

document.getElementById('signin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    removeErrorMessage();

    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;

    let isValid = true;

    if (email === '') {
        isValid = false;
        showErrorMessage(document.getElementById('signin-email'), 'Enter email.');
    } else if (!validateEmail(email)) {
        isValid = false;
        showErrorMessage(document.getElementById('signin-email'), 'Invalid email.');
    }

    if (password === '') {
        isValid = false;
        showErrorMessage(document.getElementById('signin-password'), 'Enter password.');
    } else if (!validatePassword(password)) {
        isValid = false;
        showErrorMessage(document.getElementById('signin-password'),
            'Password should be atleast 8 characters long, alphanumeric, with atleast one capital letter and special character.'
        );
    }

    if (isValid) {
        // Perform further actions, such as form submission or API call
        console.log('Form submitted successfully');
    }
});

document.getElementById('show-password').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const passwordType = passwordInput.getAttribute('type');
    const showPassword = document.getElementById('show-password');

    if (passwordType === 'password') {
        passwordInput.setAttribute('type', 'text');
        showPassword.textContent = 'Hide Password';
    } else {
        passwordInput.setAttribute('type', 'password');
        showPassword.textContent = 'Show Password';
    }
});
document.getElementById('show-signin-password').addEventListener('click', () => {
    const passwordInput = document.getElementById('signin-password');
    const passwordType = passwordInput.getAttribute('type');
    const showPassword = document.getElementById('show-signin-password');

    if (passwordType === 'password') {
        passwordInput.setAttribute('type', 'text');
        showPassword.textContent = 'Hide Password';
    } else {
        passwordInput.setAttribute('type', 'password');
        showPassword.textContent = 'Show Password';
    }
});