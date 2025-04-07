const ADMIN_NAME = "MAK the DEV's"; // Admin name
const modal = document.getElementById("blogModal"); // Get modal
const closeModalButton = document.querySelector(".close-modal"); // Close button

// Function to submit a blog post and save it to localStorage
function submitBlog(event) {
  event.preventDefault();

  const title = document.getElementById("blogTitle").value;
  const content = document.getElementById("blogContent").value;
  const imageInput = document.getElementById("blogImage");
  let imageUrl = "";

  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  let editingId = document.getElementById("blogForm").getAttribute("data-editing-id");

  if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
          imageUrl = e.target.result;
          saveOrUpdatePost(title, content, imageUrl, editingId, posts);
      };
      reader.readAsDataURL(imageInput.files[0]);
  } else {
      let existingPost = posts.find(post => post.id == editingId);
      imageUrl = existingPost ? existingPost.imageUrl : "";
      saveOrUpdatePost(title, content, imageUrl, editingId, posts);
  }
}

// Function to save a new post or update an existing post
function saveOrUpdatePost(title, content, imageUrl, editingId, posts) {
  if (editingId) {
      // Editing existing post
      let postIndex = posts.findIndex(post => post.id == editingId);
      if (postIndex !== -1) {
          posts[postIndex].title = title;
          posts[postIndex].content = content;
          posts[postIndex].imageUrl = imageUrl;
          posts[postIndex].timestamp = new Date().toLocaleString();
      }
  } else {
      // Creating new post
      const newPost = {
          id: Date.now(),
          title,
          content,
          imageUrl,
          author: ADMIN_NAME,
          timestamp: new Date().toLocaleString()
      };
      posts.unshift(newPost);
  }

  localStorage.setItem("blogPosts", JSON.stringify(posts));

  // Clear editing state
  document.getElementById("blogForm").removeAttribute("data-editing-id");

  // Refresh blog list
  loadPostedBlogs();

  // Clear input fields
  document.getElementById("blogTitle").value = "";
  document.getElementById("blogContent").value = "";
  document.getElementById("imagePreview").style.display = "none";
  document.getElementById("imagePreview").src = "";
  document.getElementById("blogImage").value = "";

  alert(editingId ? "Post updated successfully!" : "Blog post submitted successfully!");
}

// Function to save blog post
function saveBlogPost(title, content, imageUrl) {
  const post = {
      id: Date.now(),
      title,
      content,
      imageUrl,
      author: ADMIN_NAME,
      timestamp: new Date().toLocaleString()
  };

  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  posts.unshift(post);
  localStorage.setItem("blogPosts", JSON.stringify(posts));

  window.dispatchEvent(new Event("storage"));
  loadPostedBlogs(); // Update posted blogs immediately
}

