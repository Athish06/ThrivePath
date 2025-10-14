import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  Lightbulb,
  ShieldCheck,
  Users,
} from 'lucide-react';

const heroStats = [
  {
    label: 'Personalized therapy pathways',
    value: '1,280+',
    caption: 'built with clinicians in 9 countries',
  },
  {
    label: 'Session insights logged',
    value: '64k',
    caption: 'real-time observations captured at the point of care',
  },
  {
    label: 'Parent participation rate',
    value: '92%',
    caption: 'families staying engaged every single week',
  },
];

const therapyTracks = [
  {
    title: 'Regulation & Sensory Integration',
    description:
      'Daily plans curated with occupational therapists to reduce overwhelm and build tolerance for new environments.',
    icon: HeartPulse,
    focus: ['Tactile modulation routines', 'Breathing stories & co-regulation', 'Sensory diet auditing'],
  },
  {
    title: 'Communication & Social Play',
    description:
      'Dynamic ABA and speech therapy sequences that adapt to expressive, receptive, and pragmatic progress data.',
    icon: Users,
    focus: ['Visual cue libraries', 'Joint attention mini games', 'Coach-led peer pairing scripts'],
  },
  {
    title: 'Executive Thinking & Daily Living',
    description:
      'Task analysis, micro-progressions, and home routines that help families build independence with confidence.',
    icon: ClipboardList,
    focus: ['Adaptive homework snapshots', 'Goal chaining & mastery gating', 'Parent coaching check-ins'],
  },
];

const approachPillars = [
  {
    title: 'Evidence-led precision',
    description:
      'Six clinical frameworks woven together—ABA, Floortime®, SCERTS®, SI, AAC, and OT protocols—curated per child.',
    points: ['Automated assessment diffing every quarter', 'Outcome libraries mapped to DSM-5 domains', 'Live fidelity notes for supervisors'],
  },
  {
    title: 'Designed for co-therapy',
    description:
      'Therapists, parents, and school aides collaborate inside living plans with clear roles and handoffs.',
    points: ['Shared visual schedule designer', 'Parent skill rehearsals via clips & scripts', 'Team chat pinned to each child profile'],
  },
  {
    title: 'Built for sustainability',
    description:
      'Progress transparency, secure guardrails, and exportable evidence to support funding reviews and IEP cycles.',
    points: ['Offline capture + automatic sync', 'Restricted data views for compliance', 'PDF, CSV, and storyboard exports in seconds'],
  },
];

const journeyMilestones = [
  {
    title: 'Enroll and baseline in one sitting',
    copy:
      'Import past reports, align on priorities, and run our guided baseline—complete with sensory profiles and caregiver narratives.',
    meta: 'Avg. 55 minutes | Clinician + caregiver',
  },
  {
    title: 'Design the living therapy map',
    copy:
      'Sequence goals, assign prompts, and automate data capture cadence. The plan recalibrates as new evidence flows in.',
    meta: 'Dynamic plan builder | Multi-disciplinary',
  },
  {
    title: 'Celebrate, measure, and iterate',
    copy:
      'Share wins visually with families, surface regressions quickly, and keep every stakeholder aligned on next right steps.',
    meta: 'Weekly reflections | Storyboard exports',
  },
];

