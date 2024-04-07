"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const prompts_2 = require("./prompts");
const ARGS = {
    directory: '.',
    'style-guide': '',
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Running style checker ...');
    const chatModel = new openai_1.ChatOpenAI({
    // openAIApiKey: process.env.OPENAI_API_KEY as string, // Cast to string; TypeScript won't automatically infer process.env types.
    });
    processArgs();
    const prompt = prompts_1.ChatPromptTemplate.fromMessages([
        ['system', prompts_2.systemPrompt],
        ['user', prompts_2.userPrompt],
    ]);
    const chain = prompt.pipe(chatModel);
    const dir = (0, path_1.resolve)(ARGS['directory']);
    console.log(`Checking styles in directory [${dir}]`);
    (0, fs_1.readdirSync)(dir)
        .filter(x => !x.includes('#'))
        .filter(x => x.endsWith('.org'))
        .forEach((f) => __awaiter(void 0, void 0, void 0, function* () {
        const contents = (0, fs_1.readFileSync)((0, path_1.resolve)(dir, f)).toString();
        console.log(`Checking style of document [${f}]`);
        const guide = (0, fs_1.readFileSync)(ARGS['style-guide']).toString();
        const response = yield chain.invoke({
            content: `<info>
  <style_guide>${guide}</style_guide>
  <document_name>${f}</document_name>
  <document>${contents}</document>
</info>`
        });
        console.log('-----------');
        console.log(response.content);
    }));
});
const processArgs = () => {
    process.argv.forEach(arg => {
        const parts = arg.split('=');
        ARGS[parts[0].replace('--', '')] = parts[1];
    });
};
main();
