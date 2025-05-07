async function loadComments() {
  let data = loadCommentsFromLocal();
  //   console.log(data);

  if (!data) {
    const response = await fetch("data.json");
    data = await response.json();
    saveCommentsToLocal(data);
  }
  const main = document.querySelector("main");
  main.innerHTML = ""; // Clear existing content

  data.comments.forEach((comment) => {
    // Main comment
    main.appendChild(
      createCommentElement(comment, false, data.currentUser.username)
    );

    // Replies
    if (comment.replies && comment.replies.length > 0) {
      const repliesSection = document.createElement("section");
      repliesSection.className = "pl-8 border-l-2 border-gray-100 space-y-4";
      comment.replies.forEach((reply) => {
        repliesSection.appendChild(
          createCommentElement(reply, true, data.currentUser.username)
        );
      });
      main.appendChild(repliesSection);
    }
  });

  // Add comment box (optional: move this if you want it elsewhere)
  main.appendChild(createAddCommentBox(data.currentUser));
}

function createCommentElement(comment, isReply, currentUsername) {
  const isCurrentUser = comment.user.username === currentUsername;
  const wrapper = document.createElement("div");
  wrapper.className =
    "bg-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 shadow";
  wrapper.setAttribute("data-id", comment.id);
  console.log(wrapper);

  // Action buttons
  let actionButtons = "";
  if (isCurrentUser) {
    actionButtons = `
      <button class="text-red-600 active:text-red-300 font-bold cursor-pointer mr-4 flex items-center gap-1">
        <img src="./images/icon-delete.svg" alt="" class="w-4 h-4" />
        Delete
      </button>
      <button class="text-purple-600 active:text-purple-300 cursor-pointer font-bold flex items-center gap-1">
        <img src="./images/icon-edit.svg" alt="" class="w-4 h-4" />
        Edit
      </button>
    `;
  } else {
    actionButtons = `
      <button class="text-purple-600 active:text-purple-300 cursor-pointer font-bold flex items-center gap-1">
        <img src="./images/icon-reply.svg" alt="" class="w-4 h-4" />
        Reply
      </button>
    `;
  }

  wrapper.innerHTML = `
    <!-- Vote buttons on desktop (left) -->
    <div class="hidden sm:h-[max-content] sm:flex flex-col items-center bg-gray-100 rounded-lg px-4 py-3 mr-4">
      <button class="upvote-btn text-purple-300 font-bold text-lg hover:text-purple-600 cursor-pointer">+</button>
      <span class="font-bold comment-score text-gray-800">${
        comment.score
      }</span>
      <button class="downvote-btn text-purple-300 font-bold text-lg hover:text-purple-600 cursor-pointer">-</button>
    </div>
    <div class="flex-1 flex flex-col relative">
      <div class="flex flex-row items-start sm:items-center gap-2 sm:gap-4 mb-2">
        <img src="${comment.user.image.png}" alt="${
    comment.user.username
  }" class="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        <span class="font-bold text-gray-800">${comment.user.username}</span>
        ${
          isCurrentUser
            ? '<span class="bg-purple-600 text-white text-xs px-2 py-0.5 rounded ml-2">you</span>'
            : ""
        }
        <span class="text-gray-500 text-sm">${comment.createdAt}</span>
        <!-- Action buttons on desktop (top right) -->
        <div class="hidden sm:flex gap-2 ml-auto absolute right-0 top-0">
          ${actionButtons}
        </div>
      </div>
      <p class="text-gray-500 mb-4">
        ${
          comment.replyingTo
            ? `<span class="text-purple-600 font-bold">@${comment.replyingTo}</span> `
            : ""
        }
        ${comment.content}
      </p>
      <!-- Action and vote buttons on mobile -->
      <div class="flex justify-between items-center mt-2 sm:hidden">
        <div class="flex flex-row items-center bg-gray-100 rounded-lg px-4 py-1">
          <button class="upvote-btn text-purple-300 font-bold text-lg hover:text-purple-600 cursor-pointer">+</button>
          <span class="font-bold comment-score text-gray-800 px-4">${
            comment.score
          }</span>
          <button class="downvote-btn text-purple-300 font-bold text-lg hover:text-purple-600 cursor-pointer">-</button>
        </div>
        <div class="flex gap-2 ml-2">
          ${actionButtons}
        </div>
      </div>
    </div>
  `;
  return wrapper;
}

