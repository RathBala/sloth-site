;(() => {
  const branchGroups = Array.from(
    document.querySelectorAll('[data-archetype-branch-group]')
  )
  const revealTriggers = Array.from(
    document.querySelectorAll('[data-archetype-reveal]')
  )
  const archetypeContent = document.querySelector('[data-archetype-content]')
  const archetypeTriggers = Array.from(
    document.querySelectorAll(
      '[data-archetype-trigger], [data-couple-archetype-trigger]'
    )
  )

  if (branchGroups.length === 0) {
    return
  }

  const archetypeFlow = branchGroups[0].closest('.sloth-archetype-flow')
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
  const defaultBranchGroup = 'couple'
  let lockPositionFrame = 0

  const getArchetype = (trigger) =>
    trigger.dataset.archetypeTrigger || trigger.dataset.coupleArchetypeTrigger

  const getBranchGrid = (branchGroup) =>
    branchGroup?.querySelector(
      '[data-archetype-branch-grid], [data-couple-branch-grid]'
    )

  const hasSelectedArchetype = () =>
    Boolean(archetypeContent?.dataset.currentArchetype)

  const getActiveBranchGroup = () =>
    branchGroups.find((branchGroup) =>
      branchGroup.classList.contains('is-active')
    )

  const getRevealedBranchGroup = () =>
    branchGroups.find((branchGroup) =>
      branchGroup.classList.contains('is-revealed')
    )

  const getCurrentChoiceBoundary = () =>
    getRevealedBranchGroup() ?? archetypeFlow

  const updateLockedPreview = () => {
    if (!archetypeLock || !archetypeLockCopy) {
      return
    }

    if (hasSelectedArchetype()) {
      archetypeLock.classList.remove('is-bottom-stuck')
      archetypeLock.setAttribute('hidden', '')
      return
    }

    const revealedBranchGroup = getRevealedBranchGroup()

    archetypeLockCopy.textContent =
      revealedBranchGroup?.dataset.archetypeBranchLockCopy ||
      'Pick Solo or Couple to unlock your plan.'
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

  const setActiveBranchGroup = (groupKey, { revealed = false } = {}) => {
    const nextGroupKey = groupKey || defaultBranchGroup

    if (archetypeFlow) {
      archetypeFlow.dataset.activeBranchGroup = nextGroupKey
      archetypeFlow.dataset.connectorState = revealed
        ? nextGroupKey
        : 'unselected'
    }

    branchGroups.forEach((branchGroup) => {
      const isActive = branchGroup.dataset.archetypeBranchGroup === nextGroupKey
      const isRevealed = isActive && revealed

      branchGroup.classList.toggle('is-active', isActive)
      branchGroup.classList.toggle('is-revealed', isRevealed)

      if (isRevealed) {
        getBranchGrid(branchGroup)?.removeAttribute('inert')
      } else {
        getBranchGrid(branchGroup)?.setAttribute('inert', '')
      }
    })
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
    setActiveBranchGroup(defaultBranchGroup)
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
      (trigger) => getArchetype(trigger) === archetype
    )
      ? archetype
      : ''
  }

  const getBranchGroupForArchetype = (archetype) => {
    const trigger = archetypeTriggers.find(
      (candidate) => getArchetype(candidate) === archetype
    )

    return trigger?.closest('[data-archetype-branch-group]')
  }

  const showArchetypeContent = (
    archetype,
    { scroll = true, updateHistory = false } = {}
  ) => {
    if (!archetypeContent || !archetype) {
      return
    }

    const branchGroup = getBranchGroupForArchetype(archetype)
    setActiveBranchGroup(branchGroup?.dataset.archetypeBranchGroup, {
      revealed: true,
    })
    archetypeContent.classList.remove('is-preview')
    archetypeContent.classList.add('is-revealed')
    setResultSectionsLocked(false)
    archetypeContent.dataset.currentArchetype = archetype
    updateArchetypeCopy(archetype)
    updateLockedPreview()

    archetypeTriggers.forEach((trigger) => {
      const isCurrent = getArchetype(trigger) === archetype
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

    const targetBranchGroup = branchGroups.find(
      (branchGroup) => window.location.hash === `#${branchGroup.id}`
    )

    if (targetBranchGroup) {
      setActiveBranchGroup(targetBranchGroup.dataset.archetypeBranchGroup, {
        revealed: true,
      })
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
    const branchGroup = event.currentTarget.dataset.archetypeReveal
    const branchGroupElement = branchGroups.find(
      (candidate) => candidate.dataset.archetypeBranchGroup === branchGroup
    )

    setActiveBranchGroup(branchGroup, { revealed: true })
    previewArchetypeContent()

    if (
      branchGroupElement?.id &&
      window.location.hash !== `#${branchGroupElement.id}`
    ) {
      window.history.pushState(null, '', `#${branchGroupElement.id}`)
    }

    branchGroupElement?.scrollIntoView({
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

    const archetype = getArchetype(event.currentTarget)

    event.preventDefault()
    showArchetypeContent(archetype, {
      scroll: true,
      updateHistory: true,
    })
  }

  const scrollToActiveChoice = () => {
    const target = getRevealedBranchGroup() ?? archetypeFlow

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  revealTriggers.forEach((trigger) => {
    trigger.addEventListener('click', revealAndScrollBranches)
  })
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
