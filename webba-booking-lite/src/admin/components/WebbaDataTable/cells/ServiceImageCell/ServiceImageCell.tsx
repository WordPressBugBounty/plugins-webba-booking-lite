import { useEffect, useState } from 'react'
import { CellContext } from '@tanstack/react-table'
// @ts-ignore
// eslint-disable-next-line
declare global { interface Window { wp: any } }

export const ServiceImageCell = ({ getValue }: CellContext<any, any>) => {
    const id = getValue()
    const [url, setUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (
            (typeof id === 'number' || (typeof id === 'string' && id.match(/^\d+$/))) &&
            window.wp && window.wp.media
        ) {
            setLoading(true)
            window.wp.media.attachment(id).fetch({
                success: (attachment: any) => {
                    const att = attachment.toJSON ? attachment.toJSON() : attachment
                    let previewUrl = att.url
                    if (att.sizes) {
                        if (att.sizes.thumbnail) {
                            previewUrl = att.sizes.thumbnail.url
                        } else if (att.sizes.medium) {
                            previewUrl = att.sizes.medium.url
                        } else if (att.sizes.full) {
                            previewUrl = att.sizes.full.url
                        }
                    }
                    setUrl(previewUrl || null)
                    setLoading(false)
                },
                error: () => {
                    setUrl(null)
                    setLoading(false)
                }
            })
        } else {
            setUrl(null)
        }
    }, [id])

    if (loading) {
        return <span style={{ color: '#aaa' }}>Loading...</span>
    }
    if (url) {
        return <img src={url} alt="Service" style={{ maxWidth: 48, maxHeight: 48, borderRadius: 4 }} />
    }
    return <span style={{ color: '#aaa' }}>No image</span>
} 