function createAddCommentBox(currentUser) {
  const section = document.createElement("section");
  section.className =
    "bg-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 shadow items-stretch mt-4";
  section.innerHTML = `
    <img src="${currentUser.image.png}" alt="Your avatar" class="hidden sm:block w-8 h-8 rounded-full">
    <textarea class="flex-1 w-full border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-purple-300" rows="3" placeholder="Add a comment..."></textarea>
    <div class="flex w-full justify-between items-center sm:w-auto sm:flex-col sm:justify-normal sm:items-start gap-4">
      <img src="${currentUser.image.png}" alt="Your avatar" class="block sm:hidden w-8 h-8 rounded-full">
      <button class="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-300">SEND</button>
    </div>
  `;
  return section;
}

function saveCommentsToLocal(comments) {
  localStorage.setItem("comments", JSON.stringify(comments));
}

function loadCommentsFromLocal() {
  const data = localStorage.getItem("comments");
  return data ? JSON.parse(data) : null;
}

// Helper to find a comment or reply by id
function findCommentById(data, id) {
  let comment = data.comments.find((c) => c.id == id);
  if (comment) return comment;
  for (const c of data.comments) {
    if (c.replies && c.replies.length > 0) {
      const reply = c.replies.find((r) => r.id == id);
      if (reply) return reply;
    }
  }
  return null;
}

