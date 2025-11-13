// Main Application Logic

let currentView = 'available-chores';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showView('available-chores');
    renderAvailableChores();
    renderSchedule();
    renderEarnings();
    renderProfile();
});

// View Navigation
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(viewName).classList.add('active');
    currentView = viewName;
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Render Available Chores
function renderAvailableChores() {
    const container = document.getElementById('chores-list');
    const chores = filterChoresData();
    
    if (chores.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No chores match your filters.</p>';
        return;
    }
    
    container.innerHTML = chores.map(chore => `
        <div class="chore-card" onclick="showChoreDetails(${chore.id})">
            <div class="chore-header">
                <div style="display: flex; align-items: center;">
                    <span class="chore-type">${chore.typeEmoji}</span>
                    <div>
                        <div class="chore-title">${getChoreTypeName(chore.type)}</div>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">${chore.neighbor}</div>
                    </div>
                </div>
                <div class="chore-payment">$${chore.payment}</div>
            </div>
            <div class="chore-info">
                <div class="chore-info-item">
                    <span>📍</span>
                    <span>${chore.address} (${chore.distance})</span>
                </div>
                <div class="chore-info-item">
                    <span>📅</span>
                    <span>${formatDate(chore.date)} at ${chore.time}</span>
                </div>
                <div class="chore-info-item">
                    <span>🔄</span>
                    <span>${chore.frequency}</span>
                </div>
            </div>
            <div class="chore-actions">
                <button class="btn btn-primary" onclick="event.stopPropagation(); claimChore(${chore.id})">Claim Chore</button>
            </div>
        </div>
    `).join('');
}

function filterChores() {
    renderAvailableChores();
}

function filterChoresData() {
    const typeFilter = document.getElementById('filter-type').value;
    const paymentFilter = document.getElementById('filter-payment').value;
    
    return mockData.availableChores.filter(chore => {
        // Type filter
        if (typeFilter !== 'all' && chore.type !== typeFilter) {
            return false;
        }
        
        // Payment filter
        if (paymentFilter !== 'all') {
            if (paymentFilter === 'low' && (chore.payment < 5 || chore.payment > 15)) return false;
            if (paymentFilter === 'medium' && (chore.payment < 16 || chore.payment > 30)) return false;
            if (paymentFilter === 'high' && chore.payment < 31) return false;
        }
        
        return true;
    });
}

function getChoreTypeName(type) {
    const names = {
        weeding: 'Weeding',
        trash: 'Trash Cans',
        sweeping: 'Driveway Sweeping'
    };
    return names[type] || type;
}

