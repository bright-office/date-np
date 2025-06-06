import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'Date-np',
    tagline: 'Simple & minimal Nepali date picker that just works. ',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://date-np-docs.pages.dev', // Your Cloudflare Pages URL
    baseUrl: '/',
    trailingSlash: true,

    // Cloudflare Pages deployment config
    organizationName: 'bright-office',
    projectName: 'date-np',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/sarojregmi200/date-np',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        navbar: {
            title: 'Date-np',
            /* logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg',
            }, */
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'docsSidebar',
                    position: 'left',
                    label: 'Docs',
                },
                {
                    href: 'https://github.com/sarojregmi200/date-np',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },

        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Social',
                    items: [
                        {
                            label: 'Source',
                            to: "https://github.com/sarojregmi200/date-np",
                        },
                        {
                            label: 'Bright',
                            to: "https://github.com/bright-office",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} bright-office and the maintainers. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