// Helper to create and show a confirmation modal
function showDeleteModal(onConfirm) {
  // Remove any existing modal
  const existingModal = document.querySelector("#delete-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "delete-modal";
  modal.className =
    "fixed inset-0  flex items-center justify-center bg-black/60 ";
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-8 max-w-sm w-full shadow-lg mx-4">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Delete comment</h2>
      <p class="text-gray-500 mb-6">Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
      <div class="flex justify-between gap-4">
        <button class="cancel-delete cursor-pointer text-sm sm:text-lg bg-gray-400 text-white px-4 py-2 rounded font-bold flex-1">NO, CANCEL</button>
        <button class="confirm-delete cursor-pointer text-sm sm:text-lg bg-red-400 text-white px-4 py-2 rounded font-bold flex-1 ">YES, DELETE</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Event listeners for modal buttons
  modal.querySelector(".cancel-delete").onclick = () => modal.remove();
  modal.querySelector(".confirm-delete").onclick = () => {
    modal.remove();
    onConfirm();
  };
}

// Run on page load
window.addEventListener("DOMContentLoaded", loadComments);

document.addEventListener("click", function (e) {
  // Add comment
  if (e.target.textContent === "SEND") {
    // Find the closest section (the add comment box)
    const section = e.target.closest("section");
    const textarea = section.querySelector("textarea");
    const content = textarea.value.trim();
    if (!content) return;
    let data = loadCommentsFromLocal();
    const newComment = {
      id: Date.now(),
      content,
      createdAt: "Just now",
      score: 0,
      user: data.currentUser,
      replies: [],
    };
    data.comments.push(newComment);
    saveCommentsToLocal(data);
    loadComments();
  }

  // Delete comment
  if (e.target.textContent.trim() === "Delete") {
    const commentDiv = e.target.closest(".bg-white");
    const id = commentDiv.getAttribute("data-id");
    showDeleteModal(() => {
      let data = loadCommentsFromLocal();

      // Remove from main comments
      data.comments = data.comments.filter((c) => c.id != id);

      // Remove from replies
      data.comments.forEach((c) => {
        if (c.replies && c.replies.length > 0) {
          c.replies = c.replies.filter((r) => r.id != id);
        }
      });

      saveCommentsToLocal(data);
      loadComments();
    });
  }

  // Edit comment
  if (e.target.textContent.trim() === "Edit") {
    const commentDiv = e.target.closest(".bg-white");
    const p = commentDiv.querySelector("p");
    const oldContent = p.textContent.trim();
    p.innerHTML = `<textarea class="w-full border focus:outline-none focus:ring-1 focus:ring-purple-300" rounded p-2">${oldContent}</textarea>
      <button class="bg-purple-600 text-white px-2 py-1 rounded ml-2 save-edit focus:bg-purple-300 uppercase">Update</button>`;
  }

  // Save edited comment
  if (e.target.classList.contains("save-edit")) {
    const commentDiv = e.target.closest(".bg-white");
    const textarea = commentDiv.querySelector("textarea");
    const newContent = textarea.value.trim();
    let data = loadCommentsFromLocal();
    const id = commentDiv.getAttribute("data-id");
    let comment = findCommentById(data, id);
    if (comment) comment.content = newContent;
    saveCommentsToLocal(data);
    loadComments();
  }

  // Reply to comment
  if (
    e.target.textContent.trim() === "Reply" &&
    !e.target.closest(".reply-box")
  ) {
    // Remove any existing reply box
    const existingBox = document.querySelector(".reply-box");
    if (existingBox) existingBox.remove();

    const commentDiv = e.target.closest(".bg-white");
    const replyBox = document.createElement("div");
    replyBox.className =
      "reply-box bg-white rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 shadow items-start mt-4 w-full";
    let data = loadCommentsFromLocal();
    replyBox.innerHTML = `
      <img src="${data.currentUser.image.png}" alt="Your avatar" class="hidden sm:block w-8 h-8 rounded-full">
      <textarea class="flex-1 w-full border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-purple-300" rows="2" placeholder="Add a reply..."></textarea>
      <div class="flex w-full justify-between items-center sm:w-auto sm:flex-col sm:justify-normal sm:items-start gap-4">
        <img src="${data.currentUser.image.png}" alt="Your avatar" class="block sm:hidden w-8 h-8 rounded-full">
        <button class="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-300 send-reply">REPLY</button>
      </div>
    `;
    commentDiv.after(replyBox);
    replyBox.querySelector("textarea").focus();
  }

  // Send reply
  if (e.target.classList.contains("send-reply")) {
    const replyBox = e.target.closest(".reply-box");
    const textarea = replyBox.querySelector("textarea");
    const content = textarea.value.trim();
    if (!content) return;
    let data = loadCommentsFromLocal();
    // Find the comment being replied to
    const prevCommentDiv = replyBox.previousElementSibling;
    const id = prevCommentDiv.getAttribute("data-id");

    let parentComment = findCommentById(data, id);

    if (parentComment) {
      parentComment.replies = parentComment.replies || [];
      parentComment.replies.push({
        id: Date.now(),
        content,
        createdAt: "Just now",
        score: 0,
        replyingTo: parentComment.user.username,
        user: data.currentUser,
      });
      saveCommentsToLocal(data);
      // Remove the reply box before reloading
      replyBox.remove();
      loadComments();
    }
  }

  // Helper to get username from commentDiv
  function getUsernameFromCommentDiv(commentDiv) {
    // Select the span that is NOT the score (score has class 'comment-score')
    return commentDiv.querySelector(
      "span.font-bold:not(.comment-score)"
    ).textContent;
  }

  // Upvote
  if (e.target.classList.contains("upvote-btn")) {
    const commentDiv = e.target.closest(".bg-white");
    const id = commentDiv.getAttribute("data-id");
    let data = loadCommentsFromLocal();
    let comment = findCommentById(data, id);
    if (comment) {
      comment.score += 1;
      saveCommentsToLocal(data);
      loadComments();
    }
  }

  // Downvote
  if (e.target.classList.contains("downvote-btn")) {
    const commentDiv = e.target.closest(".bg-white");
    const id = commentDiv.getAttribute("data-id");
    let data = loadCommentsFromLocal();
    let comment = findCommentById(data, id);
    if (comment && comment.score > 0) {
      comment.score -= 1;
      saveCommentsToLocal(data);
      loadComments();
    }
  }
});
