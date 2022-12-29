import { loadConfig } from "@textlint/config-loader";
import { TextlintKernelDescriptor, TextlintKernelPlugin } from "@textlint/kernel";
import path from "node:path";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import debug_ from "debug";

const debug = debug_("textlint:loader:TextlintrcLoader");
export type LoadTextlintrcOptions = {
    /**
     * config file path
     * /path/to/.textlintrc
     */
    configFilePath?: string;
    /**
     * custom node_modules directory
     */
    node_modulesDir?: string;
};
export const loadTextlintrc = async ({
    configFilePath,
    node_modulesDir
}: LoadTextlintrcOptions): Promise<TextlintKernelDescriptor> => {
    const result = await loadConfig({
        configFilePath,
        node_modulesDir
    });
    // Built-in plugins should be loaded from same directory with `textlint` package
    const builtInPlugins: TextlintKernelPlugin[] = [
        {
            pluginId: "@textlint/textlint-plugin-text",
            plugin: textPlugin,
            options: true
        },
        {
            pluginId: "@textlint/textlint-plugin-markdown",
            plugin: markdownPlugin,
            options: true
        }
    ];
    if (!result.ok) {
        debug("loadTextlintrc failed: %o", result);
        return new TextlintKernelDescriptor({
            rules: [],
            filterRules: [],
            plugins: builtInPlugins
        });
    }
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules,
        plugins: [...builtInPlugins, ...plugins],
        filterRules,
        configBaseDir: path.dirname(result.configFilePath)
    });
};
