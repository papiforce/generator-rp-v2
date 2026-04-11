/**
 * Normalise n'importe quel HTML sortant d'un contentEditable vers un format
 * canonique où un saut de ligne est **exclusivement** un <br>.
 *
 * - <p>a</p><p>b</p>         → a<br>b
 * - <div>a</div><div>b</div> → a<br>b
 * - <p><br></p> (ligne vide) → <br>
 * - &nbsp; / \u00A0 isolés   → espace
 * - \n littéraux             → <br>
 *
 * Préserve les <span style="..."> (couleur, gras, italique) et les <br> existants.
 *
 * Fonction DOM-based, à appeler côté client uniquement.
 */
export function normalizeLineBreaks(html: string): string {
  if (typeof document === "undefined") return html;
  if (!html) return "";

  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  // Remplace récursivement chaque bloc (<p>, <div>) par ses enfants,
  // en insérant un <br> à la place du bloc suivant (sauf pour le dernier).
  const unwrapBlocks = (root: HTMLElement) => {
    const blocks = Array.from(root.querySelectorAll("p, div"));
    for (const block of blocks) {
      const parent = block.parentNode;
      if (!parent) continue;

      // Si le bloc est vide ou ne contient qu'un <br>, on insère juste un <br>.
      const isEmpty =
        block.childNodes.length === 0 ||
        (block.childNodes.length === 1 &&
          block.firstChild instanceof HTMLBRElement);

      if (isEmpty) {
        parent.insertBefore(document.createElement("br"), block);
      } else {
        // Déplacer tous les enfants du bloc avant le bloc lui-même.
        while (block.firstChild) {
          parent.insertBefore(block.firstChild, block);
        }
        // Ajouter un <br> après le contenu déplacé (sauf si c'est le dernier élément du parent).
        if (block.nextSibling) {
          parent.insertBefore(document.createElement("br"), block);
        }
      }
      parent.removeChild(block);
    }
  };

  unwrapBlocks(tmp);

  // Nettoie les &nbsp; / \u00A0 isolés en espaces normaux.
  // On parcourt uniquement les nœuds texte pour ne pas toucher aux attributs.
  const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }
  for (const t of textNodes) {
    if (t.nodeValue) {
      t.nodeValue = t.nodeValue.replace(/\u00A0/g, " ").replace(/\n/g, "");
    }
  }

  // Supprime un éventuel <br> final isolé (artefact classique du contentEditable).
  while (tmp.lastChild instanceof HTMLBRElement) {
    tmp.removeChild(tmp.lastChild);
  }

  return tmp.innerHTML;
}
