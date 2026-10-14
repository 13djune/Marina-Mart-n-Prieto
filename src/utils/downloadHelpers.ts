// Download utilities for Artist CV and Portfolio Dossier

export function triggerDownload(url: string, filename: string) {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download failed, opening directly:', err);
    window.open(url, '_blank');
  }
}

export function downloadCV() {
  triggerDownload('/CV_Marina_Martin.pdf', 'CV_Marina_Martin_Prieto_Concept_Artist.pdf');
}

export function downloadPortfolio() {
  triggerDownload('/Portfolio_Marina_Martin.pdf', 'Portfolio_Marina_Martin_Prieto_Concept_Art.pdf');
}
