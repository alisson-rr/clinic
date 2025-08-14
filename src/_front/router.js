import { createRouter, createWebHistory } from 'vue-router';

import wwPage from './views/wwPage.vue';

import { initializeData, initializePlugins, onPageUnload } from '@/_common/helpers/data';

let router;
const routes = [];

function scrollBehavior(to) {
    if (to.hash) {
        return {
            el: to.hash,
            behavior: 'smooth',
        };
    } else {
        return { top: 0 };
    }
}

 
/* wwFront:start */
import pluginsSettings from '../../plugins-settings.json';

// eslint-disable-next-line no-undef
window.wwg_designInfo = {"id":"3bf214dc-0a89-4c56-98fb-7dc01f745ab3","homePageId":"94f834b3-540a-457d-aad5-33044926246f","authPluginId":null,"baseTag":null,"defaultTheme":"light","langs":[{"lang":"pt","default":true,"isDefaultPath":false}],"background":{},"workflows":[],"pages":[{"id":"94f834b3-540a-457d-aad5-33044926246f","linkId":"94f834b3-540a-457d-aad5-33044926246f","name":"Home","folder":null,"paths":{"pt":"home","default":"home"},"langs":["pt"],"cmsDataSetPath":null,"sections":[{"uid":"24da0570-ed5a-4329-9bfe-2869e77cff89","sectionTitle":"Alert Bar Section","linkId":"b2d9f0b4-bd2e-4110-9d8c-b2b155ebdada"},{"uid":"6da34732-ff72-4e70-af1b-65fd2b09db53","sectionTitle":"Hero Section","linkId":"9aaa8a83-dd8f-4a07-828b-76df8c1ec52a"},{"uid":"22fc67b6-034c-4a54-94cd-03ab021e8d03","sectionTitle":"Features Section","linkId":"6ad5ed8a-01a3-4520-b090-9e42b16f4ad0"},{"uid":"dd0ccd6e-2a27-4c1d-b047-ed865b89ba9a","sectionTitle":"Pricing Section","linkId":"4f476ff8-ab83-4f87-9ff5-5fb079a9729e"},{"uid":"5e607912-9f4e-4948-b8f1-e84fbb5c0957","sectionTitle":"Optional Features Section","linkId":"8eb92cf6-1f25-4723-81ea-636121fb2611"},{"uid":"8c2b15c6-2b98-4045-916b-c968b7b1bf4a","sectionTitle":"How It Works Section","linkId":"531077fd-c09d-403b-9a55-c730940d1000"},{"uid":"6beaa243-5833-4ee2-9d34-3ed195f15565","sectionTitle":"Guarantee Section","linkId":"339237d6-831f-4b0c-9e75-3ee41e0d63fc"},{"uid":"73a4b14a-a9c7-4060-8a40-6ddb7ad48873","sectionTitle":"Benefits Section","linkId":"9af5dc19-c11a-43cf-9ac5-da3fde5fb013"},{"uid":"93456d1d-303e-414e-9adf-9cdfced886ae","sectionTitle":"About Section","linkId":"d37fdfdd-2ed6-42bc-85fe-cd64cd158c09"},{"uid":"ada0386d-64e6-43ca-baf6-251d9aabaefe","sectionTitle":"FAQ Section","linkId":"fd5ccbab-7c02-4686-9429-b0e725322d83"},{"uid":"0203a5cc-f982-4175-acfb-16dd9be8d678","sectionTitle":"Final CTA Section","linkId":"f005e969-bedd-491e-a05c-cc957d2267f9"}],"pageUserGroups":[],"title":{"en":"","fr":"Vide | Commencer à partir de zéro","pt":"Atendimento inteligente no whats"},"meta":{"desc":{"pt":"Otimização de tempo | Satisfação do cliente | Economia de custos | Cobertura de dúvidas | Custo por atendimento | Atendimento 24/7 | Escala sem dor | Qualidade consistente"},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"images/Logo_Preenchido.png?_wwcv=7"}],"plugins":[{"id":"2bd1c688-31c5-443e-ae25-59aa5b6431fb","name":"REST API","namespace":"restApi"}]};
// eslint-disable-next-line no-undef
window.wwg_cacheVersion = 7;
// eslint-disable-next-line no-undef
window.wwg_pluginsSettings = pluginsSettings;
// eslint-disable-next-line no-undef
window.wwg_disableManifest = false;

const defaultLang = window.wwg_designInfo.langs.find(({ default: isDefault }) => isDefault) || {};

const registerRoute = (page, lang, forcedPath) => {
    const langSlug = !lang.default || lang.isDefaultPath ? `/${lang.lang}` : '';
    let path =
        forcedPath ||
        (page.id === window.wwg_designInfo.homePageId ? '/' : `/${page.paths[lang.lang] || page.paths.default}`);

    //Replace params
    path = path.replace(/{{([\w]+)\|([^/]+)?}}/g, ':$1');

    routes.push({
        path: langSlug + path,
        component: wwPage,
        name: `page-${page.id}-${lang.lang}`,
        meta: {
            pageId: page.id,
            lang,
            isPrivate: !!page.pageUserGroups?.length,
        },
        async beforeEnter(to, from) {
            if (to.name === from.name) return;
            //Set page lang
            wwLib.wwLang.defaultLang = defaultLang.lang;
            wwLib.$store.dispatch('front/setLang', lang.lang);

            //Init plugins
            await initializePlugins();

            //Check if private page
            if (page.pageUserGroups?.length) {
                // cancel navigation if no plugin
                if (!wwLib.wwAuth.plugin) {
                    return false;
                }

                await wwLib.wwAuth.init();

                // Redirect to not sign in page if not logged
                if (!wwLib.wwAuth.getIsAuthenticated()) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthenticatedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }

                //Check roles are required
                if (
                    page.pageUserGroups.length > 1 &&
                    !wwLib.wwAuth.matchUserGroups(page.pageUserGroups.map(({ userGroup }) => userGroup))
                ) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthorizedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }
            }

            try {
                await import(`@/pages/${page.id.split('_')[0]}.js`);
                await wwLib.wwWebsiteData.fetchPage(page.id);

                //Scroll to section or on top after page change
                if (to.hash) {
                    const targetElement = document.getElementById(to.hash.replace('#', ''));
                    if (targetElement) targetElement.scrollIntoView();
                } else {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }

                return;
            } catch (err) {
                wwLib.$store.dispatch('front/showPageLoadProgress', false);

                if (err.redirectUrl) {
                    return { path: err.redirectUrl || '404' };
                } else {
                    //Any other error: go to target page using window.location
                    window.location = to.fullPath;
                }
            }
        },
    });
};

