// ######################################## GESTIONE DELLA PROGRESS BAR
function createLoadingModal() {
    const modal = document.createElement('div');
    modal.id = 'loading-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(1, 1, 1, 0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.fontFamily = "Inter, DM Sans, Arial, sans-serif";
    modal.style.color = 'rgba(221, 221, 221, 1)'

    const modalContent = document.createElement('div');
    modalContent.style.color = 'rgba(221, 221, 221, 1)'
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.textAlign = 'center';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Loading...';
    modalContent.appendChild(loadingText);

    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.height = '20px';
    progressBarContainer.style.backgroundColor = '#ddd';
    progressBarContainer.style.borderRadius = '10px';
    progressBarContainer.style.overflow = 'hidden';
    progressBarContainer.style.marginTop = '10px';

    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.width = '0';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#33ff8c';
    progressBarContainer.appendChild(progressBar);

    modalContent.appendChild(progressBarContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function updateProgressBar(progress) {
    //console.log('UPDATE');
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        window.requestAnimationFrame(() => {
            progressBar.style.width = `${progress}%`;
        });
    }
}

function removeLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        modal.remove();
    }
}