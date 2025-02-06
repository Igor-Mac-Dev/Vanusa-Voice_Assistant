import translate from 'translate-google';

export default async function translateText(
   text: string,
   targetLanguage: 'pt' | 'en',
): Promise<string> {
   try {
      const translatedText = await translate(text, { to: targetLanguage });
      return translatedText;
   } catch (error) {
      throw new Error('°Error translating text: ' + error);
   }
}

