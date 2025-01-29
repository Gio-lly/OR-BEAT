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

// Animazione della navbar con un effetto più fluido
gsap.from(".navbar > div", {
    duration: 1.8,
    opacity: 0,
    y: 40,
    scale: 0.9,
    delay: 2.6,
});

// Animazione della site-menu con effetto "stagger" migliorato
gsap.from(".site-menu > div", {
    duration: 1.2,
    opacity: 0,
    y: 60,
    scale: 0.9,  // Aggiungiamo una leggera scalatura per un effetto più morbido
    ease: "power4.out", 
    stagger: {
        amount: 0.5, // Maggiore varianza nel tempo di attesa tra gli elementi
        from: "start", // Animazione dall'inizio
    },
});

// Animazione dei crediti con un ingresso più fluido
gsap.from(".credits", {
    duration: 1.8,
    opacity: 0,
    y: 40,
    scale: 0.95,
    delay: 2.6,
});

/*#####################################################################################################*/
/*#################################### SEZIONE LETTERE #############################################*/

// Animazione di spostamento per ciascun blocco (prima parte)
gsap.to(".block-1", {
    duration: 2,
    x: "20%",  // Spostamento
    opacity: 1,  // Mantieni la visibilità inizialmente
    ease: "expo.inOut",
    onStart: () => {
        // Una volta completato il movimento della lettera 1, inizia la dissolvenza
        gsap.to(".block-1", {
            duration: 3,   // Durata per l'opacità (dissolvenza)
            opacity: 0,    
            ease: "expo.inOut",
            delay: 0.5
        });
    }
});

gsap.to(".block-2", {
    duration: 2,
    x: "60%",  
    opacity: 1,  // Mantieni la visibilità inizialmente
    ease: "expo.inOut",
    onStart: () => {
        // Una volta completato il movimento della lettera 1, inizia la dissolvenza
        gsap.to(".block-2", {
            duration: 3,   // Durata per l'opacità (dissolvenza)
            opacity: 0,    
            ease: "expo.inOut",
            delay: 0.5
        });
    }
});

gsap.to(".block-3", {
    duration: 2,
    x: "340%", 
    opacity: 1,  // Mantieni la visibilità inizialmente
    rotation: 90,  // Ruota di 90 gradi
    scaleX: 2,  // Allunga orizzontalmente
    scaleY: 2,  // Inspessisce
    ease: "expo.inOut",
    onStart: () => {
        // Una volta completato il movimento della lettera 1, inizia la dissolvenza
        gsap.to(".block-3", {
            duration: 3,   // Durata per l'opacità (dissolvenza)
            opacity: 0,    
            ease: "expo.inOut",
            delay: 0.5
        });
    }
});

gsap.to(".block-4", {
    duration: 2,
    x: "-50%", 
    ease: "expo.inOut",
    onStart: () => {
        // Una volta completato il movimento della lettera 1, inizia la dissolvenza
        gsap.to(".block-4", {
            duration: 3,   // Durata per l'opacità (dissolvenza)
            opacity: 0,    
            ease: "expo.inOut",
            delay: 0.5
        });
    }
});

gsap.to(".block-6", {
    duration: 2,
    x: "400%", 
    y: "-240%",
    opacity: 0, 
    ease: "expo.inOut"
});

gsap.to(".block-7", {
    duration: 2,
    x: "400%", 
    y: "240%",
    opacity: 0, 
    ease: "expo.inOut"
});

/*#####################################################################################################*/
/*#################################### ANIMAZIONE WELCOME PAGE ########################################*/

gsap.from("#welcomePage", {
    duration: 1.6,
    y: 80,  // Spostiamo la modale dal basso verso l'alto
    opacity: 0,
    ease: "expo.inOut",
    delay: 3, // Ritarda l'animazione se necessario
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

let resizeTimeout;
window.addEventListener('resize', function() {
    if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
    resizeTimeout = requestAnimationFrame(function() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)'; // Riallinea la modale
        }
    });
});

