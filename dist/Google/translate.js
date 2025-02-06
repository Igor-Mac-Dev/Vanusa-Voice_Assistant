import translate from 'translate-google';
export default async function translateText(text, targetLanguage) {
    try {
        const translatedText = await translate(text, { to: targetLanguage });
        return translatedText;
    }
    catch (error) {
        throw new Error('°Error translating text: ' + error);
    }
}
//# sourceMappingURL=translate.js.map