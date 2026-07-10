// Get all the link options inside your sidebar list
const sidebarLinks = document.querySelectorAll('.sidebar a');
// Get all the content pages on the right
const contentPages = document.querySelectorAll('.page');

sidebarLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    // 1. Stop the page from jump-flickering
    e.preventDefault();

    // 2. Remove the active white bubble from the previous link
    sidebarLinks.forEach(item => item.classList.remove('active'));
    
    // 3. Add the active white bubble to the link you just clicked
    this.classList.add('active');

    // 4. Hide all content pages
    contentPages.forEach(page => page.classList.remove('active'));

    // 5. Read the href (#home, #cv, etc.) and show that specific page
    const targetPageId = this.getAttribute('href');
    const targetPage = document.querySelector(targetPageId);
    
    if (targetPage) {
      targetPage.classList.add('active');
    }
  });
});