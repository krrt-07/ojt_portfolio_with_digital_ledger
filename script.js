/* ==========================================================================
   1. Dynamic Tab Navigation & Dropdown Management
   ========================================================================== */
const sidebarLinks = document.querySelectorAll('.sidebar a.nav-link');
const contentPages = document.querySelectorAll('.page');
const dropdownToggle = document.querySelector('.dropdown-toggle');

sidebarLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    // Clear active highlights from ALL regular nav links
    sidebarLinks.forEach(item => item.classList.remove('active'));
    
    // Remove active highlight from the parent Documents link too
    if (dropdownToggle) {
      dropdownToggle.classList.remove('active');
    }
    
    // Highlight the specific link you just clicked
    this.classList.add('active');

    // If this link is inside a dropdown sub-menu, keep the parent highlighted!
    if (this.closest('.submenu') && dropdownToggle) {
      dropdownToggle.classList.add('active');
    }

    // Toggle the visible content sections on the right
    contentPages.forEach(page => page.classList.remove('active'));
    const targetPageId = this.getAttribute('href');
    const targetPage = document.querySelector(targetPageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
  });
});

/* ==========================================================================
   2. Weekly Report Form Submission, Modal Operations & Deletion
   ========================================================================== */
const openModalBtn = document.getElementById('open-report-modal');
const closeModalBtn = document.getElementById('close-report-modal');
const reportModal = document.getElementById('report-modal');
const reportForm = document.getElementById('report-form');
const timelineContainer = document.getElementById('report-timeline');

// Show modal window
if (openModalBtn) {
  openModalBtn.addEventListener('click', () => {
    reportModal.classList.add('open');
  });
}

// Close modal window
if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    reportModal.classList.remove('open');
    reportForm.reset();
  });
}

// Capture form fields and prepend onto the timeline
if (reportForm) {
  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const weekVal = document.getElementById('report-week').value;
    const dateVal = document.getElementById('report-date').value;
    const accomplishedVal = document.getElementById('report-accomplished').value;
    const learnedVal = document.getElementById('report-learned').value;

    // Build the container HTML element
    const newLogItem = document.createElement('div');
    newLogItem.classList.add('log-item');

    // Feed layout elements into template (includes deletion button)
    newLogItem.innerHTML = `
      <div class="log-item-header">
        <h3>${weekVal} Report</h3>
        <button class="btn-delete" title="Delete Report"><i class="fa-solid fa-trash-can"></i></button>
      </div>
      <p><strong>Accomplished:</strong> ${accomplishedVal}</p>
      <p><strong>Key Learnings:</strong> ${learnedVal}</p>
      <small>Logged on: ${dateVal}</small>
    `;

    // Drop new report entry cleanly at the top of the history list
    if (timelineContainer) {
      timelineContainer.insertBefore(newLogItem, timelineContainer.firstChild);
    }

    // Close the popup view frame and reset fields
    reportModal.classList.remove('open');
    reportForm.reset();
  });
}

// Event delegation to catch clicks on any dynamically generated delete button
if (timelineContainer) {
  timelineContainer.addEventListener('click', function(e) {
    // Check if the clicked element or its parent is the delete button
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      // Find the closest log item wrap card and remove it
      const logItem = deleteBtn.closest('.log-item');
      if (logItem && confirm('Are you sure you want to delete this weekly report?')) {
        logItem.remove();
      }
    }
  });
}