const resourceHighlights = [
  {
    title: 'Black-and-white social story decks',
    description: 'Minimal sensory load visuals for practicing eye contact, turn-taking, and emotion labelling at home.',
    action: 'Download sample deck',
  },
  {
    title: 'Parent coaching micro-lessons',
    description: 'Five-minute walkthroughs co-created with autistic adults on scripting supportive responses.',
    action: 'Preview lesson library',
  },
  {
    title: 'Therapist fidelity checklist',
    description: 'Ensure every intervention stays on target with printable cue cards linked to baseline data.',
    action: 'See the checklist',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToSignup = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-lg font-semibold tracking-tight text-slate-900">
            ThrivePath
          </a>
          <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#programs" className="transition hover:text-slate-900">
              Therapy programs
            </a>
            <a href="#approach" className="transition hover:text-slate-900">
              Our approach
            </a>
            <a href="#journey" className="transition hover:text-slate-900">
              Care journey
            </a>
            <a href="#resources" className="transition hover:text-slate-900">
              Resources
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNavigateToLogin}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Log in
            </button>
            <button
              onClick={handleNavigateToSignup}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Book a walkthrough
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 lg:pt-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
                <ShieldCheck className="h-4 w-4" />
                Autism care operating system
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Design calmer, richer therapy experiences that evolve with every child.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                ThrivePath gives autism teams a living blueprint—planning sessions, logging observations, and sharing progress with parents in one place that never overwhelms the child.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleNavigateToSignup}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
                >
                  Start tailoring care
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNavigateToLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
                >
                  Explore therapist tools
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Daily calm check-ins</span>
                    <HeartPulse className="h-5 w-5 text-slate-900" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    Therapists capture regulation, affect, and sensory cues in under 45 seconds per session—structured to share with parents instantly.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">IEP-ready evidence</span>
                    <Lightbulb className="h-5 w-5 text-slate-900" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    Build engaging narratives backed by data, photos, and audio clips that highlight each child’s authentic progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-full rounded-[32px] border border-slate-200 bg-white shadow-xl">
              <div className="absolute inset-0 bg-slate-950/5" />
              <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80"
                alt="Close-up of a child’s eyes capturing focus and curiosity"
                className="h-full w-full rounded-[32px] object-cover object-center grayscale"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
                <p className="text-sm font-semibold text-slate-600">Session recap • Milo, age 7</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  “Milo stayed regulated for 18 minutes in sensory gym, initiated 4 joint-attention bids, and completed the ‘Feelings mirror’ routine.”
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <CalendarCheck className="h-4 w-4" />
                  Shared with family & school aide in under 5 minutes
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="text-3xl font-semibold text-slate-950">{stat.value}</span>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{stat.caption}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="programs" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Therapy programs</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Modular pathways tuned for each child’s profile
                </h2>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
                View curriculum map
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {therapyTracks.map((track) => {
                const Icon = track.icon;
                return (
                  <article key={track.title} className="group flex h-full flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm transition hover:border-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white">
                        <Icon className="h-5 w-5 text-slate-900" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Track</span>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950">{track.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{track.description}</p>
                    <ul className="flex flex-col gap-3 text-sm text-slate-700">
                      {track.focus.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-800" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="approach" className="bg-[#f5f6f8] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Our methodology</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                The ThrivePath approach keeps clinicians in control while families feel deeply seen.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {approachPillars.map((pillar) => (
                <div key={pillar.title} className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-950">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                  <ul className="mt-2 flex flex-col gap-3 text-sm text-slate-700">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="journey" className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Care journey</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  A calm, transparent rhythm for every stakeholder
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  From baseline to growth celebrations, ThrivePath keeps therapy visible, organized, and deeply human—without drowning teams in dashboards.
                </p>
              </div>
              <div className="flex-1">
                <div className="relative pl-8">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
                  <div className="space-y-10">
                    {journeyMilestones.map((step, index) => (
                      <div key={step.title} className="relative rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                        <span className="absolute -left-[34px] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-600">
                          {index + 1}
                        </span>
                        <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.copy}</p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{step.meta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f5f6f8] py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Family collaboration</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Parent coaching is woven into each pathway—not an afterthought.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Families receive timely, minimal-sensory updates that help them practice regulation strategies, celebrate micro-wins, and advocate confidently at school.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">At-home reflections</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Guided prompts for parents to capture how routines feel—feeding directly into the therapist note, avoiding heavy surveys.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Sensory-safe visuals</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Black-and-white social narratives and task strips, printable or accessible offline on any device.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-full rounded-[32px] border border-slate-200 bg-white shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1611691543546-e4ec1c0bde0e?auto=format&fit=crop&w=1200&q=80"
                  alt="Parent supporting their child with calm focus"
                  className="h-full w-full rounded-[32px] object-cover object-center"
                />
                <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/90 p-5 shadow-lg">
                  <p className="text-sm font-semibold text-slate-600">Parent reflection highlight</p>
                  <blockquote className="text-base font-medium text-slate-900">
                    “We practiced the breathing story together tonight—she asked to replay the calm audio before bed. The MyFeelings cards made it easy.”
                  </blockquote>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                    <Users className="h-4 w-4" />
                    Shared by Priya’s family 3 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="border-t border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Resource studio</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Tools crafted with autistic self-advocates and clinicians
                </h2>
              </div>
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
                Browse all resources
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {resourceHighlights.map((resource) => (
                <article key={resource.title} className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm transition hover:border-slate-900">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">{resource.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{resource.description}</p>
                  </div>
                  <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-slate-950">
                    {resource.action}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f5f6f8] py-20">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-white px-8 py-10 text-center shadow-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Ready to build calmer, connected autism therapy journeys?
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
              Book a walkthrough with our clinical onboarding team. We’ll map your existing process into ThrivePath, migrate historic notes securely, and set up your first family experience in under two weeks.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={handleNavigateToSignup}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
              >
                Schedule a session
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleNavigateToLogin}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-800 transition hover:border-slate-900 hover:text-slate-900"
              >
                Preview the platform
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-slate-700">© {new Date().getFullYear()} ThrivePath. Designed with families and therapists.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-slate-700">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-700">
              Terms
            </a>
            <a href="#" className="hover:text-slate-700">
              Clinical advisory board
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};