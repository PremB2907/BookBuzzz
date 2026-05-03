/**
 * BookBuzz Admin Panel JavaScript
 * Handles admin functionality including moderation, analytics, and settings
 */

// ============================================
// Admin Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

const initAdmin = () => {
    if (!document.querySelector('.admin-container')) return;
    
    checkAdminAuth();
    loadAdminStats();
    loadPendingCounts();
};

// ============================================
// Admin Authentication
// ============================================
const checkAdminAuth = () => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isLoggedIn) {
        showToast('Please login to access admin panel', 'error');
        window.location.href = 'index.html';
        return;
    }
    
    // For demo, auto-promote first user to admin
    if (!isAdmin) {
        localStorage.setItem('isAdmin', 'true');
    }
};

// ============================================
// Section Navigation
// ============================================
const showAdminSection = (sectionId) => {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar navigation
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.admin-nav a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
};

// ============================================
// Admin Statistics
// ============================================
const loadAdminStats = () => {
    // These would come from backend in real implementation
    const stats = {
        totalUsers: 1247,
        totalListings: 3582,
        totalTransactions: 892,
        totalNotes: 1156
    };
    
    updateElement('totalUsers', stats.totalUsers.toLocaleString());
    updateElement('totalListings', stats.totalListings.toLocaleString());
    updateElement('totalTransactions', stats.totalTransactions.toLocaleString());
    updateElement('totalNotes', stats.totalNotes.toLocaleString());
};

const loadPendingCounts = () => {
    // Load from localStorage or use mock data
    const pendingUsers = 12;
    const pendingListings = 8;
    const pendingNotes = 5;
    const newReports = 3;
    
    updateElement('pendingUsersCount', pendingUsers);
    updateElement('pendingListingsCount', pendingListings);
    updateElement('pendingNotesCount', pendingNotes);
    updateElement('newReportsCount', newReports);
};

const updateElement = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
};

// ============================================
// User Management
// ============================================
const approveUser = (userId) => {
    showToast('User approved successfully', 'success');
    // Update UI
    const row = document.querySelector(`#usersTable tr[data-user-id="${userId}"]`);
    if (row) {
        row.querySelector('.status').className = 'status verified';
        row.querySelector('.status').textContent = 'Verified';
    }
};

const rejectUser = (userId) => {
    if (confirm('Are you sure you want to reject this user?')) {
        showToast('User rejected', 'default');
        // Remove row or update status
        const row = document.querySelector(`#usersTable tr[data-user-id="${userId}"]`);
        if (row) {
            row.remove();
        }
    }
};

const banUser = (userId) => {
    if (confirm('Are you sure you want to ban this user?')) {
        showToast('User banned', 'error');
        // Update status
        const row = document.querySelector(`#usersTable tr[data-user-id="${userId}"]`);
        if (row) {
            row.querySelector('.status').className = 'status banned';
            row.querySelector('.status').textContent = 'Banned';
        }
    }
};

// ============================================
// Listing Moderation
// ============================================
const approveListing = (listingId) => {
    showToast('Listing approved', 'success');
    // Remove from pending or update status
    const card = document.querySelector(`.listing-mod-card[data-id="${listingId}"]`);
    if (card) {
        card.querySelector('.status-badge').className = 'status-badge approved';
        card.querySelector('.status-badge').textContent = 'Approved';
        
        // Update buttons
        const actions = card.querySelector('.listing-actions');
        actions.innerHTML = `
            <button class="secondary-btn" onclick="viewListing('${listingId}')">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="danger-btn" onclick="removeListing('${listingId}')">
                <i class="fas fa-trash"></i> Remove
            </button>
        `;
    }
};

const rejectListing = (listingId) => {
    if (confirm('Are you sure you want to reject this listing?')) {
        showToast('Listing rejected', 'error');
        const card = document.querySelector(`.listing-mod-card[data-id="${listingId}"]`);
        if (card) {
            card.remove();
        }
    }
};

const viewListing = (listingId) => {
    showToast(`Viewing listing ${listingId}`, 'default');
    // Would open detailed view in real implementation
};

const removeListing = (listingId) => {
    if (confirm('Are you sure you want to remove this listing?')) {
        const card = document.querySelector(`.listing-mod-card[data-id="${listingId}"]`);
        if (card) {
            card.remove();
        }
        showToast('Listing removed', 'default');
    }
};

// ============================================
// Notes Moderation
// ============================================
const approveNote = (noteId) => {
    showToast('Note approved', 'success');
    const card = document.querySelector(`.note-mod-card[data-id="${noteId}"]`);
    if (card) {
        card.querySelector('.status-badge').className = 'status-badge approved';
        card.querySelector('.status-badge').textContent = 'Approved';
    }
};

const rejectNote = (noteId) => {
    if (confirm('Are you sure you want to reject this note?')) {
        showToast('Note rejected', 'error');
        const card = document.querySelector(`.note-mod-card[data-id="${noteId}"]`);
        if (card) {
            card.remove();
        }
    }
};

const previewNote = (noteId) => {
    showToast(`Previewing note ${noteId}`, 'default');
    // Would open preview modal in real implementation
};

// ============================================
// Report Management
// ============================================
const viewReport = (reportId) => {
    showToast(`Viewing report details ${reportId}`, 'default');
};

const resolveReport = (reportId) => {
    showToast('Report marked as resolved', 'success');
    const card = document.querySelector(`.report-card[data-id="${reportId}"]`);
    if (card) {
        card.classList.add('resolved');
        card.querySelector('.report-actions').innerHTML = '<span class="resolved-badge"><i class="fas fa-check"></i> Resolved</span>';
    }
};

const banReporter = (reportId) => {
    if (confirm('Ban the user who reported this?')) {
        showToast('Reporter has been banned', 'error');
    }
};

// ============================================
// Admin Settings
// ============================================
const saveAdminSettings = () => {
    // Collect all settings
    const settings = {
        autoApprove: document.querySelector('input[name="autoApprove"]')?.checked,
        contentModeration: document.querySelector('input[name="contentModeration"]')?.checked,
        manualNoteApproval: document.querySelector('input[name="manualNoteApproval"]')?.checked,
        newUserAlerts: document.querySelector('input[name="newUserAlerts"]')?.checked,
        reportAlerts: document.querySelector('input[name="reportAlerts"]')?.checked,
        analyticsSummary: document.querySelector('input[name="analyticsSummary"]')?.checked,
        maxListings: document.querySelector('input[name="maxListings"]')?.value,
        maxNotes: document.querySelector('input[name="maxNotes"]')?.value,
        fileSizeLimit: document.querySelector('input[name="fileSizeLimit"]')?.value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showToast('Admin settings saved', 'success');
};

const resetSettings = () => {
    if (confirm('Reset all settings to default?')) {
        localStorage.removeItem('adminSettings');
        showToast('Settings reset to default', 'default');
        location.reload();
    }
};

// ============================================
// Filter and Search Functions
// ============================================
const filterUsers = () => {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const filter = document.getElementById('userFilter').value;
    const rows = document.querySelectorAll('#usersTable tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const status = row.querySelector('.status')?.className || '';
        
        let show = text.includes(searchTerm);
        
        if (filter !== 'all' && !status.includes(filter)) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
};

// Event listeners for admin filters
if (document.getElementById('userSearch')) {
    document.getElementById('userSearch').addEventListener('input', filterUsers);
}

if (document.getElementById('userFilter')) {
    document.getElementById('userFilter').addEventListener('change', filterUsers);
}
