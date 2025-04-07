
// Function to load blog posts in Home.html
function loadBlogPosts() {
    const blogContainer = document.getElementById("blogPosts");
    if (!blogContainer) return;

    let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
    blogContainer.innerHTML = "";

    posts.forEach((post, index) => {
        const postElement = document.createElement("div");
        postElement.classList.add("blog-post", "fade-in"); // Add fade-in class
        postElement.id = `post-${post.id}`;

        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Blog Image" class="blog-image">` : ""}
            <small>Posted by ${post.author} on ${post.timestamp}</small>

            <!-- Comment Section -->
            <div class="comments-section">
                <h4>Comments</h4>
                <div class="comments-list" id="comments-${post.id}">
                    ${loadComments(post.id)}
                </div>
                <input type="text" id="commentInput-${post.id}" placeholder="Write a comment..." class="comment-input">
                <button onclick="submitComment(${post.id})" class="comment-btn">Post Comment</button>
            </div>
        `;

        blogContainer.appendChild(postElement);

        // Delay the fade-in effect for each post
        setTimeout(() => postElement.classList.add("show"), index * 200);
    });
}


// Function to submit a comment
function submitComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    if (!commentInput || commentInput.value.trim() === "") return;

    let comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    const newComment = {
        id: Date.now(),
        text: commentInput.value.trim(),
        timestamp: new Date().toLocaleString()
    };

    comments.push(newComment);
    localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));

    commentInput.value = "";
    loadBlogPosts();
}

// Function to load comments
function loadComments(postId) {
    let comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    return comments.map(comment => `
        <div class="comment" id="comment-${comment.id}">
            <p>${comment.text}</p>
            <small>${comment.timestamp}</small>
            <button onclick="editComment(${postId}, ${comment.id})" class="edit-btn">Edit</button>
            <button onclick="deleteComment(${postId}, ${comment.id})" class="delete-btn">Delete</button>
        </div>
    `).join("");
}

// Function to edit a comment
function editComment(postId, commentId) {
    let comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    let commentIndex = comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) return;

    let newComment = prompt("Edit your comment:", comments[commentIndex].text);
    if (newComment !== null && newComment.trim() !== "") {
        comments[commentIndex].text = newComment.trim();
        comments[commentIndex].timestamp = new Date().toLocaleString();
        localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
        loadBlogPosts();
    }
}

// Function to delete a comment
function deleteComment(postId, commentId) {
    let comments = JSON.parse(localStorage.getItem(`comments-${postId}`)) || [];
    comments = comments.filter(comment => comment.id !== commentId);
    localStorage.setItem(`comments-${postId}`, JSON.stringify(comments));
    loadBlogPosts();
}

// Load blog posts when Home.html is opened
document.addEventListener("DOMContentLoaded", loadBlogPosts);

// Sync blog posts across tabs
window.addEventListener("storage", loadBlogPosts);

// Admin Login Modal and Authentication
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("adminLoginModal");
    const loginLink = document.getElementById("loginLink");
    const closeButton = document.getElementById("close");
    const loginForm = document.getElementById("loginForm");

    // Show modal when login navbar is clicked
    loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        modal.style.display = "block";
        sessionStorage.setItem("loginClicked", "true");
    });

    // Hide modal when close button is clicked
    closeButton.addEventListener("click", function () {
        modal.style.display = "none";
    });

    // Hide modal when clicking outside the modal
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Handle login
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "admin" && password === "ADMIN") { // MAK the DEV's validation
            sessionStorage.setItem("isLoggedIn", "true"); // Store login session
            window.location.href = "Admin.html"; // Redirect to Admin.html
        } else {
            alert("Invalid credentials. Please try again.");
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (event) {
        event.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    const nameInput = document.querySelector("input[name='name']");
    const emailInput = document.querySelector("input[name='email']");
    const phoneInput = document.querySelector("input[name='phone']");
    const messageInput = document.querySelector("textarea[name='message']");

    function validateFullName(name) {
        name = name.trim();
        const parts = name.split(/\s+/);
        return parts.length > 1; // Must contain at least two words
    }

    function validateEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    function validatePhone(phone) {
        return /^[0-9]{10,15}$/.test(phone);
    }

    function showError(input, message) {
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains("error-message")) {
            error = document.createElement("small");
            error.classList.add("error-message");
            input.parentNode.insertBefore(error, input.nextSibling);
        }
        error.textContent = message;
        input.style.borderColor = "red";
    }

    function removeError(input) {
        let error = input.nextElementSibling;
        if (error && error.classList.contains("error-message")) {
            error.remove();
        }
        input.style.borderColor = "";
    }

    nameInput.addEventListener("blur", function () {
        validateFullName(nameInput.value)
            ? removeError(nameInput)
            : showError(nameInput, "Enter your full name (Firstname Lastname or more).");
    });

    emailInput.addEventListener("blur", function () {
        validateEmail(emailInput.value)
            ? removeError(emailInput)
            : showError(emailInput, "Invalid email format.");
    });

    phoneInput.addEventListener("blur", function () {
        validatePhone(phoneInput.value)
            ? removeError(phoneInput)
            : showError(phoneInput, "Enter a valid phone number (10-15 digits).");
    });

    messageInput.addEventListener("blur", function () {
        messageInput.value.length >= 5
            ? removeError(messageInput)
            : showError(messageInput, "Message must be at least 5 characters.");
    });

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        let isValid = true;

        if (!validateFullName(nameInput.value)) {
            showError(nameInput, "Enter your full name (Firstname Lastname or more).");
            isValid = false;
        }

        if (!validateEmail(emailInput.value)) {
            showError(emailInput, "Invalid email format.");
            isValid = false;
        }

        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput, "Enter a valid phone number (10-15 digits).");
            isValid = false;
        }

        if (messageInput.value.length < 5) {
            showError(messageInput, "Message must be at least 5 characters.");
            isValid = false;
        }

        if (!isValid) {
            alert("Please correct the errors before submitting.");
            return;
        }

        // Save the message in localStorage for admin
        const newMessage = {
            id: Date.now(),
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            message: messageInput.value.trim(),
            timestamp: new Date().toLocaleString(),
            status: "Unread"
        };

        let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];
        messages.push(newMessage);
        localStorage.setItem("contactMessages", JSON.stringify(messages));

        alert("Your message has been sent successfully! ✅");

        // Reset form
        contactForm.reset();
    });
});

function goBack() {
    window.location.href = 'Home.html';
  }

  function navigateToPage(section) {
    // Redirect to the specific section of Home.html
    window.location.href = `Home.html#${section}`;
}