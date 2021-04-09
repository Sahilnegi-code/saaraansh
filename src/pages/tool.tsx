import { FormEvent, useState } from "react";
import { Layout } from "../components/Layout";

export default function Tool() {
  const scores = {
    "P+": "strong positive",
    P: "positive",
    NEU: "neutral",
    N: "negative",
    "N+": "strong negative",
    NONE: "without polarity",
  };
  const languages = {
    en: "English",
    ar: "Arabic",
    zh: "Chinese",
    fr: "French",
    de: "German",
    hi: "Hindi",
    ga: "Irish",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    pt: "Portuguese",
    ru: "Russian",
    es: "Spanish",
  };
  const [summarised, setSummarised] = useState<string>(
    "Summarised Text appear here"
  );
  const [hasSummed, setHasSummed] = useState<boolean>(false);
  const [language, setLanguage] = useState("hi");
  const [translated, setTranslated] = useState<string>(
    "Translated Text appear here"
  );
  const [sentiment, setSentiment] = useState({
    score_tag: "score_tag_here",
    agreement: "agreement_here",
    subjectivity: "subjectivity_here",
    confidence: "confidence_here",
    irony: "irony_here",
  });
  const [summaryOrTranslated, setSummaryOrTranslated] = useState<boolean>(true);
  const [userText, setuserText] = useState<string>("");
  const [userLines, setUserLines] = useState<number>(10);

  const handleSentiment = async () => {
    const formdata = new FormData();
    formdata.append("key", "8b363898e680795f1bee36c2e1c5265e");
    formdata.append(
      "txt",
      summarised
        .replace(/\[...\]/gi, " ")
        .replaceAll("-", "")
        .replaceAll("\n", " ")
    );
    formdata.append("lang", "en");

    // const requestOptions = {};

    const response = await fetch("https://api.meaningcloud.com/sentiment-2.1", {
      method: "POST",
      body: formdata,
      redirect: "follow",
    })
      .then((response) => response.json())
      // .then(data => console.log(data.status, data.body))
      .catch((error) => console.log("error", error));
    // const body = await response;
    const { score_tag, agreement, subjectivity, confidence, irony } = response;
    setSentiment({
      score_tag,
      agreement,
      subjectivity,
      confidence,
      irony,
    });
    console.log(response);
  };

  const handleSummarise = async () => {
    setSummarised("Loading Summary...");
    try {
      let sum = await fetch(
        `https://api.meaningcloud.com//summarization-1.0?key=${"8b363898e680795f1bee36c2e1c5265e"}&txt=${userText}&sentences=${userLines}`,
        {
          method: "POST",
        }
      ).then((sum) => sum.json());
      console.log(sum);
      setSummarised(sum.summary);
      setSummaryOrTranslated(true);
      setHasSummed(true);
      handleSentiment();
    } catch (error) {
      console.log(error);
      setSummarised("An error occured, text not supported");
    }
  };

  const handleTranlate = async () => {
    setTranslated("Loading Translation...");
    try {
      let translated = await fetch("https://libretranslate.com/translate", {
        method: "POST",
        body: JSON.stringify({
          q: summarised
            .replace(/\[...\]/gi, " ")
            .replaceAll("-", "")
            .replaceAll("\n", " "),
          source: "en",
          target: language,
        }),
        headers: { "Content-Type": "application/json" },
      }).then((data) => data.json());

      // translated = await translated.json()
      console.log(translated);
      setTranslated(translated.translatedText);
      setSummaryOrTranslated(false);
    } catch (error) {
      console.log(error);
      setTranslated("An error occured, could not translate.");
    }
  };

  return (
    <Layout title="Tool">
      <main className="flex flex-wrap max-h-screen">
        <div className="sm:w-full lg:w-1/2 flex flex-col items-center max-h-full p-4">
          <textarea
            value={userText}
            onChange={(e) => setuserText(e.target.value)}
            className="max-h-96 w-full mb-4 border-2"
            name="user-doc"
            id="user-doc"
            cols={30}
            rows={25}></textarea>
          <div className="justify-evenly flex flex-wrap items-center w-full my-6">
            <label htmlFor="" className="mr-2 text-lg font-bold">
              No. of Sentences({userLines}):
              <input
                className="mx-4"
                type="range"
                min="4"
                max="40"
                onChange={(e) => setUserLines(parseInt(e.target.value))}
                value={userLines}
              />{" "}
            </label>
            <button
              disabled={!(userText.length > 0)}
              onClick={handleSummarise}
              className="px-4 py-2 font-bold text-white bg-red-500 outline-none">
              Get Summary
            </button>
            <button
              onClick={handleTranlate}
              className={`px-4 py-2 font-bold text-white bg-red-500 outline-none ${
                hasSummed ? "block" : "hidden"
              }`}>
              Get Translation
            </button>
          </div>
          <div className="flex my-12">
            <label htmlFor="lang-select" className="mx-12 text-xl">
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              name="lang-select"
              className="px-4 py-2 mx-12 outline-none"
              id="lang-select">
              {Object.entries(languages).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="sm:w-full lg:w-1/2 flex flex-col items-center justify-start p-4 overflow-auto">
          <div className="h-96 w-full mb-4 overflow-auto border">
            <ul className="list-disc">
              {summaryOrTranslated
                ? summarised
                    ?.replace(/\[...\]/gi, " ")
                    .split(". ")
                    .map((sentence, idx) => (
                      <li key={idx} className="mb-1">
                        <b className="text-xl font-bold">- </b>
                        {sentence}
                      </li>
                    ))
                : translated}
            </ul>
          </div>
          <button
            onClick={() => setSummaryOrTranslated(!summaryOrTranslated)}
            className={`px-6 py-3 my-6 font-bold text-white bg-red-500 outline-none mb-4 ${
              hasSummed ? "block" : "hidden"
            }`}>
            {!summaryOrTranslated ? "View Summarised" : "View Translated"}
          </button>
          <div className={`${hasSummed ? "block" : "hidden"}`}>
            <h5 className="mb-2 text-2xl text-center">Sentiment Analysis</h5>
            <table className="text-white bg-red-500 border-4 border-collapse border-red-400 rounded-lg">
              {Object.entries(sentiment).map(([key, value]) => (
                <tr key={key}>
                  <td className="px-4 py-1 text-lg italic border border-gray-400">
                    {key}
                  </td>
                  <td className="px-4 py-1 text-lg font-bold uppercase border border-gray-400">
                    {key !== "score_tag" ? value : scores[value]}
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </main>
    </Layout>
  );
}