/*#####################################################################################################*/
/*#################################### ANIMAZIONE CREDITS #############################################*/
// Apri la modal "credits-page" con animazione
document.getElementById("credits-btn").addEventListener("click", function() {
    const modal = document.getElementById("credits-page");
    
    // Mostra la modal e applica l'animazione
    modal.style.display = 'flex';

    // Utilizza GSAP per l'animazione della modal
    gsap.from(modal, {
        duration: 1.6, // Durata dell'animazione
        y: innerHeight,
        opacity: 0, // Inizia con opacità 0
        ease: "expo.inOut", // Tipo di easing
        onStart: function() {
            document.getElementById("credits-page").style.display = 'flex';
            // Nascondi la pagina di benvenuto
            document.getElementById("welcomePage").style.display = 'none';
        }
    });
});

// Chiudi la modal "credits-page" e torna alla pagina di benvenuto
document.getElementById("close-btn").addEventListener("click", function() {
    const modal = document.getElementById("credits-page");

    // Esegui l'animazione di chiusura
    gsap.to(modal, {
        duration: 0.2, // Durata dell'animazione
        opacity: innerHeight,
        onComplete: function() {
            // Una volta che la modal è invisibile e fuori schermo, nascondiamola
            modal.style.display = 'none';

            // Mostriamo la pagina di benvenuto con una nuova animazione
            const welcomePage = document.getElementById("welcomePage");
            welcomePage.style.display = 'flex';

            gsap.from(welcomePage, {
                duration: 1.6, // Durata dell'animazione
                y: 80, // Distanza iniziale dall'alto
                opacity: 0, // Inizia con opacità 0
                ease: "expo.inOut", // Tipo di easing
                onStart: function() {
                    // Centra la pagina di benvenuto
                    welcomePage.style.top = '50%';
                    welcomePage.style.left = '50%';
                    welcomePage.style.transform = 'translate(-50%, -50%)';
                }
            });
        }
    });
});

/*#####################################################################################################*/
/*#################################### ANIMAZIONE MENU ################################################*/
// Apri la modal "menu-page" con animazione
document.getElementById("menu-btn").addEventListener("click", function() {
    const modal = document.getElementById("menu-page");
    
    // Mostra la modal e applica l'animazione
    modal.style.display = 'flex';

    // Utilizza GSAP per l'animazione della modal
    gsap.from(modal, {
        duration: 1.6, // Durata dell'animazione
        y: innerHeight,
        opacity: 0, // Inizia con opacità 0
        ease: "expo.inOut", // Tipo di easing
        onStart: function() {
            document.getElementById("menu-page").style.display = 'flex';
            // Nascondi la pagina di benvenuto
            document.getElementById("welcomePage").style.display = 'none';
        }
    });
});

// Chiudi la modal "credits-page" e torna alla pagina di benvenuto
document.getElementById("closeMenu-btn").addEventListener("click", function() {
    const modal = document.getElementById("menu-page");

    // Esegui l'animazione di chiusura
    gsap.to(modal, {
        duration: 0.2, // Durata dell'animazione
        opacity: innerHeight,
        onComplete: function() {
            // Una volta che la modal è invisibile e fuori schermo, nascondiamola
            modal.style.display = 'none';

            // Mostriamo la pagina di benvenuto con una nuova animazione
            const welcomePage = document.getElementById("welcomePage");
            welcomePage.style.display = 'flex';

            gsap.from(welcomePage, {
                duration: 1.6, // Durata dell'animazione
                y: 80, // Distanza iniziale dall'alto
                opacity: 0, // Inizia con opacità 0
                ease: "expo.inOut", // Tipo di easing
                onStart: function() {
                    // Centra la pagina di benvenuto
                    welcomePage.style.top = '50%';
                    welcomePage.style.left = '50%';
                    welcomePage.style.transform = 'translate(-50%, -50%)';
                }
            });
        }
    });
});