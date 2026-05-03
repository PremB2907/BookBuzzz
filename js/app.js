/**
 * BookBuzz - Student Book Exchange Platform
 * Main JavaScript File
 */

// ============================================
// Theme Management (Dark/Light Mode)
// ============================================
const toggleTheme = () => {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
};

// Initialize theme on page load
const initTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.dataset.theme = savedTheme;
    updateThemeIcon(savedTheme);
};

// ============================================
// Modal Management
// ============================================
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

const switchModal = (closeId, openId) => {
    closeModal(closeId);
    setTimeout(() => openModal(openId), 200);
};

// Close modal when clicking outside
const setupModalClose = () => {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
};

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});

// ============================================
// Toast Notifications
// ============================================
const showToast = (message, type = 'default') => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

// ============================================
// Authentication & OTP
// ============================================
let generatedOTP = null;
let tempUserData = null;

const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login validation
    if (email && password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userEmail', email);
        showToast('Login successful!', 'success');
        closeModal('loginModal');
        updateAuthUI();
    } else {
        showToast('Please fill in all fields', 'error');
    }
};

const handleRegister = async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    
    if (!validateMobile(mobile)) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Store temp data and generate OTP
    tempUserData = { name, email, mobile, password };
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via email service (or show alert in development)
    if (window.emailService) {
        showToast('Sending OTP to your email...', 'default');
        const result = await window.emailService.sendOTP(email, generatedOTP, name);
        if (result.success) {
            showToast('OTP sent to your email!', 'success');
        }
    } else {
        // Fallback for development
        alert(`Your OTP is: ${generatedOTP}`);
        showToast('OTP sent!', 'success');
    }
    
    switchModal('registerModal', 'otpModal');
};

const handleOTPVerify = async (e) => {
    e.preventDefault();
    const enteredOTP = document.getElementById('otpInput').value;
    
    if (enteredOTP === generatedOTP) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userEmail', tempUserData.email);
        localStorage.setItem('userName', tempUserData.name);
        localStorage.setItem('userMobile', tempUserData.mobile);
        
        // Send welcome email
        if (window.emailService) {
            await window.emailService.sendWelcomeEmail(tempUserData.email, tempUserData.name);
        }
        
        showToast('Registration successful!', 'success');
        closeModal('otpModal');
        updateAuthUI();
        
        // Clear temp data
        generatedOTP = null;
        tempUserData = null;
        document.getElementById('registerForm').reset();
        document.getElementById('otpInput').value = '';
    } else {
        showToast('Invalid OTP. Please try again.', 'error');
    }
};

const resendOTP = () => {
    if (tempUserData) {
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`Your new OTP is: ${generatedOTP}`);
        showToast('New OTP sent!', 'success');
    }
};

const logout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    showToast('Logged out successfully', 'default');
    updateAuthUI();
    window.location.href = 'index.html';
};

const updateAuthUI = () => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    const loginTriggers = document.querySelectorAll('.login-trigger');
    
    loginTriggers.forEach(trigger => {
        if (isLoggedIn) {
            const userName = localStorage.getItem('userName') || 'User';
            trigger.innerHTML = `<i class="fas fa-user"></i> ${userName.split(' ')[0]}`;
            trigger.onclick = logout;
        } else {
            trigger.innerHTML = `<i class="fas fa-user"></i> Login`;
            trigger.onclick = () => openModal('loginModal');
        }
    });
};

// ============================================
// Validation Utilities
// ============================================
const validateMobile = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// ============================================
// Book Search & Filters
// ============================================
const searchBooks = () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const bookCards = document.querySelectorAll('.book-card');
    let visibleCount = 0;
    
    bookCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const author = card.querySelector('.book-author').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateNoResults(visibleCount);
};

