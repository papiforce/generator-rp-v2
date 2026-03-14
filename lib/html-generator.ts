import {
  TemplateComponentInstance,
  getDefinition,
} from "./template-components";

export function renderComponentHTML(
  globalSettings: Record<string, string>,
  comp: TemplateComponentInstance,
): string {
  const def = getDefinition(comp.type);
  if (!def) return "";
  const isDarkMode = globalSettings.mode === "dark";

  const p = comp.props;

  switch (comp.type) {
    case "banner":
      const bannerStyle = `background: ${
        p.darkerBanner === "true" ?
          "linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), "
        : ""
      }url('${p.bannerUrl}'); background-size: cover !important; background-position: ${p.position} !important; filter: grayscale(${p.coloredBanner === "true" ? "0" : "90%"});`;

      return `<div class="montserrat" style="position: relative; max-width: ${globalSettings.width}px; background: #f2f2f2; margin: 0 auto; color: #000;"><div style="position: relative; display: flex; justify-content: center; align-items: center; height: 220px; ${bannerStyle}"><div style="position: absolute; bottom: 0; background: linear-gradient(360deg,${
        isDarkMode ? "rgba(26, 27, 30, 1)" : "rgba(242, 242, 242, 1)"
      } 0%, rgba(242, 242, 242, 0) 50%); opacity: ${p.gradient === "true" ? "1" : "0"}; width: 100%; height: 100%;"></div>${
        p.bannerText === "true" ?
          `<div style="z-index: 1; padding: 8px; text-shadow: 1px 1px #000; color: #fff; display: flex; flex-direction: column; text-align: center;"><span style="font-family: 'Montserrat', sans-serif; font-size: 14px; text-transform: uppercase;">${globalSettings.characterName}</span><span style="font-family: 'Petrona', serif; font-size: 24px;">${globalSettings.title}</span>${p.hideTemporality === "true" ? "" : `<span style="font-family: 'Montserrat', sans-serif; font-size: 12px;">${globalSettings.timeType === "current" ? "Présent" : "Flashback"} - ${globalSettings.year}</span>`}</div>`
        : ""
      }</div></div>`;

    case "place":
      return `<p style="font-size: ${
        Number(globalSettings.fontSize) + 1
      }px; margin-top: ${p.marginTop}px; font-weight: 500; font-style: italic; text-align: center; color: ${
        isDarkMode ? "gray" : "#a0a0a0"
      };">${p.place}.</p><hr style="height: 1px; width: 100px; border-top-color: ${
        isDarkMode ? "#fff" : "#000"
      } !important; margin: ${p.separatorMarginTop}px auto ${p.marginBottom}px;" />`;

    case "text-block":
      return `<div style="font-size: ${globalSettings.fontSize}px; text-align: ${p.align}; margin: ${p.marginTop || "16"}px 0 ${p.marginBottom || "16"}px; line-height: 1.4;">${p.text}</div>`;

    case "text-participants":
      return `<p class="${globalSettings.fontFamily}" style="margin-top: ${p.marginTop || "40"}px; font-size: ${
        Number(globalSettings.fontSize) - 1
      }px; font-style: italic; text-align: right; color: ${
        isDarkMode ? "gray" : "#a0a0a0"
      }; text-transform: lowercase;">feat. ${p.text}.</p>`;

    case "image-block":
      return `<img src="${p.src}" alt="${p.alt}" style="width: ${p.width}%; max-width: ${globalSettings.width === "580" ? "300" : "520"}px; height; auto; margin: ${p.marginTop}px auto ${p.marginBottom}px; border: 1px solid ${isDarkMode ? "white" : "black"};"/>`;

    case "image-styled":
      const toPercentage = 232 * (Number(p.width) / 100);
      return `<img src="${p.src}" alt="${p.alt}" style="width: ${p.width}%; max-width: calc(100% - 80px); height: 100%; max-height: ${toPercentage}px; object-fit: cover; filter: grayscale(${p.coloredImage === "true" ? "0%" : "90%"}); -webkit-mask-image: url('https://2img.net/image.noelshack.com/fichiers/2025/50/6/1765605039-output-onlinepngtools.png'); mask-image: url('https://2img.net/image.noelshack.com/fichiers/2025/50/6/1765605039-output-onlinepngtools.png'); -webkit-mask-size: cover; mask-size: cover; -webkit-mask-position: center; mask-position: center; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-size: 99%; mask-size: 99%; display: block; margin: ${p.marginTop}px auto ${p.marginBottom}px;">`;

    case "speech": {
      const [characterColor, characterKey] = (
        p.character || "#9E3333-tyr"
      ).split("-");

      const characterImages: Record<string, string> = {
        tyr: "https://i.pinimg.com/736x/12/c0/80/12c080b695d53b8f9bbf4da5e41c03d3.jpg",
        sonya:
          "https://i.pinimg.com/736x/37/48/46/374846ec6b5e91795344f2b8f386d98c.jpg",
        jeshaay:
          "https://i.pinimg.com/736x/b8/00/56/b8005680164e0bf4760f94fb9a3780dd.jpg",
        jeshaaySerpent:
          "https://i.pinimg.com/1200x/8e/d0/6b/8ed06b5bc4191f8d8b748edf05fffcfd.jpg",
        jeshaayHybride:
          "https://i.pinimg.com/1200x/7f/ef/c0/7fefc0a41a064f95a6d251f4f8847727.jpg",
        lem: "https://2img.net/u/3112/10/25/15/avatars/5462-79.jpg",
        nicoeliza: "https://sig.grumpybumpers.com/host/poetryisgood.gif",
        velvet: "https://sig.grumpybumpers.com/host/poetryisamazing.gif",
        lorelei: "https://2img.net/i.imgur.com/tUg6xD3.png",
        civil:
          "https://i.pinimg.com/736x/a3/50/1e/a3501ea173c42bd83d4123dccb5917d8.jpg",
        pirate:
          "https://static.wikia.nocookie.net/onepiece/images/1/1a/Membres_Pirates_du_Roux_11_Portrait.png/revision/latest/scale-to-width-down/120?cb=20231029205730&path-prefix=fr",
        marine:
          "https://i.pinimg.com/736x/77/7a/df/777adf0a1bf32967934d958be513bd7b.jpg",
        cp: "https://static.wikia.nocookie.net/onepiece/images/c/c3/Partenaire_de_Who%27s-Who_Cipher_Pol_1_Portrait.png/revision/latest/scale-to-width-down/120?cb=20231029210543&path-prefix=fr",
        chasseur:
          "https://static.wikia.nocookie.net/onepiece/images/5/5c/Daddy_Masterson_Anime_Infobox.png/revision/latest/smart/width/250/height/250?cb=20180311174550&path-prefix=fr",
        atout:
          "https://static.wikia.nocookie.net/onepiece/images/9/98/Bunny_Joe_Anime_Infobox.png/revision/latest?cb=20130621023213&path-prefix=fr",
        revolutionnaire:
          "https://static.wikia.nocookie.net/onepiece/images/9/98/Bunny_Joe_Anime_Infobox.png/revision/latest?cb=20130621023213&path-prefix=fr",
      };

      const imageUrl = characterImages[characterKey] || characterImages.tyr;
      const characterName = characterKey || "tyr";

      return `<div style="display: flex; flex-direction: ${p.reverse === "true" ? "row-reverse" : "row"}; gap: 8px; margin-top: ${p.marginTop}px; margin-bottom: ${p.marginBottom}px;"><img src="${imageUrl}" alt="${characterName}" style="object-fit: cover; object-position: center; min-width: 72px; max-width: 72px; height: 72px; border-radius: 50%; padding: 2px; border: 2px solid ${characterColor};" /><span style="color: ${characterColor}; font-size: ${globalSettings.fontSize}px; background-color: ${isDarkMode ? "#2a2c33" : "#ffffff"}; border: 2px solid ${isDarkMode ? "#33353a" : "#e7e7ee"}; border-radius: ${p.reverse === "true" ? "8px 8px 0px 8px" : "8px 8px 8px 0px"}; font-weight: bold; padding: 8px 12px; width: 100%;">${p.speech}</span></div>`;
    }

    case "link-youtube":
      return `<center><iframe width="25" height="25" src="${p.link}" style="border-radius: 4px; margin-bottom: 24px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></center>`;

    case "divider":
      return `<div class="separator" style="margin: ${p.marginTop}px auto ${p.marginBottom}px; width: max-content; max-width: 80%; display: flex; align-items: center; gap: 16px;"><hr style="height: 1px; width: 180px; border-top-color: ${
        isDarkMode ? "#fff" : "#000"
      } !important;" /><span>∞</span><hr style="height: 1px; width: 180px; border-top-color: ${
        isDarkMode ? "#fff" : "#000"
      } !important;" /></div>`;

    case "separator":
      return `<hr style="height: 1px; width: ${p.width}px; max-width: calc(100% - 80px); border-top-color: ${
        isDarkMode ? "#fff" : "#000"
      } !important; margin: ${p.marginTop}px auto ${p.marginBottom}px;" />`;

    case "spoiler":
      return `<details style="background-color: ${isDarkMode ? "#222327" : "#f5f5f5"}; border: 1px solid ${isDarkMode ? "#33353a" : "#e7e7ee"}; margin-top: ${p.marginTop || "16"}px; margin-bottom: ${p.marginBottom || "16"}px; border-radius: 8px; padding: 12px;">
  <summary style="cursor: pointer; list-style: none; font-size: ${globalSettings.fontSize}px; font-weight: bold; color: ${isDarkMode ? "#ffffff" : "#000000"}; padding: 0px 12px; user-select: none; display: flex; align-items: center; gap: 16px; justify-content: space-between;">
    ${p.title}

    ${
      p.withTooltip === "true" ?
        `<span style="font-size: ${Number(globalSettings.fontSize) - 2}px !important; color: ${
          isDarkMode ? "gray" : "#a0a0a0"
        }; font-weight: 300; font-style: italic;">Cliquez pour ouvrir</span>`
      : ""
    }
  </summary>
  <div class="spoiler-content" style="background-color: ${isDarkMode ? "#2a2c33" : "#eaeaeaff"}; color: ${isDarkMode ? "#ffffff" : "#000000"}; border-radius: 4px; font-weight: 500; font-size: ${Number(globalSettings.fontSize) - 1}px; padding: 8px 12px; margin-top: 6px; border-top: none; display: flex; flex-direction: column;">
    ${p.content}
  </div>
