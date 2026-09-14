/* ==========================================================================
   1. Global State & Admin Authentication Framework
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    let isAdmin = localStorage.getItem('ojt_admin_access') === 'true';

    // UI Admin Control Elements
    const adminStatusBadge = document.getElementById('admin-status-badge');
    const loginBox = document.getElementById('login-box');
    const logoutBox = document.getElementById('logout-box');
    const unlockBtn = document.getElementById('btn-unlock-access');
    const lockBtn = document.getElementById('btn-lock-access');
    const passwordInput = document.getElementById('admin-password-input');
    const authMessage = document.getElementById('auth-message');
    const navAdminLink = document.getElementById('nav-admin-link');

    function updateAdminUI() {
        if (isAdmin) {
            document.body.classList.add('is-admin');
            if (adminStatusBadge) {
                adminStatusBadge.innerHTML = '<i class="fa-solid fa-user-shield"></i> Admin Unlocked';
                adminStatusBadge.style.background = '#28a745';
            }
            if (loginBox) loginBox.style.display = 'none';
            if (logoutBox) logoutBox.style.display = 'block';
            if (navAdminLink) navAdminLink.innerHTML = '<i class="fa-solid fa-user-check"></i> Admin Session';
        } else {
            document.body.classList.remove('is-admin');
            if (adminStatusBadge) {
                adminStatusBadge.innerHTML = '<i class="fa-solid fa-eye"></i> Guest Mode';
                adminStatusBadge.style.background = 'rgba(255, 255, 255, 0.15)';
            }
            if (loginBox) loginBox.style.display = 'block';
            if (logoutBox) logoutBox.style.display = 'none';
            if (navAdminLink) navAdminLink.innerHTML = '<i class="fa-solid fa-lock"></i> Admin Login';
        }
        renderReports();
        renderDocuments();
    }

    // Unlock Admin Access Handler
    unlockBtn?.addEventListener('click', () => {
        if (passwordInput.value === 'admin123') {
            isAdmin = true;
            localStorage.setItem('ojt_admin_access', 'true');
            authMessage.style.display = 'block';
            authMessage.style.color = '#28a745';
            authMessage.textContent = 'Access Granted! Full admin management controls activated.';
            passwordInput.value = '';
            updateAdminUI();
        } else {
            authMessage.style.display = 'block';
            authMessage.style.color = '#dc3545';
            authMessage.textContent = 'Invalid credentials. Please try again.';
        }
    });

    // Lock Admin Session Handler
    lockBtn?.addEventListener('click', () => {
        isAdmin = false;
        localStorage.setItem('ojt_admin_access', 'false');
        authMessage.style.display = 'none';
        updateAdminUI();
        navigateToSection('#home');
    });

    /* ==========================================================================
       2. Page Routing Navigation System
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    function navigateToSection(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        pages.forEach(page => page.classList.remove('active'));

        const activeLink = document.querySelector(`.nav-link[href="${targetId}"]`);
        if (activeLink) activeLink.classList.add('active');

        const targetPage = document.querySelector(targetId);
        if (targetPage) targetPage.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                navigateToSection(href);
            }
        });
    });

    /* ==========================================================================
       3. Full-Screen Image Lightbox Zoom Handler
       ========================================================================== */
    const zoomTrigger1 = document.getElementById('zoom-trigger-1');
    const zoomTrigger2 = document.getElementById('zoom-trigger-2');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('close-lightbox');

    function openZoomModal(imageSrc, captionText) {
        if (lightboxModal && lightboxImg && lightboxCaption) {
            lightboxImg.src = imageSrc;
            lightboxCaption.textContent = captionText;
            lightboxModal.classList.add('active');
        }
    }

    function closeZoomModal() {
        if (lightboxModal) {
            lightboxModal.classList.remove('active');
        }
    }

    // Click listener for Chart 1
    zoomTrigger1?.addEventListener('click', () => {
        openZoomModal('orgchart1.png', 'NTC NCR - Main Organizational Chart');
    });

    // Click listener for Chart 2
    zoomTrigger2?.addEventListener('click', () => {
        openZoomModal('orgchart2.png', 'NTC NCR - Support Staff Chart');
    });

    // Close button listener
    closeLightboxBtn?.addEventListener('click', closeZoomModal);

    // Close when clicking dark background outside the image
    lightboxModal?.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeZoomModal();
        }
    });

    // Close when pressing the 'Escape' key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
            closeZoomModal();
        }
    });

    /* ==========================================================================
       4. Weekly Reports Management (Add, Edit, Delete)
       ========================================================================== */
    const openReportModalBtn = document.getElementById('open-report-modal');
    const closeReportModalBtn = document.getElementById('close-report-modal');
    const reportModal = document.getElementById('report-modal');
    const reportForm = document.getElementById('report-form');
    const reportTimeline = document.getElementById('report-timeline');
    const reportModalTitle = document.getElementById('report-modal-title');
    const reportIdInput = document.getElementById('report-id-input');

    let reports = JSON.parse(localStorage.getItem('ojt_reports')) || [
        {
            id: 1,
            week: 'Week 1 Report',
            date: '2026-07-01',
            accomplished: 'Completed company onboarding, configured development environments, and established Git repository access trees.',
            learned: 'Mastered team version control workflows and brushed up on modular UI deployment guidelines.'
        }
    ];

    openReportModalBtn?.addEventListener('click', () => {
        reportForm.reset();
        reportIdInput.value = '';
        reportModalTitle.textContent = 'Log Weekly Progress';
        reportModal.classList.add('open');
    });

    closeReportModalBtn?.addEventListener('click', () => reportModal.classList.remove('open'));

    function renderReports() {
        if (!reportTimeline) return;
        reportTimeline.innerHTML = '';

        reports.forEach(report => {
            const item = document.createElement('div');
            item.className = 'log-item';
            item.innerHTML = `
                <div class="log-item-header">
                    <h3>${escapeHTML(report.week)}</h3>
                    ${isAdmin ? `
                        <div class="action-btn-group">
                            <button class="btn-action edit btn-edit-report" data-id="${report.id}" title="Edit Report">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn-action delete btn-delete-report" data-id="${report.id}" title="Delete Report">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <p><strong>Accomplished:</strong> ${escapeHTML(report.accomplished)}</p>
                <p><strong>Key Learnings:</strong> ${escapeHTML(report.learned)}</p>
                <small>Logged on: ${escapeHTML(report.date)}</small>
            `;
            reportTimeline.appendChild(item);
        });

        localStorage.setItem('ojt_reports', JSON.stringify(reports));
    }

    reportForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const idVal = reportIdInput.value;
        const weekVal = document.getElementById('report-week').value;
        const dateVal = document.getElementById('report-date').value;
        const accVal = document.getElementById('report-accomplished').value;
        const learnVal = document.getElementById('report-learned').value;

        if (idVal) {
            const index = reports.findIndex(r => r.id === Number(idVal));
            if (index !== -1) {
                reports[index] = { id: Number(idVal), week: weekVal, date: dateVal, accomplished: accVal, learned: learnVal };
            }
        } else {
            const newReport = { id: Date.now(), week: weekVal, date: dateVal, accomplished: accVal, learned: learnVal };
            reports.unshift(newReport);
        }

        renderReports();
        reportForm.reset();
        reportModal.classList.remove('open');
    });

    reportTimeline?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-report');
        const editBtn = e.target.closest('.btn-edit-report');

        if (deleteBtn && isAdmin) {
            const id = Number(deleteBtn.getAttribute('data-id'));
            reports = reports.filter(r => r.id !== id);
            renderReports();
        }

        if (editBtn && isAdmin) {
            const id = Number(editBtn.getAttribute('data-id'));
            const report = reports.find(r => r.id === id);
            if (report) {
                reportIdInput.value = report.id;
                document.getElementById('report-week').value = report.week;
                document.getElementById('report-date').value = report.date;
                document.getElementById('report-accomplished').value = report.accomplished;
                document.getElementById('report-learned').value = report.learned;
                
                reportModalTitle.textContent = 'Edit Weekly Report';
                reportModal.classList.add('open');
            }
        }
    });

    /* ==========================================================================
       5. Document Repository Shelf Controls
       ========================================================================== */
    const fileInput = document.getElementById('file-input');
    const fileNamePreview = document.getElementById('file-name-preview');
    const uploadForm = document.getElementById('document-upload-form');
    const documentShelf = document.getElementById('document-shelf');

    const docEditModal = document.getElementById('doc-edit-modal');
    const docEditForm = document.getElementById('doc-edit-form');
    const closeDocModalBtn = document.getElementById('close-doc-modal');

    let documents = JSON.parse(localStorage.getItem('ojt_documents')) || [
        {
            id: 101,
            title: 'OJT Endorsement Letter',
            date: '2026-07-10',
            fileUrl: '#'
        }
    ];

    fileInput?.addEventListener('change', () => {
        fileNamePreview.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file selected';
    });

    function renderDocuments() {
        if (!documentShelf) return;
        documentShelf.innerHTML = '';

        documents.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';
            card.innerHTML = `
                <div class="doc-icon">
                    <i class="fa-solid fa-file-shield"></i>
                </div>
                <div class="doc-info">
                    <div class="doc-title-row">
                        <h4>${escapeHTML(doc.title)}</h4>
                        ${isAdmin ? `
                            <div class="action-btn-group">
                                <button class="btn-action edit btn-edit-doc" data-id="${doc.id}" title="Edit Document Metadata">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button class="btn-action delete btn-delete-doc" data-id="${doc.id}" title="Delete Document">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="doc-meta-row">
                        <small>Uploaded: ${escapeHTML(doc.date)}</small>
                    </div>
                </div>
                <a href="${doc.fileUrl}" class="btn-view" target="_blank">View File</a>
            `;
            documentShelf.appendChild(card);
        });

        localStorage.setItem('ojt_documents', JSON.stringify(documents));
    }

    uploadForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const titleVal = document.getElementById('doc-title-input').value;
        const dateVal = document.getElementById('doc-date-input').value;
        const fileObj = fileInput.files[0];

        const newDoc = {
            id: Date.now(),
            title: titleVal,
            date: dateVal,
            fileUrl: fileObj ? URL.createObjectURL(fileObj) : '#'
        };

        documents.unshift(newDoc);
        renderDocuments();

        uploadForm.reset();
        fileNamePreview.textContent = 'No file selected';
        navigateToSection('#see-documents');
    });

    documentShelf?.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete-doc');
        const editBtn = e.target.closest('.btn-edit-doc');

        if (deleteBtn && isAdmin) {
            const id = Number(deleteBtn.getAttribute('data-id'));
            documents = documents.filter(d => d.id !== id);
            renderDocuments();
        }

        if (editBtn && isAdmin) {
            const id = Number(editBtn.getAttribute('data-id'));
            const doc = documents.find(d => d.id === id);
            if (doc) {
                document.getElementById('edit-doc-id').value = doc.id;
                document.getElementById('edit-doc-title').value = doc.title;
                document.getElementById('edit-doc-date').value = doc.date;
                docEditModal.classList.add('open');
            }
        }
    });

    docEditForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('edit-doc-id').value);
        const doc = documents.find(d => d.id === id);
        
        if (doc) {
            doc.title = document.getElementById('edit-doc-title').value;
            doc.date = document.getElementById('edit-doc-date').value;
            renderDocuments();
        }
        
        docEditModal.classList.remove('open');
    });

    closeDocModalBtn?.addEventListener('click', () => docEditModal.classList.remove('open'));

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