const filterBooks = () => {
    const subjectFilter = document.getElementById('subjectFilter')?.value || 'all';
    const conditionFilter = document.getElementById('conditionFilter')?.value || 'all';
    const priceFilter = document.getElementById('priceFilter')?.value || 'all';
    
    const bookCards = document.querySelectorAll('.book-card');
    let visibleCount = 0;
    
    bookCards.forEach(card => {
        const subject = card.dataset.subject;
        const condition = card.dataset.condition;
        const price = parseInt(card.dataset.price);
        
        let showCard = true;
        
        // Subject filter
        if (subjectFilter !== 'all' && subject !== subjectFilter) {
            showCard = false;
        }
        
        // Condition filter
        if (conditionFilter !== 'all' && condition !== conditionFilter) {
            showCard = false;
        }
        
        // Price filter
        if (priceFilter !== 'all') {
            if (priceFilter === '0-300' && price >= 300) showCard = false;
            if (priceFilter === '300-500' && (price < 300 || price > 500)) showCard = false;
            if (priceFilter === '500-800' && (price < 500 || price > 800)) showCard = false;
            if (priceFilter === '800+' && price <= 800) showCard = false;
        }
        
        card.style.display = showCard ? 'flex' : 'none';
        if (showCard) visibleCount++;
    });
    
    updateNoResults(visibleCount);
};

const updateNoResults = (count) => {
    const noResults = document.getElementById('noResults');
    const booksGrid = document.getElementById('booksGrid');
    
    if (noResults && booksGrid) {
        if (count === 0) {
            noResults.style.display = 'block';
            booksGrid.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            booksGrid.style.display = 'grid';
        }
    }
};

// ============================================
// Sell Form Handling
// ============================================
const handleSellSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to sell books', 'error');
        openModal('loginModal');
        return;
    }
    
    // Get form data
    const formData = {
        sellerName: document.getElementById('sellerName').value,
        collegeName: document.getElementById('collegeName').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        contactInfo: document.getElementById('contactInfo').value,
        bookTitle: document.getElementById('bookTitle').value,
        bookAuthor: document.getElementById('bookAuthor').value,
        bookEdition: document.getElementById('bookEdition').value,
        bookSubject: document.getElementById('bookSubject').value,
        bookPrice: document.getElementById('bookPrice').value,
        bookCondition: document.getElementById('bookCondition').value,
        originalPrice: document.getElementById('originalPrice').value,
        additionalNotes: document.getElementById('additionalNotes').value
    };
    
    // Validate contact info
    const isEmail = validateEmail(formData.contactInfo);
    const isMobile = validateMobile(formData.contactInfo);
    
    if (!isEmail && !isMobile) {
        showToast('Please enter a valid email or 10-digit mobile number', 'error');
        return;
    }
    
    // Simulate API call
    console.log('Book listing submitted:', formData);
    
    // Show success modal
    openModal('successModal');
};

// Image upload preview
const setupImageUpload = () => {
    const fileInput = document.getElementById('bookImages');
    const previewContainer = document.getElementById('imagePreview');
    
    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', (e) => {
            previewContainer.innerHTML = '';
            const files = Array.from(e.target.files).slice(0, 3);
            
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }
};

const clearImagePreview = () => {
    const previewContainer = document.getElementById('imagePreview');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
};

// ============================================
// Contact Seller
// ============================================
const handleContactSeller = (e) => {
    e.preventDefault();
    const message = document.getElementById('contactMessage').value;
    
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to contact seller', 'error');
        closeModal('contactModal');
        openModal('loginModal');
        return;
    }
    
    showToast('Message sent to seller!', 'success');
    closeModal('contactModal');
    document.getElementById('contactForm').reset();
};

// Setup buy buttons
const setupBuyButtons = () => {
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.book-card');
            const bookTitle = card.querySelector('h3').textContent;
            const sellerInfo = document.getElementById('sellerInfo');
            
            if (sellerInfo) {
                sellerInfo.innerHTML = `
                    <div class="book-preview" style="margin-bottom: 15px; padding: 10px; background: var(--bg); border-radius: 8px;">
                        <strong>${bookTitle}</strong>
                        <p style="margin: 5px 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                            ${card.querySelector('.book-price').textContent}
                        </p>
                    </div>
                `;
            }
            
            openModal('contactModal');
        });
    });
};

// ============================================
// Page Protection
// ============================================
const protectSellPage = () => {
    if (window.location.pathname.includes('sell.html')) {
        if (!localStorage.getItem('loggedIn')) {
            showToast('Please login to sell books', 'error');
            setTimeout(() => {
                openModal('loginModal');
            }, 500);
        }
    }
};

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupModalClose();
    updateAuthUI();
    setupImageUpload();
    setupBuyButtons();
    protectSellPage();
});
