let demoPassword = sessionStorage.getItem("demoPassword") || "";

function placeBid(productName, bidId) {
    let amount = prompt("Enter your bid amount:");

    if (amount === null || amount.trim() === "") {
        return;
    }

    amount = Number(amount);

    let bidElement = document.getElementById(bidId);
    let currentBid = Number(bidElement.innerText);

    let timerId =
    bidId === "smartWatchBid"
        ? "smartWatchTimer"
        : bidId === "headphonesBid"
        ? "headphonesTimer"
        : "speakerTimer";

let timerElement = document.getElementById(timerId);

if (!timerElement || timerElement.innerText === "Auction Ended!") {
    alert("This auction has ended. You cannot place a bid!");
    return;
}

    if (isNaN(amount) || amount <= currentBid) {
        alert("Please enter an amount higher than the current bid!");
        return;
    }

    bidElement.innerText = amount;


    // Update Auction Details bid amount

    if (bidId === "smartWatchBid") {
        document.getElementById("smartWatchDetailBid").innerText =
        amount;
    }


    // Update Headphones Auction Details

    if (bidId === "headphonesBid") {
        document.getElementById("headphonesDetailBid").innerText =
        amount;
    }

    if (bidId === "speakerBid") {
        document.getElementById("speakerDetailBid").innerText = amount;
    }

    let history = JSON.parse(
        localStorage.getItem("bidHistory") || "[]"
    );

    history.push({
        product: productName,
        amount: amount,
        date: new Date().toLocaleString()
    });

    localStorage.setItem(
        "bidHistory",
        JSON.stringify(history)
    );

    displayBidHistory();

    // Update Bidder Dashboard
    updateBidderDashboard();

    alert("Your bid was updated successfully!");
}

function displayBidHistory() {
    let historyList = document.getElementById("bidHistory");

    if (!historyList) return;

    let history = JSON.parse(
        localStorage.getItem("bidHistory") || "[]"
    );

    historyList.innerHTML = "";

    history.forEach(function(bid) {
        let item = document.createElement("li");

        item.textContent =
            bid.product + " - ₹" +
            bid.amount + " - " + bid.date;

        historyList.appendChild(item);
    });
}

document.addEventListener("DOMContentLoaded", displayBidHistory);


// COMBINED AUCTION FILTERS

function applyAuctionFilters() {

    let searchText = document.getElementById("searchInput")
        .value.toLowerCase();

    let selectedCategory =
        document.querySelector(".categories .active")?.dataset.category || "all";

    let selectedPrice =
        document.getElementById("priceFilter").value;

    let selectedEnding =
        document.getElementById("endingFilter").value;

    let selectedPremium =
        document.getElementById("premiumFilter").value;

    let products = document.querySelectorAll(".product");

    products.forEach(function(product) {

        let name = product.innerText.toLowerCase();
        let category = product.dataset.category;

        let bidElement = product.querySelector(
            "#smartWatchBid, #headphonesBid, #speakerBid"
        );

        let timer = product.querySelector(
            "#smartWatchTimer, #headphonesTimer, #speakerTimer"
        );

        let price = bidElement ? Number(bidElement.innerText) : 0;

        let matchesSearch = name.includes(searchText);

        let matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        let matchesPrice = true;

        if (selectedPrice === "0-1000") {
            matchesPrice = price < 1000;
        } else if (selectedPrice === "1000-3000") {
            matchesPrice = price >= 1000 && price <= 3000;
        } else if (selectedPrice === "3000-5000") {
            matchesPrice = price > 3000 && price <= 5000;
        } else if (selectedPrice === "5000") {
            matchesPrice = price > 5000;
        }

        let matchesEnding = true;

        if (selectedEnding === "soon" && timer) {
            let match = timer.innerText.match(
                /(\d+)\s*min\s*(\d+)\s*sec/
            );

            if (match) {
                let seconds =
                    Number(match[1]) * 60 + Number(match[2]);

                matchesEnding = seconds <= 300;
            } else {
                matchesEnding = false;
            }
        }

        let isPremium = product.querySelector(".premium-badge") !== null;

        let matchesPremium =
        selectedPremium === "all" ||
        (selectedPremium === "premium" && isPremium);

        product.style.display =
            matchesSearch &&
            matchesCategory &&
            matchesPrice &&
            matchesEnding &&
            matchesPremium
                ? "block"
                : "none";

    });
}

function searchProducts() {
    applyAuctionFilters();
}

