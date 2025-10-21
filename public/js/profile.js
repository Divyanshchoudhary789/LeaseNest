document.addEventListener("DOMContentLoaded", function () {
    // Cache DOM elements for better performance
    const elements = {
        bookingsContainer: document.getElementById("bookings-container"),
        reviewsContainer: document.getElementById("review-container"),
        bookingsBtn: document.getElementById("bookings-btn"),
        reviewsBtn: document.getElementById("reviews-btn"),
        hostListingsContainer: document.getElementById("host-listings-container"),
        hostBookingsContainer: document.getElementById("host-bookings-container"),
        menu: document.getElementById("menu"),
        sidebar: document.getElementById("profile-div"),
        arrow: document.getElementById("arrow"),
        hostPanelBtn: document.getElementById("host-panel"),
        userPanelBtn: document.getElementById("user-panel"),
        rightNav: document.getElementById("right-nav"),
        rightNavHost: document.getElementById("right-nav-host"),
        hostListingsBtn: document.getElementById("host-listings-btn"),
        hostBookingsBtn: document.getElementById("host-bookings-btn")
    };

    // Check if all required elements exist
    const requiredElements = Object.values(elements);
    if (requiredElements.some(el => !el)) {
        console.error("Some required elements are missing from the DOM. Profile functionality may not work properly.");
        return;
    }

    // State management object
    const state = {
        currentPanel: '<%= currentPanel %>' || 'user', // 'user' or 'host'
        userView: '<%= userView %>' || 'bookings', // 'bookings' or 'reviews'
        hostView: '<%= hostView %>' || 'listings' // 'listings' or 'bookings'
    };

    // Utility functions
    function hideAllContainers() {
        elements.bookingsContainer.style.display = "none";
        elements.reviewsContainer.style.display = "none";
        elements.hostListingsContainer.style.display = "none";
        elements.hostBookingsContainer.style.display = "none";
    }

    function updateButtonStates() {
        // Reset all button states
        [elements.bookingsBtn, elements.reviewsBtn, elements.hostListingsBtn, elements.hostBookingsBtn].forEach(btn => {
            btn.classList.remove("active-btn");
        });
        [elements.hostPanelBtn, elements.userPanelBtn].forEach(btn => {
            btn.classList.remove("active-panel");
        });

        // Set active states based on current state
        if (state.currentPanel === 'user') {
            elements.userPanelBtn.classList.add("active-panel");
            elements.rightNav.style.display = "flex";
            elements.rightNavHost.style.display = "none";
            if (state.userView === 'bookings') {
                elements.bookingsBtn.classList.add("active-btn");
            } else {
                elements.reviewsBtn.classList.add("active-btn");
            }
        } else {
            elements.hostPanelBtn.classList.add("active-panel");
            elements.rightNav.style.display = "none";
            elements.rightNavHost.style.display = "flex";
            if (state.hostView === 'listings') {
                elements.hostListingsBtn.classList.add("active-btn");
            } else {
                elements.hostBookingsBtn.classList.add("active-btn");
            }
        }
    }

    function renderCurrentView() {
        hideAllContainers();
        if (state.currentPanel === 'user') {
            if (state.userView === 'bookings') {
                elements.bookingsContainer.style.display = "block";
            } else {
                elements.reviewsContainer.style.display = "block";
            }
        } else {
            if (state.hostView === 'listings') {
                elements.hostListingsContainer.style.display = "block";
            } else {
                elements.hostBookingsContainer.style.display = "block";
            }
        }
    }

    // Event handlers
    function handleUserBookingsClick() {
        state.userView = 'bookings';
        updateButtonStates();
        renderCurrentView();
    }

    function handleUserReviewsClick() {
        state.userView = 'reviews';
        updateButtonStates();
        renderCurrentView();
    }

    function handleHostListingsClick() {
        state.hostView = 'listings';
        updateButtonStates();
        renderCurrentView();
    }

    function handleHostBookingsClick() {
        state.hostView = 'bookings';
        updateButtonStates();
        renderCurrentView();
    }

    function handleUserPanelClick() {
        state.currentPanel = 'user';
        updateButtonStates();
        renderCurrentView();
    }

    function handleHostPanelClick() {
        state.currentPanel = 'host';
        updateButtonStates();
        renderCurrentView();
    }

    function handleMenuClick() {
        elements.sidebar.classList.toggle("show-profileDiv");
    }

    function handleArrowClick() {
        elements.sidebar.classList.remove("show-profileDiv");
    }

    // Attach event listeners
    elements.bookingsBtn.addEventListener("click", handleUserBookingsClick);
    elements.reviewsBtn.addEventListener("click", handleUserReviewsClick);
    elements.hostListingsBtn.addEventListener("click", handleHostListingsClick);
    elements.hostBookingsBtn.addEventListener("click", handleHostBookingsClick);
    elements.userPanelBtn.addEventListener("click", handleUserPanelClick);
    elements.hostPanelBtn.addEventListener("click", handleHostPanelClick);
    elements.menu.addEventListener("click", handleMenuClick);
    elements.arrow.addEventListener("click", handleArrowClick);

    // Keyboard accessibility
    const interactiveElements = [
        elements.bookingsBtn, elements.reviewsBtn,
        elements.hostListingsBtn, elements.hostBookingsBtn,
        elements.userPanelBtn, elements.hostPanelBtn
    ];

    interactiveElements.forEach(el => {
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                el.click();
            }
        });
    });


    // Advanced Filter Functionality
    function updateURLParameter(url, param, paramVal) {
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i = 0; i < tempArray.length; i++) {
                if (tempArray[i].split('=')[0] != param) {
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }
        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }

    function applyFilters() {
        const urlParams = new URLSearchParams(window.location.search);

        // Get current panel state
        const currentPanel = state.currentPanel;

        // Clear existing params for current panel
        const panelPrefixes = {
            user: ['searchBookings', 'sortBookings', 'paymentStatusBookings', 'searchReviews', 'sortReviews'],
            host: ['searchListings', 'sortListings', 'searchHostBookings', 'sortHostBookings', 'paymentStatusHostBookings']
        };

        if (panelPrefixes[currentPanel]) {
            panelPrefixes[currentPanel].forEach(param => {
                urlParams.delete(param);
            });
        }

        // Always preserve panel state
        urlParams.set('panel', currentPanel);

        // Preserve current view state
        if (currentPanel === 'user') {
            urlParams.set('userView', state.userView);
        } else {
            urlParams.set('hostView', state.hostView);
        }

        // Add new filter values - cache element references for performance
        if (currentPanel === 'user') {
            const searchBookingsEl = elements.searchBookings || document.getElementById('search-bookings');
            const sortBookingsEl = elements.sortBookings || document.getElementById('sort-bookings');
            const paymentStatusBookingsEl = elements.paymentStatusBookings || document.getElementById('payment-status-bookings');

            const searchBookings = searchBookingsEl?.value?.trim();
            const sortBookings = sortBookingsEl?.value;
            const paymentStatusBookings = paymentStatusBookingsEl?.value;

            if (searchBookings) urlParams.set('searchBookings', searchBookings);
            if (sortBookings) urlParams.set('sortBookings', sortBookings);
            if (paymentStatusBookings && paymentStatusBookings !== 'all') urlParams.set('paymentStatusBookings', paymentStatusBookings);

            const searchReviewsEl = elements.searchReviews || document.getElementById('search-reviews');
            const sortReviewsEl = elements.sortReviews || document.getElementById('sort-reviews');

            const searchReviews = searchReviewsEl?.value?.trim();
            const sortReviews = sortReviewsEl?.value;

            if (searchReviews) urlParams.set('searchReviews', searchReviews);
            if (sortReviews) urlParams.set('sortReviews', sortReviews);
        } else {
            // Fix: Only apply filters for the current host view
            if (state.hostView === 'listings') {
                const searchListingsEl = elements.searchListings || document.getElementById('search-listings');
                const sortListingsEl = elements.sortListings || document.getElementById('sort-listings');

                const searchListings = searchListingsEl?.value?.trim();
                const sortListings = sortListingsEl?.value;

                if (searchListings) urlParams.set('searchListings', searchListings);
                if (sortListings) urlParams.set('sortListings', sortListings);
            } else if (state.hostView === 'bookings') {
                const searchHostBookingsEl = elements.searchHostBookings || document.getElementById('search-host-bookings');
                const sortHostBookingsEl = elements.sortHostBookings || document.getElementById('sort-host-bookings');
                const paymentStatusHostBookingsEl = elements.paymentStatusHostBookings || document.getElementById('payment-status-host-bookings');

                const searchHostBookings = searchHostBookingsEl?.value?.trim();
                const sortHostBookings = sortHostBookingsEl?.value;
                const paymentStatusHostBookings = paymentStatusHostBookingsEl?.value;

                if (searchHostBookings) urlParams.set('searchHostBookings', searchHostBookings);
                if (sortHostBookings) urlParams.set('sortHostBookings', sortHostBookings);
                if (paymentStatusHostBookings && paymentStatusHostBookings !== 'all') urlParams.set('paymentStatusHostBookings', paymentStatusHostBookings);
            }
        }

        // Update URL
        const newURL = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
        window.location.href = newURL;
    }

    function setupFilters() {
        // Cache filter elements for performance
        const filterElements = {
            searchBookings: document.getElementById('search-bookings'),
            searchReviews: document.getElementById('search-reviews'),
            searchListings: document.getElementById('search-listings'),
            searchHostBookings: document.getElementById('search-host-bookings'),
            sortBookings: document.getElementById('sort-bookings'),
            sortReviews: document.getElementById('sort-reviews'),
            sortListings: document.getElementById('sort-listings'),
            sortHostBookings: document.getElementById('sort-host-bookings'),
            paymentStatusBookings: document.getElementById('payment-status-bookings'),
            paymentStatusHostBookings: document.getElementById('payment-status-host-bookings')
        };

        // Search inputs - apply filter on Enter key
        const searchInputs = ['search-bookings', 'search-reviews', 'search-listings', 'search-host-bookings'];
        searchInputs.forEach(id => {
            const input = filterElements[id.replace('search-', '').replace('-', '')] || document.getElementById(id);
            if (input) {
                // Remove existing listeners to prevent duplicates
                const newInput = input.cloneNode(true);
                input.parentNode.replaceChild(newInput, input);

                newInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent form submission
                        applyFilters();
                    }
                });

                // Show/hide clear button based on input value
                newInput.addEventListener('input', function () {
                    const clearBtn = document.getElementById('clear-' + id);
                    if (clearBtn) {
                        clearBtn.style.display = this.value ? 'block' : 'none';
                    }
                });

                // Set initial clear button state
                const clearBtn = document.getElementById('clear-' + id);
                if (clearBtn && newInput.value) {
                    clearBtn.style.display = 'block';
                }
            }
        });

        // Clear buttons functionality
        const clearButtons = ['clear-search-bookings', 'clear-search-reviews', 'clear-search-listings', 'clear-search-host-bookings'];
        clearButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function () {
                    const inputId = id.replace('clear-', '');
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = '';
                        this.style.display = 'none';
                        // Clear the corresponding search parameter from URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const paramMap = {
                            'clear-search-bookings': 'searchBookings',
                            'clear-search-reviews': 'searchReviews',
                            'clear-search-listings': 'searchListings',
                            'clear-search-host-bookings': 'searchHostBookings'
                        };
                        urlParams.delete(paramMap[id]);
                        const newURL = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
                        window.location.href = newURL;
                    }
                });
            }
        });

        // Select dropdowns - apply filter on change
        const selectElements = [
            'sort-bookings', 'payment-status-bookings',
            'sort-reviews',
            'sort-listings',
            'sort-host-bookings', 'payment-status-host-bookings'
        ];

        selectElements.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', applyFilters);
            }
        });

        // Initialize clear buttons visibility
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            const clearBtn = document.getElementById('clear-' + id);
            if (input && clearBtn && input.value) {
                clearBtn.style.display = 'block';
            }
        });
    }

    // Call setup filters when panel changes
    function handleUserPanelClick() {
        state.currentPanel = 'user';
        updateButtonStates();
        renderCurrentView();
        setTimeout(setupFilters, 100); // Delay to ensure DOM is ready
    }

    function handleHostPanelClick() {
        state.currentPanel = 'host';
        updateButtonStates();
        renderCurrentView();
        setTimeout(setupFilters, 100); // Delay to ensure DOM is ready
    }

    // Initialize the page
    updateButtonStates();
    renderCurrentView();
    setupFilters();
});