/* ==========================================================================
   6. Background Music Management (Autoplay @ 20% Volume)
   ========================================================================== */
const bgAudio = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
const musicIcon = document.getElementById('music-icon');
const volumeSlider = document.getElementById('music-volume-slider');
const volumePercentage = document.getElementById('volume-percentage');

if (bgAudio) {
    // 1. Force initial volume strictly to 20%
    bgAudio.volume = 0.2;
    bgAudio.loop = true;

    if (volumeSlider) volumeSlider.value = 0.2;
    if (volumePercentage) volumePercentage.textContent = '20%';

    let userMuted = false;

    function updateMusicUI(isPlaying) {
        if (!musicIcon || !musicToggleBtn) return;
        if (isPlaying) {
            musicIcon.className = 'fa-solid fa-music';
            musicToggleBtn.setAttribute('aria-label', 'Mute background music');
            musicToggleBtn.setAttribute('title', 'Mute background music');
            musicToggleBtn.classList.remove('muted');
        } else {
            musicIcon.className = 'fa-solid fa-volume-xmark';
            musicToggleBtn.setAttribute('aria-label', 'Unmute background music');
            musicToggleBtn.setAttribute('title', 'Unmute background music');
            musicToggleBtn.classList.add('muted');
        }
    }

    // 2. Attempt immediate audio playback on site load
    function attemptImmediatePlayback() {
        if (userMuted) return;

        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                updateMusicUI(true);
            }).catch(() => {
                // If browser blocks unmuted load autoplay, start instantly on first interaction
                updateMusicUI(false);
                bindFallbackInteraction();
            });
        }
    }

    // 3. Instant resume on first touch, click, scroll, or keypress if blocked on load
    function bindFallbackInteraction() {
        const startOnInteraction = () => {
            if (!userMuted && bgAudio.paused) {
                bgAudio.play().then(() => updateMusicUI(true)).catch(() => {});
            }
            ['pointerdown', 'click', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                document.removeEventListener(evt, startOnInteraction);
            });
        };

        ['pointerdown', 'click', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
            document.addEventListener(evt, startOnInteraction, { once: true, passive: true });
        });
    }

    // Execute playback attempt as soon as script runs
    attemptImmediatePlayback();

    // 4. Mute / Unmute Toggle Button (THE ONLY WAY TO STOP MUSIC)
    musicToggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (bgAudio.paused) {
            userMuted = false;
            if (bgAudio.volume === 0) {
                bgAudio.volume = 0.2;
                if (volumeSlider) volumeSlider.value = 0.2;
                if (volumePercentage) volumePercentage.textContent = '20%';
            }
            bgAudio.play().then(() => updateMusicUI(true)).catch(() => {});
        } else {
            userMuted = true; // Prevents any script or event from resuming music
            bgAudio.pause();
            updateMusicUI(false);
        }
    });

    // 5. Volume Slider Control
    volumeSlider?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        bgAudio.volume = val;
        
        if (volumePercentage) {
            volumePercentage.textContent = Math.round(val * 100) + '%';
        }

        if (val === 0) {
            userMuted = true;
            bgAudio.pause();
            updateMusicUI(false);
        } else {
            userMuted = false;
            if (bgAudio.paused) {
                bgAudio.play().then(() => updateMusicUI(true)).catch(() => {});
            }
        }
    });
}

    // Initialize UI and render views
    updateAdminUI();
});