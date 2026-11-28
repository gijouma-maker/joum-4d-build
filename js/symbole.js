/* Joum 4D Build – Symbole (vom Nutzer ausgewählt, 28.11.): Linien-Stil wie Mikrofon/Lautsprecher, jedes Symbol nur einmal */
const p_ = (...d) => ic(d.map((x) => `<path d="${x}"/>`).join(''));
Object.assign(ICON, {
  hausStift: p_('M9 21v-6a2 2 0 0 1 2-2h2c.645 0 1.218.305 1.584.78', 'M20 11l-8-8-9 9h2v7a2 2 0 0 0 2 2h4', 'M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97L18 22h-3v-3z'),
  hammer: p_('M11.414 10l-7.383 7.418a2.091 2.091 0 0 0 0 2.967 2.11 2.11 0 0 0 2.976 0l7.407-7.385', 'M18.121 15.293l2.586-2.586a1 1 0 0 0 0-1.414l-7.586-7.586a1 1 0 0 0-1.414 0L9.121 6.293a1 1 0 0 0 0 1.414l7.586 7.586a1 1 0 0 0 1.414 0z'),
  urkunde: p_('M12 15a3 3 0 1 0 6 0 3 3 0 1 0-6 0', 'M13 17.5V22l2-1.5 2 1.5v-4.5', 'M10 19H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-1 1.73', 'M6 9h12', 'M6 12h3', 'M6 15h2'),
  grundriss: p_('M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1', 'M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1', 'M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1', 'M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1'),
  haus: p_('M5 12H3l9-9 9 9h-2', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7', 'M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6'),
  treppe: p_('M22 5h-5v5h-5v5H7v5H2'),
  wuerfel3d: p_('M6 17.6l-2-1.1V14', 'M4 10V7.5l2-1.1', 'M10 4.1L12 3l2 1.1', 'M18 6.4l2 1.1V10', 'M20 14v2.5l-2 1.12', 'M14 19.9L12 21l-2-1.1', 'M12 12l2-1.1', 'M18 8.6l2-1.1', 'M12 12v2.5', 'M12 18.5V21', 'M12 12l-2-1.12', 'M6 8.6L4 7.5'),
  paragraf: ic('<text x="12" y="18" text-anchor="middle" font-size="19" fill="currentColor" stroke="none" font-family="Georgia, Times, serif">§</text>'),
  euro: p_('M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0', 'M14.4 8c-.67-.63-1.5-1-2.4-1-2.21 0-4 2.24-4 5s1.79 5 4 5c.9 0 1.73-.37 2.4-1', 'M7 10.5h4', 'M7 13.5h4'),
  funkeln: p_('M16 18a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zm0-12a2 2 0 0 1 2 2 2 2 0 0 1 2-2 2 2 0 0 1-2-2 2 2 0 0 1-2 2zM9 18a6 6 0 0 1 6-6 6 6 0 0 1-6-6 6 6 0 0 1-6 6 6 6 0 0 1 6 6z')
});
/* Zweite Auswahl (28.11.): auch zwei Symbole je Knopf – nebeneinander mit feinem Strich */
const doppel = (a, b) => `<span class="doppel">${a}<i class="doppel-strich" aria-hidden="true"></i>${b}</span>`;
Object.assign(ICON, {
  sofa: p_('M4 11a2 2 0 0 1 2 2v1h12v-1a2 2 0 1 1 4 0v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2z', 'M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3', 'M12 5v9'),
  werkzeuge: p_('M3 21h4L20 8a1.5 1.5 0 0 0-4-4L3 17v4', 'M14.5 5.5l4 4', 'M12 8L7 3 3 7l5 5', 'M7 8L5.5 9.5', 'M16 12l5 5-4 4-5-5', 'M16 17l-1.5 1.5'),
  smartHome: p_('M19 8.71l-5.333-4.148a2.666 2.666 0 0 0-3.274 0L5.059 8.71A2.665 2.665 0 0 0 4.03 10.815v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.2c0-.823-.38-1.6-1.03-2.105', 'M16 15c-2.21 1.333-5.792 1.333-8 0'),
  menue: p_('M4 6h16', 'M4 12h16', 'M4 18h16'),
  baeume: p_('M16 5l3 3-2 1 4 4-3 1 4 4h-9', 'M15 21v-3', 'M8 13l-2-2', 'M8 12l2-2', 'M8 21V8', 'M5.824 16a3 3 0 0 1-2.743-3.69 3 3 0 0 1 .304-4.833A3 3 0 0 1 8 3.765a3 3 0 0 1 4.615 3.707 3 3 0 0 1 .5 4.528A3 3 0 0 1 10 16z'),
  wagen: p_('M4 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0', 'M15 19a2 2 0 1 0 4 0 2 2 0 1 0-4 0', 'M17 17H6V3H4', 'M6 5l14 1-1 7H6'),
  kamera: p_('M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4z', 'M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
  stecker: p_('M9.785 6L18 14.215l-2.054 2.054a5.81 5.81 0 1 1-8.215-8.215z', 'M4 20l3.5-3.5', 'M15 4l-3.5 3.5', 'M20 9l-3.5 3.5'),
  behoerde: p_('M3 21h18', 'M3 10h18', 'M5 6l7-3 7 3', 'M4 10v11', 'M20 10v11', 'M8 14v3', 'M12 14v3', 'M16 14v3')
});
/* überall gleich: Start, Mehr, Garten, Einkauf */
ICON.start = ICON.smartHome; ICON.mehr = ICON.menue; ICON.baum = ICON.baeume; ICON.korb = ICON.wagen;
