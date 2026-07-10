import { useState, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'

const SparkleNavbar = ({ items, rightItems = [], color = '#00fffc', onNavigate, activeIndex: propActiveIndex }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [rightActiveIndex, setRightActiveIndex] = useState(0)
  const navRef = useRef(null)
  const activeElementRef = useRef(null)
  const rightActiveElementRef = useRef(null)
  const buttonRefs = useRef([])
  const rightButtonRefs = useRef([])

  const createSVG = (element) => {
    element.innerHTML = `
    <svg viewBox="0 0 116 5" preserveAspectRatio="none" class="beam">
      <path d="M0.5 2.5L113 0.534929C114.099 0.515738 115 1.40113 115 2.5C115 3.59887 114.099 4.48426 113 4.46507L0.5 2.5Z" fill="url(#gradient-beam)"/>
      <defs>
        <linearGradient id="gradient-beam" x1="2" y1="2.5" x2="115" y2="2.5" gradientUnits="userSpaceOnUse">
          <stop stop-color="${color}"/>
          <stop offset="1" stop-color="white"/>
        </linearGradient>
      </defs>
    </svg>
    <div class="strike">
      <svg viewBox="0 0 114 12" preserveAspectRatio="none">
        <g fill="none" stroke="white" stroke-width="0.75" stroke-linecap="round">
          <path d="M113.5 6.5L109.068 8.9621C109.023 8.98721 108.974 9.00516 108.923 9.01531L106.889 9.42219C106.661 9.46776 106.432 9.35034 106.336 9.1388L104.045 4.0986C104.015 4.03362 104 3.96307 104 3.8917V2.12268C104 1.6898 103.487 1.46145 103.166 1.75103L99.2887 5.24019C99.1188 5.39305 98.867 5.41132 98.6768 5.28457L95.0699 2.87996C94.7881 2.69205 94.4049 2.83291 94.3118 3.15862L92.6148 9.09827C92.5483 9.33084 92.3249 9.48249 92.0843 9.45843L87.7087 9.02087C87.5752 9.00752 87.4419 9.04839 87.3389 9.13428L84.9485 11.1263C84.7128 11.3227 84.3575 11.2625 84.1996 10.9994L81.7602 6.93359C81.617 6.69492 81.3064 6.61913 81.0694 6.76501L75.3165 10.3052C75.1286 10.4209 74.8871 10.3997 74.7223 10.2531L70.6678 6.64917C70.5611 6.55429 70.5 6.41829 70.5 6.27547V1.20711C70.5 1.0745 70.4473 0.947322 70.3536 0.853553L70.2185 0.718508C70.0846 0.584592 69.8865 0.537831 69.7068 0.59772L69.2675 0.744166C68.9149 0.861705 68.8092 1.30924 69.0721 1.57206L69.605 2.10499C69.8157 2.31571 69.7965 2.66281 69.5638 2.84897L67.5 4.5L65.2715 6.28282C65.1083 6.41338 64.8811 6.42866 64.7019 6.32113L60.3621 3.71725C60.153 3.59179 59.8839 3.63546 59.7252 3.8206L57.0401 6.95327C57.0135 6.9843 56.9908 7.01849 56.9725 7.05505L55.2533 10.4934C55.1188 10.7624 54.779 10.8526 54.5287 10.6858L50.7686 8.17907C50.6051 8.07006 50.3929 8.06694 50.2263 8.17109L46.7094 10.3691C46.5774 10.4516 46.4145 10.468 46.2688 10.4133L42.6586 9.05949C42.5558 9.02091 42.4684 8.94951 42.4102 8.85633L40.1248 5.1997C40.0458 5.07323 40.0273 4.91808 40.0745 4.77659L40.6374 3.08777C40.7755 2.67359 40.3536 2.29381 39.9562 2.47447L35.5 4.5L32.2657 5.88613C32.1013 5.95658 31.9118 5.93386 31.7687 5.82656L30.1904 4.64279C30.0699 4.55245 29.9152 4.5212 29.7691 4.55772L26.2009 5.44977C26.0723 5.48193 25.9617 5.56388 25.8934 5.67759L23.1949 10.1752C23.0796 10.3673 22.8507 10.4593 22.6346 10.4003L17.6887 9.05148C17.5674 9.01838 17.463 8.94076 17.3963 8.83409L15.3331 5.53299C15.1627 5.26032 14.7829 5.21707 14.5556 5.44443L12.1464 7.85355C12.0251 7.96724 11.8551 8.02442 11.6865 8.00523L8.12434 7.57578C8.01763 7.56142 7.91931 7.51015 7.85256 7.43413L4.96721 4.98866C4.74668 4.82194 4.42002 4.83918 4.23175 5.04691L2.52849 6.89467C2.28544 7.16062 2.34262 7.57487 2.64578 7.72873L4.99172 8.66391C5.31158 8.823 5.29816 9.23836 4.96997 9.38298L2.51148 10.4776C2.27987 10.6444 2.38442 10.9541 2.66955 11.0284L4.12227 11.3248C4.4783 11.4187 4.83739 11.3775 5.15 11.21L7.16279 10.3138C7.41771 10.1866 7.68504 10.2845 7.80377 10.52L11.4133 17.9906C11.57 18.3141 11.8683 18.5369 12.1951 18.5578L14.7489 18.6863C15.2047 18.7131 15.6414 18.4737 15.787 18.05L18.5072 10.3872C18.6893 9.83016 19.1693 9.50353 19.68 9.61799L22.9063 10.217C23.2897 10.3037 23.6893 10.2168 23.9456 9.96164L25.9947 7.924C26.2614 7.65879 26.6897 7.6646 26.9477 7.93812L30.2454 11.2664C30.3774 11.4372 30.5606 11.5406 30.7568 11.5529L32.4999 11.6377C32.7582 11.6527 32.9897 11.5658 33.125 11.4187L36.88 7.65209C37.0779 7.44726 37.072 7.13287 36.863 6.935L35.5 5.5L34.055 4.12962C33.9213 3.99563 33.8696 3.80193 33.9323 3.63344L34.9041 1.69678C34.9866 1.47758 35.2074 1.36082 35.4318 1.42646L38.3465 2.44381C38.553 2.50523 38.5916 2.75358 38.4176 2.88942L36.5 4.5L34.89 6.07782C34.8191 6.17086 34.8673 6.29165 34.9699 6.29319L40.7026 6.33609C40.8733 6.33804 40.9691 6.49111 40.8974 6.61685L38.5 9.0L37.35 10.0778C37.2931 10.1294 37.347 10.2001 37.4275 10.1849L39.971 9.64744C40.112 9.62226 40.2681 9.64464 40.3728 9.71873L42.62 11.2859C42.6741 11.3334 42.7443 11.3562 42.8149 11.3503L44.53 11.2065C44.9304 11.1628 45.2785 10.8989 45.3311 10.5L46.4 7.5L45.72 4.54217C45.6829 4.37502 45.7506 4.21092 45.8837 4.10462L47.3458 2.97236C47.4292 2.89714 47.5512 2.89714 47.6346 2.97236L49.2 4.5L51.1336 6.43C51.2551 6.55132 51.4384 6.59135 51.6072 6.54529L54.5 5.5L55.5287 4.4754C55.6287 4.38428 55.7713 4.38428 55.8713 4.4754L58.5 7.1L60.5787 9.0746C60.6787 9.16572 60.8213 9.16572 60.9213 9.0746L63.5 6.5L64.1069 5.8942C64.2069 5.7931 64.3731 5.7931 64.4731 5.8942L66.5 7.9L70.8931 12.2942C71 12.3907 71 12.5493 70.8931 12.6458L69.5 14L66.9856 16.5173C66.8373 16.6657 66.8882 16.8959 67.0911 17.0012L70.5 19L72.3695 20.8722C72.5178 21.0206 72.7849 21.0206 72.9332 20.8722L76.5 17.3L78.9144 14.8816C79.0627 14.7332 79.0627 14.5022 78.9144 14.3538L77.5 12.9289L78.2147 12.2142C78.363 12.0659 78.553 12.0659 78.7013 12.2142L81.5 15L83.2987 16.7858C83.447 17.0659 83.7141 17.0659 83.8624 16.7858L86.5 14L87.5 13L86.88 11.2147C86.772 11.0016 86.8773 10.7523 87.1057 10.6817L89.5 9.85735L88.8943 8.942C88.7436 8.66609 88.8391 8.33391 89.0906 8.17936L91.5 6.5L93.12 4.87868C93.2683 4.73033 93.2683 4.49967 93.12 4.35132L91.5 2.73"/>
</g>
    </svg>
    <svg viewBox="0 0 114 12" preserveAspectRatio="none">
      <g fill="none" stroke="white" stroke-width="0.75" stroke-linecap="round">
        <path d="M113.5 6.5L109.068 8.9621C109.023 8.98721 108.974 9.00516 108.923 9.01531L106.889 9.42219C106.661 9.46776 106.432 9.35034 106.336 9.1388L104.045 4.0986C104.015 4.03362 104 3.96307 104 3.8917V2.12268C104 1.6898 103.487 1.46145 103.166 1.75103L99.2887 5.24019C99.1188 5.39305 98.867 5.41132 98.6768 5.28457L95.0699 2.87996C94.7881 2.69205 94.4049 2.83291 94.3118 3.15862L92.6148 9.09827C92.5483 9.33084 92.3249 9.48249 92.0843 9.45843L87.7087 9.02087C87.5752 9.00752 87.4419 9.04839 87.3389 9.13428L84.9485 11.1263C84.7128 11.3227 84.3575 11.2625 84.1996 10.9994L81.7602 6.93359C81.617 6.69492 81.3064 6.61913 81.0694 6.76501L75.3165 10.3052C75.1286 10.4209 74.8871 10.3997 74.7223 10.2531L70.6678 6.64917C70.5611 6.55429 70.5 6.41829 70.5 6.27547V1.20711C70.5 1.0745 70.4473 0.947322 70.3536 0.853553L70.2185 0.718508C70.0846 0.584592 69.8865 0.537831 69.7068 0.59772L69.2675 0.744166C68.9149 0.861705 68.8092 1.30924 69.0721 1.57206L69.605 2.10499C69.8157 2.31571 69.7965 2.66281 69.5638 2.84897L67.5 4.5L65.2715 6.28282C65.1083 6.41338 64.8811 6.42866 64.7019 6.32113L60.3621 3.71725C60.153 3.59179 59.8839 3.63546 59.7252 3.8206L57.0401 6.95327C57.0135 6.9843 56.9908 7.01849 56.9725 7.05505L55.2533 10.4934C55.1188 10.7624 54.779 10.8526 54.5287 10.6858L50.7686 8.17907C50.6051 8.07006 50.3929 8.06694 50.2263 8.17109L46.7094 10.3691C46.5774 10.4516 46.4145 10.468 46.2688 10.4133L42.6586 9.05949C42.5558 9.02091 42.4684 8.94951 42.4102 8.85633L40.1248 5.1997C40.0458 5.07323 40.0273 4.91808 40.0745 4.77659L40.6374 3.08777C40.7755 2.67359 40.3536 2.29381 39.9562 2.47447L35.5 4.5L32.2657 5.88613C32.1013 5.95658 31.9118 5.93386 31.7687 5.82656L30.1904 4.64279C30.0699 4.55245 29.9152 4.5212 29.7691 4.55772L26.2009 5.44977C26.0723 5.48193 25.9617 5.56388 25.8934 5.67759L23.1949 10.1752C23.0796 10.3673 22.8507 10.4593 22.6346 10.4003L17.6887 9.05148C17.5674 9.01838 17.463 8.94076 17.3963 8.83409L15.3331 5.53299C15.1627 5.26032 14.7829 5.21707 14.5556 5.44443L12.1464 7.85355C12.0251 7.96724 11.8551 8.02442 11.6865 8.00523L8.12434 7.57578C8.01763 7.56142 7.91931 7.51015 7.85256 7.43413L4.96721 4.98866C4.74668 4.82194 4.42002 4.83918 4.23175 5.04691L2.52849 6.89467C2.28544 7.16062 2.34262 7.57487 2.64578 7.72873L4.99172 8.66391C5.31158 8.823 5.29816 9.23836 4.96997 9.38298L2.51148 10.4776C2.27987 10.6444 2.38442 10.9541 2.66955 11.0284L4.12227 11.3248C4.4783 11.4187 4.83739 11.3775 5.15 11.21L7.16279 10.3138C7.41771 10.1866 7.68504 10.2845 7.80377 10.52L11.4133 17.9906C11.57 18.3141 11.8683 18.5369 12.1951 18.5578L14.7489 18.6863C15.2047 18.7131 15.6414 18.4737 15.787 18.05L18.5072 10.3872C18.6893 9.83016 19.1693 9.50353 19.68 9.61799L22.9063 10.217C23.2897 10.3037 23.6893 10.2168 23.9456 9.96164L25.9947 7.924C26.2614 7.65879 26.6897 7.6646 26.9477 7.93812L30.2454 11.2664C30.3774 11.4372 30.5606 11.5406 30.7568 11.5529L32.4999 11.6377C32.7582 11.6527 32.9897 11.5658 33.125 11.4187L36.88 7.65209C37.0779 7.44726 37.072 7.13287 36.863 6.935L35.5 5.5L34.055 4.12962C33.9213 3.99563 33.8696 3.80193 33.9323 3.63344L34.9041 1.69678C34.9866 1.47758 35.2074 1.36082 35.4318 1.42646L38.3465 2.44381C38.553 2.50523 38.5916 2.75358 38.4176 2.88942L36.5 4.5L34.89 6.07782C34.8191 6.17086 34.8673 6.29165 34.9699 6.29319L40.7026 6.33609C40.8733 6.33804 40.9691 6.49111 40.8974 6.61685L38.5 9.0L37.35 10.0778C37.2931 10.1294 37.347 10.2001 37.4275 10.1849L39.971 9.64744C40.112 9.62226 40.2681 9.64464 40.3728 9.71873L42.62 11.2859C42.6741 11.3334 42.7443 11.3562 42.8149 11.3503L44.53 11.2065C44.9304 11.1628 45.2785 10.8989 45.3311 10.5L46.4 7.5L45.72 4.54217C45.6829 4.37502 45.7506 4.21092 45.8837 4.10462L47.3458 2.97236C47.4292 2.89714 47.5512 2.89714 47.6346 2.97236L49.2 4.5L51.1336 6.43C51.2551 6.55132 51.4384 6.59135 51.6072 6.54529L54.5 5.5L55.5287 4.4754C55.6287 4.38428 55.7713 4.38428 55.8713 4.4754L58.5 7.1L60.5787 9.0746C60.6787 9.16572 60.8213 9.16572 60.9213 9.0746L63.5 6.5L64.1069 5.8942C64.2069 5.7931 64.3731 5.7931 64.4731 5.8942L66.5 7.9L70.8931 12.2942C71 12.3907 71 12.5493 70.8931 12.6458L69.5 14L66.9856 16.5173C66.8373 16.6657 66.8882 16.8959 67.0911 17.0012L70.5 19L72.3695 20.8722C72.5178 21.0206 72.7849 21.0206 72.9332 20.8722L76.5 17.3L78.9144 14.8816C79.0627 14.7332 79.0627 14.5022 78.9144 14.3538L77.5 12.9289L78.2147 12.2142C78.363 12.0659 78.553 12.0659 78.7013 12.2142L81.5 15L83.2987 16.7858C83.447 17.0659 83.7141 17.0659 83.8624 16.7858L86.5 14L87.5 13L86.88 11.2147C86.772 11.0016 86.8773 10.7523 87.1057 10.6817L89.5 9.85735L88.8943 8.942C88.7436 8.66609 88.8391 8.33391 89.0906 8.17936L91.5 6.5L93.12 4.87868C93.2683 4.73033 93.2683 4.49967 93.12 4.35132L91.5 2.73"/>
      </g>
    </svg>
  </div>
    `
  }

  const getOffsetLeft = (element) => {
    if (!navRef.current || !activeElementRef.current) return 0
    const elementRect = element.getBoundingClientRect()
    const navRect = navRef.current.getBoundingClientRect()
    const activeElementWidth = activeElementRef.current.offsetWidth
    return (
      elementRect.left -
      navRect.left +
      (elementRect.width - activeElementWidth) / 2
    )
  }

  const getRightOffsetLeft = (element) => {
    if (!navRef.current || !rightActiveElementRef.current) return 0
    const elementRect = element.getBoundingClientRect()
    const navRect = navRef.current.getBoundingClientRect()
    const activeElementWidth = rightActiveElementRef.current.offsetWidth
    return (
      elementRect.left -
      navRect.left +
      (elementRect.width - activeElementWidth) / 2
    )
  }

  useLayoutEffect(() => {
    // Sync with prop activeIndex
    if (propActiveIndex !== undefined) {
      if (propActiveIndex < items.length) {
        setActiveIndex(propActiveIndex)
      } else {
        setRightActiveIndex(propActiveIndex - items.length)
      }
    }

    const activeButton = buttonRefs.current[activeIndex]
    if (navRef.current && activeElementRef.current && activeButton) {
      gsap.set(activeElementRef.current, {
        x: getOffsetLeft(activeButton),
      })
      gsap.to(activeElementRef.current, {
        '--active-element-show': '1',
        duration: 0.2,
      })
    }
    
    const rightActiveButton = rightButtonRefs.current[0]
    if (rightItems.length > 0 && rightActiveElementRef.current && rightActiveButton) {
      gsap.set(rightActiveElementRef.current, {
        x: getRightOffsetLeft(rightActiveButton),
        '--active-element-show': '1',
        duration: 0.2,
      })
    }
  }, [])

  const handleClick = (index) => {
    const navElement = navRef.current
    const activeElement = activeElementRef.current
    const oldButton = buttonRefs.current[activeIndex]
    const newButton = buttonRefs.current[index]

    if (index === activeIndex || !navElement || !activeElement || !oldButton || !newButton) return

    const x = getOffsetLeft(newButton)
    const direction = index > activeIndex ? 'after' : 'before'
    const spacing = Math.abs(x - getOffsetLeft(oldButton))

    navElement.classList.add(direction)

    gsap.set(activeElement, {
      rotateY: direction === 'before' ? '180deg' : '0deg',
    })

    gsap.to(activeElement, {
      keyframes: [
        {
          '--active-element-width': `${spacing > navElement.offsetWidth - 60 ? navElement.offsetWidth - 60 : spacing}px`,
          duration: 0.3,
          ease: 'none',
          onStart: () => {
            createSVG(activeElement)
            gsap.to(activeElement, {
              '--active-element-opacity': 1,
              duration: 0.1,
            })
          },
        },
        {
          '--active-element-scale-x': '0',
          '--active-element-scale-y': '.25',
          '--active-element-width': '0px',
          duration: 0.3,
          onStart: () => {
            gsap.to(activeElement, {
              '--active-element-mask-position': '40%',
              duration: 0.5,
            })
            gsap.to(activeElement, {
              '--active-element-opacity': 0,
              delay: 0.45,
              duration: 0.25,
            })
          },
          onComplete: () => {
            activeElement.innerHTML = ''
            navElement.classList.remove('before', 'after')
            gsap.set(activeElement, {
              x: getOffsetLeft(newButton),
              '--active-element-show': '1',
            })
            setActiveIndex(index)
            if (onNavigate) onNavigate(index)
          },
        },
      ],
    })

    gsap.to(activeElement, {
      x,
      '--active-element-strike-x': '-50%',
      duration: 0.6,
      ease: 'none',
    })
  }

  const handleRightClick = (index) => {
    if (index === rightActiveIndex) {
      if (onNavigate) onNavigate(items.length + index)
      return
    }
    
    const navElement = navRef.current
    const activeElement = rightActiveElementRef.current
    const oldButton = rightButtonRefs.current[rightActiveIndex] || rightButtonRefs.current[0]
    const newButton = rightButtonRefs.current[index]

    if (!navElement || !activeElement || !oldButton || !newButton) return

    const x = getRightOffsetLeft(newButton)
    const direction = index > rightActiveIndex ? 'after' : 'before'
    const spacing = Math.abs(x - getRightOffsetLeft(oldButton))

    navElement.classList.add(direction)

    gsap.set(activeElement, {
      rotateY: direction === 'before' ? '180deg' : '0deg',
    })

    gsap.to(activeElement, {
      keyframes: [
        {
          '--active-element-width': `${spacing > navElement.offsetWidth - 60 ? navElement.offsetWidth - 60 : spacing}px`,
          duration: 0.3,
          ease: 'none',
          onStart: () => {
            createSVG(activeElement)
            gsap.to(activeElement, {
              '--active-element-opacity': 1,
              duration: 0.1,
            })
          },
        },
        {
          '--active-element-scale-x': '0',
          '--active-element-scale-y': '.25',
          '--active-element-width': '0px',
          duration: 0.3,
          onStart: () => {
            gsap.to(activeElement, {
              '--active-element-mask-position': '40%',
              duration: 0.5,
            })
            gsap.to(activeElement, {
              '--active-element-opacity': 0,
              delay: 0.45,
              duration: 0.25,
            })
          },
          onComplete: () => {
            activeElement.innerHTML = ''
            navElement.classList.remove('before', 'after')
            gsap.set(activeElement, {
              x: getRightOffsetLeft(newButton),
              '--active-element-show': '1',
            })
            setRightActiveIndex(index)
            if (onNavigate) onNavigate(items.length + index)
          },
        },
      ],
    })

    gsap.to(activeElement, {
      x,
      '--active-element-strike-x': '-50%',
      duration: 0.6,
      ease: 'none',
    })
  }

  return (
    <>
      <style>{`
        .sparkle-nav {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
        }
        .sparkle-nav ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          gap: 32px;
        }
        .sparkle-nav ul li button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          border: none;
          cursor: pointer;
          background-color: transparent;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
          transition: color 0.25s;
          font-size: 0.95rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .sparkle-nav ul li:not(.active):hover button {
          text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        }
        .sparkle-nav .nav-right {
          display: flex;
          gap: 32px;
          margin-left: auto;
        }
        .sparkle-nav .active-element {
          --active-element-scale-x: 1;
          --active-element-scale-y: 1;
          --active-element-show: 0;
          --active-element-opacity: 0;
          --active-element-width: 0px;
          --active-element-strike-x: 0%;
          --active-element-mask-position: 0%;
          position: absolute;
          left: 0;
          top: 34px;
          height: 3px;
          width: 36px;
          border-radius: 2px;
          background-color: ${color};
          opacity: var(--active-element-show);
        }
        .sparkle-nav .active-element.top-right {
          top: 4px;
        }
        .sparkle-nav .active-element > svg,
        .sparkle-nav .active-element .strike {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          opacity: var(--active-element-opacity);
          width: var(--active-element-width);
          mix-blend-mode: multiply;
        }
        .sparkle-nav .active-element > svg {
          display: block;
          overflow: visible;
          height: 5px;
          filter: blur(0.5px) drop-shadow(2px 0px 8px ${color}40) drop-shadow(1px 0px 2px ${color}80) drop-shadow(0px 0px 3px ${color}40) drop-shadow(2px 0px 8px ${color}45) drop-shadow(8px 0px 16px ${color}50);
        }
        .sparkle-nav .active-element .strike {
          padding: 24px 0;
          -webkit-mask-image: linear-gradient(to right, transparent calc(0% + var(--active-element-mask-position)), black calc(15% + var(--active-element-mask-position)), black 80%, transparent);
          mask-image: linear-gradient(to right, transparent calc(0% + var(--active-element-mask-position)), black calc(15% + var(--active-element-mask-position)), black 80%, transparent);
        }
        .sparkle-nav .active-element .strike svg {
          display: block;
          overflow: visible;
          height: 12px;
          width: calc(var(--active-element-width) * 2);
          transform: translate(var(--active-element-strike-x), 30%) scale(var(--active-element-scale-x), var(--active-element-scale-y));
        }
        .sparkle-nav .active-element .strike svg:last-child {
          transform: translate(var(--active-element-strike-x), -30%) scale(-1);
        }
        .sparkle-nav .active-element .strike svg g path:nth-child(2) {
          filter: blur(2px);
        }
        .sparkle-nav .active-element .strike svg g path:nth-child(3) {
          filter: blur(4px);
        }
        .sparkle-nav.before .active-element {
          transform: rotateY(180deg);
        }
      `}</style>

      <nav className="sparkle-nav" ref={navRef}>
        <ul className="nav-left">
          {items.map((item, index) => (
            <li key={item} className={index === activeIndex ? 'active' : ''}>
              <button
                ref={(el) => { buttonRefs.current[index] = el }}
                onClick={() => handleClick(index)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
        {rightItems.length > 0 && (
          <ul className="nav-right">
            {rightItems.map((item, index) => (
              <li key={item} className={index === rightActiveIndex ? 'active' : ''}>
                <button
                  ref={(el) => { rightButtonRefs.current[index] = el }}
                  onClick={() => handleRightClick(index)}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="active-element" ref={activeElementRef} />
        {rightItems.length > 0 && (
          <div className="active-element top-right" ref={rightActiveElementRef} />
        )}
      </nav>
    </>
  )
}

export default SparkleNavbar