


function setRingPlayer(segmentBuffer) {
    const container = document.querySelector('.savings')
    const slots = container.querySelectorAll('.slot');
    const player = new Tone.Player(segmentBuffer).toDestination();
    player.autostart = false;  // Impedisce la riproduzione automatica
    players[freeSlotIndex] = player;   // Memorizza il player nell'array `players`

    // Aggiungi un evento di click per riprodurre l'audio quando si clicca sullo slot
    slots[freeSlotIndex].addEventListener('click', () => {
        playSlot(freeSlotIndex);
    });

}


