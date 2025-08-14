import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"index":{"outputDir":"./","lang":"pt","title":"Atendimento inteligente no whats","cacheVersion":8,"meta":[{"name":"title","content":"Atendimento inteligente no whats"},{"name":"description","content":"Otimização de tempo | Satisfação do cliente | Economia de custos | Cobertura de dúvidas | Custo por atendimento | Atendimento 24/7 | Escala sem dor | Qualidade consistente"},{"name":"image","content":"/images/Logo_Preenchido.png?_wwcv=8"},{"itemprop":"name","content":"Atendimento inteligente no whats"},{"itemprop":"description","content":"Otimização de tempo | Satisfação do cliente | Economia de custos | Cobertura de dúvidas | Custo por atendimento | Atendimento 24/7 | Escala sem dor | Qualidade consistente"},{"itemprop":"image","content":"/images/Logo_Preenchido.png?_wwcv=8"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Atendimento inteligente no whats"},{"name":"twitter:description","content":"Otimização de tempo | Satisfação do cliente | Economia de custos | Cobertura de dúvidas | Custo por atendimento | Atendimento 24/7 | Escala sem dor | Qualidade consistente"},{"name":"twitter:image","content":"/images/Logo_Preenchido.png?_wwcv=8"},{"property":"og:title","content":"Atendimento inteligente no whats"},{"property":"og:description","content":"Otimização de tempo | Satisfação do cliente | Economia de custos | Cobertura de dúvidas | Custo por atendimento | Atendimento 24/7 | Escala sem dor | Qualidade consistente"},{"property":"og:image","content":"/images/Logo_Preenchido.png?_wwcv=8"},{"property":"og:site_name","content":"Atendimento inteligente no whats"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://3bf214dc-0a89-4c56-98fb-7dc01f745ab3.weweb-preview.io/"},{"rel":"alternate","hreflang":"pt","href":"https://3bf214dc-0a89-4c56-98fb-7dc01f745ab3.weweb-preview.io/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});
