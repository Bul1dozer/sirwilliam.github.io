/* Editable content: prices and project cards. Plain data — no code changes needed to update. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_CONTENT = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const currency = 'N$';

  // Barbering prices (N$). Do not add beard, travel or discount prices until they are confirmed.
  const prices = [
    { label: 'Men', amount: 70 },
    { label: 'Students', amount: 50 },
    { label: 'Boys', amount: 40 }
  ];

  /*
   * Project fields:
   *  id, codename, title, summary, areas[], stack[], status, tone
   *  tone: dev | ongoing | experimental | practical | learning  (colours the status badge)
   *  image: path under /images/projects/ (a missing file shows a labelled placeholder)
   *  alt: describes the real screenshot; fit: 'cover' (default) or 'contain'
   *  repoUrl / liveUrl: leave null unless a real, public URL exists (no button is rendered for null)
   *  built[] / planned[]: optional "implemented vs planned" lists shown in the details dialog
   *  note: optional honest caveat shown in the details dialog
   */
  const projects = [
    {
      id: 'lccca-ias-v2',
      codename: 'LCCCA-IAS_V2',
      title: 'Institutional Administration System',
      summary: 'A custom administration system being developed to support the workflows of an educational institution. The project brings together backend development, authentication, invoicing, reporting, and database integration.',
      areas: [
        'Learner and administrative record management',
        'Invoice management',
        'Learner statement generation',
        'Protected API access',
        'Reporting workflows',
        'Database integration and local hosting preparation'
      ],
      stack: ['Python', 'FastAPI', 'REST APIs', 'Databases'],
      status: 'In Development',
      tone: 'dev',
      image: 'images/projects/lccca-ias-v2.png',
      alt: 'Dashboard of the institutional administration system showing learner counts, fees due, payments received and invoice totals',
      fit: 'contain',
      repoUrl: null,
      liveUrl: null,
      note: 'Active build — not every planned function is complete. Screenshot cropped to exclude personal records.'
    },
    {
      id: 'life-changers-hub',
      codename: 'Life Changers Family Radio & Hub',
      title: 'Digital Media and Ministry Platform',
      summary: 'A digital platform project connecting a ministry website, online radio streaming, media content, and digital communication workflows.',
      areas: [
        'Website development and improvements',
        'Online radio integration',
        'Prayer and contact workflows',
        'Media and broadcast integration',
        'Website reliability and security configuration',
        'Ongoing platform improvements'
      ],
      stack: ['Web development', 'Online radio', 'Media integration', 'Site security'],
      status: 'Ongoing Development',
      tone: 'ongoing',
      image: 'images/projects/life-changers-hub.png',
      alt: 'LCCC Family FM web player with a Listen Live button, volume control, next-service notice and now-playing panel',
      repoUrl: null,
      liveUrl: null,
      note: 'Practical website and digital-media work. Planned features are still being built.'
    },
    {
      id: 'barbersnap',
      codename: 'BarberSnap',
      title: 'Smart Barbering and Booking Platform',
      summary: 'A software project designed to connect barbering services, appointment workflows, and digital grooming tools in one platform.',
      areas: [
        'Appointment booking',
        'Hairstyle recommendation features',
        'Hairline measurement functionality',
        'Payment workflows',
        'Administrative tools'
      ],
      stack: ['Flutter', 'Dart', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'Riverpod', 'Dio'],
      status: 'In Development',
      tone: 'dev',
      image: 'images/projects/barbersnap.png',
      alt: 'BarberSnap landing screen in black and gold with a Start a consultation button and a note that recommendations are suggestions',
      repoUrl: null,
      liveUrl: null,
      built: [
        'Secure authentication with refresh-token handling',
        'Barbershop and barber management',
        'Client profiles with consent records',
        'Consultation workflow with rules-based hairstyle recommendations',
        'Appointment booking with double-booking prevention',
        'Flutter app foundation with sign-in and registration'
      ],
      planned: [
        'Hairline measurement',
        'Payment workflows',
        'Expanded administrative tools',
        'Public release'
      ],
      note: 'In development and not publicly released.'
    },
    {
      id: 'royalmind',
      codename: 'RoyalMind',
      title: 'Local AI Assistant',
      summary: 'An experimental desktop application exploring locally running AI models and desktop software development.',
      areas: [
        'Desktop application development',
        'Local language-model integration',
        'React-based user interfaces',
        'Tauri desktop integration',
        'Local AI tools through Ollama'
      ],
      stack: ['Tauri', 'React', 'Vite', 'Ollama', 'Local LLMs'],
      status: 'Experimental Development',
      tone: 'experimental',
      image: 'images/projects/royalmind.png',
      alt: 'RoyalMind desktop chat window with a conversation list, model selector and an Ollama connected indicator',
      repoUrl: null,
      liveUrl: null,
      note: 'An experiment and learning project — not a finished commercial product.'
    },
    {
      id: 'livestream-av',
      codename: 'Livestream and AV Systems',
      title: 'Broadcast Systems Integration and Troubleshooting',
      summary: 'Practical work involving presentation systems, video routing, livestream workflows, and audio/video troubleshooting.',
      areas: [
        'OBS and ATEM integration',
        'ProPresenter presentation workflows',
        'Audio and video signal diagnostics',
        'Livestream and in-house media coordination',
        'Presentation-system troubleshooting'
      ],
      stack: ['OBS Studio', 'ATEM Mini Extreme', 'ProPresenter 7', 'Yamaha TF3', 'NDI'],
      status: 'Practical Ongoing Work',
      tone: 'practical',
      image: 'images/projects/livestream-av.png',
      alt: 'Livestream and AV control setup',
      repoUrl: null,
      liveUrl: null
    },
    {
      id: 'network-diagnostics',
      codename: 'Network Performance Diagnostics',
      title: 'Connectivity, Cabling and Infrastructure',
      summary: 'Hands-on investigation of networking issues involving Ethernet cabling, link negotiation, connectivity tests, and network performance.',
      areas: [
        'Ethernet link-speed verification',
        'Cable and connector troubleshooting',
        'Network speed testing',
        'Router and connectivity diagnostics',
        'Investigation of possible infrastructure and internet-service limitations'
      ],
      stack: ['Ethernet', 'Link negotiation', 'Speed testing', 'Router diagnostics'],
      status: 'Practical Technical Experience',
      tone: 'practical',
      image: 'images/projects/network-diagnostics.png',
      alt: 'Network diagnostics results',
      repoUrl: null,
      liveUrl: null,
      note: 'Described in general terms to protect client and institutional confidentiality.'
    },
    {
      id: 'linux-server',
      codename: 'Linux Server and Hosting Setup',
      title: 'Linux and Debian Hosting Practice',
      summary: 'A learning and setup project covering Linux command-line workflows and preparing a server environment for hosting applications.',
      areas: [
        'Linux command-line workflows',
        'Package and dependency management',
        'Server environment preparation',
        'Application hosting fundamentals',
        'Troubleshooting and documentation'
      ],
      stack: ['Debian', 'Linux CLI', 'Package management', 'Hosting basics'],
      status: 'Learning & Setup Project',
      tone: 'learning',
      image: 'images/projects/linux-server.png',
      alt: 'Linux server terminal session',
      repoUrl: null,
      liveUrl: null,
      note: 'A learning and setup project — not production-scale server administration.'
    }
  ];

  return { currency, prices, projects };
});
