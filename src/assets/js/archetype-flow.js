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

  coupleReveal?.addEventListener('click', revealBranches)
  window.addEventListener('hashchange', syncBranchesWithHash)
  syncBranchesWithHash()
})()
