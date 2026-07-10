const SUPABASE_URL = "https://rbnfcljyxtgjatjpqwid.supabase.co";
const SUPABASE_KEY = "sb_publishable_KklgYWVbyOhrL50nToZUJg_4rGhBSON"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Security State Tracking
let hasFullAccess = false;
const ADMIN_PASSWORD = "2024-03257-MN-0";

/* ==========================================================================
   1. Dynamic Tab Navigation & Dropdown Management
   ========================================================================== */
const sidebarLinks = document.querySelectorAll('.sidebar a.nav-link');
const contentPages = document.querySelectorAll('.page');
const dropdownToggle = document.querySelector('.dropdown-toggle');

sidebarLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    sidebarLinks.forEach(item => item.classList.remove('active'));
    if (dropdownToggle) {
      dropdownToggle.classList.remove('active');
    }
    
    this.classList.add('active');

    if (this.closest('.submenu') && dropdownToggle) {
      dropdownToggle.classList.add('active');
    }

    contentPages.forEach(page => page.classList.remove('active'));
    const targetPageId = this.getAttribute('href');
    const targetPage = document.querySelector(targetPageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
  });
});

/* ==========================================================================
   2. Weekly Report Management
   ========================================================================== */
const openModalBtn = document.getElementById('open-report-modal');
const closeModalBtn = document.getElementById('close-report-modal');
const reportModal = document.getElementById('report-modal');
const reportForm = document.getElementById('report-form');
const timelineContainer = document.getElementById('report-timeline');

if (openModalBtn) {
  openModalBtn.addEventListener('click', () => {
    if (!hasFullAccess) {
      alert("Access Denied: You must sign up for full access to add weekly reports.");
      return;
    }
    reportModal.classList.add('open');
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    reportModal.classList.remove('open');
    reportForm.reset();
  });
}

function displayReportCard(id, week, date, accomplished, learned) {
  const newLogItem = document.createElement('div');
  newLogItem.classList.add('log-item');
  newLogItem.setAttribute('data-id', id);

  const deleteButtonHtml = hasFullAccess 
    ? `<button class="btn-delete" title="Delete Report"><i class="fa-solid fa-trash-can"></i></button>`
    : '';

  newLogItem.innerHTML = `
    <div class="log-item-header">
      <h3>${week} Report</h3>
      ${deleteButtonHtml}
    </div>
    <p><strong>Accomplished:</strong> ${accomplished}</p>
    <p><strong>Key Learnings:</strong> ${learned}</p>
    <small>Logged on: ${date}</small>
  `;

  if (timelineContainer) {
    timelineContainer.insertBefore(newLogItem, timelineContainer.firstChild);
  }
}

async function loadWeeklyReports() {
  if (!timelineContainer) return;
  timelineContainer.innerHTML = '';
  
  const { data: reports, error } = await supabaseClient
    .from('weekly_reports')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Error loading reports:", error.message);
    return;
  }

  reports.forEach(report => {
    displayReportCard(report.id, report.week_number, report.upload_date, report.accomplished, report.learned);
  });
}

if (reportForm) {
  reportForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!hasFullAccess) {
      alert("Access Denied: Restricted operation.");
      return;
    }

    const weekVal = document.getElementById('report-week').value;
    const dateVal = document.getElementById('report-date').value;
    const accomplishedVal = document.getElementById('report-accomplished').value;
    const learnedVal = document.getElementById('report-learned').value;

    const { data, error } = await supabaseClient
      .from('weekly_reports')
      .insert([{ week_number: weekVal, upload_date: dateVal, accomplished: accomplishedVal, learned: learnedVal }])
      .select();

    if (error) {
      alert("Database error: " + error.message);
      return;
    }

    if (data && data[0]) {
      displayReportCard(data[0].id, weekVal, dateVal, accomplishedVal, learnedVal);
    }

    reportModal.classList.remove('open');
    reportForm.reset();
  });
}

if (timelineContainer) {
  timelineContainer.addEventListener('click', async function(e) {
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      if (!hasFullAccess) {
        alert("Access Denied: You do not have permission to delete entries.");
        return;
      }
      const logItem = deleteBtn.closest('.log-item');
      const reportId = logItem.getAttribute('data-id');
      
      if (logItem && confirm('Are you sure you want to delete this weekly report permanently?')) {
        const { error } = await supabaseClient.from('weekly_reports').delete().eq('id', reportId);
        if (error) alert("Error deleting report: " + error.message);
        else logItem.remove();
      }
    }
  });
}

/* ==========================================================================
   3. Document Vault Management
   ========================================================================== */
const fileInput = document.getElementById('file-input');
const fileNamePreview = document.getElementById('file-name-preview');
const docTitleInput = document.getElementById('doc-title-input');
const docDateInput = document.getElementById('doc-date-input');
const docPrivacyInput = document.getElementById('doc-privacy-input');
const uploadForm = document.getElementById('document-upload-form');
const documentShelf = document.getElementById('document-shelf');

