const sharedFooterMounts = document.querySelectorAll('[data-shared-footer]')

const sharedFooterHtml = `
  <footer id="site-footer" class="bg-white border-t border-gray-100">
    <div class="max-w-[115rem] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-8">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3">
          <img
            class="h-7 w-auto"
            src="/assets/images/sloth%20logo%20black.png"
            style="filter: brightness(0) saturate(100%)"
            alt="Sloth Money"
          />
          <span class="text-sm font-medium tracking-wide text-gray-500">Embrace financial peace of mind.</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium tracking-wide text-gray-400">
          <a
            href="/developers/"
            class="text-gray-400 hover:text-green transition-colors duration-200"
          >Developers</a>
          <a
            href="/privacy/"
            class="text-gray-400 hover:text-green transition-colors duration-200"
          >Privacy</a>
          <span>&copy; <span data-footer-year></span> Sloth Money</span>
          <a
            href="https://www.instagram.com/slothmoneyapp"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-green transition-colors duration-200"
            aria-label="Instagram"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
`

for (const mount of sharedFooterMounts) {
  mount.outerHTML = sharedFooterHtml
}

for (const yearElement of document.querySelectorAll('[data-footer-year]')) {
  yearElement.textContent = new Date().getFullYear()
}

if (window.location.hash === '#site-footer') {
  document.getElementById('site-footer')?.scrollIntoView()
}
