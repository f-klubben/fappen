import {TypescriptExtractor} from "@fappen/extractor";
import {Generator} from "@ts-docs/ts-docs";
import FrontMatter from 'front-matter';
import * as fs from "fs";
import * as path from "path";

function loadCustomPageIndex(customPages) {
    const res = [];
    for (const category of fs.readdirSync(customPages, {withFileTypes: true})) {
        if (category.isFile()) continue;
        const pages = [];
        const categoryPath = path.join(process.cwd(), customPages, category.name);
        for (const file of fs.readdirSync(categoryPath)) {
            if (!file.endsWith(".md")) continue;
            const content = FrontMatter(fs.readFileSync(path.join(categoryPath, file), "utf-8"));
            pages.push({
                name: content.attributes.name || file.slice(0, -3),
                content: content.body,
                attributes: content.attributes
            });
        }
        res.push({name: category.name, pages});
    }
    return res;
}

const entryPoints = [`./scripts/index.ts`];

const extractor = new TypescriptExtractor({
    entryPoints,
    maxConstantTextLength: 1024,
    documentImports: true,
    // Recommended
    ignoreFolderNames: ["lib"]
});

const projects = extractor.run();

const generator = new Generator({
    entryPoints,
    name: "Fappen",
    out: `./build/docs`,
    landingPage: projects[0],
    customPages: loadCustomPageIndex(`./docs`),
    structure: "@ts-docs/default-docs-structure",
    plugins: {},
    style: {},
    exportMode: 'detailed',
});



void generator.generate(extractor, projects);