function filterCategory(category) {

    document.querySelectorAll(".categories button")
        .forEach(function(button) {
            button.classList.toggle(
                "active",
                button.getAttribute("onclick").includes("'" + category + "'")
            );
        });

    applyAuctionFilters();
}

function filterByPrice() {
    applyAuctionFilters();
}

function filterEndingSoon() {
    applyAuctionFilters();
}


function startCountdown(elementId, minutes) {

    let storageKey = "auctionEnd_" + elementId;

    let savedEndTime = localStorage.getItem(storageKey);

    let endTime;

    if (savedEndTime) {
        endTime = Number(savedEndTime);
    } else {
        endTime = Date.now() + minutes * 60 * 1000;
        localStorage.setItem(storageKey, endTime);
    }

    let timer = setInterval(function () {

        let remaining = endTime - Date.now();

        let element = document.getElementById(elementId);

        if (!element) {
            clearInterval(timer);
            return;
        }

        if (remaining <= 0) {

            element.innerText = "Auction Ended!";

            let detailStatusId =
                elementId === "smartWatchTimer"
                ? "smartWatchDetailStatus"
                : elementId === "speakerTimer"
                ? "speakerDetailStatus"
                : "headphonesDetailStatus";

            let detailStatus = document.getElementById(detailStatusId);

            if (detailStatus) {
                detailStatus.innerText = "Auction Ended 🔴";
            }

            let statusId =
                elementId === "smartWatchTimer"
                ? "smartWatchStatus"
                : elementId === "speakerTimer"
                ? "speakerStatus"
                : "headphonesStatus";

            let statusElement = document.getElementById(statusId);

            if (statusElement) {
                statusElement.innerText = "Auction Ended 🔴";
            }

            let buttonId =
                elementId === "smartWatchTimer"
                ? "smartWatchButton"
                : elementId === "speakerTimer"
                ? "speakerButton"
                : "headphonesButton";

            let bidButton = document.getElementById(buttonId);

            if (bidButton) {
                bidButton.disabled = true;
                bidButton.innerText = "Auction Closed";
            }

            clearInterval(timer);
            return;
        }

        let minutesLeft = Math.floor(remaining / 60000);
        let secondsLeft = Math.floor((remaining % 60000) / 1000);

        element.innerText =
            minutesLeft + " min " + secondsLeft + " sec";

    }, 1000);
}

startCountdown("smartWatchTimer", 2);
startCountdown("headphonesTimer", 2);
startCountdown("speakerTimer", 2);



let watchlist = JSON.parse(
    localStorage.getItem("auctionWatchlist") || "[]"
);

function displayWatchlist() {
    const list = document.getElementById("watchlistItems");

    if (!list) {
        console.log("Watchlist HTML element not found!");
        return;
    }

    list.innerHTML = "";

    watchlist.forEach(function(productName) {
        const item = document.createElement("li");
        item.textContent = productName + " ";

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {
            removeFromWatchlist(productName);
        });

        item.appendChild(removeButton);
        list.appendChild(item);
    });
    // Update Bidder Dashboard
    updateBidderDashboard();
}

function addToWatchlist(productName) {
    if (watchlist.includes(productName)) {
        alert("Already in Watchlist!");
        return;
    }

    watchlist.push(productName);

    localStorage.setItem(
        "auctionWatchlist",
        JSON.stringify(watchlist)
    );

    displayWatchlist();
    alert("Product added successfully!");
}

function removeFromWatchlist(productName) {
    watchlist = watchlist.filter(function(item) {
        return item !== productName;
    });

    localStorage.setItem(
        "auctionWatchlist",
        JSON.stringify(watchlist)
    );

    displayWatchlist();
    alert("Product removed successfully!");
}

document.addEventListener("DOMContentLoaded", function() {
    displayWatchlist();
});

function clearWatchlist() {
    if (watchlist.length === 0) {
        alert("Watchlist is already empty!");
        return;
    }

    watchlist = [];

    localStorage.setItem(
        "auctionWatchlist",
        JSON.stringify(watchlist)
    );

    displayWatchlist();

    alert("All products removed from Watchlist!");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("auctionDarkMode", isDark);

    updateDarkButton();
}

function updateDarkButton() {
    const button = document.getElementById("darkButton");

    if (!button) return;

    if (document.body.classList.contains("dark-mode")) {
        button.textContent = "☀️ Light Mode";
    } else {
        button.textContent = "🌙 Dark Mode";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const savedMode = localStorage.getItem("auctionDarkMode");

    if (savedMode === "true") {
        document.body.classList.add("dark-mode");
    }

    updateDarkButton();
});

