export interface Project {
  title: string;
  /** Short name shown floating next to the hovered cube. */
  short: string;
  subtitle: string;
  year: string;
  client: string;
  role: string;
  stack: string;
  /** Tints the page background while the project is open. */
  color: string;
  body: string[];
}

// Add, remove, or reorder projects freely — the ice-cube ring divides a full
// circle by PROJECTS.length, so a 4th, 5th, or 6th cube spaces itself
// automatically. See CUSTOMIZE.md → "Projects & cubes".
export const PROJECTS: Project[] = [
  {
    title: 'Project Alpha',
    short: 'Alpha',
    subtitle: 'A WebGL experience that overshares.',
    year: '2026',
    client: 'Personal Project',
    role: 'Design + Build',
    stack: 'Next.js · R3F · GLSL',
    color: '#0A1FE0',
    body: [
      'This is placeholder prose standing in for a real case study. Imagine several paragraphs about shaders, deadlines, and a client who asked if the particles could be "more premium."',
      'The brief called for a landing page; what shipped was a small planetarium. Sixty thousand instanced particles, a camera that breathes, and a loading screen nobody ever sees because the whole thing boots in under a second.',
      'The particles were, in the end, more premium. Everyone involved is doing fine.',
    ],
  },
  {
    title: 'Project Beta',
    short: 'Beta',
    subtitle: 'A design system with feelings.',
    year: '2025',
    client: 'Course Project · Thapar',
    role: 'Solo Build',
    stack: 'React · TypeScript · Storybook',
    color: '#A8009E',
    body: [
      'Placeholder text describing forty components, one token pipeline, and the week everything was accidentally purple.',
      'Buttons, inputs, modals, toasts — each one built twice: once quickly, once correctly. The token pipeline now feeds three products from a single source of truth, and dark mode fell out of it almost by accident.',
      'The system still ships weekly and only occasionally develops feelings.',
    ],
  },
  {
    title: 'Project Gamma',
    short: 'Gamma',
    subtitle: 'An installation that waves back.',
    year: '2024',
    client: 'Hackathon · Team of 3',
    role: 'Creative Tech',
    stack: 'TouchDesigner · Kinect · WebRTC',
    color: '#00702B',
    body: [
      'Placeholder copy about a camera, a projector, and a room full of people waving at a wall.',
      'Skeleton tracking ran at 60fps on a machine hidden in a plinth; the wall rendered a flock of hand-drawn birds that mirrored every gesture with a half-second of dramatic hesitation.',
      'The wall waved back. That was the whole brief, and it was a good one.',
    ],
  },
  {
    title: 'Project Delta',
    short: 'Delta',
    subtitle: 'A tiny game about big feelings.',
    year: '2023',
    client: 'Self-initiated',
    role: 'Everything',
    stack: 'Canvas 2D · Web Audio',
    color: '#8A4B00',
    body: [
      'Placeholder story about a weekend jam entry that refused to stay a weekend.',
      'You play a mug of coffee trying to stay warm in an open-plan office. Radiators are checkpoints. Meetings are boss fights. The soundtrack is four chords and an air conditioner.',
      'It was downloaded eleven times, and two of those were not family. A triumph.',
    ],
  },
];
