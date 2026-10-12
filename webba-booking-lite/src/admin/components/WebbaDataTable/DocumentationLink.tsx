import { ReactComponent as DocumentIcon } from '../../../../public/images/icon-document.svg'
import { ReactComponent as ExternalLinkIcon } from '../../../../public/images/icon-external.svg'
import type { IDocumentationLink } from './types'
import './DocumentationLink.scss'

export const DocumentationLink = ({ label, href }: IDocumentationLink) => {
    return (
        <a
            className="wbk_documentationLink"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <DocumentIcon
                className="wbk_documentationLink__icon"
                aria-hidden="true"
            />
            <span className="wbk_documentationLink__label">{label}</span>
            <ExternalLinkIcon
                className="wbk_documentationLink__externalIcon"
                aria-hidden="true"
            />
        </a>
    )
}
