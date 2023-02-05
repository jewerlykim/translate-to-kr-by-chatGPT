// import { Configuration, OpenAIApi } from "./bundle";

// const openai = new OpenAIApi(new Configuration({ apiKey: apikey }));

async function translate() {
  const krInputPrefix = "translate following sentences to korean: \n\n";
  const apikey = process.env.OPENAI_API_KEY;
  // header부분은 필요없고 body부분의 모든 element를 가져옴
  const elements = document.querySelectorAll("body *");

  for (const element of elements) {
    if (element.childNodes.length === 0) continue;

    // header부분 제외
    if (element.tagName === "HEADER") continue;

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        try {
          // contents가 아니고 너무 길면 제외
          if (node.textContent.length > 500) continue;
          // 특수문자가 들어가면 제외
          if (node.textContent.match(/[^a-zA-Z0-9\s]/)) continue;
          // 한글자 이하면 제외
          if (node.textContent.length < 2) continue;
          // null 이면 제외
          if (node.textContent === null) continue;
          // 내용이 없는 경우 제외
          if (node.textContent === "") continue;
          // 공백만 있는 경우 제외
          if (node.textContent.match(/^\s+$/)) continue;

          console.log("console", node.textContent, typeof node.textContent);

          const response = await fetch(
            "https://api.openai.com/v1/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + apikey,
              },
              body: JSON.stringify({
                model: "text-davinci-003",
                prompt: krInputPrefix + '"' + node.textContent + '"',
                max_tokens: 1000,
                temperature: 0.0,
              }),
            }
          );
          console.log("prompt", krInputPrefix + node.textContent);

          const data = await response.json();
          console.log("data", data);
          node.textContent = data.choices[0].text;
        } catch (error) {
          console.error(error);
          //   return;
        }
      }
    }
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.url.includes("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: translate,
    });
  }
});
