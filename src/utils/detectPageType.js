export function detectPageType(html) {
  const cleanHtml = String(html || "");

  const textWithoutTags = cleanHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const scriptsCount = (cleanHtml.match(/<script/gi) || []).length;
  const bodyTextLength = textWithoutTags.length;

  const frameworks = {
    react: /id=["']root["']|data-reactroot|react/i.test(cleanHtml),
    next: /__NEXT_DATA__/i.test(cleanHtml),
    vue: /__NUXT__|data-v-|vue/i.test(cleanHtml),
    angular: /ng-version|_ngcontent/i.test(cleanHtml)
  };

  const isAdvanced =
    bodyTextLength < 500 ||
    scriptsCount > 25 ||
    frameworks.react ||
    frameworks.next ||
    frameworks.vue ||
    frameworks.angular;

  return {
    isAdvanced,
    bodyTextLength,
    scriptsCount,
    frameworks
  };
}