for (const page of window.wwg_designInfo.pages) {
    for (const lang of window.wwg_designInfo.langs) {
        if (!page.langs.includes(lang.lang)) continue;
        registerRoute(page, lang);
    }
}

const page404 = window.wwg_designInfo.pages.find(page => page.paths.default === '404');
if (page404) {
    for (const lang of window.wwg_designInfo.langs) {
        // Create routes /:lang/:pathMatch(.*)* etc for all langs of the 404 page
        if (!page404.langs.includes(lang.lang)) continue;
        registerRoute(
            page404,
            {
                default: false,
                lang: lang.lang,
            },
            '/:pathMatch(.*)*'
        );
    }
    // Create route /:pathMatch(.*)* using default project lang
    registerRoute(page404, { default: true, isDefaultPath: false, lang: defaultLang.lang }, '/:pathMatch(.*)*');
} else {
    routes.push({
        path: '/:pathMatch(.*)*',
        async beforeEnter() {
            window.location.href = '/404';
        },
    });
}

let routerOptions = {};

const isProd =
    !window.location.host.includes(
        // TODO: add staging2 ?
        '-staging.' + (process.env.WW_ENV === 'staging' ? import.meta.env.VITE_APP_PREVIEW_URL : '')
    ) && !window.location.host.includes(import.meta.env.VITE_APP_PREVIEW_URL);

if (isProd && window.wwg_designInfo.baseTag?.href) {
    let baseTag = window.wwg_designInfo.baseTag.href;
    if (!baseTag.startsWith('/')) {
        baseTag = '/' + baseTag;
    }
    if (!baseTag.endsWith('/')) {
        baseTag += '/';
    }

    routerOptions = {
        base: baseTag,
        history: createWebHistory(baseTag),
        routes,
    };
} else {
    routerOptions = {
        history: createWebHistory(),
        routes,
    };
}

router = createRouter({
    ...routerOptions,
    scrollBehavior,
});

//Trigger on page unload
let isFirstNavigation = true;
router.beforeEach(async (to, from) => {
    if (to.name === from.name) return;
    if (!isFirstNavigation) await onPageUnload();
    isFirstNavigation = false;
    wwLib.globalVariables._navigationId++;
    return;
});

//Init page
router.afterEach((to, from, failure) => {
    wwLib.$store.dispatch('front/showPageLoadProgress', false);
    let fromPath = from.path;
    let toPath = to.path;
    if (!fromPath.endsWith('/')) fromPath = fromPath + '/';
    if (!toPath.endsWith('/')) toPath = toPath + '/';
    if (failure || (from.name && toPath === fromPath)) return;
    initializeData(to);
});
/* wwFront:end */

export default router;
