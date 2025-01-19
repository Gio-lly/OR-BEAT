/*#####################################################################################################*/
/*#################################### GRAIN (MIT) ####################################################*/

var options = {
    animate: true,
    patternWidth: 100,
    patternHeight: 100,
    grainOpacity: 0.11,
    grainDensity: 1,
    grainWidth: 1,
    grainHeight: 1
};

grained('#grained',options)

/*#####################################################################################################*/
/*#################################### ANIMAZIONE PAROLE MENU #########################################*/

TweenMax.from(".navbar > div", 1.6, {
    opacity: 0,
    y: 40,
    ease: Expo.easeInOut,
    delay: 0.6,
});
TweenMax.staggerFrom(
    ".site-menu > div",
    1,
    {
        opacity: 0,
        y: 60,
        ease: Power2.easeOut,
    },
    0.2
);
TweenMax.from(".credits", 1.6, {
    opacity: 0,
    y: 40,
    ease: Expo.easeInOut,
    delay: 0.6,
    
});

/*#####################################################################################################*/
/*#################################### SEZIONE LETTERE #############################################*/

TweenMax.to(".block-1", 2, {
    x: "-60%",  // Spostamento
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});
TweenMax.to(".block-2", 2, {
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});
TweenMax.to(".block-3", 2, {
    x: "220%",  // Spostamento
    opacity: 0,  // Rendi invisibile
    rotation: 90,  // Ruota di 90 gradi
    scaleX: 2,  // Allunga orizzontalmente il trattino
    scaleY: 2,  // Inspessisce il trattino
    ease: Expo.easeInOut
});

TweenMax.to(".block-4", 2, {
    x: "-150%",  // Spostamento
    //y: "-240%",
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});
/*TweenMax.to(".block-5", 2, {
    x: "-200%",  // Spostamento
    y: "240%",
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});*/
TweenMax.to(".block-6", 2, {
    x: "400%",  // Spostamento
    y: "-240%",
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});
TweenMax.to(".block-7", 2, {
    x: "400%",  // Spostamento
    y: "240%",
    opacity: 0,  // Rendi invisibile
    ease: Expo.easeInOut
});

/*#####################################################################################################*/
/*#################################### ANIMAZIONE WELCOME PAGE ########################################*/

TweenMax.from("#welcomePage", 1.6, {
    y: 80,  // Spostiamo la modale dal basso verso l'alto
    opacity: 0,
    ease: Expo.easeInOut,
    delay: 1.4, // Ritarda l'animazione se necessario
    onStart: function() {
        document.getElementById("welcomePage").style.display = 'flex';  // Mostra la pagina modale
        document.querySelector('.blocks').style.display = 'none';
        // Ricalcola la posizione della modale per assicurarci che sia centrata
        const modal = document.getElementById("welcomePage");
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
    }
});

window.addEventListener('resize', function() { // Utile per ridimensionamento
    // Ricalcola la posizione della modale quando la finestra viene ridimensionata
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)'; // Riallinea la modale
    }
});