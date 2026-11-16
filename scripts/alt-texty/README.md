# Alt texty fotografií – kontrola kastelánem

Okruh: export → kastelán doplní Excel → zpět do Sanity.

1. `npm run alt:export` – stáhne všech ~209 fotek z webu do
   `tmp/alt-texty/Alt texty – Zámek Rosice <datum>/` (složky podle částí webu,
   soubory číslované `001 …`), vyrobí Excel s náhledy a ZIP celé složky.
2. Kastelán vyplní žlutý sloupec „NOVÝ alt text“ (prázdné = beze změny) a vrátí Excel.
3. `npm run alt:read -- "<vrácený>.xlsx"` – vypíše počet změn a poznámky,
   uloží `tmp/alt-texty/zmeny.json`.
4. `npm run alt:apply` – zkouška: ukáže změny a nechá Sanity ověřit patche.
5. `npm run alt:apply -- --apply` – zapíše český alt do Sanity
   (publikovaný dokument i otevřený draft).

Excel nese na skrytém listu `_data` dokument, cestu a asset každé fotky, takže
se zápis netrefí jinam, ani když kastelán řádky přeřadí. Fotka, která se od
exportu ve Studiu vyměnila, nebo alt, který mezitím někdo upravil, se přeskočí
(`--force` přepíše). Anglický a německý alt zůstanou; `apply` vypíše, které
je potřeba znovu přeložit.

Vyžaduje Python s `openpyxl` a `Pillow`; zápis přihlášení `npx sanity login`.
