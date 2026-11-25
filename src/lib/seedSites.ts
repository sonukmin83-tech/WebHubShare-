import type { WebsiteCategory } from '../types/directory';

export interface StarterSiteSeed {
  id: string;
  name: string;
  url: string;
  category: WebsiteCategory;
  description: string;
  logo: string;
}

export const STARTER_SITES: StarterSiteSeed[] = [
  {
    id: 'seed-youtube',
    name: 'YouTube',
    url: 'https://youtube.com',
    category: 'Entertainment',
    description:
      'Watch, share and discover videos on every topic — music, tutorials, vlogs, gaming, comedy and much more. Home to millions of creators worldwide.',
    logo: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
  },
  {
    id: 'seed-whatsapp',
    name: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    category: 'Social',
    description:
      'Send messages, photos and make free voice and video calls to anyone in the world. Simple, reliable and private messaging.',
    logo: 'https://www.google.com/s2/favicons?domain=web.whatsapp.com&sz=128',
  },
  {
    id: 'seed-wikipedia',
    name: 'Wikipedia',
    url: 'https://wikipedia.org',
    category: 'Education',
    description:
      'The free encyclopedia that anyone can edit. Millions of articles on every subject imaginable, in 300+ languages.',
    logo: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=128',
  },
  {
    id: 'seed-github',
    name: 'GitHub',
    url: 'https://github.com',
    category: 'Tools',
    description:
      "The world's leading platform to build, host and collaborate on software. Millions of open source projects live here.",
    logo: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  },
  {
    id: 'seed-chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'AI',
    description:
      'An AI assistant that writes, codes, explains, translates and brainstorms with you. Ask anything, get useful answers.',
    logo: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=128',
  },
  {
    id: 'seed-spotify',
    name: 'Spotify',
    url: 'https://open.spotify.com',
    category: 'Entertainment',
    description:
      'Stream millions of songs, podcasts and playlists from artists all over the world. Discover your next favourite track.',
    logo: 'https://www.google.com/s2/favicons?domain=open.spotify.com&sz=128',
  },
  {
    id: 'seed-amazon',
    name: 'Amazon',
    url: 'https://amazon.in',
    category: 'Shopping',
    description:
      'Shop online for electronics, fashion, books, groceries and almost everything else — with fast delivery at home.',
    logo: 'https://www.google.com/s2/favicons?domain=amazon.in&sz=128',
  },
  {
    id: 'seed-stackoverflow',
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    category: 'Education',
    description:
      'The largest community of developers asking and answering programming questions. Get unstuck in minutes.',
    logo: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=128',
  },
  {
    id: 'seed-reddit',
    name: 'Reddit',
    url: 'https://reddit.com',
    category: 'Social',
    description:
      'Dive into thousands of communities on any topic — news, memes, discussions, hobbies and honest advice.',
    logo: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=128',
  },
  {
    id: 'seed-netflix',
    name: 'Netflix',
    url: 'https://netflix.com',
    category: 'Entertainment',
    description:
      'Watch unlimited movies, TV shows, documentaries and award-winning original series on any device.',
    logo: 'https://www.google.com/s2/favicons?domain=netflix.com&sz=128',
  },
  {
    id: 'seed-canva',
    name: 'Canva',
    url: 'https://canva.com',
    category: 'Tools',
    description:
      'Design posters, presentations, logos and social media posts in minutes — no design skills needed, free to start.',
    logo: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128',
  },
  {
    id: 'seed-bbc',
    name: 'BBC News',
    url: 'https://bbc.com',
    category: 'News',
    description:
      'Breaking news, analysis and in-depth reporting from around the world, updated 24 hours a day.',
    logo: 'https://www.google.com/s2/favicons?domain=bbc.com&sz=128',
  },
  {
    id: 'seed-khan',
    name: 'Khan Academy',
    url: 'https://khanacademy.org',
    category: 'Education',
    description:
      'Free world-class education for anyone, anywhere. Maths, science, economics and more with practice exercises.',
    logo: 'https://www.google.com/s2/favicons?domain=khanacademy.org&sz=128',
  },
  {
    id: 'seed-chess',
    name: 'Chess.com',
    url: 'https://chess.com',
    category: 'Games',
    description:
      'Play chess online with friends or millions of players worldwide, solve puzzles and improve your rating.',
    logo: 'https://www.google.com/s2/favicons?domain=chess.com&sz=128',
  },
  {
    id: 'seed-nse',
    name: 'NSE India',
    url: 'https://nseindia.com',
    category: 'Finance',
    description:
      "India's leading stock exchange — live market data, company listings, indices and investor resources.",
    logo: 'https://www.google.com/s2/favicons?domain=nseindia.com&sz=128',
  },
  {
    id: 'seed-drive',
    name: 'Google Drive',
    url: 'https://drive.google.com',
    category: 'Tools',
    description:
      'Store, share and collaborate on files securely in the cloud. Access your documents from any device.',
    logo: 'https://www.google.com/s2/favicons?domain=drive.google.com&sz=128',
  },
  {
    id: 'seed-discord',
    name: 'Discord',
    url: 'https://discord.com',
    category: 'Social',
    description:
      'Talk, hang out and stay close with communities and friends through voice, video and text channels.',
    logo: 'https://www.google.com/s2/favicons?domain=discord.com&sz=128',
  },
  {
    id: 'seed-figma',
    name: 'Figma',
    url: 'https://figma.com',
    category: 'Tools',
    description:
      'Collaborative interface design tool that runs in your browser. Design, prototype and hand off — all in real time.',
    logo: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128',
  },
];
