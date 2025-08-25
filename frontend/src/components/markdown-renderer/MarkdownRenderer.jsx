import DOMPurify from 'isomorphic-dompurify'
import styles from './markdownRenderer.module.scss'

export const MarkdownRenderer = ({
  content,
  allowedTags,
  allowedAttributes,
  allowSlides = false,
}) => {
  if (!content) {
    return null
  }

  const baseTags = [
    'p',
    'br',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'hr',
    'img',
    'strong',
    'em',
    'del',
    'b',
    'i',
    'u',
    'span',
    'div',
  ]

  const tags = allowSlides ? [...baseTags, 'iframe'] : baseTags

  const baseAttrs = [
    'href',
    'target',
    'rel',
    'class',
    'id',
    'src',
    'alt',
    'width',
    'height',
    'style',
    'title',
  ]

  const attrs = allowSlides
    ? [
        ...baseAttrs,
        'frameborder',
        'allowfullscreen',
        'mozallowfullscreen',
        'webkitallowfullscreen',
      ]
    : baseAttrs

  const defaultConfig = {
    ALLOWED_TAGS: allowedTags || tags,
    ALLOWED_ATTR: allowedAttributes || attrs,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    ADD_TAGS: [],
    ADD_ATTR: ['target', 'rel'],
  }

  if (allowSlides) {
    defaultConfig.ALLOWED_URI_REGEXP = /^https:\/\/(docs\.google\.com\/presentation|drive\.google\.com)/
  }

  let processedContent = content
  if (allowSlides) {
    processedContent = content.replace(/\[SLIDES:(.*?)\]/g, (match, url) => {
      const id = url.match(/\/d\/(.*?)(\/|$)/)?.[1]
      if (!id) return ''
      return `<div class="slides-wrapper">
          <iframe src="https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000" 
            frameborder="0" width="960" height="569" 
            allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true">
          </iframe>
        </div>`
    })
  }

  const sanitizedHtml = DOMPurify.sanitize(processedContent, defaultConfig)

  const processHtml = (html) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const temp = doc.body

    const links = temp.querySelectorAll('a')
    links.forEach((link) => {
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
      link.classList.add(styles.link)
    })

    if (allowSlides) {
      const iframes = temp.querySelectorAll('iframe')
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src')
        if (src && src.includes('docs.google.com/presentation')) {
          iframe.classList.add(styles.slidesIframe)

          if (!iframe.parentElement?.classList.contains('slides-wrapper')) {
            const wrapper = doc.createElement('div')
            wrapper.className = styles.slidesContainer
            iframe.parentNode.insertBefore(wrapper, iframe)
            wrapper.appendChild(iframe)
          } else {
            iframe.parentElement.classList.add(styles.slidesContainer)
          }
        }
      })
    }

    const elements = {
      h1: styles.h1,
      h2: styles.h2,
      h3: styles.h3,
      h4: styles.h4,
      h5: styles.h5,
      h6: styles.h6,
      p: styles.paragraph,
      ul: styles.unorderedList,
      ol: styles.orderedList,
      li: styles.listItem,
      blockquote: styles.blockquote,
      code: styles.inlineCode,
      pre: styles.pre,
      table: styles.table,
      thead: styles.thead,
      tbody: styles.tbody,
      tr: styles.tr,
      th: styles.th,
      td: styles.td,
      hr: styles.hr,
      img: styles.image,
      strong: styles.strong,
      em: styles.emphasis,
      del: styles.strikethrough,
    }

    Object.entries(elements).forEach(([tagName, className]) => {
      const tagElements = temp.querySelectorAll(tagName)
      tagElements.forEach((el) => {
        if (tagName === 'code' && el.parentElement?.tagName === 'PRE') {
          el.classList.add(styles.codeBlock)
        } else {
          el.classList.add(className)
        }
      })
    })

    const tables = temp.querySelectorAll('table')
    tables.forEach((table) => {
      if (!table.parentElement?.classList.contains(styles.tableWrapper)) {
        const wrapper = doc.createElement('div')
        wrapper.className = styles.tableWrapper
        table.parentNode.insertBefore(wrapper, table)
        wrapper.appendChild(table)
      }
    })

    const images = temp.querySelectorAll('img')
    images.forEach((img) => {
      img.setAttribute('loading', 'lazy')
    })

    return temp.innerHTML
  }

  const finalHtml = processHtml(sanitizedHtml)

  return (
    <div
      className={styles.htmlContent}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  )
}
