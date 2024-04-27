export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'Michael Yang',
    subtitle: 'Personal Website and Portfolio',
    description: '',
    image: {
        src: '/michael_canyon.jpg',
        alt: 'Picture of me at the canyon'
    },
    headerNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Projects',
            href: '/projects'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'Tags',
            href: '/tags'
        }
    ],
    footerNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'LinkedIn',
            href: 'https://www.linkedin.com/in/michaelryang/'
        }
    ],
    hero: {
        title: 'Welcome to my portfolio.',
        text: "I'm **Michael Yang**, a game developer at Heavy Iron Studios. In this website you'll find some of my favorite projects and things that I'm working on. I enjoy exploring a variety of techniques and concepts in game development, and some of the more interesting problems and challenges I encounter will be detailed here. Thanks for stopping by!",
        image: {
            src: '/michael_canyon.jpg',
            alt: 'Picture of me at the Grand Canyon'
        },
        actions: [
            {
                text: 'Get in Touch',
                href: '/contact'
            }
        ]
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
