const sidebarLinks = document.querySelectorAll('.sidebar a.nav-link');
const contentPages = document.querySelectorAll('.page');
const dropdownToggle = document.querySelector('.dropdown-toggle');

sidebarLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();

    // 1. Clear active highlights from ALL regular nav links
    sidebarLinks.forEach(item => item.classList.remove('active'));
    
    // 2. Remove active highlight from the parent Documents link too
    dropdownToggle.classList.remove('active');
    
    // 3. Highlight the specific link you just clicked
    this.classList.add('active');

    // 4. If this link is inside a dropdown sub-menu, keep the parent highlighted!
    if (this.closest('.submenu')) {
      dropdownToggle.classList.add('active');
    }

    // 5. Toggle the visible content sections on the right
    contentPages.forEach(page => page.classList.remove('active'));
    const targetPageId = this.getAttribute('href');
    const targetPage = document.querySelector(targetPageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
  });
});