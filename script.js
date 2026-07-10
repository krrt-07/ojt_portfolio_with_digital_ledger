const SUPABASE_URL = "https://rbnfcljyxtgjatjpqwid.supabase.co";
const SUPABASE_KEY = "sb_publishable_KklgYWVbyOhrL50nToZUJg_4rGhBSON"; 
// Initializing with a unique variable name to prevent declaration conflicts
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
   2. Weekly Report Live Cloud Database Synchronization
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

// Function to render a single weekly report card UI element
function displayReportCard(id, week, date, accomplished, learned) {
  const newLogItem = document.createElement('div');
  newLogItem.classList.add('log-item');
  newLogItem.setAttribute('data-id', id);

  newLogItem.innerHTML = `
    <div class="log-item-header">
      <h3>${week} Report</h3>
      <button class="btn-delete" title="Delete Report"><i class="fa-solid fa-trash-can"></i></button>
    </div>
    <p><strong>Accomplished:</strong> ${accomplished}</p>
    <p><strong>Key Learnings:</strong> ${learned}</p>
    <small>Logged on: ${date}</small>
  `;

  if (timelineContainer) {
    timelineContainer.insertBefore(newLogItem, timelineContainer.firstChild);
  }
}

// Load existing reports dynamically from Supabase on launch
async function loadWeeklyReports() {
  if (!timelineContainer) return;
  timelineContainer.innerHTML = ''; // clear loading state
  
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
loadWeeklyReports();

// Handle data creation pipelines to cloud row insertion
if (reportForm) {
  reportForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const weekVal = document.getElementById('report-week').value;
    const dateVal = document.getElementById('report-date').value;
    const accomplishedVal = document.getElementById('report-accomplished').value;
    const learnedVal = document.getElementById('report-learned').value;

    // Send data to Supabase database table
    const { data, error } = await supabaseClient
      .from('weekly_reports')
      .insert([
        { week_number: weekVal, upload_date: dateVal, accomplished: accomplishedVal, learned: learnedVal }
      ])
      .select();

    if (error) {
      alert("Database error: " + error.message);
      return;
    }

    // Append visually to UI immediately using the created record ID
    if (data && data[0]) {
      displayReportCard(data[0].id, weekVal, dateVal, accomplishedVal, learnedVal);
    }

    reportModal.classList.remove('open');
    reportForm.reset();
  });
}

// Event delegation to catch clicks on delete button and remove rows from Supabase
if (timelineContainer) {
  timelineContainer.addEventListener('click', async function(e) {
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      const logItem = deleteBtn.closest('.log-item');
      const reportId = logItem.getAttribute('data-id');
      
      if (logItem && confirm('Are you sure you want to delete this weekly report permanently from the database?')) {
        const { error } = await supabaseClient
          .from('weekly_reports')
          .delete()
          .eq('id', reportId);

        if (error) {
          alert("Error deleting report: " + error.message);
        } else {
          logItem.remove();
        }
      }
    }
  });
}

/* ==========================================================================
   3. Document Vault: Cloud Bucket Storage & Metadata Interconnection
   ========================================================================== */
const fileInput = document.getElementById('file-input');
const fileNamePreview = document.getElementById('file-name-preview');
const docTitleInput = document.getElementById('doc-title-input');
const docDateInput = document.getElementById('doc-date-input');
const docPrivacyInput = document.getElementById('doc-privacy-input');
const uploadForm = document.getElementById('document-upload-form');
const documentShelf = document.getElementById('document-shelf');

// Auto-populate form inputs once file is staged inside the dropzone
if (fileInput) {
  fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      fileNamePreview.textContent = `Selected: ${this.files[0].name}`;
      
      if (!docTitleInput.value) {
        docTitleInput.value = this.files[0].name.split('.')[0];
      }
      
      if (!docDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        docDateInput.value = today;
      }
    } else {
      fileNamePreview.textContent = "No file selected";
    }
  });
}

// Function to render a document card UI object onto the dashboard view
function displayDocumentCard(id, title, date, privacy, fileUrl) {
  const newCard = document.createElement('div');
  newCard.classList.add('doc-card', `privacy-${privacy}`);
  newCard.setAttribute('data-id', id);

  const isPdf = fileUrl.toLowerCase().includes('.pdf') || title.toLowerCase().includes('pdf');
  const iconClass = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-image';
  
  const badgeClass = privacy === 'confidential' ? 'badge-confidential' : 'badge-public';
  const badgeLabel = privacy === 'confidential' ? 'Confidential' : 'Public';

  newCard.innerHTML = `
    <div class="doc-icon"><i class="${iconClass}"></i></div>
    <div class="doc-info">
      <div class="doc-title-row">
        <h4>${title}</h4>
        <button class="btn-doc-delete" title="Delete Document"><i class="fa-solid fa-trash-can"></i></button>
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

// Load documents from database table on launch
async function loadDocuments() {
  if (!documentShelf) return;
  documentShelf.innerHTML = '';
  
  const { data: docs, error } = await supabaseClient
    .from('documents')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error("Error loading documents:", error.message);
    return;
  }

  docs.forEach(doc => {
    displayDocumentCard(doc.id, doc.title, doc.upload_date, doc.privacy, doc.file_url);
  });
}
loadDocuments();

// Handle direct binary image/PDF uploads up to Supabase Cloud Storage
if (uploadForm) {
  uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const selectedFile = fileInput.files[0];
    const customTitle = docTitleInput.value;
    const selectedDate = docDateInput.value;
    const privacySetting = docPrivacyInput.value;

    if (!selectedFile) return;

    // Generate unique file path string name to avoid overrides
    const fileExtension = selectedFile.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    // 1. Upload the raw binary file directly into the storage bucket
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .from('portfolio_docs')
      .upload(uniqueFileName, selectedFile);

    if (storageError) {
      alert("Storage Upload Failed: " + storageError.message);
      return;
    }

    // 2. Resolve public URL for tracking
    const { data: urlData } = supabaseClient
      .storage
      .from('portfolio_docs')
      .getPublicUrl(uniqueFileName);

    const publicFileUrl = urlData.publicUrl;

    // 3. Create tracking metadata index row in documents table
    const { data: dbData, error: dbError } = await supabaseClient
      .from('documents')
      .insert([
        { title: customTitle, upload_date: selectedDate, privacy: privacySetting, file_url: publicFileUrl }
      ])
      .select();

    if (dbError) {
      alert("Metadata Registration Failed: " + dbError.message);
      return;
    }

    // Render directly on dashboard view shelf layout instantly
    if (dbData && dbData[0]) {
      displayDocumentCard(dbData[0].id, customTitle, selectedDate, privacySetting, publicFileUrl);
    }

    uploadForm.reset();
    fileNamePreview.textContent = "No file selected";

    alert('Document uploaded and saved successfully to cloud!');
    const seeDocsTabLink = document.querySelector('a[href="#see-documents"]');
    if (seeDocsTabLink) seeDocsTabLink.click();
  });
}

// Delete tracking indices and cleanup files
if (documentShelf) {
  documentShelf.addEventListener('click', async function(e) {
    const deleteBtn = e.target.closest('.btn-doc-delete');
    if (deleteBtn) {
      const docCard = deleteBtn.closest('.doc-card');
      const docId = docCard.getAttribute('data-id');
      
      if (docCard && confirm('Are you sure you want to delete this file from your shelf?')) {
        const { error } = await supabaseClient
          .from('documents')
          .delete()
          .eq('id', docId);

        if (error) {
          alert("Error removing document: " + error.message);
        } else {
          docCard.remove();
        }
      }
    }
  });
}