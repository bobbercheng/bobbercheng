// Shared navigation: reveal the on-page navigator once the first screen scrolls
// away, mark the section in view, and keep that link visible on narrow screens.
(function () {
    const header = document.querySelector('.site-header');
    const list = document.querySelector('.page-nav-links');
    if (!header || !list) return;

    const links = Array.from(list.querySelectorAll('a[href^="#"]'));
    // Firefox makes scrollable lists their own Tab stop; the links inside are enough.
    list.tabIndex = -1;
    const targets = links.map(link => document.getElementById(link.hash.slice(1)));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = null;
    let queued = false;

    function setCurrent(link) {
        if (link === current) return;
        if (current) current.removeAttribute('aria-current');
        current = link;
        if (!link) return;
        link.setAttribute('aria-current', 'location');

        const left = link.offsetLeft;
        const right = left + link.offsetWidth;
        if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
            list.scrollTo({ left: left - 24, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    }

    function update() {
        queued = false;
        header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.4);

        // A section is current once its top reaches the line where anchor jumps land.
        const line = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 8;
        let active = null;
        targets.forEach((target, i) => {
            if (target && target.getBoundingClientRect().top <= line) active = links[i];
        });

        // Short final sections never reach the line. At the bottom of the page, prefer
        // the section the visitor jumped to, otherwise the last section in view.
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) {
            const jumped = location.hash && document.getElementById(location.hash.slice(1));
            const inView = targets.filter(target => {
                const top = target ? target.getBoundingClientRect().top : -1;
                return top >= 0 && top < window.innerHeight;
            });
            const pick = inView.find(target => jumped && target.contains(jumped)) || inView[inView.length - 1];
            if (pick) active = links[targets.indexOf(pick)];
        }
        setCurrent(active);
    }

    function queue() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('hashchange', queue);
    window.addEventListener('load', queue);
    update();
})();
