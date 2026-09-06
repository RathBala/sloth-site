;(function () {
  const menuToggle = document.getElementById('mobile-menu-toggle')
  const mobileMenu = document.getElementById('mobile-menu')
  const openIcon = document.getElementById('mobile-menu-open-icon')
  const closeIcon = document.getElementById('mobile-menu-close-icon')
  const toolsMenus = [...document.querySelectorAll('[data-tools-menu]')]

  const closeToolsMenus = () => {
    toolsMenus.forEach((menu) => menu.removeAttribute('open'))
  }

  document.addEventListener('click', (event) => {
    toolsMenus.forEach((menu) => {
      if (menu.open && !menu.contains(event.target)) {
        menu.removeAttribute('open')
      }
    })
  })

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return

    const openMenu = toolsMenus.find((menu) => menu.open)
    if (!openMenu) return

    closeToolsMenus()
    openMenu.querySelector('summary')?.focus()
  })

  if (!menuToggle || !mobileMenu || !openIcon || !closeIcon) return

  const setMenuState = (isOpen) => {
    mobileMenu.classList.toggle('hidden', !isOpen)
    menuToggle.setAttribute('aria-expanded', isOpen)
    openIcon.classList.toggle('hidden', isOpen)
    closeIcon.classList.toggle('hidden', !isOpen)
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('hidden')
    setMenuState(isOpen)
  })
})()
