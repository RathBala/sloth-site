;(() => {
  const coupleBranches = document.getElementById('couple-archetypes')
  const coupleReveal = document.querySelector(
    '[data-archetype-reveal="couple"]'
  )
  const archetypeContent = document.querySelector('[data-archetype-content]')
  const archetypeTriggers = Array.from(
    document.querySelectorAll('[data-couple-archetype-trigger]')
  )

  if (!coupleBranches) {
    return
  }

  const branchGrid = coupleBranches.querySelector('[data-couple-branch-grid]')

  const revealBranches = () => {
    coupleBranches.classList.add('is-revealed')
    branchGrid?.removeAttribute('inert')
  }

  const previewArchetypeContent = () => {
    if (!archetypeContent) {
      return
    }

    archetypeContent.classList.remove('is-revealed')
    archetypeContent.classList.add('is-preview')
    archetypeContent.removeAttribute('data-current-archetype')

    archetypeTriggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false')
      trigger.removeAttribute('aria-current')
    })
  }

  const lockBranches = () => {
    coupleBranches.classList.remove('is-revealed')
    branchGrid?.setAttribute('inert', '')
    previewArchetypeContent()
  }

  const getArchetypeFromHash = () => {
    const hash = window.location.hash.replace(/^#/, '')
    const suffix = '-content'

    if (!hash.endsWith(suffix)) {
      return ''
    }

    const archetype = hash.slice(0, -suffix.length)

    return archetypeTriggers.some(
      (trigger) => trigger.dataset.coupleArchetypeTrigger === archetype
    )
      ? archetype
      : ''
  }

  const showArchetypeContent = (
    archetype,
    { scroll = true, updateHistory = false } = {}
  ) => {
    if (!archetypeContent || !archetype) {
      return
    }

    revealBranches()
    archetypeContent.classList.remove('is-preview')
    archetypeContent.classList.add('is-revealed')
    archetypeContent.dataset.currentArchetype = archetype

    archetypeTriggers.forEach((trigger) => {
      const isCurrent = trigger.dataset.coupleArchetypeTrigger === archetype
      trigger.setAttribute('aria-expanded', String(isCurrent))

      if (isCurrent) {
        trigger.setAttribute('aria-current', 'true')
      } else {
        trigger.removeAttribute('aria-current')
      }
    })

    const nextHash = `#${archetype}-content`

    if (updateHistory && window.location.hash !== nextHash) {
      window.history.pushState({ currentArchetype: archetype }, '', nextHash)
    }

    if (scroll) {
      archetypeContent.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const syncBranchesWithHash = () => {
    const archetype = getArchetypeFromHash()

    if (archetype) {
      showArchetypeContent(archetype, { scroll: false })
      return
    }

    if (window.location.hash === '#couple-archetypes') {
      revealBranches()
      previewArchetypeContent()
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
    previewArchetypeContent()

    if (window.location.hash !== '#couple-archetypes') {
      window.history.pushState(null, '', '#couple-archetypes')
    }

    coupleBranches.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const selectArchetype = (event) => {
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

    const archetype = event.currentTarget.dataset.coupleArchetypeTrigger

    event.preventDefault()
    showArchetypeContent(archetype, {
      scroll: true,
      updateHistory: true,
    })
  }

  coupleReveal?.addEventListener('click', revealAndScrollBranches)
  archetypeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', selectArchetype)
  })
  window.addEventListener('hashchange', syncBranchesWithHash)
  window.addEventListener('popstate', syncBranchesWithHash)
  syncBranchesWithHash()
})()