function showChoreDetails(choreId) {
    const chore = mockData.availableChores.find(c => c.id === choreId);
    if (!chore) return;
    
    const modal = document.getElementById('chore-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${chore.typeEmoji} ${getChoreTypeName(chore.type)}</h2>
        <div style="margin: 1.5rem 0;">
            <h3 style="margin-bottom: 1rem;">Details</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div><strong>Neighbor:</strong> ${chore.neighbor}</div>
                <div><strong>Address:</strong> ${chore.address}</div>
                <div><strong>Date:</strong> ${formatDate(chore.date)}</div>
                <div><strong>Time:</strong> ${chore.time}</div>
                <div><strong>Frequency:</strong> ${chore.frequency}</div>
                <div><strong>Payment:</strong> <span style="color: #10b981; font-weight: bold;">$${chore.payment}</span></div>
                <div><strong>Distance:</strong> ${chore.distance}</div>
            </div>
        </div>
        <div style="margin: 1.5rem 0;">
            <h3 style="margin-bottom: 1rem;">Instructions</h3>
            <p style="color: #666;">${chore.instructions}</p>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="claimChore(${chore.id}); closeModal();" style="flex: 1;">
                Claim This Chore
            </button>
            <button class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">
                Close
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('chore-modal').classList.remove('active');
}

function claimChore(choreId) {
    const chore = mockData.availableChores.find(c => c.id === choreId);
    if (!chore) return;
    
    // Remove from available
    mockData.availableChores = mockData.availableChores.filter(c => c.id !== choreId);
    
    // Add to schedule
    mockData.mySchedule.push({
        ...chore,
        id: Date.now(),
        status: 'upcoming'
    });
    
    mockData.user.activeChores++;
    
    showToast(`Successfully claimed ${getChoreTypeName(chore.type)} for ${chore.neighbor}!`);
    renderAvailableChores();
    renderSchedule();
    renderProfile();
}

// Render Schedule
function renderSchedule() {
    const container = document.getElementById('schedule-list');
    const schedule = mockData.mySchedule.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return new Date(a.date) - new Date(b.date);
    });
    
    if (schedule.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No scheduled chores. Browse available chores to get started!</p>';
        return;
    }
    
    container.innerHTML = schedule.map(item => `
        <div class="schedule-item ${item.status === 'completed' ? 'completed' : ''}">
            <div class="schedule-details">
                <h3>${item.typeEmoji} ${getChoreTypeName(item.type)} - ${item.neighbor}</h3>
                <p>📍 ${item.address}</p>
                <p>📅 ${formatDate(item.date)} at ${item.time}</p>
                <p>💰 Payment: $${item.payment}</p>
                ${item.instructions ? `<p style="margin-top: 0.5rem; font-style: italic;">${item.instructions}</p>` : ''}
            </div>
            <div>
                <div class="schedule-status ${item.status === 'completed' ? 'status-completed' : 'status-upcoming'}">
                    ${item.status === 'completed' ? '✓ Completed' : 'Upcoming'}
                </div>
                ${item.status === 'upcoming' ? `
                    <button class="btn btn-success" style="margin-top: 0.5rem; width: 100%;" onclick="completeChore(${item.id})">
                        Mark Complete
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function completeChore(choreId) {
    const chore = mockData.mySchedule.find(c => c.id === choreId);
    if (!chore) return;
    
    // Update status
    chore.status = 'completed';
    chore.completedDate = new Date().toISOString().split('T')[0];
    
    // Add to payment history
    mockData.paymentHistory.unshift({
        id: Date.now(),
        chore: `${getChoreTypeName(chore.type)} - ${chore.neighbor}`,
        date: chore.completedDate,
        amount: chore.payment,
        status: 'paid'
    });
    
    // Update user stats
    mockData.user.completedChores++;
    mockData.user.totalEarned += chore.payment;
    mockData.user.activeChores--;
    
    showToast(`Chore completed! $${chore.payment} will be paid.`);
    renderSchedule();
    renderEarnings();
    renderProfile();
}

// Render Earnings
function renderEarnings() {
    const totals = calculateTotals();
    
    document.getElementById('total-earned').textContent = totals.total;
    document.getElementById('month-earned').textContent = totals.thisMonth;
    document.getElementById('completed-count').textContent = totals.completed;
    
    const container = document.getElementById('payment-history');
    container.innerHTML = mockData.paymentHistory.map(payment => `
        <div class="payment-item">
            <div class="payment-info">
                <h4>${payment.chore}</h4>
                <p>${formatDate(payment.date)}</p>
            </div>
            <div class="payment-amount">$${payment.amount}</div>
        </div>
    `).join('');
}

// Render Profile
function renderProfile() {
    document.getElementById('profile-name').textContent = mockData.user.name;
    document.getElementById('profile-rating').textContent = mockData.user.rating;
    document.getElementById('profile-completed').textContent = mockData.user.completedChores;
    document.getElementById('profile-total').textContent = mockData.user.totalEarned;
    document.getElementById('profile-active').textContent = mockData.user.activeChores;
    
    const container = document.getElementById('reviews-list');
    container.innerHTML = mockData.reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div>
                    <strong>${review.reviewer}</strong>
                    <span style="color: #666; margin-left: 0.5rem;">${formatDate(review.date)}</span>
                </div>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${isError ? 'error' : ''} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('chore-modal');
    if (event.target === modal) {
        closeModal();
    }
}

