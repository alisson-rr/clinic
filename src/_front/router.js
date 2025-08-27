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
window.wwg_designInfo = {"id":"14d5f00d-3994-4bb0-9045-a31427d67f4f","homePageId":"d6b85892-1b6d-4511-8c0b-8972a0e85e44","authPluginId":null,"baseTag":null,"defaultTheme":"light","langs":[{"lang":"pt","default":true}],"background":{},"workflows":[],"pages":[{"id":"d6b85892-1b6d-4511-8c0b-8972a0e85e44","linkId":"d6b85892-1b6d-4511-8c0b-8972a0e85e44","name":"Agenda Magnetica","folder":null,"paths":{"pt":"home","default":"home"},"langs":["pt"],"cmsDataSetPath":null,"sections":[{"uid":"bef98b99-4c0b-4755-ad54-f1f07d14a028","sectionTitle":"Header Section","linkId":"fece8df4-ea4b-4452-8802-3df9d3d9d8c6"},{"uid":"388a7b3f-91b5-4ec2-8503-e0dd748657a5","sectionTitle":"Hero Section","linkId":"a8e25711-7b02-4356-ae62-6710b5237844"},{"uid":"ef69503e-ce11-4ddd-a3a3-51468947ce75","sectionTitle":"Problem Section","linkId":"bccbf3c5-fe9c-444e-951c-acaf7d4f35e4"},{"uid":"7ff5847d-cf59-4d63-a399-7fbb8c7494a9","sectionTitle":"Solution Section","linkId":"4aa2d2bb-0033-4338-8ba4-aca8408a2f1b"},{"uid":"eaa86be8-96e1-43d8-b57c-cb79f2576f9a","sectionTitle":"Target Audience Section","linkId":"12b764bf-7d13-4e2d-9c33-e4587405a62d"},{"uid":"6c9e7724-d788-4e7f-ab41-c8a34df1ada6","sectionTitle":"Benefits Section","linkId":"364fde96-7400-4d51-81ff-c883fbc9b612"},{"uid":"fdeace26-2783-4552-bd59-a7d3c3c858de","sectionTitle":"Testimonials Section","linkId":"c6d379c3-2c68-42c2-b49d-9c6ebb1ab27a"},{"uid":"18ba83c9-fe2a-49ed-8cab-6c004fc61cde","sectionTitle":"Origin Story Section","linkId":"979b2185-b04a-4552-9c89-c131c2de400b"},{"uid":"75a5ad98-9b24-4105-b868-f2644387582a","sectionTitle":"How It Works Section","linkId":"aa16ac7d-e34d-4947-bbca-13eb5826a68e"},{"uid":"492278fb-2759-48e2-9455-48cc19e8f134","sectionTitle":"Pricing Section","linkId":"f62c1ace-857a-46f9-b9d8-a221eb2b94c2"},{"uid":"76c1805d-d1db-4c6e-b798-599d991ba016","sectionTitle":"Guarantee Section","linkId":"9c780ead-64cf-4c64-9c93-d6dea261bfec"},{"uid":"6f2ff3ac-c8ad-48c6-8887-8d2ab74051d9","sectionTitle":"Vision Section","linkId":"e6bc3af8-7537-4984-bc07-24c313b50cce"},{"uid":"1be8ac42-94b3-496b-92c3-4ac9a78b2685","sectionTitle":"Objections Section","linkId":"d7d2f4bb-205c-4404-b009-e5ce9f37c626"},{"uid":"1c9426b0-3e27-436e-8402-666b355963bd","sectionTitle":"FAQ Section","linkId":"7480cd87-314f-4d52-a37a-081712a9807a"},{"uid":"1d0a88af-4327-4b2c-a693-a55aa98d7cad","sectionTitle":"Footer Section","linkId":"9f28f9c5-056a-4d66-91be-6c7fdb40dde4"}],"pageUserGroups":[],"title":{"en":"","fr":"Vide | Commencer à partir de zéro","pt":"Agenda Magnetica"},"meta":{"desc":{"pt":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"images/Logo_Preenchido.png?_wwcv=11"}],"plugins":[{"id":"2bd1c688-31c5-443e-ae25-59aa5b6431fb","name":"REST API","namespace":"restApi"}]};
// eslint-disable-next-line no-undef
window.wwg_cacheVersion = 11;
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
