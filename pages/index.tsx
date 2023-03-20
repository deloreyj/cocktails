import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Professional");
  const [generatedCocktail, setGeneratedCocktails] = useState<string>("");

  const ingredientsRef = useRef<null | HTMLDivElement>(null);

  const scrollToCocktails = () => {
    if (ingredientsRef.current !== null) {
      ingredientsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `You are a bartender AI tasked with inventing new cocktails. You'll be given a list of potential ingredients and your job is to create new cocktail recipes with some, but not necessarily all, of the potential ingredients. You are encouraged to also include common household ingredients like spices, fruits, vegetables, and mixers like juices, milk, or soda water in the recipe. Your recipes should include no more than 3 types of liquor. The main priority is to create recipes that would be appealing to couples or friend groups for "cocktail nights at home." 

  The following is an example of prompt and response. Notice that not all available ingredients must be used.
  Available ingredients: 
  Coconut rum, tequila, triple sec, Tito's vodka
  Recipe: 
  Frozen margaritas
  Ingredients: 
  - 4 cups crushed ice
  - 1 (6 ounce) can frozen limeade concentrate
  - 6 fluid ounces tequila
  - 2 fluid ounces triple sec
  Directions: 
  - Fill the blender with crushed ice. Pour in limeade concentrate, tequila, and triple sec. Blend until smooth. Pour into glasses and serve
  
  Available ingredients:
  ${ingredients}
  Recipe:`;

  const generateCocktail = async (e: any) => {
    e.preventDefault();
    setGeneratedCocktails("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedCocktails((prev) => prev + chunkValue);
    }
    scrollToCocktails();
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Cocktail Companion AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Host your next cocktail night with AI
        </h1>
        <p className="text-slate-500 mt-5">
          47,118 cocktails generated so far.
        </p>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Write a list of ingredients you have on hand{" "}
              <span className="text-slate-500">
                (or just add a few of your favorite ingredients)
              </span>
              .
            </p>
          </div>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={6}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. Tito's vodka, coconut rum, blackberry brandy, triple sec, limes, peanut butter, soda water, etc."
            }
          />
          {/* <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div> */}

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateCocktail(e)}
            >
              Generate your cocktail &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedCocktail && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={ingredientsRef}
                >
                  Your generated cocktail
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                <div
                  className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCocktail);
                    toast("Bio copied to clipboard", {
                      icon: "✂️",
                    });
                  }}
                  key={generatedCocktail}
                >
                  {generatedCocktail.split("\n").map((item, key) => {
                    return key === 0 ? (
                      <h3 className="text-left font-bold" key={key}>
                        {item}
                      </h3>
                    ) : (
                      <p className="text-left" key={key}>
                        {item}
                      </p>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
