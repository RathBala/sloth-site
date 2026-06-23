;(() => {
  const coupleBranches = document.getElementById('couple-archetypes')
  const coupleReveal = document.querySelector(
    '[data-archetype-reveal="couple"]'
  )

  if (!coupleBranches) {
    return
  }

  const branchGrid = coupleBranches.querySelector('[data-couple-branch-grid]')

  const revealBranches = () => {
    coupleBranches.classList.add('is-revealed')
    branchGrid?.removeAttribute('inert')
  }

  const lockBranches = () => {
    coupleBranches.classList.remove('is-revealed')
    branchGrid?.setAttribute('inert', '')
  }

  const syncBranchesWithHash = () => {
    if (window.location.hash === '#couple-archetypes') {
      revealBranches()
      return
    }

    lockBranches()
  }

  const revealAndScrollBranches = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    revealBranches()

    if (window.location.hash !== '#couple-archetypes') {
      window.history.pushState(null, '', '#couple-archetypes')
    }

    coupleBranches.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  coupleReveal?.addEventListener('click', revealAndScrollBranches)
  window.addEventListener('hashchange', syncBranchesWithHash)
  syncBranchesWithHash()
})()