if (fileInput) {
  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileNamePreview.textContent = `Selected: ${this.files[0].name}`;
      if (!docTitleInput.value) docTitleInput.value = this.files[0].name.split('.')[0];
      if (!docDateInput.value) docDateInput.value = new Date().toISOString().split('T')[0];
    } else {
      fileNamePreview.textContent = "No file selected";
    }
  });
}

function displayDocumentCard(id, title, date, privacy, fileUrl) {
  const newCard = document.createElement('div');
  newCard.classList.add('doc-card', `privacy-${privacy}`);
  newCard.setAttribute('data-id', id);

  const isPdf = fileUrl.toLowerCase().includes('.pdf') || title.toLowerCase().includes('pdf');
  const iconClass = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image';
  
  const badgeClass = privacy === 'confidential' ? 'badge-confidential' : 'badge-public';
  const badgeLabel = privacy === 'confidential' ? 'Confidential' : 'Public';

  const deleteButtonHtml = hasFullAccess 
    ? `<button class="btn-doc-delete" title="Delete Document"><i class="fa-solid fa-trash-can"></i></button>`
    : '';

  newCard.innerHTML = `
    <div class="doc-icon"><i class="${iconClass}"></i></div>
    <div class="doc-info">
      <div class="doc-title-row">
        <h4>${title}</h4>
        ${deleteButtonHtml}
      </div>
      <div class="doc-meta-row">
        <small>Uploaded: ${date}</small>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>
    </div>
    <a href="${fileUrl}" class="btn-view" target="_blank">View File</a>
  `;

  if (documentShelf) {
    documentShelf.insertBefore(newCard, documentShelf.firstChild);
  }
}

async function loadDocuments() {
  if (!documentShelf) return;
  documentShelf.innerHTML = '';
  
  let query = supabaseClient.from('documents').select('*');

  if (!hasFullAccess) {
    query = query.eq('privacy', 'public');
  }

  const { data: docs, error } = await query.order('id', { ascending: true });

  if (error) {
    console.error("Error loading documents:", error.message);
    return;
  }

  docs.forEach(doc => {
    displayDocumentCard(doc.id, doc.title, doc.upload_date, doc.privacy, doc.file_url);
  });
}

if (uploadForm) {
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // FIXED: Security check prevents file uploads if access is locked
    if (!hasFullAccess) {
      alert("Access Denied: You must sign up for full access to upload files.");
      return;
    }

    const selectedFile = fileInput.files[0];
    const customTitle = docTitleInput.value;
    const selectedDate = docDateInput.value;
    const privacySetting = docPrivacyInput.value;

    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('portfolio_docs')
      .upload(uniqueFileName, selectedFile);

    if (storageError) {
      alert("Storage Upload Failed: " + storageError.message);
      return;
    }

    const { data: urlData } = supabaseClient.storage.from('portfolio_docs').getPublicUrl(uniqueFileName);
    const publicFileUrl = urlData.publicUrl;

    const { data: dbData, error: dbError } = await supabaseClient
      .from('documents')
      .insert([{ title: customTitle, upload_date: selectedDate, privacy: privacySetting, file_url: publicFileUrl }])
      .select();

    if (dbError) {
      alert("Metadata Registration Failed: " + dbError.message);
      return;
    }

    if (dbData && dbData[0]) {
      if (privacySetting === 'public' || hasFullAccess) {
        displayDocumentCard(dbData[0].id, customTitle, selectedDate, privacySetting, publicFileUrl);
      }
    }

    uploadForm.reset();
    fileNamePreview.textContent = "No file selected";
    alert('Document saved successfully!');
  });
}

if (documentShelf) {
  documentShelf.addEventListener('click', async function(e) {
    const deleteBtn = e.target.closest('.btn-doc-delete');
    if (deleteBtn) {
      if (!hasFullAccess) {
        alert("Access Denied: You do not have permission to delete entries.");
        return;
      }
      const docCard = deleteBtn.closest('.doc-card');
      const docId = docCard.getAttribute('data-id');
      
      if (docCard && confirm('Are you sure you want to delete this file?')) {
        const { error } = await supabaseClient.from('documents').delete().eq('id', docId);
        if (error) alert("Error removing document: " + error.message);
        else docCard.remove();
      }
    }
  });
}

/* ==========================================================================
   4. Gatekeeper Authentication Engine
   ========================================================================== */
const passwordInput = document.getElementById('admin-password-input');
const unlockBtn = document.getElementById('btn-unlock-access');
const authMessage = document.getElementById('auth-message');

if (unlockBtn) {
  unlockBtn.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();

    if (enteredPassword === ADMIN_PASSWORD) {
      hasFullAccess = true;
      
      authMessage.textContent = "Access Granted! Management mode enabled.";
      authMessage.style.color = "green";
      authMessage.style.display = "block";
      passwordInput.value = "";

      loadDocuments();
      loadWeeklyReports();
    } else {
      hasFullAccess = false;
      authMessage.textContent = "Incorrect password. Please try again.";
      authMessage.style.color = "red";
      authMessage.style.display = "block";
    }
  });
}

// Global initialization run execution
loadWeeklyReports();
loadDocuments();