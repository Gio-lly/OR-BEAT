let angle = 0; // Angolo iniziale
let ringSegments = []; // Array per memorizzare le suddivisioni

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES); // Imposta l'angolo in gradi

  // Configura gli anelli
  ringSegments = [
    { diameter: 300, totalSegments: 3, gap: 10, rotationOffset: -90 },
    { diameter: 200, totalSegments: 5, gap: 10, rotationOffset: -90 }
  ];
}

function draw() {
  background(30); // Colore di sfondo
  translate(width / 2, height / 2); // Sposta l'origine al centro del canvas

  // Disegna e gestisci gli anelli
  for (let ring of ringSegments) {
    drawRing(ring.diameter, ring.totalSegments, ring.gap, ring.rotationOffset);
  }

  // Disegna la barra
  push();
  rotate(angle); // Ruota secondo l'angolo
  stroke(255); // Colore della barra
  strokeWeight(4); // Spessore della barra
  line(0, 0, 150, 0); // Disegna la barra
  pop();

  // Aggiorna l'angolo per creare il movimento
  angle += 2; // Velocità della rotazione
  if (angle >= 360) {
    angle = 0; // Resetta l'angolo dopo un giro completo
  }
}

// Funzione per disegnare un anello diviso in segmenti con spazi vuoti
function drawRing(diameter, totalSegments, gap, rotationOffset) {
  strokeWeight(4); // Spessore del bordo
  noFill(); // Nessun riempimento
  let segmentAngle = 360 / totalSegments - gap; // Angolo di ogni segmento

  for (let i = 0; i < totalSegments; i++) {
    let start = i * (segmentAngle + gap) + rotationOffset; // Inizio della sezione
    let end = start + segmentAngle; // Fine della sezione

    // Controlla se la barra si trova sopra questo segmento
    let normalizedAngle = (angle + 360) % 360; // Normalizza l'angolo della barra tra 0 e 360
    let highlight = normalizedAngle >= start && normalizedAngle < end;

    // Imposta il colore del segmento
    if (highlight) {
      stroke(255, 255, 100); // Colore evidenziato
    } else {
      stroke(100 + i * 50, 150, 255); // Colore normale
    }

    // Disegna la sezione dell'anello
    arc(0, 0, diameter, diameter, start, end);
  }
}