// Function to load all posted blogs
function loadPostedBlogs() {
  const blogContainer = document.getElementById("blogPosts");
  if (!blogContainer) return;

  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  if (posts.length === 0) {
      blogContainer.innerHTML = "<p>No blogs posted yet.</p>";
      return;
  }

  blogContainer.innerHTML = posts.map(post => `
      <div class="blog-post" data-id="${post.id}">
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Blog Image" class="blog-image">` : ""}
          <small>Posted by ${post.author} on ${post.timestamp}</small>
          ${post.author === ADMIN_NAME ? `
              <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
              <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
          ` : ""}
      </div>
  `).join("");
}

// Function to edit a blog post
function editPost(postId) {
  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  let postIndex = posts.findIndex(post => post.id === postId);

  if (postIndex === -1) return;

  const post = posts[postIndex];

  // Find the post container in the DOM
  const postElement = document.querySelector(`.blog-post[data-id="${postId}"]`);

  // Replace the content with input fields
  postElement.innerHTML = `
      <input type="text" id="editTitle-${postId}" value="${post.title}" class="edit-input">
      <textarea id="editContent-${postId}" class="edit-textarea">${post.content}</textarea>
      
      ${post.imageUrl ? `<img src="${post.imageUrl}" id="editImage-${postId}" class="blog-image">` : ""}
      <input type="file" id="newImage-${postId}" accept="image/*">
      
      <button onclick="saveEdit(${postId})" class="save-btn">Save</button>
      <button onclick="cancelEdit(${postId})" class="cancel-btn">Cancel</button>
  `;
}

function saveEdit(postId) {
  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  let postIndex = posts.findIndex(post => post.id === postId);

  if (postIndex === -1) return;

  // Get edited values
  const newTitle = document.getElementById(`editTitle-${postId}`).value;
  const newContent = document.getElementById(`editContent-${postId}`).value;
  const newImageInput = document.getElementById(`newImage-${postId}`);

  // Update post details
  posts[postIndex].title = newTitle;
  posts[postIndex].content = newContent;

  // If a new image is uploaded, update it
  if (newImageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
          posts[postIndex].imageUrl = e.target.result;
          localStorage.setItem("blogPosts", JSON.stringify(posts));
          loadPostedBlogs();
      };
      reader.readAsDataURL(newImageInput.files[0]);
  } else {
      localStorage.setItem("blogPosts", JSON.stringify(posts));
      loadPostedBlogs();
  }
}

function cancelEdit(postId) {
  loadPostedBlogs(); // Simply reloads the posts from localStorage
}

// Function to delete a blog post
function deletePost(postId) {
  const confirmation = confirm("Are you sure you want to delete this blog post?");
  if (!confirmation) return;

  let posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  posts = posts.filter(post => post.id !== postId);
  localStorage.setItem("blogPosts", JSON.stringify(posts));

  loadPostedBlogs();
}


// Load posts when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadPostedBlogs();
  modal.style.display = "none"; // Ensure modal is hidden when the page loads
});

// Function to Preview Blog Post
function previewBlogPost() {
  const title = document.getElementById("blogTitle").value;
  const content = document.getElementById("blogContent").value;
  const imageInput = document.getElementById("blogImage");

  if (!title || !content) {
      alert("Please enter a title and content before previewing.");
      return;
  }

  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalContent").textContent = content;

  if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (e) {
          document.getElementById("modalImage").src = e.target.result;
          document.getElementById("modalImage").style.display = "block";
      };
      reader.readAsDataURL(imageInput.files[0]);
  } else {
      document.getElementById("modalImage").style.display = "none";
  }

  modal.style.display = "flex"; // Show modal when clicking preview button
}

// Function to Close Modal
closeModalButton.addEventListener("click", function () {
  modal.style.display = "none";
});

// Close Modal When Clicking Outside
window.addEventListener("click", function (event) {
  if (event.target === modal) {
      modal.style.display = "none";
  }
});


document.addEventListener("DOMContentLoaded", loadMessages);

function loadMessages() {
  const messagesContainer = document.getElementById("messagesContainer");
  let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];

  // Sort messages by timestamp (newest first)
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (messages.length === 0) {
      messagesContainer.innerHTML = "<p>No messages yet.</p>";
      return;
  }

  messagesContainer.innerHTML = messages.map(msg => `
      <div class="message-box ${msg.status === 'Unread' ? 'unread' : 'read'}">
          <h4>📧 ${msg.name}</h4>
          <h4>📩 ${msg.email}</h4>
          <h4>📞 ${msg.phone}</h4>
          <p>📜 ${msg.message}</p>
          <small>🕒 Sent on: ${msg.timestamp}</small>
          <br>
          <button onclick="markAsRead('${msg.timestamp}')">✅ Mark as Read</button>
          <button onclick="deleteMessage('${msg.timestamp}')">❌ Delete</button>
      </div>
  `).join("");
}

// Function to Mark Message as Read
function markAsRead(timestamp) {
  let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];
  let message = messages.find(msg => msg.timestamp === timestamp);

  if (message) {
      message.status = "Read";
      localStorage.setItem("contactMessages", JSON.stringify(messages));
      loadMessages(); // Reload messages to reflect changes
  }
}

// Function to Delete a Message
function deleteMessage(timestamp) {
  let messages = JSON.parse(localStorage.getItem("contactMessages")) || [];
  messages = messages.filter(msg => msg.timestamp !== timestamp);

  localStorage.setItem("contactMessages", JSON.stringify(messages));
  loadMessages(); // Reload messages after deletion
}

// Load messages on page load
document.addEventListener("DOMContentLoaded", loadMessages);

function logout() {
  window.location.href = 'Home.html';
}