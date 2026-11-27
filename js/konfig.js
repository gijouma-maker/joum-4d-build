/* Joum 4D Build – öffentliche Einstellungen (KEINE Geheimnisse hier!)
   Die Google-Client-ID ist öffentlich (steht in jeder Webseite mit Google-Anmeldung) – das ist so gewollt. */
const KONFIG = {
  // Aus Google Cloud Console → APIs & Dienste → Anmeldedaten → OAuth-Client-ID (Webanwendung)
  // Beispiel: '1234567890-abc123.apps.googleusercontent.com'
  googleClientId: '',
  // Freigeschaltete Anmeldewege. Vorerst nur Google (kostenlos). Später: 'facebook', 'apple', 'telefon', 'email'
  anmeldeWege: ['google'],
  // Eigener Joum-KI-Server (fragt andere KIs nach Raum-Ideen, Bildern, Übersetzungen). Leer = aus.
  kiServer: ''
};
