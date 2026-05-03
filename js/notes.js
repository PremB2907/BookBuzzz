/**
 * BookBuzz Notes & Study Materials JavaScript
 * Handles notes browsing, filtering, upload, and library management
 */

// ============================================
// Notes Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNotes();
});

const initNotes = () => {
    if (!document.querySelector('.notes-section')) return;
    
    loadMyLibrary();
};

// ============================================
// Search and Filter Functions
// ============================================
const searchNotes = () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const noteCards = document.querySelectorAll('.note-card');
    let visibleCount = 0;
    
    noteCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('.note-description').textContent.toLowerCase();
        const author = card.querySelector('.note-meta span').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    updateNoNotesMessage(visibleCount);
};

const filterNotes = () => {
    const subjectFilter = document.getElementById('notesSubjectFilter')?.value || 'all';
    const yearFilter = document.getElementById('notesYearFilter')?.value || 'all';
    
    const noteCards = document.querySelectorAll('.note-card');
    let visibleCount = 0;
    
    noteCards.forEach(card => {
        const subject = card.dataset.subject;
        const year = card.dataset.year;
        
        let showCard = true;
        
        if (subjectFilter !== 'all' && subject !== subjectFilter) {
            showCard = false;
        }
        
        if (yearFilter !== 'all' && year !== yearFilter) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'flex' : 'none';
        if (showCard) visibleCount++;
    });
    
    updateNoNotesMessage(visibleCount);
};

const filterByCategory = (category) => {
    const noteCards = document.querySelectorAll('.note-card');
    let visibleCount = 0;
    
    noteCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update active category
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCategory = document.querySelector(`.category-card[onclick="filterByCategory('${category}')"]`);
    if (activeCategory) {
        activeCategory.classList.add('active');
    }
    
    updateNoNotesMessage(visibleCount);
};

const sortNotes = () => {
    const sortType = document.getElementById('notesSort')?.value || 'newest';
    const grid = document.getElementById('notesGrid');
    const cards = Array.from(grid.querySelectorAll('.note-card'));
    
    cards.sort((a, b) => {
        if (sortType === 'popular') {
            return parseInt(b.dataset.downloads) - parseInt(a.dataset.downloads);
        } else if (sortType === 'rating') {
            return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        } else {
            // Newest first (default order)
            return 0;
        }
    });
    
    cards.forEach(card => grid.appendChild(card));
};

const updateNoNotesMessage = (count) => {
    const noNotes = document.getElementById('noNotes');
    const grid = document.getElementById('notesGrid');
    
    if (noNotes && grid) {
        if (count === 0) {
            noNotes.style.display = 'block';
            grid.style.display = 'none';
        } else {
            noNotes.style.display = 'none';
            grid.style.display = 'grid';
        }
    }
};

const scrollToNotes = () => {
    document.getElementById('notesSection').scrollIntoView({ behavior: 'smooth' });
};

// ============================================
// Download and Save Functions
// ============================================
const downloadNote = (noteId) => {
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to download notes', 'error');
        openModal('loginModal');
        return;
    }
    
    // Simulate download
    const note = findNoteById(noteId);
    if (note) {
        showToast(`Downloading "${note.title}"...`, 'success');
        
        // Increment download count
        const currentDownloads = parseInt(note.dataset.downloads);
        note.dataset.downloads = currentDownloads + 1;
        
        // Add to download history
        const downloads = JSON.parse(localStorage.getItem('myDownloads') || '[]');
        downloads.push({
            id: noteId,
            title: note.title,
            downloadedAt: new Date().toISOString()
        });
        localStorage.setItem('myDownloads', JSON.stringify(downloads));
        
        // Simulate download delay
        setTimeout(() => {
            showToast('Download complete!', 'success');
        }, 1500);
    }
};

const saveToLibrary = (noteId) => {
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to save notes', 'error');
        openModal('loginModal');
        return;
    }
    
    const note = findNoteById(noteId);
    if (!note) return;
    
    const library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    
    if (library.find(n => n.id === noteId)) {
        showToast('Note is already in your library!', 'warning');
        return;
    }
    
    library.push({
        id: noteId,
        title: note.title,
        author: note.author,
        subject: note.subject,
        category: note.category,
        savedAt: new Date().toISOString()
    });
    
    localStorage.setItem('myLibrary', JSON.stringify(library));
    showToast('Added to your library!', 'success');
    loadMyLibrary();
};

