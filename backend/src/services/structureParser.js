const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");

const env = require("../config/env");

const ai = env.geminiApiKey
  ? new GoogleGenAI({ apiKey: env.geminiApiKey })
  : null;


// Schema used for links such as LinkedIn, GitHub, Portfolio
const linkSchema = {
  type: Type.OBJECT,
  required: ["label", "url"],
  properties: {
    label: { type: Type.STRING },
    url: { type: Type.STRING },
  },
};


// Schema that tells Gemini the exact structure
// in which we want the resume data
const responseSchema = {
  type: Type.OBJECT,

  required: [
    "basics",
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "interests",
  ],

  properties: {
    basics: {
      type: Type.OBJECT,
      required: [
        "name",
        "title",
        "location",
        "email",
        "phone",
        "links",
      ],
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        location: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        links: {
          type: Type.ARRAY,
          items: linkSchema,
        },
      },
    },

    summary: {
      type: Type.STRING,
    },

    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "company",
          "role",
          "period",
          "bullets",
        ],
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          location: { type: Type.STRING },
          period: { type: Type.STRING },
          bullets: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      },
    },

    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "degree",
          "school",
          "period",
        ],
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          location: { type: Type.STRING },
          period: { type: Type.STRING },
          details: { type: Type.STRING },
        },
      },
    },

    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },

    projects: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        required: [
          "name",
          "description",
        ],

        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },

          tech: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },

          links: {
            type: Type.ARRAY,
            items: linkSchema,
          },
        },
      },
    },


    certifications: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        required: ["name"],

        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },


    languages: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },


    interests: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
};

// Zod validation schema
const validator = z.object({

  basics: z.object({
    name: z.string().default(""),
    title: z.string().default(""),
    location: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),

    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        })
      )
      .default([]),
  }),

  summary: z.string().default(""),

  experience: z
    .array(
      z.object({
        company: z.string().default(""),
        role: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),

        bullets: z
          .array(z.string())
          .default([]),
      })
    )
    .default([]),


  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        school: z.string().default(""),
        location: z.string().default(""),
        period: z.string().default(""),
        details: z.string().default(""),
      })
    )
    .default([]),


  skills: z
    .array(z.string())
    .default([]),


  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),

        tech: z
          .array(z.string())
          .default([]),

        links: z
          .array(
            z.object({
              label: z.string(),
              url: z.string(),
            })
          )
          .default([]),
      })
    )
    .default([]),


  certifications: z
    .array(
      z.object({
        name: z.string().default(""),
        issuer: z.string().default(""),
        year: z.string().default(""),
      })
    )
    .default([]),

  languages: z
    .array(z.string())
    .default([]),

  interests: z
    .array(z.string())
    .default([]),
});


// Prompt construction
function buildPrompt(rawText) {

  return [
    "You are a resume parser. The input is text extracted from a PDF - lines may be jumbled or out of natural reading order.",
    "",

    "Extract structured data:",

    "-- basics: name, professional title, location, email, phone, social links (LinkedIn / GitHub / portfolio etc.; label like \"LinkedIn\", full URL)",
    "-- summary: the professional summary paragraph (rejoin if split across lines)",
    "-- experience: jobs most recent first, with company, role, period (preserve original date format), location if available, and bullet points",
    "-- education: degree, school, period, location, optional details",
    "-- skills: flat array of technical skills",
    "-- projects: name, one-sentence description, optional tech tags, optional links",
    "-- certifications: name, issuer, year",
    "-- languages: flat array",
    "-- interests: flat array",

    "",

    "Rules:",

    "-- Be conservative: omit fields that are not clearly present. Use empty strings/arrays where missing.",
    "-- Do not invent or paraphrase - extract verbatim where possible.",
    "-- Each experience bullet should read as a complete sentence.",
    "-- Preserve original date formats (e.g. Jan 2022 - Dec 2023).",

    "",

    "RESUME TEXT:",
    "----------------",
    rawText,
    "----------------",
  ].join("\n");
}


// Empty fallback object
const EMPTY = {
  basics: {
    name: "",
    title: "",
    location: "",
    email: "",
    phone: "",
    links: [],
  },

  summary: "",

  experience: [],

  education: [],

  skills: [],

  projects: [],

  certifications: [],

  languages: [],

  interests: [],
};


// Main resume parsing function
// async function parseResume(rawText) {

//   // Don't call Gemini if API isn't configured
//   // or resume text is empty
//   if (!ai || !rawText?.trim()) {
//     return EMPTY;
//   }


//   // Create the prompt
//   const prompt = buildPrompt(rawText);


//   // Retry Gemini request once if something fails
//   for (let attempt = 1; attempt <= 2; attempt++) {

//     try {

//       const result = await ai.models.generateContent({

//         model: env.geminiModel,

//         contents: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: prompt,
//               },
//             ],
//           },
//         ],

//         config: {
//           responseMimeType: "application/json",

//           responseSchema,

//           temperature: 0.1,
//         },
//       });


//       // Extract generated text
//       const text =
//         typeof result.text === "function"
//           ? result.text()
//           : result.text;


//       // Make sure Gemini returned something
//       if (!text) {
//         throw new Error("Empty response");
//       }


//       // Convert JSON string into JavaScript object
//       const parsed = JSON.parse(text);


//       // Validate Gemini output using Zod
//       return validator.parse(parsed);
    

//     } catch (err) {

//       // If second attempt also fails,
//       // return safe empty structure
//       if (attempt === 2) {

//         console.error(
//           "Structured parse failed:",
//           err.message
//         );

//         return EMPTY;
//       }
//     }
// }
//     return EMPTY
// }

async function parseResume(rawText) {

  if (!ai || !rawText?.trim()) {
    console.log("AI missing OR rawText empty");
    return EMPTY;
  }

  console.log("========== RESUME TEXT ==========");
  console.log(rawText);
  console.log("=================================");

  const prompt = buildPrompt(rawText);

  for (let attempt = 1; attempt <= 2; attempt++) {

    try {

      console.log(`Gemini attempt: ${attempt}`);

      const modelName = (env.geminiModel || "gemini-3.6-flash").trim();

      const result = await ai.models.generateContent({
        model: modelName,

        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.1,
        },
      });

      console.log("Gemini response received");

      const text =
        typeof result.text === "function"
          ? result.text()
          : result.text;

      console.log("========== GEMINI OUTPUT ==========");
      console.log(text);
      console.log("===================================");

      if (!text) {
        throw new Error("Empty response");
      }

      const normalizedText = text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(normalizedText);

      console.log("========== PARSED JSON ==========");
      console.log(JSON.stringify(parsed, null, 2));
      console.log("=================================");

      const validated = validator.parse(parsed);

      console.log("========== ZOD VALIDATION PASSED ==========");

      return validated;

    } catch (err) {

      console.error("========== PARSER ERROR ==========");
      console.error(err);
      console.error("===================================");

      if (attempt === 2) {
        throw err;
      }
    }
  }

  return EMPTY;
}


module.exports = {
  parseResume,
};