</details>`;

    case "footer":
      return `<p style="text-align: center; font-size: ${
        globalSettings.fontFamily === "montserrat" ?
          Number(globalSettings.fontSize) - 1
        : Number(globalSettings.fontSize)
      }px; font-weight: 400; padding-bottom: 40px; margin: ${p.marginTop || "32"}px 0 0 0;">Bourbon | バーボン</p>${
        p.logo !== "none" ?
          `<img src="${p.logo}" alt="jolly roger" style="position: absolute; left: 16px; bottom: 16px; transform: rotate(-17deg); width: ${
            p.size || "64"
          }px; border-radius: 100%; ${
            p.logo === "jr-gray" ? "filter: grayscale(1);" : ""
          }" />`
        : ""
      }`;

    default:
      return "";
  }
}

export function generateFullHTML(
  globalSettings: Record<string, string>,
  components: TemplateComponentInstance[],
): string {
  const isDarkMode = globalSettings.mode === "dark";
  const isMontserrat = globalSettings.fontFamily === "montserrat";

  const globalStyle = `max-width: ${globalSettings.width}px; background: ${
    isDarkMode ? "oklch(0.2223 0.006 271.1393)" : "#f2f2f2"
  }; margin: 0 auto; color: ${isDarkMode ? "#fff" : "#000"};`;

  const withFirstLetterBig =
    globalSettings.firstLetter ?
      ".firstLetter::first-letter { -webkit-initial-letter: 3; initial-letter: 3; font-weight: bold; margin-right: .5em; }"
    : "";

  const bannerHTML: string[] = [];
  const contentHTML: string[] = [];
  const footerHTML: string[] = [];

  for (const component of components) {
    const html = renderComponentHTML(globalSettings, component);
    if (component.type === "banner") {
      bannerHTML.push(html);
    } else if (component.type === "footer") {
      footerHTML.push(html);
    } else {
      contentHTML.push(html);
    }
  }

  const bodyContent =
    bannerHTML.join("\n") +
    (contentHTML.length > 0 ?
      `<div class="content-wrapper">${contentHTML.join("\n")}</div>`
    : "") +
    footerHTML.join("\n");

  return `<style>@import url('@import url('https://fonts.googleapis.com/css2?${isMontserrat ? "family=Montserrat:ital,wght@0,100..900;1,100..900&" : "family=Noto+Serif+JP:wght@200..900&"}family=Petrona:ital,wght@0,100..900;1,100..900&display=swap');'); .petrona { font-family: 'Petrona', serif; font-optical-sizing: auto; font-style: normal; } ${isMontserrat ? ".montserrat { font-family: 'Montserrat', sans-serif; font-optical-sizing: auto; font-style: normal; }" : ""} ${!isMontserrat ? ".noto-serif-jp { font-family: 'Noto Serif JP', serif; font-optical-sizing: auto; font-style: normal; }" : ""} .content-wrapper { margin: 0px 40px !important; display: flex; flex-direction: column; } ${withFirstLetterBig} .spoiler-content img { width: 100%; max-width: calc(100% - 48px); max-height: 300px; margin: 0 auto; }</style><!--

--><div class="${globalSettings.fontFamily}" style="position: relative; ${globalStyle}">${bodyContent}</div>`;
}
