import { useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Button, Input, useLocalStorage, useThemeStore } from "@tableflow/ui-library";
import notification from "../../utils/notification";
import getCodeJavaScript from "./utils/getCodeJavaScript";
import getCodeReact from "./utils/getCodeReact";
import { CodeProps } from "./types";
import style from "./style/Code.module.scss";
import { colorBrewer as syntaxHighlighterStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Code(props: CodeProps) {
  const [framework, setFramework] = useLocalStorage("framework", "react");

  const theme = useThemeStore((state) => state.theme);

  const options = {
    React: { value: "react" },
    JavaScript: { value: "javascript" },
  };

  const code = useMemo(() => (framework === "react" ? getCodeReact(props) : getCodeJavaScript(props)), [JSON.stringify(props), framework]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notification({ type: "success", message: "Copied to clipboard" });
  };

  const customStyles = {
    resize: "none" as "none",
    display: "block",
    width: "100%",
    minHeight: 470,
    margin: 0,
    padding: 24,
    border: theme === "dark" ? "1px solid #344054" : "1px solid #d0d5dd",
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    fontFamily: "monospace",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    overflow: "hidden",
    backgroundColor: theme === "dark" ? "#181A1F" : "#fff",
    color: theme === "dark" ? "#fff" : "#000",
  };

  return (
    <div className={style.container}>
      <Input
        label="Select a frontend framework:"
        options={options}
        value={framework}
        onChange={(v) => setFramework(v)}
        icon="code"
        className={style.dropdown}
      />

      <div className={style.top}>
        <p>Copy and paste the code below into your application:</p>
        <Button icon="copy" variants={["tertiary"]} onClick={() => copyToClipboard(code)}>
          Copy code
        </Button>
      </div>

      <SyntaxHighlighter language={framework === "react" ? "jsx" : "javascript"} style={syntaxHighlighterStyle} customStyle={customStyles}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
