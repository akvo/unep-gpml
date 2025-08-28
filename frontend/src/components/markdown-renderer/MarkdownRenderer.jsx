import DOMPurify from 'isomorphic-dompurify'
import styles from './markdownRenderer.module.scss'

export const MarkdownRenderer = ({ content, allowSlides = false }) => {
  if (!content) {
    return null
  }

  let processedContent = content

  if (allowSlides) {
    processedContent = processedContent.replace(
      /\[SLIDES:(.*?)\]/g,
      (match, url) => {
        const id = url.match(/\/d\/(.*?)(\/|$)/)?.[1]
        if (!id) return ''
        return `<div class="${styles.slidesContainer}">
          <iframe 
            class="${styles.slidesIframe}"
            src="https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000" 
            frameborder="0" 
            allowfullscreen="true">
          </iframe>
        </div>`
      }
    )
  }

  const sanitizedHtml = DOMPurify.sanitize(processedContent, {
    ADD_TAGS: allowSlides ? ['iframe'] : [],
    ADD_ATTR: allowSlides ? ['frameborder', 'allowfullscreen'] : [],
    ALLOWED_URI_REGEXP: allowSlides
      ? /^https:\/\/docs\.google\.com\/presentation/
      : undefined,
  })

  return (
    <div
      className={styles.htmlContent}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
