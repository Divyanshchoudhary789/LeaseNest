document.addEventListener("DOMContentLoaded", function () {


    const toggleIcon = document.getElementById("toggle-icon");
    const sidebar = document.getElementById("sidebar");
    const arrowLeft = document.getElementById("arrow-left");
    const chatContainer = document.getElementById("chat-container");


    const chatForm = document.getElementById("chat-form");

    chatForm.addEventListener("submit", function () {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });
    });


    if (toggleIcon && sidebar) {
        toggleIcon.addEventListener("click", function () {
            sidebar.classList.toggle("showSidebar");
        });

        toggleIcon.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                sidebar.classList.toggle("showSidebar");
            }
        });
    }

    if (arrowLeft && sidebar) {
        arrowLeft.addEventListener("click", function () {
            sidebar.classList.remove("showSidebar");
        });

        arrowLeft.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                sidebar.classList.remove("showSidebar");
            }
        });
    }


    let moveDownIcon = document.getElementById("move-down-icon");

    moveDownIcon.addEventListener("click", function () {
        const chatContainer = document.getElementById("chat-container");

        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });
    });



    // delete chat buttons
    const deleteButtons = document.querySelectorAll('.delete-chat-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            if (!id) return;
            if (!confirm('Delete this chat?')) return;
            try {
                const res = await fetch('/assistant/' + id, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    // remove the list item from DOM instead of reloading
                    const li = btn.closest('li');
                    if (li) li.remove();
                } else {
                    // fail silently (no alert) but log
                    console.error('Delete failed', await res.text());
                }
            } catch (err) {
                console.error('Delete error', err);
            }
        });
    });







});


