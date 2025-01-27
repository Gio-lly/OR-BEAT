
class Model {
  constructor() {
    this.duration;
    this.onsets = []; //l'array dei timestaps, quindi della posizione nel tempo di tutti i marker
    this.representation_matrix = []
  }
  setonsets(onsets) {
    this.onsets = onsets;
  }
  addTimeStamp(timestamp) {
    this.onsets.push(timestamp);
  }
  getonsets(i) {
    return this.onsets[i];
  }
  addRing(startEnd, steps = 2, density, phase, color) {
    this.representation_matrix.push([
      startEnd, // l'inizio e la fine della regione da suonare in secondi
      this.representation_matrix.length + 1, //lo metti sempre alla fine
      color, //che colore
      steps, //quanti segmenti ha il cerchio
      density, //quanti sono accesi
      phase, //con che fase
      new Array(steps).fill(false)
    ]);
  }
  modifyRingBooleanList(i_ring, bool_list) {
    this.representation_matrix[i_ring][6] = bool_list;
  }
  modifyRingSteps(i_ring, steps) {
    this.representation_matrix[i_ring][3] = steps;
    this.representation_matrix[i_ring][6] = new Array(steps).fill(false);
  }
  modifyRingPhase(i_ring, phase) {
    if (this.representation_matrix[i_ring]) {
      this.representation_matrix[i_ring][5] = phase;
    }
  }
  modifyRingDensity(i_ring, density) {
    if (this.representation_matrix[i_ring]) {
      this.representation_matrix[i_ring][4] = density;
    }
  }
  getRing(i) {
    return this.representation_matrix[i];
  }
  removeRing(i) {
    this.representation_matrix.splice(i, 1);
    // Ora, aggiorna tutti gli iRing successivi
    for (let j = i; j < this.representation_matrix.length; j++) {
      // Decrementa di 1 l'indice dell'anello per ogni anello successivo
      this.representation_matrix[j][1] = j + 1;  // j+1 per mantenere la numerazione corretta (1-based index)
    }
  }
  setRingPlayer(segmentBuffer, startTime, endTime, i_ring) {
    const player = new Tone.Player(segmentBuffer).toDestination();
    player.autostart = false;  // Impedisce la riproduzione automatica
    if(!this.representation_matrix[i_ring].push(player)==8){
      alert("error");
    }  
    this.representation_matrix[i_ring][0]= new Array(startTime,endTime);

  }
  playSound(i_ring){
    if(this.representation_matrix[i_ring][7]){

      this.representation_matrix[i_ring][7].start();
    }
  }
  //[ [[0,1],iring,steps,density,phase,[booleans]],  ]


}