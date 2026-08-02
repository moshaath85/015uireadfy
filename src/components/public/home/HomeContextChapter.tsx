import Link from 'next/link';

interface HomeContextChapterProps {
  projects: Array<{
    id: string;
    href: string;
    title: string;
    type?: string;
    image?: { src: string; alt: string; width?: number; height?: number };
  }>;
}

export default function HomeContextChapter({ projects }: HomeContextChapterProps) {
  if (projects.length === 0) return null;

  return (
    <section className="home-chapter home-chapter--context" aria-labelledby="home-context-title">
      <p className="home-chapter__number" aria-hidden="true">05</p>
      <div className="home-chapter__heading">
        <p className="home-chapter__eyebrow">Projects</p>
        <h2 id="home-context-title">Art in context</h2>
      </div>
      <div className="home-context-sequence">
        {projects.map((project, index) => (
          <Link href={project.href} className={`home-context-sequence__entry home-context-sequence__entry--${index + 1}`} key={project.id}>
            <div className="home-context-sequence__media">
              {project.image ? <img src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} loading="lazy" decoding="async" /> : <span>015 / Image forthcoming</span>}
            </div>
            <div><p>{project.type ?? 'Project'}</p><h3>{project.title}</h3></div>
          </Link>
        ))}
      </div>
      <Link href="/projects" className="home-chapter__index-link">All projects <span aria-hidden="true">↗</span></Link>
    </section>
  );
}
