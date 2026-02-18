import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content/posts");

const headingTransitions = [
  [/^gancho$/i, ""],
  [/^contexto$/i, ""],
  [/^tesis( y limites)?$/i, "La idea central es esta:"],
  [/^marco(:|\b).*$/i, "Para aterrizarlo de forma practica:"],
  [/^marco practico.*$/i, "Llevado al dia a dia, funciona mejor asi:"],
  [/^caso( y tradeoff)?$/i, "Un ejemplo concreto lo vuelve mas claro:"],
  [/^contraargumento( y respuesta)?$/i, "La objecion mas comun suele ser esta:"],
  [/^errores frecuentes$/i, "Hay patrones que conviene evitar desde el principio:"],
  [/^checklist( de accion)?( \(7 dias\))?$/i, "Si quieres aplicarlo esta semana, empieza por aqui:"],
  [/^checklist para aplicar desde ya$/i, "Si quieres aplicarlo esta semana, empieza por aqui:"],
  [/^cierre$/i, "Para cerrar:"],
  [/^mecanismo practico.*$/i, "Llevado a operacion, esto ayuda mucho:"],
  [/^politica minima.*$/i, "Como regla minima de ejecucion:"],
  [/^implementacion avanzada.*$/i, "Si lo llevas a un nivel mas maduro, esto marca diferencia:"],
  [/^senales de mejora temprana$/i, "Una forma de saber si vas bien es mirar estas senales:"],
  [/^como institucionalizar.*$/i, "Para que no quede en teoria, conviene institucionalizarlo asi:"],
  [/^patron para conversaciones.*$/i, "Tambien cambia mucho la calidad de conversacion con stakeholders cuando:"],
  [/^como operar la escalera.*$/i, "En produccion real, la clave suele estar en esto:"],
  [/^errores de escalamiento.*$/i, "Tambien vale la pena evitar estos errores de escalamiento:"],
  [/^que cambia cuando.*$/i, "Cuando lo llevas al uso real, suelen aparecer estos cambios:"],
  [/^gobernanza de inversion.*$/i, "Para sostenerlo en el tiempo, la gobernanza importa:"],
  [/^integracion de evals.*$/i, "Si quieres que funcione en serio, integra evals al ciclo de decisiones asi:"],
  [/^ritual semanal recomendado$/i, "Un ritual semanal simple puede ordenar todo:"],
  [/^senales para distinguir.*$/i, "Para separar narrativa de cambio real, mira estas senales:"],
  [/^que hacer en los proximos 90 dias$/i, "En terminos operativos, los proximos 90 dias pueden verse asi:"],
  [/^priorizacion de inversiones.*$/i, "Si tienes que priorizar por etapas, esta secuencia suele funcionar:"],
  [/^riesgos de implementacion$/i, "Tambien hay riesgos de implementacion que conviene anticipar:"],
  [/^diseno de producto orientado.*$/i, "Si quieres que esto se note en el producto, enfocalo en momentos de decision:"],
  [/^diseno de transicion.*$/i, "Si vienes de un enfoque mas visual, la transicion puede hacerse asi:"],
  [/^transicion comercial.*$/i, "En pricing, la transicion comercial es tan importante como el modelo:"],
  [/^recomendaciones de implementacion.*$/i, "Para implementarlo sin friccion innecesaria:"],
  [/^arquitectura minima.*$/i, "Una arquitectura minima y progresiva suele ser suficiente para empezar:"],
  [/^como elegir un wedge.*$/i, "Para elegir bien el foco inicial, esto ayuda:"],
  [/^metricas por etapa.*$/i, "Por etapa, conviene mirar metricas distintas:"],
  [/^gobernanza para que.*$/i, "Para que no se degrade con el tiempo, esta gobernanza ayuda:"],
  [/^(lunes|miercoles|viernes):\s*(.+)$/i, (_m, day, rest) => `En ${day.toLowerCase()}, ${rest.charAt(0).toLowerCase()}${rest.slice(1)}.`]
];

function transitionForHeading(rawHeading) {
  const heading = rawHeading.trim();
  for (const [pattern, replacement] of headingTransitions) {
    const match = heading.match(pattern);
    if (!match) continue;
    if (typeof replacement === "function") return replacement(...match);
    return replacement;
  }
  return "";
}

function normalizeText(content) {
  const lines = content.split("\n");
  const out = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      const transition = transitionForHeading(headingMatch[1]);
      if (transition) {
        out.push(transition);
        out.push("");
      }
      continue;
    }

    out.push(line);
  }

  // tighten excessive blank lines
  const joined = out.join("\n").replace(/\n{3,}/g, "\n\n");
  return joined.trim() + "\n";
}

const files = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
  .sort();

for (const file of files) {
  const fullPath = path.join(postsDir, file);
  const source = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(source);
  const normalized = normalizeText(parsed.content);
  const output = matter.stringify(normalized, parsed.data);
  fs.writeFileSync(fullPath, output);
  console.log(`Reescrito: ${file}`);
}
