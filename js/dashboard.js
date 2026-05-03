/**
 * BookBuzz Dashboard JavaScript
 * Handles dashboard functionality including sections, chat, and settings
 */

// Current active chat
let currentChatId = null;

// ============================================
// Dashboard Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

const initDashboard = () => {
    if (!document.querySelector('.dashboard-container')) return;
    
    checkAuth();
    loadUserData();
    loadDashboardStats();
    loadRecentActivity();
    loadMyListings();
    loadMyPurchases();
    loadWishlist();
    loadChatList();
    loadSavedSearches();
    loadSettings();
};

// ============================================
// Authentication Check
// ============================================
const checkAuth = () => {
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to access dashboard', 'error');
        window.location.href = 'index.html';
    }
};

// ============================================
// Section Navigation
// ============================================
const showSection = (sectionId) => {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar navigation
    document.querySelectorAll('.dashboard-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.dashboard-nav a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Save current section
    localStorage.setItem('dashboardSection', sectionId);
};

// ============================================
// User Data Loading
// ============================================
const loadUserData = () => {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const isVerified = localStorage.getItem('collegeVerified') === 'true';
    
    const nameDisplay = document.getElementById('userNameDisplay');
    const emailDisplay = document.getElementById('userEmailDisplay');
    const badge = document.getElementById('verificationBadge');
    
    if (nameDisplay) nameDisplay.textContent = userName;
    if (emailDisplay) emailDisplay.textContent = userEmail;
    
    if (badge) {
        if (isVerified) {
            badge.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            badge.classList.add('verified');
        } else {
            badge.innerHTML = '<i class="fas fa-clock"></i> Pending';
            badge.classList.remove('verified');
        }
    }
};

// ============================================
// Dashboard Statistics
// ============================================
const loadDashboardStats = () => {
    const listings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const purchases = JSON.parse(localStorage.getItem('myPurchases') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Update stat cards
    updateStat('statListings', listings.length);
    updateStat('statPurchases', purchases.length);
    updateStat('statWishlist', wishlist.length);
    updateStat('statMessages', messages.length);
    
    // Update sidebar counts
    updateStat('myListingsCount', listings.length);
    updateStat('myPurchasesCount', purchases.length);
    updateStat('wishlistCount', wishlist.length);
    updateStat('unreadCount', messages.filter(m => !m.read).length);
    
    // Update impact stats
    updateImpactStats(purchases.length);
};

const updateStat = (elementId, value) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
};

const updateImpactStats = (purchaseCount) => {
    const treesSaved = Math.floor(purchaseCount * 0.5);
    const moneySaved = purchaseCount * 300; // Average savings
    const booksRecycled = purchaseCount;
    
    const treesElement = document.getElementById('treesSaved');
    const moneyElement = document.getElementById('moneySaved');
    const booksElement = document.getElementById('booksRecycled');
    
    if (treesElement) treesElement.textContent = treesSaved;
    if (moneyElement) moneyElement.textContent = `₹${moneySaved}`;
    if (booksElement) booksElement.textContent = booksRecycled;
};

// ============================================
// Recent Activity
// ============================================
const loadRecentActivity = () => {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;
    
    const activities = JSON.parse(localStorage.getItem('recentActivity') || '[]');
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon}"></i>
            <div class="activity-details">
                <p>${activity.text}</p>
                <span>${formatTime(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
};

const addActivity = (text, icon = 'fa-info-circle') => {
    const activities = JSON.parse(localStorage.getItem('recentActivity') || '[]');
    activities.unshift({
        text,
        icon,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 activities
    if (activities.length > 20) activities.pop();
    
    localStorage.setItem('recentActivity', JSON.stringify(activities));
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
};

// ============================================
// My Listings
// ============================================
const loadMyListings = () => {
    const container = document.getElementById('myListings');
    if (!container) return;
    
    const listings = JSON.parse(localStorage.getItem('myListings') || '[]');
    
    if (listings.length === 0) {
        container.innerHTML = `<p class="empty-state">You haven't listed any books yet. <a href="sell.html">Sell your first book!</a></p>`;
        return;
    }
    
    container.innerHTML = listings.map(listing => `
        <div class="my-listing-card">
            <img src="${listing.image || 'https://via.placeholder.com/100'}" alt="${listing.title}">
            <div class="listing-details">
                <h4>${listing.title}</h4>
                <p>₹${listing.price} • ${listing.condition}</p>
                <span class="status ${listing.status}">${listing.status}</span>
            </div>
            <div class="listing-actions">
                <button class="icon-btn" onclick="editListing('${listing.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn" onclick="deleteListing('${listing.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

// ============================================
// My Purchases
// ============================================
const loadMyPurchases = () => {
    const container = document.getElementById('myPurchases');
    if (!container) return;
    
    const purchases = JSON.parse(localStorage.getItem('myPurchases') || '[]');
    
    if (purchases.length === 0) {
        container.innerHTML = `<p class="empty-state">You haven't purchased any books yet. <a href="buy.html">Browse books!</a></p>`;
        return;
    }
    
    container.innerHTML = purchases.map(purchase => `
        <div class="purchase-card">
            <img src="${purchase.image}" alt="${purchase.title}">
            <div class="purchase-details">
                <h4>${purchase.title}</h4>
                <p>₹${purchase.price} • From: ${purchase.seller}</p>
                <span class="purchase-date">Purchased on ${formatDate(purchase.date)}</span>
            </div>
            <button class="secondary-btn small" onclick="contactSeller('${purchase.sellerId}')">
                <i class="fas fa-comment"></i> Message
            </button>
        </div>
    `).join('');
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// ============================================
// Wishlist
// ============================================
const loadWishlist = () => {
    const container = document.getElementById('myWishlist');
    if (!container) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlist.length === 0) {
        container.innerHTML = `<p class="empty-state">Your wishlist is empty. <a href="buy.html">Browse books to add!</a></p>`;
        return;
    }
    
    container.innerHTML = wishlist.map(book => `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <p class="book-price">Price: <span>₹${book.price}</span></p>
                <div class="book-actions">
                    <button class="primary-btn buy-btn" onclick="buyFromWishlist('${book.id}')">Buy Now</button>
                    <button class="icon-btn" onclick="removeFromWishlist('${book.id}')" title="Remove">
                        <i class="fas fa-heart-broken"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

const addToWishlist = (book) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (wishlist.find(b => b.id === book.id)) {
        showToast('Book is already in your wishlist!', 'warning');
        return;
    }
    
    wishlist.push(book);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    addActivity(`Added "${book.title}" to wishlist`, 'fa-heart');
    showToast('Added to wishlist!', 'success');
};

const removeFromWishlist = (bookId) => {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist = wishlist.filter(b => b.id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    loadWishlist();
    loadDashboardStats();
    showToast('Removed from wishlist', 'default');
};

// ============================================
// Chat/Messages
// ============================================
const loadChatList = () => {
    const container = document.getElementById('chatList');
    if (!container) return;
    
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    
    if (chats.length === 0) {
        container.innerHTML = '<p class="empty-state">No messages yet. Start chatting with sellers!</p>';
        return;
    }
    
    container.innerHTML = chats.map(chat => `
        <div class="chat-item ${chat.unread ? 'unread' : ''}" onclick="openChat('${chat.id}')">
            <i class="fas fa-user-circle"></i>
            <div class="chat-info">
                <h4>${chat.userName}</h4>
                <p>${chat.lastMessage}</p>
            </div>
            <div class="chat-meta">
                <span>${formatTime(chat.lastMessageTime)}</span>
                ${chat.unread ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
            </div>
        </div>
    `).join('');
};

const openChat = (chatId) => {
    currentChatId = chatId;
    const chat = JSON.parse(localStorage.getItem('chats') || '[]').find(c => c.id === chatId);
    
    if (!chat) return;
    
    document.getElementById('chatUserName').textContent = chat.userName;
    document.getElementById('chatBookInfo').textContent = chat.bookTitle || '';
    
    loadChatMessages(chatId);
    openModal('chatModal');
};

const loadChatMessages = (chatId) => {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem(`messages_${chatId}`) || '[]');
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender === 'me' ? 'sent' : 'received'}">
            <p>${msg.text}</p>
            <span class="message-time">${formatTime(msg.timestamp)}</span>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
};

const sendMessage = () => {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentChatId) return;
    
    const messages = JSON.parse(localStorage.getItem(`messages_${currentChatId}`) || '[]');
    messages.push({
        sender: 'me',
        text,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem(`messages_${currentChatId}`, JSON.stringify(messages));
    
    // Update chat list
    updateChatLastMessage(currentChatId, text);
    
    input.value = '';
    loadChatMessages(currentChatId);
};

const updateChatLastMessage = (chatId, message) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        chat.lastMessage = message;
        chat.lastMessageTime = new Date().toISOString();
        localStorage.setItem('chats', JSON.stringify(chats));
    }
};

// ============================================
// Saved Searches
// ============================================
const loadSavedSearches = () => {
    const container = document.getElementById('savedSearchesList');
    if (!container) return;
    
    const searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    
    if (searches.length === 0) {
        container.innerHTML = '<p class="empty-state">No saved searches. Search for books and save your filters!</p>';
        return;
    }
    
    container.innerHTML = searches.map((search, index) => `
        <div class="saved-search-item">
            <div class="search-details">
                <h4>${search.name}</h4>
                <p>${search.filters || 'No filters'}</p>
            </div>
            <div class="search-actions">
                <button class="secondary-btn small" onclick="runSavedSearch(${index})">
                    <i class="fas fa-search"></i> Search
                </button>
                <button class="icon-btn" onclick="deleteSavedSearch(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
};

const saveSearch = (name, filters) => {
    const searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    searches.push({ name, filters, date: new Date().toISOString() });
    localStorage.setItem('savedSearches', JSON.stringify(searches));
    showToast('Search saved!', 'success');
};

const deleteSavedSearch = (index) => {
    let searches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    searches.splice(index, 1);
    localStorage.setItem('savedSearches', JSON.stringify(searches));
    loadSavedSearches();
    showToast('Saved search deleted', 'default');
};

// ============================================
// Settings
// ============================================
const loadSettings = () => {
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userMobile = localStorage.getItem('userMobile') || '';
    const college = localStorage.getItem('college') || '';
    const collegeEmail = localStorage.getItem('collegeEmail') || '';
    const isVerified = localStorage.getItem('collegeVerified') === 'true';
    
    const nameInput = document.getElementById('settingsName');
    const emailInput = document.getElementById('settingsEmail');
    const mobileInput = document.getElementById('settingsMobile');
    const collegeInput = document.getElementById('settingsCollege');
    const collegeEmailInput = document.getElementById('collegeEmail');
    const statusDiv = document.getElementById('verificationStatus');
    
    if (nameInput) nameInput.value = userName;
    if (emailInput) emailInput.value = userEmail;
    if (mobileInput) mobileInput.value = userMobile;
    if (collegeInput) collegeInput.value = college;
    if (collegeEmailInput) collegeEmailInput.value = collegeEmail;
    
    if (statusDiv) {
        if (isVerified) {
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i><span>Your college email is verified</span>';
            statusDiv.classList.add('verified');
        } else {
            statusDiv.innerHTML = '<i class="fas fa-clock"></i><span>College email verification pending</span>';
            statusDiv.classList.remove('verified');
        }
    }
};

const saveSettings = () => {
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const mobile = document.getElementById('settingsMobile').value;
    const college = document.getElementById('settingsCollege').value;
    
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userMobile', mobile);
    localStorage.setItem('college', college);
    
    addActivity('Updated profile settings', 'fa-cog');
    showToast('Settings saved successfully!', 'success');
    loadUserData();
    updateAuthUI();
};

const sendCollegeVerification = () => {
    const collegeEmail = document.getElementById('collegeEmail').value;
    
    if (!collegeEmail || !collegeEmail.includes('.')) {
        showToast('Please enter a valid college email', 'error');
        return;
    }
    
    localStorage.setItem('collegeEmail', collegeEmail);
    
    // Generate verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('collegeVerifyCode', verifyCode.toString());
    
    alert(`Verification code sent to ${collegeEmail}\nCode: ${verifyCode}`);
    
    // Show verification input
    const enteredCode = prompt('Enter the verification code sent to your college email:');
    if (enteredCode === localStorage.getItem('collegeVerifyCode')) {
        localStorage.setItem('collegeVerified', 'true');
        showToast('College email verified!', 'success');
        loadSettings();
        loadUserData();
    } else {
        showToast('Invalid verification code', 'error');
    }
};

const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        localStorage.clear();
        showToast('Account deleted', 'default');
        window.location.href = 'index.html';
    }
};

// ============================================
// Purchase & Listing Actions
// ============================================
const buyFromWishlist = (bookId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const book = wishlist.find(b => b.id === bookId);
    
    if (book) {
        addToPurchases(book);
        removeFromWishlist(bookId);
        showToast('Purchase successful!', 'success');
    }
};

const addToPurchases = (book) => {
    const purchases = JSON.parse(localStorage.getItem('myPurchases') || '[]');
    purchases.push({
        ...book,
        date: new Date().toISOString()
    });
    localStorage.setItem('myPurchases', JSON.stringify(purchases));
    addActivity(`Purchased "${book.title}"`, 'fa-shopping-bag');
};

const editListing = (listingId) => {
    window.location.href = `sell.html?edit=${listingId}`;
};

const deleteListing = (listingId) => {
    if (confirm('Are you sure you want to delete this listing?')) {
        let listings = JSON.parse(localStorage.getItem('myListings') || '[]');
        const listing = listings.find(l => l.id === listingId);
        listings = listings.filter(l => l.id !== listingId);
        localStorage.setItem('myListings', JSON.stringify(listings));
        
        loadMyListings();
        loadDashboardStats();
        addActivity(`Deleted listing "${listing?.title || 'Unknown'}"`, 'fa-trash');
        showToast('Listing deleted', 'default');
    }
};

const contactSeller = (sellerId) => {
    openChat(sellerId);
};

// Handle Enter key in chat
if (document.getElementById('messageInput')) {
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Restore last viewed section
const lastSection = localStorage.getItem('dashboardSection') || 'overview';
if (document.getElementById(lastSection)) {
    showSection(lastSection);
}