function showDetails(productName) {
    if (productName === "Smart Watch") {
        alert(
            "Product: Smart Watch\n" +
            "Category: Electronics\n" +
            "Starting Price: ₹2000\n" +
            "Current Bid: ₹" +
            document.getElementById("smartWatchBid").innerText
        );
    }

    else if (productName === "Headphones") {
        alert(
            "Product: Headphones\n" +
            "Category: Accessories\n" +
            "Starting Price: ₹1500\n" +
            "Current Bid: ₹" +
            document.getElementById("headphonesBid").innerText
        );
    }

    else if (productName === "Bluetooth Speaker") {
        alert(
            "Product: Bluetooth Speaker\n" +
            "Category: Electronics\n" +
            "Starting Price: ₹1000\n" +
            "Current Bid: ₹" +
            document.getElementById("speakerBid").innerText
        );

    }
}

function registerUser() {
    let name = document.getElementById("userName").value.trim();
    let email = document.getElementById("userEmail").value.trim();
    let password = document.getElementById("userPassword").value;

    if (!isEmailVerified || email !== verifiedEmail) {
        alert("Please verify your email before registering!");
        return;
    }

    if (name === "" || email === "" || password === "") {
        alert("Please fill all the fields!");
        return;
    }

    // Store only name and email
    let user = {
        name: name,
        email: email
    };

    localStorage.setItem(
        "auctionUser",
        JSON.stringify(user)
    );

// Keep demo password only in memory
demoPassword = password;
sessionStorage.setItem("demoPassword", demoPassword);

    document.getElementById("registerMessage").innerText =
        "Registration Successful! Welcome " + name;

    alert("Registration completed successfully!");
}


// BIDDER DASHBOARD

function updateBidderDashboard() {

    // Get Bid History
    let history = JSON.parse(
        localStorage.getItem("bidHistory") || "[]"
    );

    // Get Watchlist
    let savedWatchlist = JSON.parse(
        localStorage.getItem("auctionWatchlist") || "[]"
    );

    // Display total bids
    document.getElementById("dashboardBidCount").innerText =
        history.length;

    // Display watchlist count
    document.getElementById("dashboardWatchlistCount").innerText =
        savedWatchlist.length;

    // Won items and payment history
    document.getElementById("dashboardWonCount").innerText = 0;

    document.getElementById("dashboardPaymentCount").innerText = 0;
}

// Update dashboard when page loads
document.addEventListener("DOMContentLoaded", function() {
    updateBidderDashboard();
});


// SELLER DASHBOARD

let sellerProducts = JSON.parse(
    localStorage.getItem("sellerProducts") || "[]"
);

// Show or hide seller form
function showSellerForm() {
    let form = document.getElementById("sellerForm");

    if (form.style.display === "none") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}

// Add a new auction product
function addSellerProduct() {
    let name = document.getElementById("sellerProductName").value.trim();

    let price = Number(
        document.getElementById("sellerProductPrice").value
    );

    if (name === "" || price <= 0 || !Number.isFinite(price)) {
        alert("Please enter a valid product name and price!");
        return;
    }

    let product = {
        id: Date.now(),
        name: name,
        price: price
    };

    sellerProducts.push(product);

    localStorage.setItem(
        "sellerProducts",
        JSON.stringify(sellerProducts)
    );

    document.getElementById("sellerProductName").value = "";
    document.getElementById("sellerProductPrice").value = "";

    displaySellerProducts();

    alert("Auction product added successfully!");
}

// Display seller products
function displaySellerProducts() {
    let list = document.getElementById("sellerProductList");

    if (!list) return;

    list.innerHTML = "";

    sellerProducts.forEach(function(product) {
        let item = document.createElement("li");

        item.textContent =
            product.name + " - Starting Price: ₹" + product.price + " ";

        let removeButton = document.createElement("button");

        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function() {
            removeSellerProduct(product.id);
        });

        item.appendChild(removeButton);
        list.appendChild(item);
    });

    document.getElementById("sellerListingCount").innerText =
        sellerProducts.length;

    document.getElementById("sellerActiveCount").innerText =
        sellerProducts.length;

    document.getElementById("sellerSalesCount").innerText = 0;
}

// Remove a seller product
function removeSellerProduct(productId) {
    sellerProducts = sellerProducts.filter(function(product) {
        return product.id !== productId;
    });

    localStorage.setItem(
        "sellerProducts",
        JSON.stringify(sellerProducts)
    );

    displaySellerProducts();

    alert("Product removed successfully!");
}

// Load seller products when page opens
document.addEventListener("DOMContentLoaded", function() {
    displaySellerProducts();
});

