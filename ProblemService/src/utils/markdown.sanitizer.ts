import { marked } from "marked";
import logger from "../config/logger.config";
import sanitizeHtml from "sanitize-html";
import TurndownService from "turndown"


export async function sanitizeMarkdown(markdown: string): Promise<string> {

    if (!markdown || typeof markdown !== "string") {
        return "";
    }
    // use trycatch as these packages somtimes throw exceptions
    try {
        // 1. Convert String/Markdown to HTML using marked
        const convertedHTML = await marked.parse(markdown);

        // 2. Sanitize the converted HTML
        const sanitizedHTML = sanitizeHtml(convertedHTML, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "pre", "code"]),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                "img": ["src", "alt", "title"],
                "code": ["class"],
                "pre": ["class"],
                "a": ["href", "target"]
            },
            allowedSchemes: ["http", "https"],
            allowedSchemesByTag: {
                "img": ["http", "https"]
            }
        });

        // 3. Convert the sanitized HTML back to Markdown
        const tds = new TurndownService();

        return tds.turndown(sanitizedHTML)
    } catch (error) {
        logger.error("Error sanitizing markdown", error);
        return "";
    }
}