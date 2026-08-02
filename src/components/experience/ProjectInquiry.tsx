import Link from 'next/link';

interface ProjectInquiryProps {
  projectTitle: string;
}

export function ProjectInquiry({ projectTitle }: ProjectInquiryProps) {
  return (
    <section className="project-experience-inquiry" aria-labelledby="project-inquiry-title">
      <p className="project-experience-kicker">Project inquiry</p>
      <h2 id="project-inquiry-title">Discuss a project like <em>{projectTitle}</em></h2>
      <p>Contact Gallery 015 for commissions, institutional collaborations, and project consultations.</p>
      <Link href="/contact">Contact the gallery</Link>
    </section>
  );
}
