import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Michael Yang",
  DESCRIPTION: "Welcome to my Portfolio",
  AUTHOR: "Michael Yang",
}

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION: "Places I have worked.",
}

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION: "Posts about things I'm working on.",
}

// Projects Page 
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION: "Recent projects I have worked on.",
}

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION: "Search all posts and projects by keyword.",
}

// Links
export const LINKS: Links = [
  { 
    TEXT: "Home", 
    HREF: "/", 
  },
  { 
    TEXT: "Work", 
    HREF: "/work", 
  },
  { 
    TEXT: "Projects", 
    HREF: "/projects", 
  },
  { 
    TEXT: "Blog", 
    HREF: "/blog", 
  },
]

// Socials
export const SOCIALS: Socials = [
  { 
    NAME: "Email",
    ICON: "email", 
    TEXT: "michaelryang2@gmail.com",
    HREF: "mailto:michaelryang2@gmail.com",
  },
  { 
    NAME: "Github",
    ICON: "github",
    TEXT: "michaelryang",
    HREF: "https://github.com/michaelryang"
  },
  { 
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "Michael Yang",
    HREF: "https://www.linkedin.com/in/michaelryang/",
  },
  /*{ 
    NAME: "Twitter",
    ICON: "twitter-x",
    TEXT: "markhorn_dev",
    HREF: "https://twitter.com/markhorn_dev",
  },*/
]

