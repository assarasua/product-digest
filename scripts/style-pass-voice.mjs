import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");

function getThemeByDate(fileName) {
  const date = fileName.slice(0, 10);
  if (date >= "2026-02-14" && date <= "2026-02-21") return "pm";
  if (date >= "2026-02-22" && date <= "2026-02-25") return "ai";
  return "saas";
}

const openers = {
  pm: "Si trabajas producto en una startup en crecimiento, este texto esta escrito para tus decisiones del lunes por la manana, no para teoria de slides.",
  ai: "En AI PM, la diferencia entre una demo atractiva y un producto durable suele estar en los detalles operativos que casi nunca se celebran en publico.",
  saas: "En estrategia de producto, la ventaja no la gana quien grita una tesis mas fuerte, sino quien convierte esa tesis en decisiones repetibles de mercado, producto y distribucion."
};

const replacementsByTheme = {
  pm: [
    [/\bTesis:\s*/g, "Si tuviera que resumirlo en una linea: "],
    [/\bTradeoff:\s*/g, "La renuncia real es esta: "],
    [/\bRespuesta:\s*/g, "Mi lectura practica es: "],
    [/\bChecklist\b/g, "Pasos practicos"],
    [/\bframework\b/gi, "marco"],
    [/\bgovernance\b/gi, "gobernanza"],
    [/\bthroughput\b/gi, "volumen de entrega"]
  ],
  ai: [
    [/\bTesis:\s*/g, "Tecnicamente, la idea central es: "],
    [/\bTradeoff:\s*/g, "El tradeoff tecnico-operativo es: "],
    [/\bRespuesta:\s*/g, "Desde producto y riesgo, la respuesta es: "],
    [/\bChecklist\b/g, "Controles recomendados"],
    [/\bfallback\b/gi, "plan de respaldo"],
    [/\bfeature\b/gi, "funcionalidad"],
    [/\brelease\b/gi, "despliegue"],
    [/\bprompt\b/gi, "prompt"]
  ],
  saas: [
    [/\bTesis:\s*/g, "Mi tesis de mercado es: "],
    [/\bTradeoff:\s*/g, "El costo estrategico de elegir esto es: "],
    [/\bRespuesta:\s*/g, "Estrategicamente, la respuesta es: "],
    [/\bChecklist\b/g, "Movimientos sugeridos"],
    [/\bpricing\b/gi, "modelo de precios"],
    [/\bbundle\b/gi, "paquete"],
    [/\bworkflow\b/gi, "flujo de trabajo"],
    [/\bmoat\b/gi, "moat"]
  ]
};

for (const fileName of fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx") || f.endsWith(".md")).sort()) {
  const fullPath = path.join(postsDir, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(source);
  const theme = getThemeByDate(fileName);

  let content = parsed.content.trim();

  const opener = openers[theme];
  if (!content.startsWith(opener)) {
    content = `${opener}\n\n${content}`;
  }

  for (const [pattern, replacement] of replacementsByTheme[theme]) {
    content = content.replace(pattern, replacement);
  }

  const output = matter.stringify(content + "\n", parsed.data);
  fs.writeFileSync(fullPath, output);
  console.log(`Ajustado (${theme}): ${fileName}`);
}
