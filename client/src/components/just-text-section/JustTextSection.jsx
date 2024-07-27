import './JustTextSection.scss';
import DOMPurify from 'dompurify';

export default function JustTextSection({
    theme,
    entry
}) {
    const sanitizedHtml = DOMPurify.sanitize(entry)
    const combinedClassName = `section-text ${theme}`
    return (
        <section className={combinedClassName}>
            <div className="shell">
                <div className="section__inner">
                    <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                </div>
            </div>
        </section>
    )
}