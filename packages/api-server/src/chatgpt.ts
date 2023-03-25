function isChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str);
}
export const sendMessagesToApiHub = async (
  message: string, chatContext?: any
): Promise<void> => {

  // add some customer logic here
  let content = message;
  const [command, ...rest] = message.split(" ");
  if (command.startsWith("tr ") || command.startsWith("tr: ")) {
    const restContent = rest.join(" ");
    const currentLanguage = isChinese(restContent) ? "Chinese" : "English";
    const exceptLanguage = isChinese(restContent) ? "English" : "Chinese";
    const prompt = `I want you to act as an ${currentLanguage} translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in ${exceptLanguage}.`;
    content = prompt + " " + restContent;
  } else if (command.startsWith("op ") || command.startsWith("op: ")) {
    const restContent = rest.join(" ");
    const currentLanguage = "English";
    const exceptLanguage = "English" ;
    const prompt = `I want you to act as an ${currentLanguage} translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in ${exceptLanguage}.`;
    content = prompt + " " + restContent;
  }
  try {
    const resBody = {
      url: "https://api.openai.com/v1/chat/completions",
      requestHeaders: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      payload: {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content }]
      },
      chatContext
    };
    // console.log(JSON.stringify(requestBody));
    // "http://localhost:4000/subscribe"
    const response = await fetch(process.env.API_HUB_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resBody),
    });
    const data = await response.json();
    console.log("== data from aws==", data);
  } catch (error) {
    console.log("== error ==", error);
  }
};