const findNoteById = (noteId) => {
    // This would normally fetch from a database
    // For now, return mock data
    const mockNotes = {
        'ds-notes': { title: 'Data Structures Complete Notes', author: 'Rahul S.', subject: 'Computer Science', category: 'handwritten' },
        'math-papers': { title: 'Engineering Maths I - 5 Years Papers', author: 'Priya M.', subject: 'Mathematics', category: 'previous-papers' },
        'chem-guide': { title: 'Organic Chemistry Quick Revision', author: 'Amit K.', subject: 'Chemistry', category: 'study-guides' },
        'ds-lab': { title: 'Data Structures Lab Manual', author: 'Sneha R.', subject: 'Computer Science', category: 'lab-manuals' },
        'de-ppt': { title: 'Digital Electronics PPT', author: 'Vikram P.', subject: 'Electronics', category: 'presentation' },
        'physics-formula': { title: 'Physics Formulae Sheet', author: 'Neha G.', subject: 'Physics', category: 'handwritten' }
    };
    
    return mockNotes[noteId];
};

// ============================================
// My Library
// ============================================
const loadMyLibrary = () => {
    const container = document.getElementById('myLibrary');
    if (!container) return;
    
    const library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    
    if (library.length === 0) {
        container.innerHTML = '<p class="empty-state">Your library is empty. Save notes to access them quickly!</p>';
        return;
    }
    
    container.innerHTML = library.map(note => `
        <div class="note-card library-note">
            <div class="note-content">
                <h3>${note.title}</h3>
                <p class="note-subject">${note.subject}</p>
                <p class="note-category"><i class="fas fa-tag"></i> ${formatCategory(note.category)}</p>
            </div>
            <div class="note-footer">
                <span class="saved-date">Saved on ${formatDate(note.savedAt)}</span>
                <div class="note-actions">
                    <button class="primary-btn small" onclick="downloadNote('${note.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="icon-btn" onclick="removeFromLibrary('${note.id}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

const removeFromLibrary = (noteId) => {
    let library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    library = library.filter(n => n.id !== noteId);
    localStorage.setItem('myLibrary', JSON.stringify(library));
    
    loadMyLibrary();
    showToast('Removed from library', 'default');
};

const formatCategory = (category) => {
    const categories = {
        'handwritten': 'Handwritten Notes',
        'previous-papers': 'Previous Papers',
        'study-guides': 'Study Guides',
        'lab-manuals': 'Lab Manuals',
        'presentation': 'Presentations',
        'other': 'Other'
    };
    return categories[category] || category;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
    });
};

// ============================================
// Upload Notes
// ============================================
const handleNoteUpload = (e) => {
    e.preventDefault();
    
    if (!localStorage.getItem('loggedIn')) {
        showToast('Please login to upload notes', 'error');
        closeModal('uploadNoteModal');
        openModal('loginModal');
        return;
    }
    
    const title = document.getElementById('noteTitle').value;
    const subject = document.getElementById('noteSubject').value;
    const year = document.getElementById('noteYear').value;
    const category = document.getElementById('noteCategory').value;
    const description = document.getElementById('noteDescription').value;
    const fileInput = document.getElementById('noteFile');
    
    // Validate file
    if (!fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a file to upload', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    // Simulate upload
    showToast('Uploading your notes...', 'default');
    
    setTimeout(() => {
        // Save upload record
        const uploads = JSON.parse(localStorage.getItem('myUploads') || '[]');
        uploads.push({
            id: Date.now(),
            title,
            subject,
            year,
            category,
            description,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
            status: 'pending'
        });
        
        localStorage.setItem('myUploads', JSON.stringify(uploads));
        
        // Reset form and close modal
        document.getElementById('uploadNoteForm').reset();
        closeModal('uploadNoteModal');
        
        showToast('Notes uploaded successfully! Pending review.', 'success');
    }, 2000);
};

// ============================================
// Toggle Library View
// ============================================
const showLibrary = () => {
    document.getElementById('notesSection').style.display = 'none';
    document.getElementById('myLibrarySection').style.display = 'block';
    loadMyLibrary();
};

const showAllNotes = () => {
    document.getElementById('notesSection').style.display = 'block';
    document.getElementById('myLibrarySection').style.display = 'none';
};
