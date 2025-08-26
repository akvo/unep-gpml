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

  const processVideoShortcodes = (content) => {
    return content.replace(
      /\[SECTION type="(.*?)" title="(.*?)" description="(.*?)"\]([\s\S]*?)\[\/SECTION\]/g,
      (match, type, title, description, innerContent) => {
        const cleanInner = innerContent
          .replace(/<p>/g, '')
          .replace(/<\/p>/g, '\n')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<span>/g, '')
          .replace(/<\/span>/g, '')
          .replace(/&amp;/g, '&')

        if (type === 'video-row') {
          const videos = []
          const videoRegex = /\[VIDEO title="(.*?)" url="(.*?)"\]/g
          let videoMatch
          while ((videoMatch = videoRegex.exec(cleanInner))) {
            videos.push({ title: videoMatch[1], url: videoMatch[2] })
          }

          const videoCards = videos
            .map((v) => {
              const videoId = v.url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
              )?.[1]

              if (!videoId) {
                return `<div class="${styles.videoCard}">
                        <h4>${v.title}</h4>
                        <div class="${styles.videoWrapper}">
                          <p>Invalid video URL</p>
                        </div>
                      </div>`
              }

              return `
              <div class="${styles.videoCard}">
                <h4>${v.title}</h4>
                <div class="${styles.videoWrapper}">
                  <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen="true">
                  </iframe>
                </div>
              </div>
            `
            })
            .join('')

          return `
          <div class="${styles.videoSection}">
            <h2>${title}</h2>
            <p>${description}</p>
            <div class="${styles.videoRow}">
              ${videoCards}
            </div>
          </div>
        `
        }

        if (type === 'video-links') {
          const videoMatch = innerContent.match(
            /\[VIDEO title="(.*?)" url="(.*?)"\]/
          )
          const video = videoMatch
            ? { title: videoMatch[1], url: videoMatch[2] }
            : null

          const links = []
          const linkRegex = /\[LINK text="(.*?)" url="(.*?)"\]/g
          let linkMatch
          while ((linkMatch = linkRegex.exec(innerContent))) {
            links.push({ text: linkMatch[1], url: linkMatch[2] })
          }

          const videoId = video?.url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
          )?.[1]

          return `
          <div class="${styles.videoLinksSection}">
            <h2>${title}</h2>
            <p>${description}</p>
            <div class="${styles.videoLinksGrid}">
              <div class="${styles.videoColumn}">
                <h4>${video?.title}</h4>
                <div class="${styles.videoWrapper}">
                  <iframe src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allowfullscreen></iframe>
                </div>
              </div>
              <div class="${styles.linksColumn}">
                ${links
                  .map(
                    (link) => `
                  <a href="${link.url}" target="_blank" class="${styles.dataLink}">
                    ${link.text}
                  </a>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `
        }

        return match
      }
    )
  }

  let processedContent = content
  processedContent = processVideoShortcodes(processedContent)
  if (allowSlides) {
    processedContent = processedContent.replace(
      /\[SLIDES:(.*?)\]/g,
      (match, url) => {
        const id = url.match(/\/d\/(.*?)(\/|$)/)?.[1]
        if (!id) return ''
        return `<div class="slides-wrapper">
          <iframe src="https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000" 
            frameborder="0" width="960" height="569" 
            allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true">
          </iframe>
        </div>`
      }
    )
  }

  const sections = processedContent.split(
    /(<div class="[^"]*videoSection[^"]*">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>|<div class="[^"]*videoLinksSection[^"]*">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/
  )

  const sanitizedHtml = sections
    .map((section) => {
      if (
        section.includes('videoSection') ||
        section.includes('videoLinksSection')
      ) {
        return section
      } else {
        return DOMPurify.sanitize(section, defaultConfig)
      }
    })
    .join('')

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