function filterPremiumAuctions() {
    applyAuctionFilters();
}


// EMAIL VERIFICATION

let generatedVerificationCode = "";
let isEmailVerified = false;

let verifiedEmail = "";

function resetEmailVerification() {
    isEmailVerified = false;
    verifiedEmail = "";
    generatedVerificationCode = "";

    document.getElementById("verificationMessage").innerText =
        "Email changed. Please verify your email again.";
}

function sendVerificationCode() {

    let email = document.getElementById("userEmail").value.trim();

    if (email === "") {
        alert("Please enter your email address!");
        return;
    }

    generatedVerificationCode =
        Math.floor(100000 + Math.random() * 900000).toString();

    isEmailVerified = false;

    verifiedEmail = "";

    document.getElementById("verificationMessage").innerText =
        "Demo OTP generated. Please check the alert.";

    alert(
        "Your Demo Verification Code is: " +
        generatedVerificationCode
    );
}

function verifyEmailCode() {

    let enteredCode =
        document.getElementById("verificationCode").value.trim();

    if (generatedVerificationCode === "") {
        
        alert("Please generate a verification code first!");
        return;
    }

    if (enteredCode === generatedVerificationCode) {

        verifiedEmail = document.getElementById("userEmail").value.trim();

        isEmailVerified = true;

        document.getElementById("verificationMessage").innerText =
            "Email verification successful! ✅";

    } else {

        isEmailVerified = false;

        document.getElementById("verificationMessage").innerText =
            "Incorrect verification code. Try again! ❌";
    }
}

// USER LOGIN

function loginUser() {

    let email = document.getElementById("loginEmail").value.trim();

    let password = document.getElementById("loginPassword").value;

    let savedUser = JSON.parse(
        localStorage.getItem("auctionUser") || "null"
    );

    if (email === "" || password === "") {
        alert("Please enter email and password!");
        return;
    }

    if (!savedUser) {
        alert("Please register first!");
        return;
    }

    if (email === savedUser.email && password === demoPassword) {

        document.getElementById("loginMessage").innerText =
        "Welcome back, " + savedUser.name + "! Login successful.";

    } else {

        document.getElementById("loginMessage").innerText =
            "Invalid email or password. Please try again.";
    }
}

// CONTACT US FORM

function sendContactMessage() {

    let name = document.getElementById("contactName").value.trim();

    let email = document.getElementById("contactEmail").value.trim();

    let message = document.getElementById("contactMessage").value.trim();

    if (name === "" || email === "" || message === "") {
        alert("Please fill in all contact fields!");
        return;
    }

    let inquiry = {
        name: name,
        email: email,
        message: message,
        date: new Date().toLocaleString()
    };

    let inquiries = JSON.parse(
        localStorage.getItem("contactInquiries") || "[]"
    );

    inquiries.push(inquiry);

    localStorage.setItem(
        "contactInquiries",
        JSON.stringify(inquiries)
    );

    document.getElementById("contactResponse").innerText =
        "Thank you, " + name + "! Your message has been recorded successfully. ✅";

    document.getElementById("contactName").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactMessage").value = "";
}

function logoutUser() {
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    document.getElementById("loginMessage").innerText =
        "You have logged out successfully!";

    document.getElementById("logoutMessage").innerText =
        "Logout successful.";
}

function calculateNextBid() {
    let currentBid = Number(
        document.getElementById("calculatorBid").value
    );

    if (currentBid <= 0 || isNaN(currentBid)) {
        alert("Please enter a valid bid amount!");
        return;
    }

    let nextBid = currentBid + 100;

    document.getElementById("nextBidResult").innerText =
        "Next Minimum Bid: ₹" + nextBid;
}

function calculateSmartWatchNextBid() {
    let currentBid = Number(
        document.getElementById("smartWatchCalculatorBid").value
    );

    if (currentBid <= 0 || isNaN(currentBid)) {
        alert("Please enter a valid bid amount!");
        return;
    }

    let nextBid = currentBid + 100;

    document.getElementById("smartWatchNextBidResult").innerText =
        "Next Minimum Bid: ₹" + nextBid;
}

function calculateSpeakerNextBid() {
    let currentBid = Number(
        document.getElementById("speakerCalculatorBid").value
    );

    if (currentBid <= 0 || isNaN(currentBid)) {
        alert("Please enter a valid bid amount!");
        return;
    }

    let nextBid = currentBid + 100;

    document.getElementById("speakerNextBidResult").innerText =
        "Next Minimum Bid: ₹" + nextBid;
}

