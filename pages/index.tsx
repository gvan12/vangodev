import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRef } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function downloadFile(): Promise<void> {
    const text = textareaRef.current?.value;
    const response = await fetch("/api/generate-storybook", {
      method: "POST",
      body: JSON.stringify({ componentCode: text }),
      headers: {
        "Content-Type": "application/json",
        vangokey: inputRef.current?.value || "",
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "storybook-component.tsx";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } else {
      console.error("Failed to download file:", response.statusText);
    }
  }

  return (
    <>
      <Head>
        <title>vango.devp</title>
        <meta name="description" content="utility" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div>
          <h1>Vango trash heap</h1>
          <p>Welcome to the trash heap of Vango's projects.</p>
        </div>
        <section>
          <h3>create storybook components</h3>
          <input type="text" ref={inputRef} />
          <textarea ref={textareaRef} />
          <button
            onClick={async () => {
              await downloadFile();
            }}
          >
            Create
          </button>
        </section>
      </main>
    </>
  );
}
