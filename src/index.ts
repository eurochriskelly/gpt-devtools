import { PathLike, readFileSync, readdirSync } from "fs";
import { resolve } from 'path';

import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { systemPrompt, userPrompt } from './prompts';

const ARGS: any = {
  directory: '.',
  'style-guide': '',
}

const main = async (): Promise<void> => {
  console.log('Running style checker ...')
  const chatModel = new ChatOpenAI({
    // openAIApiKey: process.env.OPENAI_API_KEY as string, // Cast to string; TypeScript won't automatically infer process.env types.
  });

  processArgs()
  const prompt = ChatPromptTemplate.fromMessages([
    [ 'system', systemPrompt],
    [ 'user', userPrompt ],
  ])
  const chain = prompt.pipe(chatModel)
  const dir: PathLike = resolve(ARGS['directory']);
  console.log(`Checking styles in directory [${dir}]`);
  readdirSync(dir)
    .filter(x => !x.includes('#'))
    .filter(x => x.endsWith('.org'))
    .forEach(async f => {
      const contents = readFileSync(resolve(dir, f)).toString();
      console.log(`Checking style of document [${f}]`);
      const guide = readFileSync(ARGS['style-guide']).toString()
      const response: any = await chain.invoke({
        content:`<info>
  <style_guide>${guide}</style_guide>
  <document_name>${f}</document_name>
  <document>${contents}</document>
</info>` 
      })
      console.log('-----------')
      console.log(response.content);
    })
};

const processArgs = () => {
  process.argv.forEach(arg => {
    const parts: string[] = arg.split('=');
    ARGS[parts[0].replace('--', '')] = parts[1];
  })
}

main();
