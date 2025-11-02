class FpsTopbar extends HTMLElement {
    connectedCallback() {
        const currentPage = window.location.pathname.split('/').pop() || CONFIG.site.homepage;
        const isHomepage = currentPage === CONFIG.site.homepage || currentPage === '';
        
        const navLinks = CONFIG.nav.map(item => {
            const activeClass = item.href === currentPage ? 'active' : '';
            return `<a href="${item.href}" class="nav-link ${activeClass}">${item.label}</a>`;
        }).join('');
        
        const logoClass = isHomepage ? 'active' : '';
        
        this.innerHTML = `
            <nav class="topbar">
                <a href="${CONFIG.site.homepage}" class="logo ${logoClass}">${CONFIG.site.name}</a>
                <div class="nav">${navLinks}</div>
            </nav>
        `;
    }
}

customElements.define('fps-topbar', FpsTopbar);