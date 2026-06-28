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

  const archetypeFlow = coupleBranches.closest('.sloth-archetype-flow')
  const branchGrid = coupleBranches.querySelector('[data-couple-branch-grid]')
  const archetypeLock = archetypeContent?.querySelector('[data-archetype-lock]')
  const archetypeLockCopy = archetypeLock?.querySelector(
    '[data-archetype-lock-copy]'
  )
  const archetypeLockAction = archetypeLock?.querySelector(
    '[data-archetype-lock-action]'
  )
  const archetypeSections = Array.from(
    archetypeContent?.querySelectorAll(':scope > section') ?? []
  )
  const archetypeCopyTargets = Array.from(
    archetypeContent?.querySelectorAll('[data-archetype-text]') ?? []
  )
  let lockPositionFrame = 0

  const hasSelectedArchetype = () =>
    Boolean(archetypeContent?.dataset.currentArchetype)

  const getCurrentChoiceBoundary = () =>
    coupleBranches.classList.contains('is-revealed')
      ? coupleBranches
      : archetypeFlow

  const updateLockedPreview = () => {
    if (!archetypeLock || !archetypeLockCopy) {
      return
    }

    if (hasSelectedArchetype()) {
      archetypeLock.classList.remove('is-bottom-stuck')
      archetypeLock.setAttribute('hidden', '')
      return
    }

    archetypeLockCopy.textContent = coupleBranches.classList.contains(
      'is-revealed'
    )
      ? 'Pick a couple dynamic to unlock your plan.'
      : 'Pick Solo or Couple to unlock your plan.'
    archetypeLock.removeAttribute('hidden')
    updateLockPosition()
  }

  const updateLockPosition = () => {
    if (!archetypeLock || hasSelectedArchetype()) {
      archetypeLock?.classList.remove('is-bottom-stuck')
      return
    }

    const choiceBoundary = getCurrentChoiceBoundary()

    if (!choiceBoundary || archetypeLock.hasAttribute('hidden')) {
      archetypeLock.classList.remove('is-bottom-stuck')
      return
    }

    const lockHeight = archetypeLock.offsetHeight
    const minimumGap = 16

    archetypeLock.classList.toggle(
      'is-bottom-stuck',
      choiceBoundary.getBoundingClientRect().bottom <=
        window.innerHeight - lockHeight - minimumGap
    )
  }

  const scheduleLockPositionUpdate = () => {
    if (lockPositionFrame) {
      return
    }

    lockPositionFrame = window.requestAnimationFrame(() => {
      lockPositionFrame = 0
      updateLockPosition()
    })
  }

  const updateArchetypeCopy = (archetype = '') => {
    archetypeCopyTargets.forEach((target) => {
      const nextCopy =
        (archetype && target.getAttribute(`data-archetype-${archetype}`)) ||
        target.getAttribute('data-archetype-default')

      if (nextCopy) {
        target.textContent = nextCopy
      }
    })
  }

  const revealBranches = () => {
    coupleBranches.classList.add('is-revealed')
    branchGrid?.removeAttribute('inert')
  }

  const setResultSectionsLocked = (isLocked) => {
    archetypeSections.forEach((section) => {
      if (isLocked) {
        section.setAttribute('inert', '')
      } else {
        section.removeAttribute('inert')
      }
    })
  }

  const previewArchetypeContent = () => {
    if (!archetypeContent) {
      return
    }

    archetypeContent.classList.remove('is-revealed')
    archetypeContent.classList.add('is-preview')
    archetypeContent.removeAttribute('data-current-archetype')
    updateArchetypeCopy()
    setResultSectionsLocked(true)
    updateLockedPreview()

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
    setResultSectionsLocked(false)
    archetypeContent.dataset.currentArchetype = archetype
    updateArchetypeCopy(archetype)
    updateLockedPreview()

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

  const scrollToActiveChoice = () => {
    const target = coupleBranches.classList.contains('is-revealed')
      ? coupleBranches
      : archetypeFlow

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  coupleReveal?.addEventListener('click', revealAndScrollBranches)
  archetypeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', selectArchetype)
  })
  archetypeLockAction?.addEventListener('click', scrollToActiveChoice)
  window.addEventListener('scroll', scheduleLockPositionUpdate, {
    passive: true,
  })
  window.addEventListener('resize', scheduleLockPositionUpdate)
  window.addEventListener('hashchange', syncBranchesWithHash)
  window.addEventListener('popstate', syncBranchesWithHash)
  syncBranchesWithHash()
})()
